import { AppDispatcher } from "../flux/Dispatcher";
import { store } from "../flux/Store";
import { NavigateActionsType } from "../flux/Actions";
import {
  getAllUsers,
  deleteUser,
  UserData,
} from "../services/firebase/user-service";
import { getPosts, deletePost } from "../services/firebase/post-service";
import { Post } from "../types/SrcTypes";

class AdminPage extends HTMLElement {
  private users: UserData[] = [];
  private posts: Post[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.loadUsers();
    this.loadPosts();
    store.subscribe(this.handleStateChange.bind(this));
  }

  disconnectedCallback() {
    store.unsubscribe(this.handleStateChange.bind(this));
  }

  handleStateChange() {
    const state = store.getState();
    if (!state.isAuthenticated || state.currentUser?.role !== "admin") {
      if (window.location.pathname !== "/") {
        AppDispatcher.dispatch({
          type: NavigateActionsType.NAVIGATE,
          payload: { path: "/" },
        });
      }
    }
  }

  async loadUsers() {
    try {
      this.users = await getAllUsers();
      this.render();
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  }

  async loadPosts() {
    try {
      this.posts = await getPosts();
      this.render();
    } catch (error) {
      console.error("Error al cargar publicaciones:", error);
    }
  }

  async handleDeleteUser(userId: string) {
    if (
      confirm(
        "¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
      )
    ) {
      try {
        await deleteUser(userId);
        this.users = this.users.filter((user) => user.uid !== userId);
        this.render();
        alert("Usuario eliminado exitosamente");
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
        let errorMessage = "Error al eliminar el usuario";

        if (error instanceof Error) {
          switch (error.message) {
            case "No hay usuario autenticado":
              errorMessage =
                "Sesión expirada. Por favor, vuelve a iniciar sesión.";
              break;
            case "No tienes permisos para eliminar usuarios":
              errorMessage = "No tienes permisos para eliminar usuarios.";
              break;
            case "No puedes eliminar tu propia cuenta desde aquí":
              errorMessage =
                "No puedes eliminar tu propia cuenta desde el panel de administración.";
              break;
            default:
              errorMessage = error.message;
          }
        }

        alert(errorMessage);
      }
    }
  }

  async handleDeletePost(postId: string) {
    if (
      confirm(
        "¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer."
      )
    ) {
      try {
        await deletePost(postId);
        this.posts = this.posts.filter((post) => post.id !== postId);
        this.render();
        alert("Publicación eliminada exitosamente");
      } catch (error) {
        console.error("Error al eliminar publicación:", error);
        alert("Error al eliminar la publicación");
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
          --shadow: 0 10px 30px rgba(67, 97, 238, 0.1);
          --border-radius: 12px;
          --danger-color: #ef4444;
          --danger-hover: #dc2626;
        }
        
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .admin-header {
          background: var(--card-bg);
          border-radius: var(--border-radius);
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: var(--shadow);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content {
          flex: 1;
        }
        
        h1 {
          color: var(--text-color);
          font-size: 2.5rem;
          margin-bottom: 15px;
          font-weight: 700;
        }

        h2 {
          color: var(--text-color);
          font-size: 1.8rem;
          margin: 40px 0 20px;
          font-weight: 600;
        }

        .logout-btn {
          background: var(--secondary-color);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logout-btn:hover {
          background: var(--secondary-hover);
          transform: translateY(-2px);
        }

        .logout-btn svg {
          width: 16px;
          height: 16px;
        }
        
        .users-table, .posts-table {
          width: 100%;
          background: var(--card-bg);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          overflow: hidden;
          margin-top: 20px;
        }

        .users-table table, .posts-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th,
        .users-table td,
        .posts-table th,
        .posts-table td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        .users-table th,
        .posts-table th {
          background: var(--primary-light);
          color: var(--primary-color);
          font-weight: 600;
        }

        .users-table tr:hover,
        .posts-table tr:hover {
          background: var(--background-color);
        }

        .role-badge {
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .role-admin {
          background: var(--primary-light);
          color: var(--primary-color);
        }

        .role-user {
          background: #e0f2fe;
          color: #0284c7;
        }

        .delete-btn {
          background: var(--danger-color);
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .delete-btn:hover {
          background: var(--danger-hover);
          transform: translateY(-2px);
        }

        .no-users, .no-posts {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary);
        }

        .post-content {
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      </style>
      
      <div class="admin-container">
        <div class="admin-header">
          <div class="header-content">
            <h1>Panel de Administración</h1>
            <p>Gestión de usuarios y publicaciones del sistema</p>
          </div>
          <button class="logout-btn" id="logout-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
        
        <h2>Usuarios</h2>
        <div class="users-table">
          ${
            this.users.length > 0
              ? `
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Fecha de Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${this.users
                  .map(
                    (user) => `
                  <tr>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>
                      <span class="role-badge role-${user.role.toLowerCase()}">
                        ${user.role}
                      </span>
                    </td>
                    <td>${user.createdAt.toLocaleDateString()}</td>
                    <td>
                      <button class="delete-btn" data-user-id="${user.uid}">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          `
              : `
            <div class="no-users">
              <p>No hay usuarios registrados</p>
            </div>
          `
          }
        </div>

        <h2>Publicaciones</h2>
        <div class="posts-table">
          ${
            this.posts.length > 0
              ? `
            <table>
              <thead>
                <tr>
                  <th>Autor</th>
                  <th>Contenido</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${this.posts
                  .map(
                    (post) => `
                  <tr>
                    <td>${post.authorName}</td>
                    <td class="post-content">${post.content}</td>
                    <td>${post.createdAt.toLocaleDateString()}</td>
                    <td>
                      <button class="delete-btn" data-post-id="${post.id}">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          `
              : `
            <div class="no-posts">
              <p>No hay publicaciones</p>
            </div>
          `
          }
        </div>
      </div>
    `;

    // Agregar event listeners para los botones de eliminar usuarios
    const deleteUserButtons = this.shadowRoot.querySelectorAll(
      ".users-table .delete-btn"
    );
    deleteUserButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const userId = (e.target as HTMLElement).dataset.userId;
        if (userId) {
          this.handleDeleteUser(userId);
        }
      });
    });

    // Agregar event listeners para los botones de eliminar publicaciones
    const deletePostButtons = this.shadowRoot.querySelectorAll(
      ".posts-table .delete-btn"
    );
    deletePostButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const postId = (e.target as HTMLElement).dataset.postId;
        if (postId) {
          this.handleDeletePost(postId);
        }
      });
    });

    // Agregar event listener para el botón de cerrar sesión
    const logoutBtn = this.shadowRoot.querySelector("#logout-btn");
    logoutBtn?.addEventListener("click", () => {
      AppDispatcher.dispatch({
        type: "LOGOUT",
        payload: {},
      });
      window.dispatchEvent(
        new CustomEvent("navigate", {
          detail: { path: "/" },
        })
      );
    });
  }
}

export default AdminPage;
