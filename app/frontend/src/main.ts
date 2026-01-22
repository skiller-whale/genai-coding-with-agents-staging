import { HashGenerator } from './components/HashGenerator.js';
import { ContentStorage } from './components/ContentStorage.js';
import { ContentView } from './components/ContentView.js';
import './styles/main.css';
import './styles/components.css';

type Component = HashGenerator | ContentStorage | ContentView | null;

class App {
  private container: HTMLElement;
  private navContainer: HTMLElement;
  private currentComponent: Component = null;

  constructor() {
    const appElement = document.getElementById('app');
    if (!appElement) {
      throw new Error('App container not found');
    }

    this.container = appElement;
    this.navContainer = document.createElement('nav');
    this.navContainer.className = 'nav';

    this.init();
  }

  private init(): void {
    // Render navigation
    this.renderNav();

    // Handle initial route
    this.handleRoute();

    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  private renderNav(): void {
    this.navContainer.innerHTML = `
      <div class="nav-container">
        <a href="#/" class="nav-title">PasteHash</a>
        <div class="nav-links">
          <a href="#/" class="nav-link">New Paste</a>
          <a href="#/hash" class="nav-link">Hash Tool</a>
        </div>
      </div>
    `;

    this.container.prepend(this.navContainer);
    this.updateActiveNavLink();
  }

  private updateActiveNavLink(): void {
    const links = this.navContainer.querySelectorAll('.nav-link');
    const currentHash = window.location.hash;

    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && currentHash.startsWith(href)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  private handleRoute(): void {
    // Clean up previous component
    if (this.currentComponent) {
      this.currentComponent.destroy();
      this.currentComponent = null;
    }

    // Get current route
    const hash = window.location.hash.slice(1) || '/';
    const { route, params } = this.parseRoute(hash);

    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'content';

    // Render appropriate component
    switch (route) {
      case '/':
      case '/paste':
        this.currentComponent = new ContentStorage(contentContainer);
        break;

      case '/hash':
        this.currentComponent = new HashGenerator(contentContainer);
        break;

      case '/view':
        if (params.hash) {
          this.currentComponent = new ContentView(contentContainer, params.hash);
        } else {
          this.render404(contentContainer);
        }
        break;

      default:
        this.render404(contentContainer);
        break;
    }

    // Update container
    const existingContent = this.container.querySelector('.content');
    if (existingContent) {
      existingContent.replaceWith(contentContainer);
    } else {
      this.container.appendChild(contentContainer);
    }

    this.updateActiveNavLink();
  }

  private parseRoute(hash: string): { route: string; params: Record<string, string> } {
    // Handle routes like /view/abc123...
    const viewMatch = hash.match(/^\/view\/([a-f0-9]{64})$/);
    if (viewMatch) {
      return {
        route: '/view',
        params: { hash: viewMatch[1] },
      };
    }

    // Default routes
    if (hash === '/hash' || hash === '/paste') {
      return { route: hash, params: {} };
    }

    // Fallback to content storage for root
    if (hash === '/' || hash === '') {
      return { route: '/', params: {} };
    }

    return { route: '/404', params: {} };
  }

  private render404(container: HTMLElement): void {
    container.innerHTML = `
      <div class="card">
        <h2>404 - Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <div class="button-group">
          <a href="#/" class="btn btn-primary">New Paste</a>
          <a href="#/hash" class="btn btn-secondary">Hash Tool</a>
        </div>
      </div>
    `;
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
