import { Modal, Stack, Button, Group } from "@mantine/core";
import DescriptionEditor from "./DescriptionEditor";

interface DescriptionEditorModalProps {
  opened: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  loading?: boolean;
}

export default function DescriptionEditorModal({
  opened,
  onClose,
  value,
  onChange,
  onSave,
  loading = false,
}: DescriptionEditorModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Event Description"
      size="xl"
      centered
    >
      <Stack gap="md">
        <DescriptionEditor value={value} onChange={onChange} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} loading={loading}>
            Save Description
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
