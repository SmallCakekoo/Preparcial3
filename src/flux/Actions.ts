// import { UserCredential } from "firebase/auth";
import { AppDispatcher } from "./Dispatcher";
import { Post, PostPayload, PathPayload, UserPayload } from "../types/SrcTypes";

export enum NavigateActionsType {
  NAVIGATE = "NAVIGATE",
  NAVIGATE_BACK = "NAVIGATE_BACK",
  NAVIGATE_FORWARD = "NAVIGATE_FORWARD",
}

export const NavigateActions = {
  navigate: (path: string) => {
    const payload: PathPayload = { path };
    AppDispatcher.dispatch({
      type: NavigateActionsType.NAVIGATE,
      payload,
    });
  },
  navigateBack: () => {
    const payload: PathPayload = { path: "" };
    AppDispatcher.dispatch({
      type: NavigateActionsType.NAVIGATE_BACK,
      payload,
    });
  },
  navigateForward: () => {
    const payload: PathPayload = { path: "" };
    AppDispatcher.dispatch({
      type: NavigateActionsType.NAVIGATE_FORWARD,
      payload,
    });
  },
};

export enum PostActionsType {
  CREATE_POST = "CREATE_POST",
  DELETE_POST = "DELETE_POST",
  UPDATE_POST = "UPDATE_POST",
  SET_POSTS = "SET_POSTS",
  POST_ERROR = "POST_ERROR",
}

export const PostActions = {
  createPost: (content: string) => {
    const payload: PostPayload = { content };
    AppDispatcher.dispatch({
      type: PostActionsType.CREATE_POST,
      payload,
    });
  },
  deletePost: (postId: string) => {
    const payload: PostPayload = { postId };
    AppDispatcher.dispatch({
      type: PostActionsType.DELETE_POST,
      payload,
    });
  },
  updatePost: (postId: string, content: string) => {
    const payload: PostPayload = { postId, content };
    AppDispatcher.dispatch({
      type: PostActionsType.UPDATE_POST,
      payload,
    });
  },
  setPosts: (posts: Post[]) => {
    const payload: PostPayload = { posts };
    AppDispatcher.dispatch({
      type: PostActionsType.SET_POSTS,
      payload,
    });
  },
  setError: (error: string) => {
    const payload: PostPayload = { error };
    AppDispatcher.dispatch({
      type: PostActionsType.POST_ERROR,
      payload,
    });
  },
};

export enum AuthActionsType {
  LOGIN = "LOGIN",
  LOGIN_START = "LOGIN_START",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_ERROR = "LOGIN_ERROR",
  REGISTER = "REGISTER",
  REGISTER_START = "REGISTER_START",
  REGISTER_SUCCESS = "REGISTER_SUCCESS",
  REGISTER_ERROR = "REGISTER_ERROR",
  LOGOUT = "LOGOUT",
  AUTH_ERROR = "AUTH_ERROR",
}

export const AuthActions = {
  login: (email: string, password: string) => {
    const payload: UserPayload = { email, password };
    AppDispatcher.dispatch({
      type: AuthActionsType.LOGIN,
      payload,
    });
  },
  register: (email: string, password: string, displayName: string) => {
    const payload: UserPayload = { email, password, displayName };
    AppDispatcher.dispatch({
      type: AuthActionsType.REGISTER,
      payload,
    });
  },
  logout: () => {
    const payload: UserPayload = {};
    AppDispatcher.dispatch({
      type: AuthActionsType.LOGOUT,
      payload,
    });
  },
  setError: (error: string) => {
    const payload: UserPayload = { error };
    AppDispatcher.dispatch({
      type: AuthActionsType.AUTH_ERROR,
      payload,
    });
  },
};
