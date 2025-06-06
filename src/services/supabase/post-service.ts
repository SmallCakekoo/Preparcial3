import { supabase } from "./SupabaseConfig";
import { Post } from "../../types/SrcTypes";

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
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("display_name, username")
      .eq("id", userId)
      .single();

    if (userError) {
      throw new Error("Error al obtener datos del usuario");
    }

    console.log("Datos del usuario encontrados:", userData);

    const postData = {
      content,
      user_id: userId,
      image_url: imageUrl || "",
      created_at: new Date().toISOString(),
      author_name: userData.display_name || userData.username || "Anónimo",
    };

    console.log("Datos del post a guardar:", postData);
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert(postData)
      .select()
      .single();

    if (postError) {
      throw new Error("Error al crear el post");
    }

    console.log("Post creado con ID:", post.id);

    return {
      id: post.id,
      content: post.content,
      userId: post.user_id,
      imageUrl: post.image_url,
      authorName: post.author_name,
      createdAt: new Date(post.created_at),
    };
  } catch (error) {
    console.error("Error al crear el post:", error);
    throw error;
  }
};

export const getPosts = async (): Promise<Post[]> => {
  try {
    console.log("Obteniendo posts de Supabase...");
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error("Error al obtener los posts");
    }

    console.log("Posts obtenidos:", posts.length);

    return posts.map((post) => ({
      id: post.id,
      content: post.content,
      userId: post.user_id,
      imageUrl: post.image_url,
      authorName: post.author_name,
      createdAt: new Date(post.created_at),
    }));
  } catch (error) {
    console.error("Error al obtener los posts:", error);
    throw error;
  }
};

export const deletePost = async (postId: string): Promise<void> => {
  try {
    console.log("Intentando eliminar post con ID:", postId);
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      throw new Error("Error al eliminar el post");
    }

    console.log("Post eliminado exitosamente");
  } catch (error) {
    console.error("Error al eliminar el post:", error);
    throw error;
  }
};
