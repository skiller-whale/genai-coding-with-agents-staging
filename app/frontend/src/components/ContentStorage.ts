import { apiClient } from '../api/client.js';
import { copyToClipboard, showTemporaryMessage } from '../utils/clipboard.js';

interface ContentHistoryItem {
  url: string;
  preview: string;
  timestamp: number;
}

const HISTORY_KEY = 'content-history';
const MAX_HISTORY_ITEMS = 10;

export class ContentStorage {
  private container: HTMLElement;
  private textarea: HTMLTextAreaElement | null = null;
  private storeButton: HTMLButtonElement | null = null;
  private resultDiv: HTMLElement | null = null;
  private errorDiv: HTMLElement | null = null;
  private historyDiv: HTMLElement | null = null;
  private copyUrlButton: HTMLButtonElement | null = null;
  private viewLinkButton: HTMLAnchorElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
    this.attachEventListeners();
    this.renderHistory();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="paste-container">
        <div class="paste-main">
          <textarea
            id="content-input"
            class="paste-textarea"
            placeholder="Paste your content here..."
            rows="20"
            autofocus
          ></textarea>

          <div class="paste-actions">
            <button id="store-btn" class="btn btn-primary btn-large">
              Create Paste
            </button>
          </div>

          <div id="error-message" class="error-message hidden"></div>

          <div id="result" class="result hidden">
            <div class="result-success">
              <strong>Paste created successfully!</strong>
            </div>
            <div class="url-display">
              <input type="text" id="content-url" class="url-input" readonly />
              <button id="copy-url-btn" class="btn btn-secondary">
                Copy Link
              </button>
              <a id="view-link" href="#" class="btn btn-secondary">
                View
              </a>
            </div>
          </div>
        </div>

        <div id="history" class="history-sidebar">
          <h3>Recent Pastes</h3>
          <div id="history-list"></div>
        </div>
      </div>
    `;

    // Cache DOM elements
    this.textarea = this.container.querySelector('#content-input');
    this.storeButton = this.container.querySelector('#store-btn');
    this.resultDiv = this.container.querySelector('#result');
    this.errorDiv = this.container.querySelector('#error-message');
    this.historyDiv = this.container.querySelector('#history-list');
    this.copyUrlButton = this.container.querySelector('#copy-url-btn');
    this.viewLinkButton = this.container.querySelector('#view-link');
  }

  private attachEventListeners(): void {
    this.storeButton?.addEventListener('click', () => this.handleStore());
    this.copyUrlButton?.addEventListener('click', () => this.handleCopyUrl());

    // Allow Ctrl/Cmd+Enter to store
    this.textarea?.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        this.handleStore();
      }
    });
  }

  private async handleStore(): Promise<void> {
    const content = this.textarea?.value.trim() || '';

    // Validate input
    if (!content) {
      this.showError('Please enter some content to store');
      return;
    }

    // Show loading state
    this.setLoading(true);
    this.hideError();
    this.hideResult();

    try {
      const response = await apiClient.storeContent(content);
      this.showResult(response.url);
      this.addToHistory(response.url, content);
      this.renderHistory();

      // Clear textarea after successful storage
      if (this.textarea) {
        this.textarea.value = '';
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to store content';
      this.showError(message);
    } finally {
      this.setLoading(false);
    }
  }

  private async handleCopyUrl(): Promise<void> {
    const urlInput = this.container.querySelector('#content-url') as HTMLInputElement;
    const url = urlInput?.value;
    if (!url) return;

    try {
      await copyToClipboard(url);
      if (this.copyUrlButton) {
        showTemporaryMessage(this.copyUrlButton, 'Copied!', 2000);
      }
    } catch (error) {
      this.showError('Failed to copy URL');
    }
  }

  private showResult(url: string): void {
    const urlInput = this.container.querySelector('#content-url') as HTMLInputElement;
    if (urlInput) {
      const fullUrl = `${window.location.origin}/#/view${url.replace('/content', '')}`;
      urlInput.value = fullUrl;
    }

    // Extract hash from URL for view link
    const hash = url.split('/').pop();
    if (this.viewLinkButton && hash) {
      this.viewLinkButton.href = `#/view/${hash}`;
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
    if (this.storeButton) {
      this.storeButton.disabled = loading;
      this.storeButton.textContent = loading ? 'Creating...' : 'Create Paste';
    }
    if (this.textarea) {
      this.textarea.disabled = loading;
    }
  }

  private addToHistory(url: string, content: string): void {
    const history = this.getHistory();
    const preview = content.substring(0, 100) + (content.length > 100 ? '...' : '');

    const newItem: ContentHistoryItem = {
      url,
      preview,
      timestamp: Date.now(),
    };

    // Add to beginning and limit size
    history.unshift(newItem);
    const limitedHistory = history.slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
  }

  private getHistory(): ContentHistoryItem[] {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private renderHistory(): void {
    if (!this.historyDiv) return;

    const history = this.getHistory();

    if (history.length === 0) {
      this.historyDiv.innerHTML = '<p class="empty-message">No content stored yet</p>';
      return;
    }

    this.historyDiv.innerHTML = history
      .map((item) => {
        const hash = item.url.split('/').pop();
        const date = new Date(item.timestamp).toLocaleString();
        return `
          <div class="history-item">
            <div class="history-preview">${this.escapeHtml(item.preview)}</div>
            <div class="history-meta">
              <span class="history-date">${date}</span>
              <a href="#/view/${hash}" class="btn btn-small">View</a>
            </div>
          </div>
        `;
      })
      .join('');
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
