import { supabase } from "./SupabaseConfig";

export class FileSystemServiceSB {
  private bucket: string;

  constructor(bucket: string = "default") {
    this.bucket = bucket;
  }

  async uploadFile(file: File, path: string): Promise<string | null> {
    try {
      const { error } = await supabase.storage
        .from(this.bucket)
        .upload(path, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from(this.bucket).getPublicUrl(path);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  }

  async deleteFile(path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from(this.bucket).remove([path]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  async getFileUrl(path: string): Promise<string | null> {
    try {
      const {
        data: { publicUrl },
      } = supabase.storage.from(this.bucket).getPublicUrl(path);

      return publicUrl;
    } catch (error) {
      console.error("Error getting file URL:", error);
      return null;
    }
  }

  async listFiles(path: string = ""): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .list(path);

      if (error) throw error;
      return data.map((item) => item.name);
    } catch (error) {
      console.error("Error listing files:", error);
      return [];
    }
  }
}

// Función exportada para subir archivos
export const uploadFile = async (file: File): Promise<string | null> => {
  const fileSystem = new FileSystemServiceSB("imagessocial");
  const path = `Fotos/file_${Date.now()}`;
  return await fileSystem.uploadFile(file, path);
};
