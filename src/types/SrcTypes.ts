import { UserCredential, User as FirebaseUser } from "firebase/auth";

export type UserRole = "user" | "admin";

export interface Post {
  id: string;
  content: string;
  authorName: string;
  createdAt: Date;
  userId: string;
  imageUrl?: string;
}

export interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorId: string;
  createdAt: Date;
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: UserRole;
}

export interface AppState {
  currentPath: string;
  isAuthenticated: boolean;
  posts: Post[];
  tasks: Task[];
  loading: boolean;
  error: string | null;
  currentComponent: string | null;
  currentUser: User | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  authorId?: string;
  userId?: string;
  createdAt: Date;
}

// Tipos para los payloads de acciones
export interface PathPayload {
  path: string;
}

export interface PostPayload {
  content?: string;
  postId?: string;
  posts?: Post[];
  error?: string;
  imageUrl?: string;
}

export interface TaskPayload {
  task?: Task;
  tasks?: Task[];
  taskId?: string;
}

export interface UserPayload {
  email?: string;
  password?: string;
  displayName?: string;
  user?: UserCredential | FirebaseUser;
  error?: string;
  loading?: boolean;
}

export interface AuthPayload {
  user?: UserCredential | FirebaseUser;
  displayName?: string;
  role?: UserRole;
  error?: string;
  loading?: boolean;
}

export interface ErrorPayload {
  error: string;
}

export type ActionPayload =
  | PathPayload
  | PostPayload
  | TaskPayload
  | UserPayload
  | AuthPayload
  | ErrorPayload;
