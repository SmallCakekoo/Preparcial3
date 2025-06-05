import { store } from "../flux/Store";

class RootApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupRouting();
    store.subscribe(this.handleStateChange.bind(this));
  }

  handleStateChange() {
    this.handleRouteChange();
  }

  setupRouting() {
    this.handleRouteChange();
    window.addEventListener("popstate", () => this.handleRouteChange());

    // Escuchar eventos de navegación personalizados
    window.addEventListener("navigate", ((event: CustomEvent) => {
      const path = event.detail.path;
      window.history.pushState({}, "", path);
      this.handleRouteChange();
    }) as EventListener);

    this.shadowRoot?.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A" && target.hasAttribute("href")) {
        e.preventDefault();
        const href = target.getAttribute("href");
        if (href) {
          window.history.pushState({}, "", href);
          this.handleRouteChange();
        }
      }
    });
  }

  handleRouteChange() {
    if (!this.shadowRoot) return;
    const path = window.location.pathname;
    console.log("Ruta actual:", path);
    const content = this.shadowRoot.querySelector("#content");
    if (!content) return;
    content.innerHTML = "";

    switch (path) {
      case "/":
        content.innerHTML = `<menu-page></menu-page>`;
        break;
      case "/login":
        content.innerHTML = `<login-form></login-form>`;
        break;
      case "/register":
        content.innerHTML = `<register-form></register-form>`;
        break;
      case "/post":
        content.innerHTML = `<post-page></post-page>`;
        break;
      default:
        content.innerHTML = `<four-page></four-page>`;
        break;
    }
  }

  render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: montserrat;
          --primary-color: #4361ee;
          --secondary-color: #3f3d56;
          --background-color: #f8f9fa;
          --card-background: #ffffff;
          --border-color: #e9ecef;
          --text-color: #212529;
          --text-secondary: #6c757d;
          --success-color: #4CAF50;
          --warning-color: #ff9800;
          --danger-color: #f44336;
          --border-radius: 8px;
          --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          color: var(--text-color);
          background-color: var(--background-color);
          margin: 0;
          padding: 0;
        }
        
        * {
          box-sizing: border-box;
        }
        
        .app-container {
          display: flex;
          min-height: 100vh;
        }
        
        .main-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }
        
        #content {
          padding: 20px;
          min-height: calc(100vh - 40px);
          display: flex;
          flex-direction: column;
        }
      </style>
      
      <div class="app-container">
        <div class="main-content">
          <div id="content">
            <menu-page></menu-page>
          </div>
        </div>
      </div>
    `;
  }
}

export default RootApp;
