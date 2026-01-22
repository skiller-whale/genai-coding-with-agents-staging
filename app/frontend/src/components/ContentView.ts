import { apiClient } from '../api/client.js';
import { isValidHash } from '../utils/validators.js';

export class ContentView {
  private container: HTMLElement;
  private hash: string;

  constructor(container: HTMLElement, hash: string) {
    this.container = container;
    this.hash = hash;
    this.render();
    this.loadContent();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="view-container">
        <div class="view-header">
          <div class="view-actions">
            <a href="#/" class="btn btn-secondary">New Paste</a>
            <button id="raw-btn" class="btn btn-secondary" disabled>Raw</button>
          </div>
        </div>

        <div id="loading" class="loading">
          <div class="spinner"></div>
          <p>Loading paste...</p>
        </div>

        <div id="error-message" class="error-message hidden"></div>

        <div id="content-display" class="paste-display hidden">
          <pre id="content-text" class="paste-content"></pre>
        </div>
      </div>
    `;
  }

  private async loadContent(): Promise<void> {
    const loadingDiv = this.container.querySelector('#loading');
    const errorDiv = this.container.querySelector('#error-message');
    const contentDiv = this.container.querySelector('#content-display');

    // Validate hash format
    if (!isValidHash(this.hash)) {
      this.showError('Invalid content hash format');
      return;
    }

    try {
      const content = await apiClient.retrieveContent(this.hash);
      this.showContent(content);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load content';
      this.showError(message);
    } finally {
      loadingDiv?.classList.add('hidden');
    }
  }

  private showContent(content: string): void {
    const contentDiv = this.container.querySelector('#content-display');
    const contentText = this.container.querySelector('#content-text');

    if (contentText) {
      contentText.textContent = content;
    }

    contentDiv?.classList.remove('hidden');
  }

  private showError(message: string): void {
    const errorDiv = this.container.querySelector('#error-message');
    const loadingDiv = this.container.querySelector('#loading');

    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');
    }

    loadingDiv?.classList.add('hidden');

    // Add helpful action buttons for errors
    const actionButtons = document.createElement('div');
    actionButtons.className = 'button-group';
    actionButtons.style.marginTop = '1rem';
    actionButtons.innerHTML = `
      <a href="#/" class="btn btn-primary">New Paste</a>
      <a href="#/hash" class="btn btn-secondary">Hash Tool</a>
    `;
    errorDiv?.appendChild(actionButtons);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  public destroy(): void {
    this.container.innerHTML = '';
  }
}
