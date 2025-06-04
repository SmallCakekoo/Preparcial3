import { User } from "firebase/auth";

export type UserRole = "admin" | "usuario";

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  photoURL?: string;
}

export interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
}

export interface AppState {
  currentPath: string;
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  posts: Post[];
  loading: boolean;
  error: string | null;
}
