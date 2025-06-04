import { AppDispatcher } from "../flux/Dispatcher";
import { NavigationActionsType } from "../flux/Actions";

class FourPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
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
          }
          
          .not-found {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 80vh;
            text-align: center;
            padding: 0 20px;
          }
          
          h1 {
            font-size: 6rem;
            color: var(--primary-color);
            margin: 0;
            line-height: 1;
          }
          
          h2 {
            font-size: 2rem;
            color: var(--secondary-color);
            margin: 10px 0 30px;
          }
          
          p {
            color: var(--text-secondary);
            margin-bottom: 30px;
            font-size: 1.1rem;
          }
          
          button {
            font-family: montserrat;
            padding: 12px 24px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          button:hover {
            background-color: #3a56d4;
          }
        </style>
        
        <div class="not-found">
          <h1>404</h1>
          <h2>Página no encontrada</h2>
          <p>Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
          <button id="home-btn">Volver al inicio</button>
        </div>
      `;

    const homeBtn = this.shadowRoot.querySelector("#home-btn");
    homeBtn?.addEventListener("click", () => {
      AppDispatcher.dispatch({
        type: NavigationActionsType.NAVIGATE,
        payload: { path: "/" },
      });
    });
  }
}

customElements.define("four-page", FourPage);
