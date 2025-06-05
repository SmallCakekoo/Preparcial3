import { Post } from "../types/SrcTypes";
// import { PostActions } from "../flux/Actions";
import { deletePost } from "../services/firebase/post-service";

class PostCard extends HTMLElement {
  private post: Post | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["post"];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "post" && newValue) {
      this.post = JSON.parse(newValue);
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  setupListeners() {
    const deleteButton = this.shadowRoot?.querySelector(".delete-btn");
    deleteButton?.addEventListener("click", async () => {
      if (this.post) {
        try {
          await deletePost(this.post.id);
        } catch (error) {
          console.error("Error al eliminar el post:", error);
        }
      }
    });
  }

  render() {
    if (!this.shadowRoot || !this.post) return;

    const date = new Date(this.post.createdAt).toLocaleDateString();

    this.shadowRoot.innerHTML = `
      <style>
        .post-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
        
        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .post-content {
          margin-bottom: 15px;
          line-height: 1.5;
        }

        .post-image {
          max-width: 100%;
          max-height: 400px;
          border-radius: 4px;
          margin: 10px 0;
        }
        
        .post-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #666;
          font-size: 0.9em;
        }
        
        .delete-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .delete-btn:hover {
          background: #c82333;
        }
      </style>
      
      <div class="post-card">
        <div class="post-header">
          <span class="post-date">${date}</span>
          <button class="delete-btn">Eliminar</button>
        </div>
        <div class="post-content">
          ${this.post.content}
        </div>
        ${
          this.post.imageUrl
            ? `<img src="${this.post.imageUrl}" alt="Post image" class="post-image">`
            : ""
        }
        <div class="post-footer">
          <span>Usuario: ${this.post.userId}</span>
        </div>
      </div>
    `;
  }
}

export default PostCard;
