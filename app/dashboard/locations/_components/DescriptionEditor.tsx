import { Modal, Stack, Button, Group, LoadingOverlay } from "@mantine/core";
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import { useLocationStore } from "@/stores/useLocationStore";

interface DescriptionEditorProps {
  opened: boolean;
  onClose: () => void;
  description: string;
  locationId: string;
  onUpdate: (location: any) => void;
}

export default function DescriptionEditor({
  opened,
  onClose,
  description,
  locationId,
  onUpdate,
}: DescriptionEditorProps) {
  const [loading, setLoading] = useState(false);
  const { updateLocation } = useLocationStore();
  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: "",
  });

  useEffect(() => {
    if (opened && editor) {
      editor.commands.setContent(description || "");
    }
  }, [opened, description, editor]);

  const handleSave = async () => {
    if (!editor) return;

    setLoading(true);
    try {
      const updatedLocation = await updateLocation(locationId, {
        description: editor.getHTML(),
      });
      onUpdate((prev: Location) => ({
        ...prev,
        description: updatedLocation.description,
      }));
      onClose();
    } catch (error) {
      console.error("Failed to update description:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Location Description"
      size="xl"
      centered
    >
      <LoadingOverlay
        visible={loading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <Stack gap="md">
        <RichTextEditor editor={editor}>
          <RichTextEditor.Toolbar sticky stickyOffset={60}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Strikethrough />
              <RichTextEditor.ClearFormatting />
              <RichTextEditor.Highlight />
              <RichTextEditor.Code />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H1 />
              <RichTextEditor.H2 />
              <RichTextEditor.H3 />
              <RichTextEditor.H4 />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Blockquote />
              <RichTextEditor.Hr />
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
              <RichTextEditor.Subscript />
              <RichTextEditor.Superscript />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Link />
              <RichTextEditor.Unlink />
            </RichTextEditor.ControlsGroup>

            <RichTextEditor.ControlsGroup>
              <RichTextEditor.AlignLeft />
              <RichTextEditor.AlignCenter />
              <RichTextEditor.AlignJustify />
              <RichTextEditor.AlignRight />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>
          <RichTextEditor.Content />
        </RichTextEditor>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Description</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
