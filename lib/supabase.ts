import { useSession } from "@clerk/nextjs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useClientAuthSession } from "@/app/dashboard/_components/client-layout";
import { notifications } from "@mantine/notifications";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface ImageInfo {
  path: string;
  url: string;
  name: string;
}

export const useSupabase = () => {
  const { session } = useSession();
  const { workspace } = useClientAuthSession();

  const [client, setClient] = useState<
    SupabaseClient<any, "public", any> | undefined
  >(undefined);

  useEffect(() => {
    if (!session) {
      setClient(undefined);
      return;
    }

    // Create new client when session changes
    const newClient = createClient(supabaseUrl, supabaseAnonKey, {
      async accessToken() {
        return session?.getToken() ?? null;
      },
    });

    setClient(newClient);
  }, [session]); // Only depend on session changes

  const uploadImage = async (
    type: "events" | "locations",
    workspaceId: string,
    resourceId: string,
    file: File
  ) => {
    if (!client) {
      throw new Error("Supabase client not initialized");
    }
    const { data, error } = await client.storage
      .from("images")
      .upload(
        `user-uploads/${type}/${workspaceId}/${resourceId}/${sanitizeFilename(
          file.name
        )}`,
        file
      );

    if (error) {
      console.error("Upload failed:", error);
      throw error;
    }
    notifications.show({ message: "Succesfully upload image" });
    return data.path;
  };

  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (!client) return null;
    const { data } = client.storage.from("images").getPublicUrl(path);
    return data.publicUrl;
  };

  const listImages = async (
    type: "events" | "locations",
    resourceId: string
  ): Promise<ImageInfo[]> => {
    if (!client) {
      throw new Error("Supabase client not initialized");
    }

    if (!workspace?.id) {
      throw new Error("No workspace selected");
    }

    const { data, error } = await client.storage
      .from("images")
      .list(`user-uploads/${type}/${workspace.id}/${resourceId}`);

    if (error) {
      console.error("Failed to list images:", error);
      throw error;
    }

    if (!data || data.length < 1) {
      return [];
    }

    return await Promise.all(
      data.map(async (file) => {
        const path = `user-uploads/${type}/${workspace.id}/${resourceId}/${file.name}`;
        const { data: urlData } = await client.storage
          .from("images")
          .getPublicUrl(path);
        return {
          path: path,
          url: urlData.publicUrl,
          name: file.name,
        };
      })
    );
  };

  const deleteImage = async (path: string) => {
    if (!client) {
      throw new Error("Supabase client not initialized");
    }

    const { error } = await client.storage.from("images").remove([path]);

    if (error) {
      console.error("Failed to delete image:", error);
      throw error;
    }
  };

  return {
    uploadImage,
    getImageUrl,
    listImages,
    deleteImage,
    client,
  };
};

const sanitizeFilename = (name: string) => {
  return name.replace(/[^a-z0-9.\-_]/gi, "_");
};
