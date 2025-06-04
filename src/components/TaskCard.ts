class TaskCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["id", "title", "description", "status"];
  }

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const statusButtons = this.shadowRoot?.querySelectorAll(".status-btn");
    statusButtons?.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const status = target.getAttribute("data-status");
        const taskCard = this.shadowRoot?.querySelector(".task-card");
        const statusElement = taskCard?.querySelector(".task-status");

        if (taskCard && statusElement && status) {
          // Actualizar la clase de la tarjeta
          taskCard.className = "task-card " + status;

          if (status === "completed") {
            taskCard.classList.add("completed");
          } else {
            taskCard.classList.remove("completed");
          }

          // Actualizar el texto del estado
          statusElement.textContent =
            status === "todo"
              ? "Por hacer"
              : status === "in-progress"
              ? "En progreso"
              : "Completada";

          // Actualizar la clase del estado para aplicar el color correcto
          statusElement.className = "task-status " + status;

          // Resaltar el botón activo
          const allStatusBtns =
            this.shadowRoot?.querySelectorAll(".status-btn");
          allStatusBtns?.forEach((statusBtn) => {
            if (statusBtn.getAttribute("data-status") === status) {
              statusBtn.classList.add("active-status");
            } else {
              statusBtn.classList.remove("active-status");
            }
          });

          // Emitir evento para notificar el cambio de estado
          this.dispatchEvent(
            new CustomEvent("task-status-changed", {
              bubbles: true,
              composed: true,
              detail: {
                id: this.getAttribute("id"),
                status: status,
              },
            })
          );
        }
      });
    });

    // Agregar evento para el botón eliminar
    const deleteBtn = this.shadowRoot?.querySelector(".delete-btn");
    deleteBtn?.addEventListener("click", () => {
      // Emitir un evento para notificar que la tarea debe ser eliminada
      this.dispatchEvent(
        new CustomEvent("task-deleted", {
          bubbles: true,
          composed: true,
          detail: {
            id: this.getAttribute("id"),
          },
        })
      );
    });
  }

  render() {
    if (!this.shadowRoot) return;

    const id = this.getAttribute("id") || "";
    const title = this.getAttribute("title") || "Sin título";
    const description = this.getAttribute("description") || "Sin descripción";
    const status = this.getAttribute("status") || "todo";

    const statusText =
      status === "todo"
        ? "Por hacer"
        : status === "in-progress"
        ? "En progreso"
        : "Completada";

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: montserrat;
          --primary-color: #4361ee;
          --secondary-color: #3f3d56;
          --background-color: #f8f9fa;
          --card-background: #ffffff;
          --border-color: #e9ecef;
          --text-color: #212529;
          --text-secondary: #6c757d;
          --success-color: #4CAF50;
          --warning-color: #ff9800;
          --danger-color: #f44336;
          --border-radius: 8px;
          --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          --todo-color: #4361ee;
          --in-progress-color: #ff9800;
          --completed-color: #4CAF50;
        }
        
        .task-card {
          background-color: var(--card-background);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
          padding: 15px;
          margin-bottom: 15px;
          border-left: 4px solid var(--todo-color);
          transition: all 0.2s;
        }
        
        .task-card.todo {
          border-left-color: var(--todo-color);
        }
        
        .task-card.in-progress {
          border-left-color: var(--in-progress-color);
        }
        
        .task-card.completed {
          border-left-color: var(--completed-color);
          opacity: 0.8;
        }
        
        .task-card.completed .task-title {
          text-decoration: line-through;
        }
        
        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        
        .task-title {
          font-weight: 600;
          font-size: 16px;
          margin: 0;
        }
        
        .task-status {
          font-size: 12px;
          padding: 3px 8px;
          border-radius: 12px;
          background-color: var(--in-progress-color);
          color: white;
          display: inline-block;
        }
        
        .task-status.todo {
          background-color: var(--todo-color);
        }
        
        .task-status.in-progress {
          background-color: var(--in-progress-color);
        }
        
        .task-status.completed {
          background-color: var(--completed-color);
        }
        
        .task-description {
          color: var(--text-secondary);
          font-size: 14px;
          margin: 10px 0;
        }
        
        .task-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
          font-size: 12px;
        }
        
        .task-actions {
          display: flex;
          gap: 5px;
        }
        
        .status-btn {
          background: none;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 3px 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .active-status {
          background-color: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        
        .delete-btn {
          background-color: var(--danger-color);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 3px 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .delete-btn:hover {
          background-color: #d32f2f;
        }
      </style>
      
      <div class="task-card ${status}" data-id="${id}">
        <div class="task-header">
          <h3 class="task-title">${title}</h3>
          <span class="task-status ${status}">${statusText}</span>
        </div>
        <p class="task-description">${description}</p>
        <div class="task-footer">
          <div class="task-actions">
            <button class="status-btn ${
              status === "todo" ? "active-status" : ""
            }" data-status="todo">Por hacer</button>
            <button class="status-btn ${
              status === "in-progress" ? "active-status" : ""
            }" data-status="in-progress">En progreso</button>
            <button class="status-btn ${
              status === "completed" ? "active-status" : ""
            }" data-status="completed">Completada</button>
            <button class="delete-btn">Eliminar</button>
          </div>
        </div>
      </div>
    `;
  }
}

export default TaskCard;
