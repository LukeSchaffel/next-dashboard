import { useSession } from "@clerk/nextjs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useClientAuthSession } from "@/app/dashboard/_components/client-layout";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
    file: File
  ) => {
    if (!client) {
      throw new Error("Supabase client not initialized");
    }
    const { data, error } = await client.storage
      .from("images")
      .upload(
        `user-uploads/${type}/${workspaceId}/${sanitizeFilename(file.name)}`,
        file
      );

    if (error) {
      console.error("Upload failed:", error);
      throw error;
    }

    return data.path;
  };

  const getImageUrl = (path: string) => {
    if (!path) return null;
    return `${supabaseUrl}/storage/v1/object/public/images/${path}`;
  };

  const listImages = async (
    type: "event" | "location"
  ): Promise<any[] | undefined> => {
    if (client) {
      if (!workspace?.id) {
        throw new Error("No workspace selected");
      }

      const { data, error } = await client.storage
        .from("images")
        .list(`user-uploads/${type}s/${workspace.id}`);

      if (error) {
        console.error("Failed to list images:", error);
        throw error;
      }

      return data.map((file) => ({
        ...file,
        url: `${supabaseUrl}/storage/v1/object/public/images/user-uploads/${type}s/${workspace.id}/${file.name}`,
      }));
    }
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
