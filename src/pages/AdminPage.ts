import { AppDispatcher } from "../flux/Dispatcher";
import { store } from "../flux/Store";
import { NavigateActionsType } from "../flux/Actions";
import {
  getAllUsers,
  deleteUser,
  UserData,
  updateUser,
} from "../services/firebase/user-service";
import {
  getPosts,
  deletePost,
  updatePost,
} from "../services/firebase/post-service";
import { Post } from "../types/SrcTypes";

class AdminPage extends HTMLElement {
  private users: UserData[] = [];
  private posts: Post[] = [];
  private editingUserId: string | null = null;
  private editingPostId: string | null = null;

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

  async handleUpdateUser(userId: string, formData: FormData) {
    try {
      const userData = {
        username: formData.get("username") as string,
        email: formData.get("email") as string,
        role: formData.get("role") as string,
      };

      await updateUser(userId, userData);
      this.users = await getAllUsers();
      this.editingUserId = null;
      this.render();
      alert("Usuario actualizado exitosamente");
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert("Error al actualizar el usuario");
    }
  }

  async handleUpdatePost(postId: string, formData: FormData) {
    try {
      const postData = {
        content: formData.get("content") as string,
      };

      await updatePost(postId, postData);
      this.posts = await getPosts();
      this.editingPostId = null;
      this.render();
      alert("Publicación actualizada exitosamente");
    } catch (error) {
      console.error("Error al actualizar publicación:", error);
      alert("Error al actualizar la publicación");
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

        .edit-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
          margin-right: 8px;
        }

        .edit-btn:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
        }

        .edit-form {
          background: var(--card-bg);
          padding: 20px;
          border-radius: var(--border-radius);
          margin-top: 10px;
          box-shadow: var(--shadow);
        }

        .edit-form input,
        .edit-form select,
        .edit-form textarea {
          width: 100%;
          padding: 8px;
          margin: 8px 0;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          font-size: 14px;
        }

        .edit-form textarea {
          min-height: 100px;
          resize: vertical;
        }

        .form-buttons {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .cancel-btn {
          background: var(--secondary-color);
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover {
          background: var(--secondary-hover);
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
                      <button class="edit-btn" data-user-id="${user.uid}">
                        Editar
                      </button>
                      <button class="delete-btn" data-user-id="${user.uid}">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                  ${
                    this.editingUserId === user.uid
                      ? `
                    <tr>
                      <td colspan="5">
                        <form class="edit-form" id="edit-user-form-${user.uid}">
                          <input type="text" name="username" value="${
                            user.username
                          }" placeholder="Nombre de usuario" required>
                          <input type="email" name="email" value="${
                            user.email
                          }" placeholder="Email" required>
                          <select name="role" required>
                            <option value="user" ${
                              user.role === "user" ? "selected" : ""
                            }>Usuario</option>
                            <option value="admin" ${
                              user.role === "admin" ? "selected" : ""
                            }>Administrador</option>
                          </select>
                          <div class="form-buttons">
                            <button type="submit" class="edit-btn">Guardar</button>
                            <button type="button" class="cancel-btn" data-cancel-user="${
                              user.uid
                            }">Cancelar</button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  `
                      : ""
                  }
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
                      <button class="edit-btn" data-post-id="${post.id}">
                        Editar
                      </button>
                      <button class="delete-btn" data-post-id="${post.id}">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                  ${
                    this.editingPostId === post.id
                      ? `
                    <tr>
                      <td colspan="4">
                        <form class="edit-form" id="edit-post-form-${post.id}">
                          <textarea name="content" required>${post.content}</textarea>
                          <div class="form-buttons">
                            <button type="submit" class="edit-btn">Guardar</button>
                            <button type="button" class="cancel-btn" data-cancel-post="${post.id}">Cancelar</button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  `
                      : ""
                  }
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

    // Agregar event listeners para los botones de editar usuarios
    const editUserButtons = this.shadowRoot.querySelectorAll(
      ".users-table .edit-btn"
    );
    editUserButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const userId = (e.target as HTMLElement).dataset.userId;
        if (userId) {
          this.editingUserId = userId;
          this.render();
        }
      });
    });

    // Agregar event listeners para los formularios de edición de usuarios
    const editUserForms = this.shadowRoot.querySelectorAll(
      ".users-table .edit-form"
    );
    editUserForms.forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const userId = form.id.split("-")[3];
        this.handleUpdateUser(userId, new FormData(form as HTMLFormElement));
      });
    });

    // Agregar event listeners para los botones de cancelar edición de usuarios
    const cancelUserButtons = this.shadowRoot.querySelectorAll(
      ".users-table .cancel-btn"
    );
    cancelUserButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const userId = (e.target as HTMLElement).dataset.cancelUser;
        if (userId) {
          this.editingUserId = null;
          this.render();
        }
      });
    });

    // Agregar event listeners para los botones de editar posts
    const editPostButtons = this.shadowRoot.querySelectorAll(
      ".posts-table .edit-btn"
    );
    editPostButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const postId = (e.target as HTMLElement).dataset.postId;
        if (postId) {
          this.editingPostId = postId;
          this.render();
        }
      });
    });

    // Agregar event listeners para los formularios de edición de posts
    const editPostForms = this.shadowRoot.querySelectorAll(
      ".posts-table .edit-form"
    );
    editPostForms.forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const postId = form.id.split("-")[3];
        this.handleUpdatePost(postId, new FormData(form as HTMLFormElement));
      });
    });

    // Agregar event listeners para los botones de cancelar edición de posts
    const cancelPostButtons = this.shadowRoot.querySelectorAll(
      ".posts-table .cancel-btn"
    );
    cancelPostButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const postId = (e.target as HTMLElement).dataset.cancelPost;
        if (postId) {
          this.editingPostId = null;
          this.render();
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
