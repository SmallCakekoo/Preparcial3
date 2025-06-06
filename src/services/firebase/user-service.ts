import { db } from "./firebase-config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { auth } from "./firebase-config";
import { deleteUser as deleteAuthUser } from "firebase/auth";

export interface UserData {
  uid: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
}

export const getAllUsers = async (): Promise<UserData[]> => {
  try {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    const users: UserData[] = [];

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        username: data.username,
        email: data.email,
        role: data.role,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    return users;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // Primero eliminamos el documento de Firestore
    await deleteDoc(doc(db, "users", userId));

    // Luego eliminamos el usuario de Authentication
    // Para esto necesitamos obtener el usuario actual y verificar que sea admin
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No hay usuario autenticado");
    }

    // Verificar que el usuario actual sea admin
    const currentUserDoc = await getDocs(collection(db, "users"));
    const currentUserData = currentUserDoc.docs
      .find((doc) => doc.id === currentUser.uid)
      ?.data();

    if (currentUserData?.role !== "admin") {
      throw new Error("No tienes permisos para eliminar usuarios");
    }

    // Si el usuario a eliminar es el mismo que está autenticado, no permitir la eliminación
    if (userId === currentUser.uid) {
      throw new Error("No puedes eliminar tu propia cuenta desde aquí");
    }

    // Nota: Por limitaciones de seguridad de Firebase, solo podemos eliminar usuarios de Authentication
    // cuando son el usuario actual. Para eliminar otros usuarios, necesitamos un backend.
    console.warn(
      "El usuario ha sido desactivado exitosamente. " +
        "Sus datos han sido eliminados de la base de datos y no podrá acceder a la aplicación. " +
        "Para eliminar completamente su cuenta de autenticación, se requiere implementar un backend con Firebase Admin SDK."
    );

    return true;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw error;
  }
};
