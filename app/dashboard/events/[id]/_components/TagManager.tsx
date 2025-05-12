import {
  Modal,
  MultiSelect,
  Stack,
  Button,
  LoadingOverlay,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useEventStore } from "@/stores/useEventStore";

interface TagManagerProps {
  opened: boolean;
  onClose: () => void;
  eventId: string;
  currentTags: { id: string; name: string; tagId: string }[];
}

export default function TagManager({
  opened,
  onClose,
  eventId,
  currentTags,
}: TagManagerProps) {
  const { updateEvent } = useEventStore();
  const [availableTags, setAvailableTags] = useState<
    { value: string; label: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    currentTags.map((tag) => tag.tagId)
  );

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        const tags = await response.json();
        setAvailableTags(
          tags.map((tag: any) => ({
            value: tag.id,
            label: tag.name,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      }
    };
    fetchTags();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Convert selected tag IDs to the format expected by the API
      const tags = selectedTags.map((tagId) => {
        const tag = availableTags.find((t) => t.value === tagId);
        return {
          id: tagId,
          name: tag?.label,
        };
      });

      await updateEvent(eventId, { tags });
      onClose();
    } catch (error) {
      console.error("Failed to update tags:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Manage Event Tags"
      size="md"
      centered
    >
      <Stack gap="md" pos="relative">
        <LoadingOverlay visible={loading} />
        <MultiSelect
          label="Tags"
          placeholder="Select tags"
          data={availableTags}
          value={selectedTags}
          onChange={setSelectedTags}
          searchable
          clearable
        />
        <Button onClick={handleSubmit} loading={loading}>
          Save Changes
        </Button>
      </Stack>
    </Modal>
  );
}
