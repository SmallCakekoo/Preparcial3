import { store } from "../flux/Store";
import { AppDispatcher } from "../flux/Dispatcher";
import {
  TaskActionsType,
  AuthActionsType,
  NavigationActionsType,
} from "../flux/Actions";
import { Task } from "../types";

class TasksPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
    store.subscribe(this.handleStateChange.bind(this));
    AppDispatcher.dispatch({ type: TaskActionsType.FETCH_TASKS });
  }

  disconnectedCallback() {
    store.unsubscribe(this.handleStateChange.bind(this));
  }

  handleStateChange(state: any) {
    const tasksContainer = this.shadowRoot?.querySelector(".tasks-list");
    if (!tasksContainer) return;

    if (state.loading) {
      tasksContainer.innerHTML = `
        <div class="loading-state">
          <p>Cargando tareas...</p>
        </div>
      `;
      return;
    }

    if (state.error) {
      tasksContainer.innerHTML = `
        <div class="error-state">
          <p>${state.error}</p>
        </div>
      `;
      return;
    }

    if (state.tasks.length === 0) {
      tasksContainer.innerHTML = `
        <div class="empty-state">
          <h3>No hay tareas todavía</h3>
          <p>Comienza añadiendo tu primera tarea con el botón "Añadir tarea"</p>
        </div>
      `;
      return;
    }

    tasksContainer.innerHTML = "";
    state.tasks.forEach((task: Task) => {
      const taskCard = document.createElement("task-card");
      taskCard.setAttribute("id", task.id);
      taskCard.setAttribute("title", task.title);
      taskCard.setAttribute("description", task.description);
      taskCard.setAttribute("status", task.status);
      tasksContainer.appendChild(taskCard);
    });
  }

  setupListeners() {
    const addTaskBtn = this.shadowRoot?.querySelector("#add-task-btn");
    addTaskBtn?.addEventListener("click", () => {
      this.openAddTaskModal();
    });

    const logoutBtn = this.shadowRoot?.querySelector("#logout-btn");
    logoutBtn?.addEventListener("click", () => {
      AppDispatcher.dispatch({ type: AuthActionsType.LOGOUT });
      AppDispatcher.dispatch({
        type: NavigationActionsType.NAVIGATE,
        payload: { path: "/" },
      });
    });
  }

  openAddTaskModal() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Añadir nueva tarea</h2>
          <button class="close-btn">&times;</button>
        </div>
        <task-form id="task-form"></task-form>
      </div>
    `;

    this.shadowRoot?.appendChild(modal);

    const closeBtn = modal.querySelector(".close-btn");
    closeBtn?.addEventListener("click", () => {
      modal.remove();
    });

    // Envío del formulario
    const taskForm = modal.querySelector("#task-form");
    taskForm?.addEventListener("task-submitted", (e: Event) => {
      const customEvent = e as CustomEvent;
      const taskData = customEvent.detail;
      this.addTask(taskData);

      // Cerrar el modal
      modal.remove();
    });
  }

  async addTask(taskData: { title: string; description: string }) {
    // Obtener el ID de usuario del localStorage
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("No hay usuario autenticado");
      return;
    }

    // Crear nueva tarea
    const newTask = {
      userId,
      title: taskData.title,
      description: taskData.description,
      status: "todo", // Estado inicial: Por hacer
    };

    // Añadir la tarea a Firebase
    const taskId = await addTask(newTask);

    if (taskId) {
      // Actualizar la interfaz
      this.loadTasks();
    }
  }

  async loadTasks() {
    const tasksContainer = this.shadowRoot?.querySelector(".tasks-list");
    if (!tasksContainer) return;

    // Mostrar indicador de carga para las tareas
    tasksContainer.innerHTML = `
      <div class="loading-state">
        <p>Cargando tareas...</p>
      </div>
    `;

    // Obtener el ID de usuario del localStorage
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("No hay usuario autenticado");
      return;
    }

    // Obtener tareas de Firebase
    this.tasks = await getTasksByUserId(userId);

    // Limpiar el contenedor
    tasksContainer.innerHTML = "";

    if (this.tasks.length === 0) {
      // Mostrar estado vacío si no hay tareas
      tasksContainer.innerHTML = `
        <div class="empty-state">
          <h3>No hay tareas todavía</h3>
          <p>Comienza añadiendo tu primera tarea con el botón "Añadir tarea"</p>
        </div>
      `;
      return;
    }

    // Crear tarjetas para cada tarea
    this.tasks.forEach((task: TaskType) => {
      const taskCard = document.createElement("div");
      taskCard.className = `task-card ${task.status}`;
      taskCard.dataset.id = task.id;

      // Determinar el texto del estado
      let statusText = "Por hacer";
      if (task.status === "in-progress") statusText = "En progreso";
      if (task.status === "completed") statusText = "Completada";

      taskCard.innerHTML = `
        <h4>${task.title}</h4>
        <p class="task-description">${task.description}</p>
        <div class="task-meta">
          <span class="task-status">${statusText}</span>
          <div class="task-actions">
            <button class="task-btn change-status-btn" title="Cambiar estado">
              <span>📝</span>
            </button>
            <button class="task-btn delete-btn" title="Eliminar tarea">
              <span>🗑️</span>
            </button>
          </div>
        </div>
      `;

      // Añadir evento para eliminar tarea
      const deleteBtn = taskCard.querySelector(".delete-btn");
      deleteBtn?.addEventListener("click", () => {
        this.deleteTask(task.id);
      });

      // Añadir evento para cambiar estado
      const changeStatusBtn = taskCard.querySelector(".change-status-btn");
      changeStatusBtn?.addEventListener("click", () => {
        this.changeTaskStatus(task.id);
      });

      tasksContainer.appendChild(taskCard);
    });
  }

  async deleteTask(taskId: string) {
    // Eliminar tarea de Firebase
    const success = await deleteTask(taskId);

    if (success) {
      // Actualizar la interfaz
      this.loadTasks();
    }
  }

  async changeTaskStatus(taskId: string) {
    // Encontrar la tarea a actualizar
    const task = this.tasks.find((t) => t.id === taskId);

    if (!task) return;

    // Rotar entre los estados: todo -> in-progress -> completed -> todo
    let newStatus = "todo";

    if (task.status === "todo") {
      newStatus = "in-progress";
    } else if (task.status === "in-progress") {
      newStatus = "completed";
    } else {
      newStatus = "todo";
    }

    // Actualizar tarea en Firebase
    const success = await updateTask(taskId, { status: newStatus });

    if (success) {
      // Actualizar la interfaz
      this.loadTasks();
    }
  }

  render() {
    if (!this.shadowRoot) return;

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
        
        .tasks-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .tasks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        h1 {
          color: var(--text-color);
          margin: 0;
          font-size: 28px;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .user-email {
          color: var(--text-secondary);
          font-size: 14px;
        }
        
        button {
          font-family: 'Montserrat', sans-serif;
          padding: 12px 24px;
          background: linear-gradient(45deg, var(--primary-color), #4895ef);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          z-index: 1;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        button:hover {
          transform: translateY(-3px);
          box-shadow: 0 7px 20px rgba(67, 97, 238, 0.3);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        #logout-btn {
          background: var(--border-color);
          color: var(--text-color);
          border-radius: 50px;
          transition: all 0.3s ease;
        }
        
        #logout-btn:hover {
          background-color: #dee2e6;
          transform: translateY(-3px);
          box-shadow: 0 7px 20px rgba(222, 226, 230, 0.3);
        }
        
        .tasks-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .tasks-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        
        .task-card {
          background-color: var(--card-background);
          border-radius: var(--border-radius);
          padding: 15px;
          box-shadow: var(--shadow);
          position: relative;
          border-left: 3px solid var(--todo-color);
        }
        
        .task-card.completed {
          border-left-color: var(--completed-color);
        }
        
        .task-card.completed h4 {
          text-decoration: line-through;
        }
        
        .task-card.in-progress {
          border-left-color: var(--in-progress-color);
        }
        
        .task-card h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .task-description {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: var(--text-secondary);
        }
        
        .task-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--text-secondary);
        }
        
        .task-status {
          padding: 3px 8px;
          border-radius: 12px;
          background-color: #e9ecef;
          font-weight: 500;
        }
        
        .task-actions {
          display: flex;
          gap: 5px;
        }
        
        .task-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          font-size: 16px;
          transition: transform 0.2s;
        }
        
        .task-btn:hover {
          transform: scale(1.2);
        }
        
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background-color: var(--card-background);
          border-radius: var(--border-radius);
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid var(--border-color);
        }
        
        .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--text-secondary);
          padding: 0;
          transition: all 0.3s ease;
        }
        
        .close-btn:hover {
          color: var(--danger-color);
          transform: scale(1.1);
        }
        
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-secondary);
          align-items: center;
          justify-content: center;
          display: ruby;
        }
        
        .empty-state h3 {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 20px;
        }
        
        .empty-state p {
          margin-bottom: 20px;
        }
      </style>
      
      <div class="tasks-container">
        <div class="tasks-header">
          <h1>Mis tareas</h1>
          <div class="user-info">
            <span class="user-email" id="user-email">usuario@ejemplo.com</span>
            <button id="logout-btn">Cerrar sesión</button>
          </div>
        </div>
        
        <div class="tasks-actions">
          <button id="add-task-btn">
            <span>Añadir tarea</span>
          </button>
        </div>
        
        <div class="tasks-list">
          <!-- Aquí se cargarán las tarjetas de tareas -->
          <div class="empty-state">
            <h3>No hay tareas todavía</h3>
            <p>Comienza añadiendo tu primera tarea con el botón "Añadir tarea"</p>
          </div>
        </div>
      </div>
    `;

    // Mostrar el email del usuario en la interfaz si está disponible
    const userEmailElement = this.shadowRoot.querySelector("#user-email");
    const userEmail = localStorage.getItem("userEmail");
    if (userEmailElement && userEmail) {
      userEmailElement.textContent = userEmail;
    }
  }
}

export default TasksPage;
