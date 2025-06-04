// import { UserCredential } from "firebase/auth";
// import { AppDispatcher } from "./Dispatcher";

// export const NavigateActionsType = {
//   NAVIGATE: "NAVIGATE",
// };

// export const UserActionsType = {
//   SAVE_USER: "SAVE_USER",
//   CHECK_AUTH: "CHECK_AUTH",
//   LOGOUT: "LOGOUT",
// };

// export const NavigateActions = {
//   navigate: (path: string) => {
//     AppDispatcher.dispatch({
//       type: NavigateActionsType.NAVIGATE,
//       payload: { path },
//     });
//   },
// };

// export const UserActions = {
//   saveUser: (user: UserCredential) => {
//     AppDispatcher.dispatch({
//       type: UserActionsType.SAVE_USER,
//       payload: user,
//     });
//   },
//   checkAuth: () => {
//     AppDispatcher.dispatch({
//       type: UserActionsType.CHECK_AUTH,
//     });
//   },
//   logout: () => {
//     AppDispatcher.dispatch({
//       type: UserActionsType.LOGOUT,
//     });
//   },
// };
