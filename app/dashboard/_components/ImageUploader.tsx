import { Paper, Group, Text, Image, Button, Stack } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react";
import { useState } from "react";
import { useSupabase } from "@/lib/supabase";

interface ImageUploaderProps {
  type: "events" | "locations";
  workspaceId: string;
  currentImagePath?: string | null;
  onImageUploaded?: (path: string) => void;
  onImageRemoved?: () => void;
  maxSize?: number;
  height?: number;
  accept?: string[];
  resourceId: string;
}

export default function ImageUploader({
  type,
  workspaceId,
  currentImagePath,
  onImageUploaded,
  onImageRemoved,
  maxSize = 5 * 1024 ** 2, // 5MB default
  height = 220,
  accept = ["image/jpeg", "image/png", "image/webp"],
  resourceId,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(
    currentImagePath || null
  );
  const { uploadImage } = useSupabase();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const imageUrl = imagePath
    ? `${supabaseUrl}/storage/v1/object/public/images/${imagePath}`
    : null;

  const handleImageUpload = async (files: FileWithPath[]) => {
    const file = files[0];
    if (!file) return;

    setUploading(true);
    try {
      const path = await uploadImage(
        type,
        workspaceId,
        resourceId,
        file
      );
      if (path) {
        setImagePath(path);
        onImageUploaded?.(path);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePath(null);
    onImageRemoved?.();
  };

  if (imageUrl) {
    return (
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Text size="sm" fw={500}>
            Image
          </Text>
          <Button
            variant="subtle"
            color="red"
            size="xs"
            onClick={handleRemoveImage}
          >
            Remove Image
          </Button>
        </Group>
        <Image
          src={imageUrl}
          alt="Uploaded image"
          height={height}
          fit="cover"
          radius="md"
        />
      </Paper>
    );
  }

  return (
    <Dropzone
      onDrop={handleImageUpload}
      maxSize={maxSize}
      accept={accept}
      loading={uploading}
    >
      <Group
        justify="center"
        gap="xl"
        style={{ minHeight: height, pointerEvents: "none" }}
      >
        <Dropzone.Accept>
          <IconUpload size={50} stroke={1.5} />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX size={50} stroke={1.5} />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto size={50} stroke={1.5} />
        </Dropzone.Idle>

        <Stack gap="xs" align="center">
          <Text size="xl" inline>
            Drag an image here or click to select
          </Text>
          <Text size="sm" c="dimmed" inline>
            Upload an image (max {maxSize / (1024 * 1024)}MB)
          </Text>
        </Stack>
      </Group>
    </Dropzone>
  );
}
