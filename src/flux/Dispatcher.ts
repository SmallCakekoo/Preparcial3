import { UserCredential } from "firebase/auth";
import { UserProfile, Post } from "../types";
import { Action as ActionType } from "./Actions";

export type PathPayload = {
  path: string;
};

export type PostPayload = {
  content?: string;
  postId?: string;
  posts?: Post[];
};

export type UserPayload = {
  email?: string;
  password?: string;
  displayName?: string;
  user?: UserCredential;
  profile?: UserProfile;
  error?: string;
};

export type ActionPayload =
  | PathPayload
  | PostPayload
  | UserPayload
  | string
  | Post[]
  | UserCredential;

export interface Action {
  type: string;
  payload?: ActionPayload;
}

class Dispatcher {
  private _callbacks: Array<(action: ActionType) => void> = [];

  register(callback: (action: ActionType) => void): void {
    this._callbacks.push(callback);
  }

  dispatch(action: ActionType): void {
    this._callbacks.forEach((callback) => callback(action));
  }
}

export const AppDispatcher = new Dispatcher();
