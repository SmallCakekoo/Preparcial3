import { db } from "./firebase-config";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { Post } from "../../types/SrcTypes";

interface UserData {
  displayName?: string;
  username?: string;
}

export const createPost = async (
  content: string,
  userId: string,
  imageUrl?: string
): Promise<Post> => {
  try {
    console.log("Iniciando creación de post con datos:", {
      content,
      userId,
      imageUrl,
    });

    // Obtener información del usuario
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data() as UserData;
    console.log("Datos del usuario encontrados:", userData);

    if (!userData) {
      throw new Error("Usuario no encontrado");
    }

    const postData = {
      content,
      userId,
      imageUrl: imageUrl || "",
      createdAt: Timestamp.now(),
      authorName: userData.displayName || userData.username || "Anónimo",
    };

    console.log("Datos del post a guardar:", postData);
    const docRef = await addDoc(collection(db, "post"), postData);
    console.log("Post creado con ID:", docRef.id);

    return {
      id: docRef.id,
      ...postData,
      createdAt: postData.createdAt.toDate(),
    };
  } catch (error) {
    console.error("Error al crear el post:", error);
    throw error;
  }
};

export const getPosts = async (): Promise<Post[]> => {
  try {
    console.log("Obteniendo posts de Firestore...");
    const q = query(collection(db, "post"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    console.log("Posts obtenidos:", querySnapshot.size);

    const posts = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        // Obtener el nombre del usuario para cada post
        const userDocRef = doc(db, "users", data.userId);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data() as UserData;

        const post: Post = {
          id: docSnapshot.id,
          content: data.content,
          userId: data.userId,
          imageUrl: data.imageUrl,
          authorName: userData?.displayName || userData?.username || "Anónimo",
          createdAt: data.createdAt.toDate(),
        };

        return post;
      })
    );

    console.log("Posts procesados:", posts);
    return posts;
  } catch (error) {
    console.error("Error al obtener los posts:", error);
    throw error;
  }
};

export const deletePost = async (postId: string): Promise<void> => {
  try {
    console.log("Intentando eliminar post con ID:", postId);
    await deleteDoc(doc(db, "post", postId));
    console.log("Post eliminado exitosamente");
  } catch (error) {
    console.error("Error al eliminar el post:", error);
    throw error;
  }
};

export const updatePost = async (
  postId: string,
  postData: Partial<Post>
): Promise<boolean> => {
  try {
    const postRef = doc(db, "post", postId);
    await setDoc(postRef, postData, { merge: true });
    return true;
  } catch (error) {
    console.error("Error al actualizar post:", error);
    throw error;
  }
};
