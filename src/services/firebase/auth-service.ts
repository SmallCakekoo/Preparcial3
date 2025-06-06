import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  deleteUser,
} from "firebase/auth";
import { auth, db } from "./firebase-config";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

// Función para registrar un nuevo usuario
export const registerUser = async (
  email: string,
  password: string,
  username: string,
  role: string
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
      role,
      createdAt: new Date(),
    });

    // Guardar información en localStorage para acceso rápido
    localStorage.setItem("userId", user.uid);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("username", username);
    localStorage.setItem("userRole", role);

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

    if (!userData) {
      throw new Error(
        "No se encontró la información del usuario en la base de datos"
      );
    }

    // Guardar información en localStorage
    localStorage.setItem("userId", user.uid);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("username", userData.username);
    localStorage.setItem("userRole", userData.role);

    return {
      success: true,
      user,
      userData,
      isAdmin: userData.role === "admin",
    };
  } catch (error: unknown) {
    console.error("Error al iniciar sesión:", error);

    let errorMessage = "Error al iniciar sesión";

    if (error && typeof error === "object" && "code" in error) {
      const errorCode = (error as { code: string }).code;
      if (errorCode === "auth/invalid-credential") {
        errorMessage = "Email o contraseña incorrectos";
      } else if (errorCode === "auth/user-not-found") {
        errorMessage = "No existe una cuenta con este email";
      } else if (errorCode === "auth/wrong-password") {
        errorMessage = "Contraseña incorrecta";
      } else if (errorCode === "auth/too-many-requests") {
        errorMessage =
          "Demasiados intentos fallidos. Por favor, intenta más tarde";
      } else if (errorCode === "auth/user-disabled") {
        errorMessage = "Esta cuenta ha sido deshabilitada";
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
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

// Función para eliminar el usuario de Firestore
export const deleteUserFromFirestore = async (userId: string) => {
  try {
    await deleteDoc(doc(db, "users", userId));
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar usuario de Firestore:", error);
    return { success: false, error };
  }
};

// Función para eliminar la cuenta del usuario
export const deleteUserAccount = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No hay usuario autenticado");
    }

    // Primero eliminamos el documento de Firestore
    const deleteFirestoreResult = await deleteUserFromFirestore(user.uid);
    if (!deleteFirestoreResult.success) {
      throw new Error(
        "Error al eliminar datos del usuario de la base de datos"
      );
    }

    // Luego eliminamos la cuenta de autenticación
    await deleteUser(user);

    // Limpiamos localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar la cuenta:", error);
    return { success: false, error };
  }
};
