'use client'

import { Paper, Stack, Group, Title, Button, Text } from "@mantine/core";
import { EventWithDetails } from "@/stores/useEventStore";
import { useState } from "react";
import { useEventStore } from "@/stores/useEventStore";
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface EventDescriptionProps {
  event: EventWithDetails;
}

export default function EventDescription({ event }: EventDescriptionProps) {
  const { updateEvent } = useEventStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: event.description || "",
  });

  const handleSave = async () => {
    if (!editor) return;

    setIsSaving(true);
    try {
      await updateEvent(event.id, { description: editor.getHTML() });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update description:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Paper p="xl" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Event Description</Title>
          {!isEditing ? (
            <Button variant="light" onClick={() => setIsEditing(true)}>
              Edit Description
            </Button>
          ) : (
            <Group>
              <Button variant="subtle" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="filled" onClick={handleSave} loading={isSaving}>
                Save Changes
              </Button>
            </Group>
          )}
        </Group>

        {isEditing ? (
          <RichTextEditor editor={editor}>
            <RichTextEditor.Toolbar sticky stickyOffset={60}>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
                <RichTextEditor.ClearFormatting />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.H1 />
                <RichTextEditor.H2 />
                <RichTextEditor.H3 />
                <RichTextEditor.H4 />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>
            <RichTextEditor.Content />
          </RichTextEditor>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: event.description || "" }} />
        )}
      </Stack>
    </Paper>
  );
}
