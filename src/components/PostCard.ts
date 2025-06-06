import { Post } from "../types/SrcTypes";
// import { PostActions } from "../flux/Actions";

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
      try {
        // Reemplazar las entidades HTML antes de parsear
        const decodedValue = newValue.replace(/&apos;/g, "'");
        this.post = JSON.parse(decodedValue);
        this.render();
      } catch (error) {
        console.error("Error al parsear el post:", error);
        console.error("Valor recibido:", newValue);
      }
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this.shadowRoot || !this.post) return;

    const date = new Date(this.post.createdAt).toLocaleDateString();

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
        
        .post-card {
          background: var(--card-bg);
          padding: 25px;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          margin-bottom: 20px;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }
        
        .post-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
        }
        
        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid var(--border-color);
        }
        
        .post-author {
          color: var(--primary-color);
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .post-content {
          color: var(--text-color);
          margin-bottom: 20px;
          line-height: 1.6;
          font-size: 1rem;
        }

        .post-image {
          max-width: 100%;
          max-height: 400px;
          border-radius: 8px;
          margin: 15px 0;
        }
        
        .post-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid var(--border-color);
        }
        
        @media (max-width: 768px) {
          .post-card {
            padding: 20px;
          }
          
          .post-author {
            font-size: 1rem;
          }
          
          .post-content {
            font-size: 0.95rem;
          }
          
        }
      </style>
      
      <div class="post-card">
        <div class="post-header">
          <span class="post-author">${this.post.authorName}</span>
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
          <span class="post-date">${date}</span>
        </div>
      </div>
    `;
  }
}

export default PostCard;
