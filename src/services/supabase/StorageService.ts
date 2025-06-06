import { supabase } from "./SupabaseConfig";

export interface Meme {
  name: string;
  url: string;
  type: "image" | "video" | "gif";
}

export async function uploadMeme(file: File): Promise<Meme | null> {
  try {
    // Verificar si el archivo es una imagen, video o gif
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      throw new Error("El archivo debe ser una imagen o un video");
    }

    // Determinar el tipo de archivo
    let fileType: "image" | "video" | "gif" = "image";
    if (file.type.startsWith("video/")) {
      fileType = "video";
    } else if (file.type === "image/gif") {
      fileType = "gif";
    }

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB para videos
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        "El archivo es demasiado grande. El tamaño máximo es 50MB"
      );
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `preparcial/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("imagessocial")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error al subir el archivo:", uploadError.message);
      if (uploadError.message.includes("permission denied")) {
        throw new Error(
          "No tienes permisos para subir archivos. Por favor, inicia sesión."
        );
      }
      throw new Error(`Error al subir el archivo: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("imagessocial").getPublicUrl(filePath);

    return {
      name: file.name,
      url: publicUrl,
      type: fileType,
    };
  } catch (error) {
    console.error("Error al subir el archivo:", error);
    throw error;
  }
}

export async function getMemes(): Promise<Meme[]> {
  try {
    const { data, error } = await supabase.storage
      .from("imagessocial")
      .list("preparcial", {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "desc" },
      });

    if (error) {
      console.error("Error al obtener la lista de archivos:", error.message);
      if (error.message.includes("permission denied")) {
        throw new Error("No tienes permisos para ver los archivos.");
      }
      throw new Error(
        `Error al obtener la lista de archivos: ${error.message}`
      );
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Filtrar el archivo .emptyFolderPlaceholder
    const filteredData = data.filter(
      (file) => file.name !== ".emptyFolderPlaceholder"
    );

    const memes = await Promise.all(
      filteredData.map(async (file) => {
        const {
          data: { publicUrl },
        } = supabase.storage
          .from("imagessocial")
          .getPublicUrl(`preparcial/${file.name}`);

        // Determinar el tipo basado en la extensión del archivo
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
        let fileType: "image" | "video" | "gif" = "image";

        if (["mp4", "webm", "ogg", "mov"].includes(fileExt)) {
          fileType = "video";
        } else if (fileExt === "gif") {
          fileType = "gif";
        }

        return {
          name: file.name,
          url: publicUrl,
          type: fileType,
        };
      })
    );

    return memes;
  } catch (error) {
    console.error("Error al obtener los archivos:", error);
    throw error;
  }
}
