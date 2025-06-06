import { store } from "../flux/Store";
import { Post, AppState } from "../types/SrcTypes";

class PostList extends HTMLElement {
  private posts: Post[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // Cargar los posts del estado actual
    const state = store.getState();
    this.posts = state.posts;
    this.render();

    // Suscribirse a los cambios del estado
    store.subscribe(this.handleStateChange.bind(this));
  }

  disconnectedCallback() {
    store.unsubscribe(this.handleStateChange.bind(this));
  }

  handleStateChange(state: AppState) {
    if (state.posts) {
      this.posts = state.posts;
      this.render();
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
        
        .post-list {
          display: flex;
          flex-direction: column;
          gap: 25px;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .empty-state {
          text-align: center;
          padding: 40px;
          background: var(--card-bg);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          border: 1px solid var(--border-color);
        }
        
        .empty-state h3 {
          color: var(--primary-color);
          font-size: 1.8rem;
          margin-bottom: 15px;
          font-weight: 600;
        }
        
        .empty-state p {
          color: var(--text-secondary);
          font-size: 1.1rem;
          line-height: 1.6;
        }
        
        @media (max-width: 768px) {
          .post-list {
            padding: 15px;
            gap: 20px;
          }
          
          .empty-state {
            padding: 30px 20px;
          }
          
          .empty-state h3 {
            font-size: 1.5rem;
          }
          
          .empty-state p {
            font-size: 1rem;
          }
        }
      </style>
      
      <div class="post-list">
        ${
          this.posts.length === 0
            ? `<div class="empty-state">
              <h3>No hay posts aún</h3>
              <p>Sé el primero en compartir algo</p>
            </div>`
            : this.posts
                .map(
                  (post) => `
              <post-card post='${JSON.stringify(post).replace(
                /'/g,
                "&apos;"
              )}'></post-card>
            `
                )
                .join("")
        }
      </div>
    `;
  }
}

export default PostList;
