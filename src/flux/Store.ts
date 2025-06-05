import { AppDispatcher } from "./Dispatcher";
import {
  AppState,
  PostPayload,
  PathPayload,
  ActionPayload,
  UserPayload,
  User,
  AuthPayload,
} from "../types/SrcTypes";
import { Action } from "./Dispatcher";
import {
  PostActionsType,
  NavigateActionsType,
  AuthActionsType,
} from "./Actions";
import {
  UserCredential,
  User as FirebaseUser,
  onAuthStateChanged,
} from "firebase/auth";
import { createPost, getPosts } from "../services/firebase/post-service";
import { auth } from "../services/firebase/firebase-config";

class Store {
  private state: AppState = {
    currentPath: "/",
    isAuthenticated: false,
    posts: [],
    tasks: [],
    loading: false,
    error: null,
    currentComponent: null,
    currentUser: null,
  };

  private navigationHistory: string[] = ["/"];
  private currentHistoryIndex: number = 0;

  private listeners: Array<(state: AppState) => void> = [];

  constructor() {
    AppDispatcher.register(this.handleAction.bind(this));
    // Cargar posts iniciales
    this.loadInitialPosts();
    // Verificar estado de autenticación
    this.checkAuthState();
  }

  private checkAuthState() {
    onAuthStateChanged(auth, (user) => {
      console.log("Estado de autenticación cambiado:", user);
      if (user) {
        const userData: User = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: "user",
        };
        this.state = {
          ...this.state,
          isAuthenticated: true,
          currentUser: userData,
          error: null,
        };
      } else {
        this.state = {
          ...this.state,
          isAuthenticated: false,
          currentUser: null,
          error: null,
        };
      }
      this.notifyListeners();
    });
  }

  private async loadInitialPosts() {
    try {
      const posts = await getPosts();
      this.state = {
        ...this.state,
        posts,
      };
      this.notifyListeners();
    } catch (error) {
      console.error("Error al cargar posts iniciales:", error);
    }
  }

  private convertToUser(userCredential: UserCredential | FirebaseUser): User {
    const firebaseUser =
      "user" in userCredential ? userCredential.user : userCredential;
    return {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName,
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
      role: "user", // Por defecto, todos los usuarios nuevos son usuarios normales
    };
  }

  private async handleAction(action: Action) {
    console.log("Store - Acción recibida:", action);
    const payload = action.payload as ActionPayload;

    switch (action.type) {
      case NavigateActionsType.NAVIGATE:
        if (payload && "path" in payload) {
          const pathPayload = payload as PathPayload;
          this.navigationHistory = this.navigationHistory.slice(
            0,
            this.currentHistoryIndex + 1
          );
          this.navigationHistory.push(pathPayload.path);
          this.currentHistoryIndex++;
          this.state = {
            ...this.state,
            currentPath: pathPayload.path,
          };
        }
        break;

      case NavigateActionsType.NAVIGATE_BACK:
        if (this.currentHistoryIndex > 0) {
          this.currentHistoryIndex--;
          this.state = {
            ...this.state,
            currentPath: this.navigationHistory[this.currentHistoryIndex],
          };
        }
        break;

      case NavigateActionsType.NAVIGATE_FORWARD:
        if (this.currentHistoryIndex < this.navigationHistory.length - 1) {
          this.currentHistoryIndex++;
          this.state = {
            ...this.state,
            currentPath: this.navigationHistory[this.currentHistoryIndex],
          };
        }
        break;

      case AuthActionsType.LOGIN:
        if (payload && "user" in payload) {
          const userPayload = payload as UserPayload;
          if (userPayload.user) {
            const user = this.convertToUser(userPayload.user);
            this.state = {
              ...this.state,
              isAuthenticated: true,
              currentUser: user,
              error: null,
            };
          }
        }
        break;

      case AuthActionsType.REGISTER:
        if (payload && "user" in payload) {
          const userPayload = payload as UserPayload;
          if (userPayload.user) {
            const user = this.convertToUser(userPayload.user);
            if ("role" in payload) {
              user.role = (payload as AuthPayload).role || "user";
            }
            this.state = {
              ...this.state,
              isAuthenticated: true,
              currentUser: user,
              error: null,
            };
          }
        }
        break;

      case AuthActionsType.LOGOUT:
        this.state = {
          ...this.state,
          isAuthenticated: false,
          currentUser: null,
          error: null,
        };
        break;

      case AuthActionsType.AUTH_ERROR:
        if (payload && "error" in payload) {
          const userPayload = payload as UserPayload;
          this.state = {
            ...this.state,
            error: userPayload.error || null,
          };
        }
        break;

      case PostActionsType.CREATE_POST:
        console.log("Store - Procesando CREATE_POST");
        if (payload && "content" in payload) {
          const postPayload = payload as PostPayload;
          console.log("Store - Payload del post:", postPayload);
          if (postPayload.content && this.state.currentUser) {
            try {
              console.log("Store - Creando post en Firebase...");
              const newPost = await createPost(
                postPayload.content,
                this.state.currentUser.uid,
                postPayload.imageUrl
              );
              console.log("Store - Post creado exitosamente:", newPost);

              this.state = {
                ...this.state,
                posts: [newPost, ...this.state.posts],
              };
            } catch (error) {
              console.error("Store - Error al crear post en Firebase:", error);
              this.state = {
                ...this.state,
                error: "Error al crear el post",
              };
            }
          } else {
            console.log("Store - No se puede crear el post:", {
              tieneContenido: !!postPayload.content,
              tieneUsuario: !!this.state.currentUser,
            });
          }
        }
        break;

      case PostActionsType.DELETE_POST:
        if (payload && "postId" in payload) {
          const postPayload = payload as PostPayload;
          if (postPayload.postId) {
            this.state = {
              ...this.state,
              posts: this.state.posts.filter(
                (post) => post.id !== postPayload.postId
              ),
            };
          }
        }
        break;

      case PostActionsType.UPDATE_POST:
        if (payload && "postId" in payload && "content" in payload) {
          const postPayload = payload as PostPayload;
          if (postPayload.postId && postPayload.content) {
            const updatedPosts = this.state.posts.map((post) => {
              if (post.id === postPayload.postId) {
                return {
                  ...post,
                  content: postPayload.content!,
                  updatedAt: new Date(),
                };
              }
              return post;
            });

            this.state = {
              ...this.state,
              posts: updatedPosts,
            };
          }
        }
        break;

      case PostActionsType.SET_POSTS:
        if (payload && "posts" in payload) {
          const postPayload = payload as PostPayload;
          if (postPayload.posts) {
            this.state = {
              ...this.state,
              posts: postPayload.posts,
            };
          }
        }
        break;

      case PostActionsType.POST_ERROR:
        if (payload && "error" in payload) {
          const postPayload = payload as PostPayload;
          this.state = {
            ...this.state,
            error: postPayload.error || null,
          };
        }
        break;
    }
    this.notifyListeners();
  }

  subscribe(listener: (state: AppState) => void) {
    this.listeners.push(listener);
  }

  unsubscribe(listener: (state: AppState) => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  getState(): AppState {
    return this.state;
  }
}

export const store = new Store();
