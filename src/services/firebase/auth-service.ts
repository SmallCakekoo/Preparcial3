import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth, db } from "./firebase-config";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Función para registrar un nuevo usuario
export const registerUser = async (
  email: string,
  password: string,
  username: string
) => {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Guardar información adicional en Firestore
    await setDoc(doc(db, "users", user.uid), {
      username,
      email,
      createdAt: new Date(),
    });

    // Guardar información en localStorage para acceso rápido
    localStorage.setItem("userId", user.uid);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("username", username);

    return { success: true, user };
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return { success: false, error };
  }
};

// Función para iniciar sesión
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Obtener información adicional del usuario desde Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    // Guardar información en localStorage
    localStorage.setItem("userId", user.uid);
    localStorage.setItem("userEmail", email);
    if (userData && userData.username) {
      localStorage.setItem("username", userData.username);
    }

    return { success: true, user, userData };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return { success: false, error };
  }
};

// Función para cerrar sesión
export const logoutUser = async () => {
  try {
    await signOut(auth);

    // Limpiar localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");

    return { success: true };
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return { success: false, error };
  }
};

// Función para verificar el estado de autenticación
export const checkAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
