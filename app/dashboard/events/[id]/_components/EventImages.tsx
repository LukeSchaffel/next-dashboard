import {
  Paper,
  Stack,
  Title,
  Image,
  ActionIcon,
  Group,
  Text,
  Tooltip,
  Box,
  Overlay,
  Badge,
  Modal,
  Button,
  rem,
} from "@mantine/core";
import { EventWithDetails } from "@/stores/useEventStore";
import ImageUploader from "../../../_components/ImageUploader";
import { IconTrash, IconPhoto, IconMaximize, IconX } from "@tabler/icons-react";
import { useSupabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Carousel } from "@mantine/carousel";
import { useDisclosure } from "@mantine/hooks";
import classes from "./_styles.module.css";

interface ImageInfo {
  path: string;
  url: string;
  name: string;
}

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
  const { listImages, deleteImage, client } = useSupabase();
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  const fetchImages = async () => {
    if (!client || !event.workspaceId) return;

    const { data, error } = await client.storage
      .from("images")
      .list(`user-uploads/events/${event.workspaceId}/${event.id}`);

    if (error) {
      console.error("Failed to list images:", error);
      return;
    }

    const imageInfos = data.map((file) => {
      const { data: urlData } = client.storage
        .from("images")
        .getPublicUrl(
          `user-uploads/events/${event.workspaceId}/${event.id}/${file.name}`
        );
      return {
        path: `user-uploads/events/${event.workspaceId}/${event.id}/${file.name}`,
        url: urlData.publicUrl,
        name: file.name,
      };
    });

    setImages(imageInfos);
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, [client, event.workspaceId, event.id]);

  const handleDeleteImage = async (imageInfo: ImageInfo) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      await deleteImage(imageInfo.path);
      setImages(images.filter((img) => img.path !== imageInfo.path));
      if (imageInfo.path === imagePath) {
        onImageRemoved();
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  return (
    <Stack gap="xl">
      <Paper p="xl" withBorder radius="md">
        <Stack gap="md">
          <Group>
            <IconPhoto size={24} stroke={1.5} />
            <Title order={3}>Upload New Image</Title>
          </Group>
          <Text size="sm" c="dimmed">
            Upload an image named "header" to set it as the main image on the
            event page. Otherwise, images will be displayed in the event
            gallery.
          </Text>
          <ImageUploader
            type="events"
            workspaceId={event.workspaceId}
            currentImagePath={imagePath}
            onImageUploaded={(path) => {
              onImageUploaded(path);
              fetchImages();
            }}
            onImageRemoved={onImageRemoved}
            resourceId={event.id}
          />
        </Stack>
      </Paper>

      <Paper p="xl" withBorder radius="md">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group>
              <IconPhoto size={24} stroke={1.5} />
              <Title order={3}>Event Images</Title>
            </Group>
            <Badge size="lg" variant="light">
              {images.length} {images.length === 1 ? "image" : "images"}
            </Badge>
          </Group>

          {loading ? (
            <Text c="dimmed" ta="center" py="xl">
              Loading images...
            </Text>
          ) : images.length > 0 ? (
            <Box className={classes.carouselWrapper}>
              <Carousel
                withIndicators
                height={400}
                slideSize="100%"
                slideGap="md"
                classNames={{
                  root: classes.carousel,
                  indicators: classes.indicators,
                  indicator: classes.indicator,
                }}
              >
                {images.map((imageInfo) => (
                  <Carousel.Slide key={imageInfo.path}>
                    <Box className={classes.slideWrapper}>
                      <Image
                        src={imageInfo.url}
                        alt={imageInfo.name}
                        height={400}
                        fit="contain"
                        className={classes.carouselImage}
                      />
                      <Group
                        className={classes.slideOverlay}
                        justify="space-between"
                        p="md"
                      >
                        <Group>
                          <Text
                            size="sm"
                            c="white"
                            truncate
                            style={{ maxWidth: "80%" }}
                          >
                            {imageInfo.name}
                          </Text>
                          {imageInfo.name === "header" && (
                            <Badge size="sm" variant="filled" color="blue">
                              Header Image
                            </Badge>
                          )}
                        </Group>
                        <Group>
                          <Tooltip label="View full size">
                            <ActionIcon
                              variant="light"
                              color="gray"
                              onClick={() => {
                                setSelectedImage(imageInfo);
                                openModal();
                              }}
                              size="lg"
                            >
                              <IconMaximize size={18} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Delete image">
                            <ActionIcon
                              variant="light"
                              color="red"
                              onClick={() => handleDeleteImage(imageInfo)}
                              size="lg"
                            >
                              <IconTrash size={18} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Group>
                    </Box>
                  </Carousel.Slide>
                ))}
              </Carousel>
            </Box>
          ) : (
            <Paper withBorder p="xl" radius="md" className={classes.emptyState}>
              <Stack align="center" gap="xs">
                <IconPhoto
                  size={48}
                  stroke={1}
                  color="var(--mantine-color-dimmed)"
                />
                <Text c="dimmed" size="lg">
                  No images uploaded yet
                </Text>
                <Text c="dimmed" size="sm" ta="center">
                  Upload images to showcase your event
                </Text>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        size="xl"
        padding={0}
        withCloseButton={false}
        centered
      >
        {selectedImage && (
          <Box pos="relative">
            <Image
              src={selectedImage.url}
              alt={selectedImage.name}
              fit="contain"
              style={{ maxHeight: "80vh" }}
            />
            <Group
              className={classes.modalOverlay}
              justify="space-between"
              p="md"
            >
              <Text size="sm" c="white" truncate style={{ maxWidth: "80%" }}>
                {selectedImage.name}
              </Text>
              <ActionIcon
                variant="light"
                color="gray"
                onClick={closeModal}
                size="lg"
              >
                <IconX size={18} />
              </ActionIcon>
            </Group>
          </Box>
        )}
      </Modal>
    </Stack>
  );
}
