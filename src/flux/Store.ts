// import { User, UserCredential } from 'firebase/auth';
// import { NavigateActionsType, UserActionsType } from './Actions';
// import { AppDispatcher, Action } from './Dispatcher';
// import { auth } from '../services/Firebase/FirebaseConfig';

// export type State = {
//     currentPath: string;
//     isAuthenticated: boolean;
//     userAuthenticated: UserCredential | User | null;
// };

// type Listener = (state: State) => void;


// class Store {
//     private _myState: State = {
//         currentPath: '',
//         isAuthenticated: false,
//         userAuthenticated: null
//     }
//     // Los componentes
//     private _listeners: Listener[] = [];

//     constructor() {
//         AppDispatcher.register(this._handleActions.bind(this)); // Bind the context of this method to the Store instance
//     }

//     getState() {
//         return this._myState;
//     }

//     _handleActions(action: Action): void {
//         switch (action.type) {
//             case NavigateActionsType.NAVIGATE:
//                 if (action.payload && 'path' in action.payload) {
//                     this._myState = {
//                         ...this._myState,
//                         currentPath: action.payload.path 
//                     }
//                     this._emitChange();
//                 }
//                 break;
//             case UserActionsType.SAVE_USER:
//                 this._myState = {
//                     ...this._myState,
//                     isAuthenticated: true,
//                     userAuthenticated: action.payload as UserCredential
//                 }
//                 break;
//             case UserActionsType.CHECK_AUTH:
//                 auth.onAuthStateChanged((user) => {
//                     if (user) {
//                         console.log('Entro');
//                         this._myState = {
//                             ...this._myState,
//                             isAuthenticated: true,
//                             userAuthenticated: user,
//                         }
//                     } else {
//                         this._myState = {
//                             ...this._myState,
//                             isAuthenticated: false,
//                             userAuthenticated: null
//                         }
//                     }

//                     this._emitChange();
//                     this.persist();
//                 });
//                 break;
//             case UserActionsType.LOGOUT:
//                 auth.signOut().then(() => {
//                     this._myState = {
//                         currentPath: '/',
//                         isAuthenticated: false,
//                         userAuthenticated: null
//                     }
//                     this._emitChange();
//                 }).catch((error) => {
//                     console.error('Error al cerrar sesión:', error);
//                 });
//                 break;
//         }

//         this.persist();
//     }

//     private _emitChange(): void {
//         const state = this.getState();
//         for (const listener of this._listeners) {
//             listener(state);
//         }
//     }

//     // Permite a los componentes suscribirse al store
//     subscribe(listener: Listener): void {
//         this._listeners.push(listener);
//         listener(this.getState()); // Emitir estado actual al suscribirse
//     }

//     // Permite quitar la suscripción
//     unsubscribe(listener: Listener): void {
//         this._listeners = this._listeners.filter(l => l !== listener);
//     }

//     persist(): void {
//         console.log('Persistiendo el estado en localStorage', this._myState);
//         localStorage.setItem('flux:state', JSON.stringify(this._myState));
//     }

//     load(): void {
//         const persistedState = localStorage.getItem('flux:state');
//         if (persistedState) {
//             this._myState = JSON.parse(persistedState);
//             this._emitChange(); // Emitir el nuevo estado
//         }
//     }

// }

// export const store = new Store();