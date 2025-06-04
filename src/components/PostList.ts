import { appStore } from "../flux/stores/AppStore";
import { PostActions } from "../flux/actions/PostActions";
import { Post } from "../types";

class PostList extends HTMLElement {
  private unsubscribe: (() => void) | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.unsubscribe = appStore.subscribe(this.handleStateChange.bind(this));
    PostActions.fetchPosts();
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private handleStateChange(state: any) {
    this.render();
  }

  private render() {
    if (!this.shadowRoot) return;

    const state = appStore.getState();
    const { posts, loading, error } = state;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 20px;
        }

        .post-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .post {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .post-author {
          font-weight: bold;
          color: #333;
        }

        .post-date {
          color: #666;
          font-size: 0.9em;
        }

        .post-content {
          margin: 10px 0;
          line-height: 1.5;
        }

        .post-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .post-actions button {
          padding: 5px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background: #f0f0f0;
        }

        .post-actions button:hover {
          background: #e0e0e0;
        }

        .loading {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        .error {
          color: red;
          padding: 10px;
          background: #ffebee;
          border-radius: 4px;
          margin: 10px 0;
        }
      </style>

      <div class="post-list">
        ${loading ? '<div class="loading">Cargando posts...</div>' : ""}
        ${error ? `<div class="error">${error}</div>` : ""}
        ${posts.map((post) => this.renderPost(post)).join("")}
      </div>
    `;

    // Agregar event listeners para los botones
    this.shadowRoot.querySelectorAll(".like-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        const postId = (e.target as HTMLElement).getAttribute("data-post-id");
        if (postId) {
          PostActions.likePost(postId);
        }
      });
    });
  }

  private renderPost(post: Post) {
    return `
      <div class="post">
        <div class="post-header">
          <span class="post-author">${post.authorName}</span>
          <span class="post-date">${post.createdAt.toLocaleDateString()}</span>
        </div>
        <div class="post-content">${post.content}</div>
        <div class="post-actions">
          <button class="like-button" data-post-id="${post.id}">
            ❤️ ${post.likes}
          </button>
          <button class="comment-button" data-post-id="${post.id}">
            💬 ${post.comments.length}
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define("post-list", PostList);

export default PostList;
