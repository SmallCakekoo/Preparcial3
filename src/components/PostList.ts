import { store } from "../flux/Store";
import { Post, AppState } from "../types/SrcTypes";
import { getPosts } from "../services/firebase/post-service";

class PostList extends HTMLElement {
  private posts: Post[] = [];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.loadPosts();
    store.subscribe(this.handleStateChange.bind(this));
  }

  disconnectedCallback() {
    store.unsubscribe(this.handleStateChange.bind(this));
  }

  async loadPosts() {
    try {
      const posts = await getPosts();
      this.posts = posts;
      this.render();
    } catch (error) {
      console.error("Error al cargar los posts:", error);
    }
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
        .post-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 20px;
        }
        
        .empty-state {
          text-align: center;
          color: #666;
          padding: 40px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
              <post-card post='${JSON.stringify(post)}'></post-card>
            `
                )
                .join("")
        }
      </div>
    `;
  }
}

export default PostList;
