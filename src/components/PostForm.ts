import { store } from "../flux/Store";
import { AppState } from "../types/SrcTypes";
import { PostActions } from "../flux/Actions";

class PostForm extends HTMLElement {
  private selectedFile: string | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
    store.subscribe(this.handleStateChange.bind(this));
  }

  disconnectedCallback() {
    store.unsubscribe(this.handleStateChange.bind(this));
  }

  handleStateChange(state: AppState) {
    console.log("PostForm - Estado actualizado:", state);
    // Solo re-renderizar si cambia el estado de autenticación
    const currentState = store.getState();
    if (currentState.isAuthenticated !== state.isAuthenticated) {
      this.render();
    }
  }

  setupListeners() {
    const form = this.shadowRoot?.querySelector("form");
    const fileInput = this.shadowRoot?.querySelector(
      "#image-upload"
    ) as HTMLInputElement;

    fileInput?.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = this.shadowRoot?.querySelector(
            ".image-preview"
          ) as HTMLImageElement;
          if (preview && e.target?.result) {
            preview.src = e.target.result as string;
            preview.style.display = "block";
            this.selectedFile = e.target.result as string;
          }
        };
        reader.readAsDataURL(file);
      }
    });

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("PostForm - Formulario enviado");

      const state = store.getState();
      if (!state.isAuthenticated || !state.currentUser) {
        const errorElement = this.shadowRoot?.querySelector(".error-message");
        if (errorElement) {
          errorElement.textContent = "Debes iniciar sesión para publicar";
        }
        return;
      }

      const contentInput = this.shadowRoot?.querySelector(
        "#content"
      ) as HTMLTextAreaElement;

      if (contentInput && contentInput.value.trim()) {
        console.log(
          "PostForm - Contenido del post:",
          contentInput.value.trim()
        );
        console.log(
          "PostForm - Imagen seleccionada:",
          this.selectedFile ? "Sí" : "No"
        );

        // Usar la acción del Store para crear el post
        PostActions.createPost(
          contentInput.value.trim(),
          this.selectedFile || undefined
        );
        console.log("PostForm - Acción createPost disparada");

        // Limpiar el formulario
        contentInput.value = "";
        this.selectedFile = null;
        const preview = this.shadowRoot?.querySelector(
          ".image-preview"
        ) as HTMLImageElement;
        if (preview) {
          preview.src = "";
          preview.style.display = "none";
        }
        if (fileInput) {
          fileInput.value = "";
        }
      } else {
        console.log("PostForm - El contenido está vacío");
      }
    });
  }

  render() {
    if (!this.shadowRoot) return;

    const state = store.getState();
    const isAuthenticated = state.isAuthenticated && state.currentUser;

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
        
        .post-form {
          background: var(--card-bg);
          padding: 25px;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          margin-bottom: 20px;
          border: 1px solid var(--border-color);
        }
        
        form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        textarea {
          width: 95%;
          min-height: 120px;
          padding: 15px;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          resize: vertical;
          font-family: inherit;
          font-size: 1rem;
          color: var(--text-color);
          transition: all 0.2s ease;
        }
        
        textarea:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px var(--primary-light);
        }
        
        .image-upload-container {
          display: flex;
          align-items: center;
          gap: 15px;
          margin: 10px 0;
        }

        .image-preview {
          max-width: 200px;
          max-height: 200px;
          display: none;
          border-radius: 8px;
        }

        .upload-btn {
          background: var(--secondary-color);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .upload-btn:hover {
          background: var(--secondary-hover);
          transform: translateY(-1px);
        }
        
        .upload-btn:active {
          transform: translateY(0);
        }
        
        button[type="submit"] {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          align-self: flex-end;
          transition: all 0.2s ease;
        }
        
        button[type="submit"]:hover {
          background: var(--primary-hover);
          transform: translateY(-1px);
        }
        
        button[type="submit"]:active {
          transform: translateY(0);
        }

        .error-message {
          color: var(--accent-color);
          margin-top: 10px;
          text-align: center;
          font-size: 0.9rem;
        }

        .auth-message {
          text-align: center;
          padding: 30px;
          background: var(--primary-light);
          border-radius: var(--border-radius);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }
        
        .auth-message h3 {
          color: var(--primary-color);
          font-size: 1.5rem;
          margin-bottom: 10px;
          font-weight: 600;
        }
        
        .auth-message p {
          font-size: 1rem;
          line-height: 1.6;
        }
        
        @media (max-width: 768px) {
          .post-form {
            padding: 20px;
          }
          
          textarea {
            min-height: 100px;
            font-size: 0.95rem;
          }
          
          button[type="submit"] {
            width: 100%;
            font-size: 0.95rem;
          }
          
          .upload-btn {
            width: 100%;
            text-align: center;
          }
        }
      </style>
      
      <div class="post-form">
        ${
          isAuthenticated
            ? `<form>
                <textarea 
                  id="content" 
                  placeholder="¿Qué estás pensando?"
                  required
                ></textarea>
                <div class="image-upload-container">
                  <input type="file" id="image-upload" accept="image/*" style="display: none;">
                  <button type="button" class="upload-btn" onclick="this.previousElementSibling.click()">
                    Subir imagen
                  </button>
                  <img class="image-preview" alt="Vista previa">
                </div>
                <button type="submit">Publicar</button>
                <div class="error-message"></div>
              </form>`
            : `<div class="auth-message">
                <h3>Inicia sesión para publicar</h3>
                <p>Necesitas estar autenticado para crear publicaciones</p>
              </div>`
        }
      </div>
    `;

    if (isAuthenticated) {
      this.setupListeners();
    }
  }
}

export default PostForm;
