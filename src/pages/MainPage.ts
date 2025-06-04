import { checkAuthState } from "../services/firebase/auth-service";

class MainPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.renderInitialStructure();
    this.checkAuthentication();
  }

  renderInitialStructure() {
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
          --shadow: 0 10px 30px rgba(67, 97, 238, 0.1);
          --border-radius: 12px;
        }
        
        .main-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 60px 20px;
          text-align: center;
        }
        
        .welcome-container {
          background: var(--card-bg);
          border-radius: var(--border-radius);
          padding: 40px;
          box-shadow: var(--shadow);
          position: relative;
          overflow: hidden;
          animation: fadeIn 0.8s ease-out;
        }
        
        .welcome-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 6px;
          background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
        }
        
        h1 {
          color: var(--text-color);
          font-size: 2.8rem;
          margin-bottom: 20px;
          font-weight: 700;
          line-height: 1.2;
          background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        p {
          color: var(--text-secondary);
          font-size: 1.2rem;
          margin-bottom: 40px;
          line-height: 1.8;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .auth-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 40px;
        }
        
        button {
          font-family: 'Montserrat', sans-serif;
          padding: 14px 32px;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          z-index: 1;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        #login-btn {
          background: linear-gradient(45deg, var(--primary-color), #4895ef);
          color: white;
        }
        
        #login-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 7px 20px rgba(67, 97, 238, 0.3);
        }
        
        #login-btn:active {
          transform: translateY(0);
        }
        
        .secondary-btn {
          background: var(--secondary-color);
          color: white;
        }
        
        .secondary-btn:hover {
          background: var(--secondary-hover);
          transform: translateY(-3px);
          box-shadow: 0 7px 20px rgba(63, 61, 86, 0.3);
        }
        
        .secondary-btn:active {
          transform: translateY(0);
        }
        
        .auth-options {
          background: var(--card-bg);
          border-radius: var(--border-radius);
          padding: 40px;
          box-shadow: var(--shadow);
          animation: fadeIn 0.8s ease-out;
        }
        
        .auth-options h2 {
          color: var(--primary-color);
          font-size: 2.2rem;
          margin-bottom: 15px;
          font-weight: 600;
        }
        
        .auth-options p {
          margin-bottom: 15px;
          color: var(--text-secondary);
        }
        
        .login-message {
          font-style: italic;
          color:rgb(136, 143, 175);
          font-size: 0.8rem;
          margin-bottom: 30px !important;
          opacity: 0.9;
        }
        
        .buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 10px;
        }
        
        .primary-btn {
          background: linear-gradient(45deg, var(--primary-color), #4895ef);
          color: white;
          padding: 14px 32px;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .primary-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 7px 20px rgba(67, 97, 238, 0.3);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 768px) {
          h1 {
            font-size: 2.2rem;
          }
          
          p {
            font-size: 1rem;
          }
          
          .welcome-container {
            padding: 30px 20px;
          }
          
          .auth-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          button {
            width: 100%;
            max-width: 250px;
          }
        }
      </style>
      
      <div class="main-container">
        <!-- El contenido se cargará dinámicamente -->
      </div>
    `;
  }

  checkAuthentication() {
    // Verificar si el usuario está autenticado
    checkAuthState((user) => {
      if (user) {
        // Usuario autenticado, redirigir a tareas
        window.history.pushState({}, "", "/tasks");
        const event = new CustomEvent("route-change", {
          bubbles: true,
          composed: true,
          detail: { path: "/tasks" },
        });
        this.dispatchEvent(event);
      } else {
        // No autenticado, mostrar opciones de login/registro
        this.renderAuthOptions();
      }
    });
  }

  renderAuthOptions() {
    const container = this.shadowRoot?.querySelector(".main-container");
    if (!container) return;

    container.innerHTML = `
      <div class="auth-options">
        <h2>Bienvenido a la minired social.</h2>
        <p>Conéctate con amigos y comparte tus pensamientos.</p>
        <p class="login-message">Inicia sesión o regístrate para comenzar.</p>
        
        <div class="buttons">
          <button id="login-btn" class="primary-btn">Iniciar sesión</button>
          <button id="register-btn" class="secondary-btn">Registrarse</button>
        </div>
      </div>
    `;

    const loginBtn = this.shadowRoot?.querySelector("#login-btn");
    loginBtn?.addEventListener("click", () => {
      window.history.pushState({}, "", "/login");
      const event = new CustomEvent("route-change", {
        bubbles: true,
        composed: true,
        detail: { path: "/login" },
      });
      this.dispatchEvent(event);
    });

    const registerBtn = this.shadowRoot?.querySelector("#register-btn");
    registerBtn?.addEventListener("click", () => {
      window.history.pushState({}, "", "/register");
      const event = new CustomEvent("route-change", {
        bubbles: true,
        composed: true,
        detail: { path: "/register" },
      });
      this.dispatchEvent(event);
    });
  }
}

export default MainPage;
