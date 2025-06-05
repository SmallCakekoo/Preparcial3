import { store } from "../flux/Store";
import { AppState } from "../types/SrcTypes";
import {
  logoutUser,
  deleteUserAccount,
} from "../services/firebase/auth-service";

class PostPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    store.subscribe(this.handleStateChange.bind(this));
  }

  disconnectedCallback() {
    store.unsubscribe(this.handleStateChange.bind(this));
  }

  handleStateChange(state: AppState) {
    if (state.error) {
      const errorElement = this.shadowRoot?.querySelector(".error-message");
      if (errorElement) {
        errorElement.textContent = state.error;
      }
    }
    this.render();
  }

  async handleLogout() {
    try {
      await logoutUser();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  async handleDeleteAccount() {
    if (
      confirm(
        "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer."
      )
    ) {
      try {
        const result = await deleteUserAccount();
        if (result.success) {
          window.location.href = "/login";
        } else {
          const errorElement = this.shadowRoot?.querySelector(".error-message");
          if (errorElement) {
            errorElement.textContent =
              "Error al eliminar la cuenta. Por favor, intenta de nuevo.";
          }
        }
      } catch (error) {
        console.error("Error al eliminar la cuenta:", error);
        const errorElement = this.shadowRoot?.querySelector(".error-message");
        if (errorElement) {
          errorElement.textContent =
            "Error al eliminar la cuenta. Por favor, intenta de nuevo.";
        }
      }
    }
  }

  render() {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        
        :host {
          display: block;
          font-family: 'Montserrat', sans-serif;
          --primary-color: #4361ee;
          --primary-hover: #3a56d4;
          --primary-light: #eef2ff;
          --secondary-color: #3f3d56;
          --secondary-hover: #33313f;
          --accent-color: #f72585;
          --text-color: #2b2d42;
          --text-secondary: #64748b;
          --border-color: #e0e0e0;
          --background-color: #f9f9f9;
          --card-bg: #ffffff;
          --shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          --border-radius: 12px;
        }
        
        .post-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        h1 {
          color: var(--text-color);
          margin-bottom: 20px;
          font-weight: 600;
        }

        .error-message {
          color: var(--accent-color);
          margin: 10px 0;
          text-align: center;
        }

        .user-actions {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          justify-content: flex-end;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .btn-logout {
          background: var(--secondary-color);
          color: white;
        }

        .btn-logout:hover {
          background: var(--secondary-hover);
          transform: translateY(-1px);
        }

        .btn-delete {
          background: var(--accent-color);
          color: white;
        }

        .btn-delete:hover {
          background: #e01e6f;
          transform: translateY(-1px);
        }

        .btn:active {
          transform: translateY(0);
        }
        
        @media (max-width: 768px) {
          .user-actions {
            flex-direction: column;
            align-items: stretch;
          }
          
          .btn {
            width: 100%;
            text-align: center;
          }
        }
      </style>
      
      <div class="post-page">
        <div class="user-actions">
          <button class="btn btn-logout">Cerrar Sesión</button>
          <button class="btn btn-delete">Eliminar Cuenta</button>
        </div>
        <h1>Publicaciones</h1>
        <div class="error-message"></div>
        <post-form></post-form>
        <post-list></post-list>
      </div>
    `;

    // Agregar event listeners a los botones
    const logoutButton = this.shadowRoot.querySelector(".btn-logout");
    const deleteButton = this.shadowRoot.querySelector(".btn-delete");

    logoutButton?.addEventListener("click", this.handleLogout.bind(this));
    deleteButton?.addEventListener(
      "click",
      this.handleDeleteAccount.bind(this)
    );
  }
}

export default PostPage;
