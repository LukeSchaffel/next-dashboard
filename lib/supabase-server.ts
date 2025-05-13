import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side Supabase client
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);

export const listImagesServer = async (
  type: "event" | "location",
  workspaceId: string,
  resourceId: string
): Promise<any[]> => {
  const { data, error } = await supabaseServer.storage
    .from("images")
    .list(`user-uploads/${type}s/${workspaceId}/${resourceId}`);

  if (error) {
    console.error("Failed to list images:", error);
    throw error;
  }

  return data.map((file) => {
    const { data: urlData } = supabaseServer.storage
      .from("images")
      .getPublicUrl(
        `user-uploads/${type}s/${workspaceId}/${resourceId}/${file.name}`
      );
    return {
      ...file,
      url: urlData.publicUrl,
    };
  });
};
