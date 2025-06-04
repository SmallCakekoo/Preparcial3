import { UserCredential } from "firebase/auth";

export type PathPayload = {
    path: string;
};

export interface Action {
    type: string;
    payload?: PathPayload | UserCredential;
}

export class Dispatcher {
    // Los metodos de cada store que accionan las handleActions
    private _listeners: Array<(action: Action) => void>;

    constructor() {
        this._listeners = [];
    }

    // This method is used to register a callback function that will be called
    // whenever an action is dispatched. It allows components to listen for
    // changes in the application state and update themselves accordingly.
    register(callback: (action: Action) => void): void {
        this._listeners.push(callback);
    }

    // This method is used to dispatch an action to all registered listeners.
    // It takes an action object as an argument and calls each registered
    // callback function with the action as an argument. This allows components
    // to respond to actions and update their state accordingly.
    dispatch(action: Action): void {
        for (const listener of this._listeners) {
            listener(action);
        }
    }
}

export const AppDispatcher = new Dispatcher();