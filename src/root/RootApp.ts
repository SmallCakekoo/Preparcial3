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
    const state = store.getState();
    console.log("State changed, current path:", state.currentPath);
    console.log("Window location path:", window.location.pathname);

    // Solo actualizar si la ruta en el estado es diferente a la actual
    if (state.currentPath !== window.location.pathname) {
      console.log("Path mismatch, updating route");
      this.handleRouteChange();
    }
  }

  setupRouting() {
    // Manejar la ruta inicial
    this.handleRouteChange();

    // Escuchar cambios en el historial del navegador
    window.addEventListener("popstate", () => {
      console.log("PopState event triggered");
      this.handleRouteChange();
    });

    // Escuchar eventos de navegación personalizados
    window.addEventListener("navigate", ((event: CustomEvent) => {
      console.log("Navigate event triggered:", event.detail);
      const path = event.detail.path;
      window.history.pushState({}, "", path);
      this.handleRouteChange();
    }) as EventListener);

    // Manejar clicks en enlaces
    this.shadowRoot?.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A" && target.hasAttribute("href")) {
        e.preventDefault();
        const href = target.getAttribute("href");
        if (href) {
          console.log("Link clicked, navigating to:", href);
          window.history.pushState({}, "", href);
          this.handleRouteChange();
        }
      }
    });
  }

  handleRouteChange() {
    if (!this.shadowRoot) return;
    const path = window.location.pathname;
    console.log("Handling route change to:", path);

    const content = this.shadowRoot.querySelector("#content");
    if (!content) {
      console.error("Content container not found");
      return;
    }

    // Limpiar el contenido actual
    content.innerHTML = "";

    // Crear y agregar el nuevo componente
    let newComponent: HTMLElement;
    switch (path) {
      case "/":
        newComponent = document.createElement("menu-page");
        break;
      case "/login":
        newComponent = document.createElement("login-form");
        break;
      case "/register":
        newComponent = document.createElement("register-form");
        break;
      case "/post":
        newComponent = document.createElement("post-page");
        break;
      default:
        newComponent = document.createElement("four-page");
        break;
    }

    // Agregar el nuevo componente al DOM
    content.appendChild(newComponent);
    console.log("New component added:", newComponent.tagName);
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
