import { apiClient } from '../api/client.js';
import { isValidJSON, parseJSON } from '../utils/validators.js';
import { copyToClipboard, showTemporaryMessage } from '../utils/clipboard.js';

export class HashGenerator {
  private container: HTMLElement;
  private textarea: HTMLTextAreaElement | null = null;
  private generateButton: HTMLButtonElement | null = null;
  private exampleButton: HTMLButtonElement | null = null;
  private resultDiv: HTMLElement | null = null;
  private errorDiv: HTMLElement | null = null;
  private copyButton: HTMLButtonElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
    this.attachEventListeners();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="card">
        <h2>Hash Generator</h2>
        <p class="description">Enter a JSON object to generate a SHA-256 hash</p>

        <div class="form-group">
          <label for="json-input">JSON Object:</label>
          <textarea
            id="json-input"
            class="json-textarea"
            placeholder='{"key": "value"}'
            rows="8"
          ></textarea>
        </div>

        <div class="button-group">
          <button id="generate-btn" class="btn btn-primary">
            Generate Hash
          </button>
          <button id="example-btn" class="btn btn-secondary">
            Load Example
          </button>
        </div>

        <div id="error-message" class="error-message hidden"></div>

        <div id="result" class="result hidden">
          <h3>Generated Hash:</h3>
          <div class="hash-display">
            <code id="hash-value"></code>
            <button id="copy-btn" class="btn btn-small">
              Copy
            </button>
          </div>
        </div>
      </div>
    `;

    // Cache DOM elements
    this.textarea = this.container.querySelector('#json-input');
    this.generateButton = this.container.querySelector('#generate-btn');
    this.exampleButton = this.container.querySelector('#example-btn');
    this.resultDiv = this.container.querySelector('#result');
    this.errorDiv = this.container.querySelector('#error-message');
    this.copyButton = this.container.querySelector('#copy-btn');
  }

  private attachEventListeners(): void {
    this.generateButton?.addEventListener('click', () => this.handleGenerate());
    this.exampleButton?.addEventListener('click', () => this.loadExample());
    this.copyButton?.addEventListener('click', () => this.handleCopy());

    // Allow Enter key with Ctrl/Cmd to generate
    this.textarea?.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        this.handleGenerate();
      }
    });
  }

  private loadExample(): void {
    const exampleJSON = {
      message: "Hello, World!",
      timestamp: new Date().toISOString(),
      data: {
        user: "example",
        action: "demo"
      }
    };

    if (this.textarea) {
      this.textarea.value = JSON.stringify(exampleJSON, null, 2);
    }

    this.hideError();
    this.hideResult();
  }

  private async handleGenerate(): Promise<void> {
    const input = this.textarea?.value.trim() || '';

    // Validate input
    if (!input) {
      this.showError('Please enter a JSON object');
      return;
    }

    if (!isValidJSON(input)) {
      this.showError('Invalid JSON format. Please check your syntax.');
      return;
    }

    const jsonData = parseJSON(input);
    if (!jsonData) {
      this.showError('Failed to parse JSON');
      return;
    }

    // Show loading state
    this.setLoading(true);
    this.hideError();
    this.hideResult();

    try {
      const response = await apiClient.hash(jsonData);
      this.showResult(response.hash);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate hash';
      this.showError(message);
    } finally {
      this.setLoading(false);
    }
  }

  private async handleCopy(): Promise<void> {
    const hashValue = this.container.querySelector('#hash-value')?.textContent;
    if (!hashValue) return;

    try {
      await copyToClipboard(hashValue);
      if (this.copyButton) {
        showTemporaryMessage(this.copyButton, 'Copied!', 2000);
      }
    } catch (error) {
      this.showError('Failed to copy to clipboard');
    }
  }

  private showResult(hash: string): void {
    const hashValueElement = this.container.querySelector('#hash-value');
    if (hashValueElement) {
      hashValueElement.textContent = hash;
    }
    this.resultDiv?.classList.remove('hidden');
  }

  private hideResult(): void {
    this.resultDiv?.classList.add('hidden');
  }

  private showError(message: string): void {
    if (this.errorDiv) {
      this.errorDiv.textContent = message;
      this.errorDiv.classList.remove('hidden');
    }
  }

  private hideError(): void {
    this.errorDiv?.classList.add('hidden');
  }

  private setLoading(loading: boolean): void {
    if (this.generateButton) {
      this.generateButton.disabled = loading;
      this.generateButton.textContent = loading ? 'Generating...' : 'Generate Hash';
    }
    if (this.textarea) {
      this.textarea.disabled = loading;
    }
  }

  public destroy(): void {
    this.container.innerHTML = '';
  }
}
