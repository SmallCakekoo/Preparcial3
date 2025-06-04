import { UserCredential } from "firebase/auth";
import {
  NavigateActionsType,
  UserActionsType,
  PostActionsType,
  AuthActionsType,
  TaskActionsType,
  NavigationActionsType,
} from "./Actions";
import { AppDispatcher, Action, UserPayload } from "./Dispatcher";
import { auth, db } from "../services/firebase/firebase-config";
import { AppState, UserProfile, Post, Task } from "../types";
import {
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

type Listener = (state: AppState) => void;

class Store {
  private _myState: AppState = {
    currentPath: "/",
    isAuthenticated: false,
    currentUser: null,
    posts: [],
    tasks: [],
    loading: false,
    error: null,
    currentComponent: null,
  };

  private _listeners: Array<() => void> = [];

  constructor() {
    AppDispatcher.register(this.handleAction.bind(this));
    this.setupAuthListener();
  }

  private setupAuthListener() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;
          this._myState = {
            ...this._myState,
            isAuthenticated: true,
            currentUser: userData,
          };
        }
      } else {
        this._myState = {
          ...this._myState,
          isAuthenticated: false,
          currentUser: null,
        };
      }
      this._emitChange();
    });
  }

  handleAction(action: Action): void {
    switch (action.type) {
      case NavigationActionsType.NAVIGATE:
        if (action.payload?.path) {
          window.history.pushState({}, "", action.payload.path);
          const event = new CustomEvent("route-change", {
            bubbles: true,
            composed: true,
            detail: { path: action.payload.path },
          });
          document.dispatchEvent(event);
          this._myState = {
            ...this._myState,
            currentPath: action.payload.path,
            currentComponent: this.getComponentForPath(action.payload.path),
          };
          this._emitChange();
        }
        break;

      case TaskActionsType.FETCH_TASKS:
        this._myState = {
          ...this._myState,
          loading: true,
          error: null,
        };
        this._emitChange();
        break;

      case TaskActionsType.FETCH_TASKS_SUCCESS:
        if (action.payload?.tasks) {
          this._myState = {
            ...this._myState,
            tasks: action.payload.tasks,
            loading: false,
            error: null,
          };
          this._emitChange();
        }
        break;

      case TaskActionsType.FETCH_TASKS_ERROR:
        this._myState = {
          ...this._myState,
          loading: false,
          error: action.payload?.error || "Error al cargar las tareas",
        };
        this._emitChange();
        break;

      case TaskActionsType.CREATE_TASK:
        this._myState = {
          ...this._myState,
          loading: true,
          error: null,
        };
        this._emitChange();
        break;

      case TaskActionsType.CREATE_TASK_SUCCESS:
        if (action.payload?.task) {
          this._myState = {
            ...this._myState,
            tasks: [...this._myState.tasks, action.payload.task],
            loading: false,
            error: null,
          };
          this._emitChange();
        }
        break;

      case TaskActionsType.CREATE_TASK_ERROR:
        this._myState = {
          ...this._myState,
          loading: false,
          error: action.payload?.error || "Error al crear la tarea",
        };
        this._emitChange();
        break;

      case TaskActionsType.UPDATE_TASK:
        this._myState = {
          ...this._myState,
          loading: true,
          error: null,
        };
        this._emitChange();
        break;

      case TaskActionsType.UPDATE_TASK_SUCCESS:
        if (action.payload?.task) {
          this._myState = {
            ...this._myState,
            tasks: this._myState.tasks.map((task) =>
              task.id === action.payload.task?.id ? action.payload.task : task
            ),
            loading: false,
            error: null,
          };
          this._emitChange();
        }
        break;

      case TaskActionsType.UPDATE_TASK_ERROR:
        this._myState = {
          ...this._myState,
          loading: false,
          error: action.payload?.error || "Error al actualizar la tarea",
        };
        this._emitChange();
        break;

      case TaskActionsType.DELETE_TASK:
        this._myState = {
          ...this._myState,
          loading: true,
          error: null,
        };
        this._emitChange();
        break;

      case TaskActionsType.DELETE_TASK_SUCCESS:
        if (action.payload?.task) {
          this._myState = {
            ...this._myState,
            tasks: this._myState.tasks.filter(
              (task) => task.id !== action.payload.task?.id
            ),
            loading: false,
            error: null,
          };
          this._emitChange();
        }
        break;

      case TaskActionsType.DELETE_TASK_ERROR:
        this._myState = {
          ...this._myState,
          loading: false,
          error: action.payload?.error || "Error al eliminar la tarea",
        };
        this._emitChange();
        break;

      case UserActionsType.SAVE_USER:
        if (
          action.payload &&
          typeof action.payload === "object" &&
          "user" in action.payload
        ) {
          const userCredential = action.payload.user as UserCredential;
          this._myState = {
            ...this._myState,
            isAuthenticated: true,
            currentUser: {
              uid: userCredential.user.uid,
              email: userCredential.user.email || "",
              role: "usuario",
              displayName: userCredential.user.displayName || undefined,
              photoURL: userCredential.user.photoURL || undefined,
            },
          };
          this._emitChange();
        }
        break;

      case UserActionsType.CHECK_AUTH:
        this._myState.loading = true;
        this._emitChange();
        break;

      case UserActionsType.LOGOUT:
        signOut(auth)
          .then(() => {
            this._myState = {
              currentPath: "/",
              isAuthenticated: false,
              currentUser: null,
              posts: [],
              loading: false,
              error: null,
              tasks: [],
            };
            this._emitChange();
          })
          .catch((error) => {
            this._myState.error = error.message;
            this._emitChange();
          });
        break;

      case UserActionsType.REGISTER:
        this._myState.loading = true;
        this._emitChange();
        if (
          action.payload &&
          typeof action.payload === "object" &&
          "email" in action.payload
        ) {
          const { email, password, displayName } =
            action.payload as UserPayload;
          if (email && password) {
            createUserWithEmailAndPassword(auth, email, password)
              .then(async (userCredential) => {
                const userProfile: UserProfile = {
                  uid: userCredential.user.uid,
                  email: email,
                  role: "usuario",
                  displayName: displayName,
                };
                await setDoc(
                  doc(db, "users", userCredential.user.uid),
                  userProfile
                );
                this._myState.currentUser = userProfile;
                this._myState.loading = false;
                this._emitChange();
              })
              .catch((error) => {
                this._myState.error = error.message;
                this._myState.loading = false;
                this._emitChange();
              });
          }
        }
        break;

      case PostActionsType.CREATE_POST:
        if (!this._myState.currentUser) {
          this._myState.error = "Usuario no autenticado";
          this._emitChange();
          break;
        }

        if (
          action.payload &&
          typeof action.payload === "object" &&
          "content" in action.payload
        ) {
          const content = action.payload.content;
          if (content) {
            const postData = {
              content,
              authorId: this._myState.currentUser.uid,
              authorName: this._myState.currentUser.displayName || "Anónimo",
              createdAt: serverTimestamp(),
              likes: 0,
              comments: [],
            };

            addDoc(collection(db, "posts"), postData)
              .then((docRef) => {
                const newPost: Post = {
                  id: docRef.id,
                  content,
                  authorId: this._myState.currentUser!.uid,
                  authorName:
                    this._myState.currentUser!.displayName || "Anónimo",
                  createdAt: new Date(),
                  likes: 0,
                  comments: [],
                };
                this._myState.posts = [newPost, ...this._myState.posts];
                this._emitChange();
              })
              .catch((error) => {
                this._myState.error = error.message;
                this._emitChange();
              });
          }
        }
        break;

      case PostActionsType.FETCH_POSTS: {
        this._myState.loading = true;
        this._emitChange();

        const postsQuery = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc")
        );

        getDocs(postsQuery)
          .then((querySnapshot) => {
            const posts: Post[] = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              posts.push({
                id: doc.id,
                content: data.content,
                authorId: data.authorId,
                authorName: data.authorName,
                createdAt: data.createdAt.toDate(),
                likes: data.likes,
                comments: data.comments || [],
              });
            });
            this._myState.posts = posts;
            this._myState.loading = false;
            this._emitChange();
          })
          .catch((error) => {
            this._myState.error = error.message;
            this._myState.loading = false;
            this._emitChange();
          });
        break;
      }

      case AuthActionsType.LOGIN_START:
        this._myState.loading = true;
        this._myState.error = null;
        this._emitChange();
        break;

      case AuthActionsType.LOGIN_SUCCESS:
        if (action.payload?.user) {
          this._myState = {
            ...this._myState,
            isAuthenticated: true,
            currentUser: action.payload.user,
            loading: false,
            error: null,
          };
          this._emitChange();
        }
        break;

      case AuthActionsType.LOGIN_ERROR:
        this._myState = {
          ...this._myState,
          loading: false,
          error: action.payload?.error || "Error al iniciar sesión",
        };
        this._emitChange();
        break;

      case AuthActionsType.REGISTER_START:
        this._myState.loading = true;
        this._myState.error = null;
        this._emitChange();
        break;

      case AuthActionsType.REGISTER_SUCCESS:
        if (action.payload?.user) {
          this._myState = {
            ...this._myState,
            isAuthenticated: true,
            currentUser: action.payload.user,
            loading: false,
            error: null,
          };
          this._emitChange();
        }
        break;

      case AuthActionsType.REGISTER_ERROR:
        this._myState = {
          ...this._myState,
          loading: false,
          error: action.payload?.error || "Error al registrarse",
        };
        this._emitChange();
        break;

      case AuthActionsType.LOGOUT:
        this._myState = {
          ...this._myState,
          isAuthenticated: false,
          currentUser: null,
          tasks: [],
          loading: false,
          error: null,
        };
        this._emitChange();
        break;

      case AuthActionsType.CHECK_AUTH:
        this._myState = {
          ...this._myState,
          loading: true,
          error: null,
        };
        this._emitChange();
        break;
    }

    this.persist();
  }

  private getComponentForPath(path: string): string {
    switch (path) {
      case "/":
        return "main-page";
      case "/login":
        return "login-form";
      case "/register":
        return "register-form";
      case "/tasks":
        return "tasks-page";
      default:
        return "four-page";
    }
  }

  private _emitChange(): void {
    this._listeners.forEach((listener) => listener());
  }

  getState(): AppState {
    return this._myState;
  }

  subscribe(listener: () => void): () => void {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter((l) => l !== listener);
    };
  }

  persist(): void {
    localStorage.setItem("flux:state", JSON.stringify(this._myState));
  }

  load(): void {
    const persistedState = localStorage.getItem("flux:state");
    if (persistedState) {
      this._myState = JSON.parse(persistedState);
      this._emitChange();
    }
  }
}

export const store = new Store();
