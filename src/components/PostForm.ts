import { store } from "../flux/Store";
import { AppState } from "../types/SrcTypes";
import { PostActions } from "../flux/Actions";
import { uploadMeme } from "../services/supabase/StorageService";

class PostForm extends HTMLElement {
  private selectedFile: File | null = null;

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
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = this.shadowRoot?.querySelector(
            ".image-preview"
          ) as HTMLImageElement;
          if (preview && e.target?.result) {
            preview.src = e.target.result as string;
            preview.style.display = "block";
          }
        };
        reader.readAsDataURL(file);
      }
    });

    form?.addEventListener("submit", async (e) => {
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

        let imageUrl: string | undefined;

        if (this.selectedFile) {
          try {
            const result = await uploadMeme(this.selectedFile);
            if (result) {
              imageUrl = result.url;
            }
          } catch (error) {
            console.error("Error al subir la imagen:", error);
            const errorElement =
              this.shadowRoot?.querySelector(".error-message");
            if (errorElement) {
              errorElement.textContent =
                "Error al subir la imagen. Por favor, intenta de nuevo.";
            }
            return;
          }
        }

        // Usar la acción del Store para crear el post
        PostActions.createPost(contentInput.value.trim(), imageUrl);
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

        .submit-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 1rem;
          transition: all 0.2s ease;
          align-self: flex-end;
        }

        .submit-btn:hover {
          background: var(--primary-hover);
          transform: translateY(-1px);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .error-message {
          color: var(--accent-color);
          margin: 10px 0;
          text-align: center;
        }

        @media (max-width: 768px) {
          .post-form {
            padding: 20px;
          }
          
          textarea {
            width: 100%;
          }
          
          .submit-btn {
            width: 100%;
          }
        }
      </style>
      
      <div class="post-form">
        <form>
          <textarea
            id="content"
            placeholder="¿Qué estás pensando?"
            required
          ></textarea>
          <div class="image-upload-container">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              style="display: none"
            />
            <label for="image-upload" class="upload-btn">
              Subir imagen
            </label>
            <img class="image-preview" alt="Vista previa" />
          </div>
          <div class="error-message"></div>
          <button type="submit" class="submit-btn">Publicar</button>
        </form>
      </div>
    `;
  }
}

export default PostForm;
