import {
  Paper,
  Stack,
  Title,
  SimpleGrid,
  Image,
  ActionIcon,
  Group,
  Text,
  Tooltip,
} from "@mantine/core";
import { EventWithDetails } from "@/stores/useEventStore";
import ImageUploader from "../../../_components/ImageUploader";
import { IconTrash } from "@tabler/icons-react";
import { useSupabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

interface EventImagesProps {
  event: EventWithDetails;
  imagePath: string | null;
  onImageUploaded: (path: string) => void;
  onImageRemoved: () => void;
}

export default function EventImages({
  event,
  imagePath,
  onImageUploaded,
  onImageRemoved,
}: EventImagesProps) {
  const { listImages, deleteImage } = useSupabase();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      const imgs = await listImages("events", event.id);
      setImages(imgs || []);
      setLoading(false);
    };
    fetchImages();
  }, [listImages, event.id]);

  const handleDeleteImage = async (path: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      await deleteImage(path);
      setImages(images.filter((img) => img !== path));
      if (path === imagePath) {
        onImageRemoved();
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  return (
    <Stack gap="xl">
      <Paper p="xl" withBorder>
        <Stack gap="md">
          <Title order={3}>Upload New Image</Title>
          <ImageUploader
            type="events"
            workspaceId={event.workspaceId}
            currentImagePath={imagePath}
            onImageUploaded={(path) => {
              onImageUploaded(path);
              setImages([...images, path]);
            }}
            onImageRemoved={onImageRemoved}
            resourceId={event.id}
          />
        </Stack>
      </Paper>

      <Paper p="xl" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={3}>Event Images</Title>
            <Text size="sm" c="dimmed">
              {images.length} {images.length === 1 ? "image" : "images"}
            </Text>
          </Group>

          {loading ? (
            <Text c="dimmed">Loading images...</Text>
          ) : images.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
              {images.map((path) => (
                <Paper key={path} withBorder p="xs" pos="relative">
                  <Image
                    src={path}
                    alt="Event image"
                    height={200}
                    fit="cover"
                    radius="sm"
                  />
                  <Group justify="flex-end" mt="xs">
                    <Tooltip label="Delete image">
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDeleteImage(path)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>
          ) : (
            <Text c="dimmed">No images uploaded yet</Text>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
