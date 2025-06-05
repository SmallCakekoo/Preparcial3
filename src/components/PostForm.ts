import { store } from "../flux/Store";
import { AppState } from "../types/SrcTypes";
import { PostActionsType } from "../flux/Actions";
import { AppDispatcher } from "../flux/Dispatcher";

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
    if (state.error) {
      const errorElement = this.shadowRoot?.querySelector(".error-message");
      if (errorElement) {
        errorElement.textContent = state.error;
      }
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
      const contentInput = this.shadowRoot?.querySelector(
        "#content"
      ) as HTMLTextAreaElement;

      if (contentInput && contentInput.value.trim()) {
        const state = store.getState();
        if (state.currentUser) {
          // Crear nuevo post
          const newPost = {
            id: crypto.randomUUID(),
            content: contentInput.value.trim(),
            userId: state.currentUser.uid,
            authorName: state.currentUser.displayName || "Anónimo",
            authorId: state.currentUser.uid,
            createdAt: new Date(),
            updatedAt: new Date(),
            likes: 0,
            comments: [],
            imageUrl: this.selectedFile || "",
          };

          // Actualizar el estado global
          AppDispatcher.dispatch({
            type: PostActionsType.SET_POSTS,
            payload: {
              posts: [newPost, ...(state.posts || [])],
            },
          });

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
        }
      }
    });
  }

  render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        .post-form {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
        
        form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        textarea {
          width: 100%;
          min-height: 100px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
          font-family: inherit;
        }
        
        .image-upload-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .image-preview {
          max-width: 200px;
          max-height: 200px;
          display: none;
          border-radius: 4px;
        }

        .upload-btn {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .upload-btn:hover {
          background: #45a049;
        }
        
        button[type="submit"] {
          background: #1a73e8;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          align-self: flex-end;
        }
        
        button[type="submit"]:hover {
          background: #1557b0;
        }

        .error-message {
          color: #dc3545;
          margin-top: 10px;
          text-align: center;
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
            <input type="file" id="image-upload" accept="image/*" style="display: none;">
            <button type="button" class="upload-btn" onclick="this.previousElementSibling.click()">
              Subir imagen
            </button>
            <img class="image-preview" alt="Vista previa">
          </div>
          <button type="submit">Publicar</button>
          <div class="error-message"></div>
        </form>
      </div>
    `;
  }
}

export default PostForm;
