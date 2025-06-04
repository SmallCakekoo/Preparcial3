export interface UserProfile {
  uid: string;
  email: string;
  role: string;
  displayName?: string;
  photoURL?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  userId: string;
  createdAt?: Date;
}

export interface AppState {
  currentPath: string;
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  posts: Post[];
  tasks: Task[];
  loading: boolean;
  error: string | null;
  currentComponent: string | null;
}

export interface ActionPayload {
  path?: string;
  user?: UserProfile;
  post?: Post;
  task?: Task;
  tasks?: Task[];
  error?: string;
  content?: string;
  postId?: string;
  posts?: Post[];
  email?: string;
  password?: string;
  displayName?: string;
  component?: string;
}
