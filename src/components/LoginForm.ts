import { loginUser } from "../services/firebase/auth-service";
import { store } from "../flux/Store";
import { AppDispatcher } from "../flux/Dispatcher";
import { AuthActionsType, NavigationActionsType } from "../flux/Actions";

class LoginForm extends HTMLElement {
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

  handleStateChange(state: any) {
    const submitBtn = this.shadowRoot?.querySelector(
      "button[type='submit']"
    ) as HTMLButtonElement;
    const errorMsg = this.shadowRoot?.querySelector(".error-message");

    if (submitBtn && errorMsg) {
      submitBtn.disabled = state.loading;
      submitBtn.textContent = state.loading
        ? "Iniciando sesión..."
        : "Iniciar sesión";
      errorMsg.textContent = state.error || "";
    }
  }

  setupListeners() {
    const form = this.shadowRoot?.querySelector("form");
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailInput = this.shadowRoot?.querySelector(
        "#email"
      ) as HTMLInputElement;
      const passwordInput = this.shadowRoot?.querySelector(
        "#password"
      ) as HTMLInputElement;

      if (emailInput && passwordInput) {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
          AppDispatcher.dispatch({
            type: AuthActionsType.LOGIN_ERROR,
            payload: { error: "Por favor, completa todos los campos" },
          });
          return;
        }

        AppDispatcher.dispatch({ type: AuthActionsType.LOGIN_START });

        const result = await loginUser(email, password);

        if (result.success) {
          AppDispatcher.dispatch({
            type: AuthActionsType.LOGIN_SUCCESS,
            payload: { user: result.user },
          });

          AppDispatcher.dispatch({
            type: NavigationActionsType.NAVIGATE,
            payload: { path: "/tasks" },
          });
        } else {
          AppDispatcher.dispatch({
            type: AuthActionsType.LOGIN_ERROR,
            payload: {
              error: "Error al iniciar sesión. Verifica tus credenciales.",
            },
          });
        }
      }
    });

    const registerLink = this.shadowRoot?.querySelector(".register-link");
    registerLink?.addEventListener("click", (e) => {
      e.preventDefault();
      AppDispatcher.dispatch({
        type: NavigationActionsType.NAVIGATE,
        payload: { path: "/register" },
      });
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
          --text-color: #333;
          --border-color: #e0e0e0;
          --background-color: #f9f9f9;
          --shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          --border-radius: 8px;
          --error-color: #f44336;
          --accent-color: #f72585;
        }
        
        .login-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 30px;
          background-color: white;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow);
        }
        
        h2 {
          text-align: center;
          color: var(--text-color);
          margin-top: 0;
          margin-bottom: 25px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          font-size: 14px;
          color: var(--text-color);
        }
        
        input {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid var(--border-color);
          border-radius: var(--border-radius);
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          transition: all 0.3s ease;
          box-sizing: border-box;
        }
        
        input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
        }
        
        button {
          width: 100%;
          padding: 14px 32px;
          background: linear-gradient(45deg, var(--primary-color), #4895ef);
          color: white;
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
        
        button:hover {
          transform: translateY(-3px);
          box-shadow: 0 7px 20px rgba(67, 97, 238, 0.3);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        button:disabled {
          background: #cccccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .error-message {
          color: var(--error-color);
          font-size: 14px;
          margin-top: 15px;
          text-align: center;
        }
        
        .form-footer {
          margin-top: 20px;
          text-align: center;
          font-size: 14px;
          color: var(--text-color);
        }
        
        .register-link {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
        }
        
        .register-link:hover {
          text-decoration: underline;
        }
      </style>
      
      <div class="login-container">
        <h2>Iniciar sesión</h2>
        
        <form>
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input type="email" id="email" required placeholder="tu@email.com">
          </div>
          
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" required placeholder="Tu contraseña">
          </div>
          
          <button type="submit">Iniciar sesión</button>
          
          <div class="error-message"></div>
        </form>
        
        <div class="form-footer">
          ¿No tienes una cuenta? <a class="register-link">Regístrate</a>
        </div>
      </div>
    `;
  }
}

export default LoginForm;
