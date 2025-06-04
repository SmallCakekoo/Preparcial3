import { UserCredential } from "firebase/auth";
import { AppDispatcher } from "./Dispatcher";
import { UserProfile, Post } from "../types";

export enum NavigateActionsType {
  NAVIGATE = "NAVIGATE",
}

export enum UserActionsType {
  SAVE_USER = "SAVE_USER",
  CHECK_AUTH = "CHECK_AUTH",
  LOGOUT = "LOGOUT",
  REGISTER = "REGISTER",
  SET_USER_PROFILE = "SET_USER_PROFILE",
  AUTH_ERROR = "AUTH_ERROR",
}

export enum PostActionsType {
  CREATE_POST = "CREATE_POST",
  UPDATE_POST = "UPDATE_POST",
  DELETE_POST = "DELETE_POST",
  FETCH_POSTS = "FETCH_POSTS",
  SET_POSTS = "SET_POSTS",
  ADD_COMMENT = "ADD_COMMENT",
  LIKE_POST = "LIKE_POST",
  POST_ERROR = "POST_ERROR",
}

export enum AuthActionsType {
  LOGIN_START = "LOGIN_START",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_ERROR = "LOGIN_ERROR",
  LOGIN_RESET = "LOGIN_RESET",
  REGISTER_START = "REGISTER_START",
  REGISTER_SUCCESS = "REGISTER_SUCCESS",
  REGISTER_ERROR = "REGISTER_ERROR",
  REGISTER_RESET = "REGISTER_RESET",
  LOGOUT = "LOGOUT",
  CHECK_AUTH = "CHECK_AUTH",
}

export enum TaskActionsType {
  FETCH_TASKS = "FETCH_TASKS",
  FETCH_TASKS_SUCCESS = "FETCH_TASKS_SUCCESS",
  FETCH_TASKS_ERROR = "FETCH_TASKS_ERROR",
  CREATE_TASK = "CREATE_TASK",
  CREATE_TASK_SUCCESS = "CREATE_TASK_SUCCESS",
  CREATE_TASK_ERROR = "CREATE_TASK_ERROR",
  UPDATE_TASK = "UPDATE_TASK",
  UPDATE_TASK_SUCCESS = "UPDATE_TASK_SUCCESS",
  UPDATE_TASK_ERROR = "UPDATE_TASK_ERROR",
  DELETE_TASK = "DELETE_TASK",
  DELETE_TASK_SUCCESS = "DELETE_TASK_SUCCESS",
  DELETE_TASK_ERROR = "DELETE_TASK_ERROR",
}

export enum NavigationActionsType {
  NAVIGATE = "NAVIGATE",
  NAVIGATE_SUCCESS = "NAVIGATE_SUCCESS",
  NAVIGATE_ERROR = "NAVIGATE_ERROR",
}

export const NavigateActions = {
  navigate: (path: string) => {
    AppDispatcher.dispatch({
      type: NavigateActionsType.NAVIGATE,
      payload: { path },
    });
  },
};

export const UserActions = {
  saveUser: (user: UserCredential) => {
    AppDispatcher.dispatch({
      type: UserActionsType.SAVE_USER,
      payload: { user },
    });
  },

  checkAuth: () => {
    AppDispatcher.dispatch({
      type: UserActionsType.CHECK_AUTH,
    });
  },

  logout: () => {
    AppDispatcher.dispatch({
      type: UserActionsType.LOGOUT,
    });
  },

  register: (userData: {
    email: string;
    password: string;
    displayName: string;
  }) => {
    AppDispatcher.dispatch({
      type: UserActionsType.REGISTER,
      payload: userData,
    });
  },

  setUserProfile: (profile: UserProfile) => {
    AppDispatcher.dispatch({
      type: UserActionsType.SET_USER_PROFILE,
      payload: { profile },
    });
  },

  setAuthError: (error: string) => {
    AppDispatcher.dispatch({
      type: UserActionsType.AUTH_ERROR,
      payload: { error },
    });
  },
};

export const PostActions = {
  createPost: (content: string) => {
    AppDispatcher.dispatch({
      type: PostActionsType.CREATE_POST,
      payload: { content },
    });
  },

  updatePost: (postId: string, content: string) => {
    AppDispatcher.dispatch({
      type: PostActionsType.UPDATE_POST,
      payload: { postId, content },
    });
  },

  deletePost: (postId: string) => {
    AppDispatcher.dispatch({
      type: PostActionsType.DELETE_POST,
      payload: { postId },
    });
  },

  fetchPosts: () => {
    AppDispatcher.dispatch({
      type: PostActionsType.FETCH_POSTS,
    });
  },

  setPosts: (posts: Post[]) => {
    AppDispatcher.dispatch({
      type: PostActionsType.SET_POSTS,
      payload: { posts },
    });
  },

  addComment: (postId: string, content: string) => {
    AppDispatcher.dispatch({
      type: PostActionsType.ADD_COMMENT,
      payload: { postId, content },
    });
  },

  likePost: (postId: string) => {
    AppDispatcher.dispatch({
      type: PostActionsType.LIKE_POST,
      payload: { postId },
    });
  },

  setPostError: (error: string) => {
    AppDispatcher.dispatch({
      type: PostActionsType.POST_ERROR,
      payload: { error },
    });
  },
};

      payload: { error },
    });
  },
};
