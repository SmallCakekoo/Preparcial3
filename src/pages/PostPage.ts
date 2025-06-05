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
        .post-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        h1 {
          color: #333;
          margin-bottom: 20px;
        }

        .error-message {
          color: #dc3545;
          margin: 10px 0;
          text-align: center;
        }

        .user-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          justify-content: flex-end;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s;
        }

        .btn-logout {
          background-color: #6c757d;
          color: white;
        }

        .btn-delete {
          background-color: #dc3545;
          color: white;
        }

        .btn:hover {
          opacity: 0.9;
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
