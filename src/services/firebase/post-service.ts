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
} from "firebase/firestore";
import { Post } from "../../types/SrcTypes";

export const createPost = async (
  content: string,
  userId: string,
  imageUrl?: string
): Promise<Post> => {
  try {
    const postData = {
      content,
      userId,
      imageUrl: imageUrl || "",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      authorName: "", // Se actualizará con el nombre del usuario
      authorId: userId,
      likes: 0,
      comments: [],
    };

    const docRef = await addDoc(collection(db, "posts"), postData);

    return {
      id: docRef.id,
      ...postData,
      createdAt: postData.createdAt.toDate(),
      updatedAt: postData.updatedAt.toDate(),
    };
  } catch (error) {
    console.error("Error al crear el post:", error);
    throw error;
  }
};

export const getPosts = async (): Promise<Post[]> => {
  try {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Post[];
  } catch (error) {
    console.error("Error al obtener los posts:", error);
    throw error;
  }
};

export const deletePost = async (postId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "posts", postId));
  } catch (error) {
    console.error("Error al eliminar el post:", error);
    throw error;
  }
};
