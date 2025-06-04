class RootApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupRouting();

    this.addEventListener("route-change", ((e: CustomEvent) => {
      if (e.detail && e.detail.path) {
        window.history.pushState({}, "", e.detail.path);
        this.handleRouteChange();
      }
    }) as EventListener);
  }

  setupRouting() {
    this.handleRouteChange();
    window.addEventListener("popstate", () => this.handleRouteChange());

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
        content.innerHTML = `
        <main-page></main-page>
        `;
        break;
      case "/login":
        content.innerHTML = `<login-form></login-form>`;
        break;
      case "/register":
        content.innerHTML = `<register-form mode="register"></register-form>`;
        break;
      case "/tasks":
        content.innerHTML = `<tasks-page></tasks-page>`;
        break;
      default:
        content.innerHTML = `
        <four-page></four-page>  
        `;
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
        }
      </style>
      
      <div class="app-container">
        <div class="main-content">
          <main id="content">
          </main>
        </div>
      </div>
    `;
  }
}

export default RootApp;
