"use client";

import { useEffect, use, useState } from "react";
import { notFound, redirect } from "next/navigation";
import {
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Button,
  LoadingOverlay,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import SeatingLayoutEditor from "@/lib/components/seating-layout/SeatingLayoutEditor";
import { useEventStore } from "@/stores/useEventStore";

export default function EditEventLayoutPage({
  params,
}: {
  params: Promise<{ slug: string; layoutId: string }>;
}) {
  const { slug, layoutId } = use(params);
  const { currentEvent, loading, fetchEvent, currentEventLayout } =
    useEventStore();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEvent(slug).catch(() => {
      notFound();
    });
  }, [slug, fetchEvent]);

  // Redirect to create page if the event doesn't have a layout
  useEffect(() => {
    if (currentEvent && !currentEvent.eventLayout) {
      redirect(`/dashboard/events/${slug}/event-layout`);
    }
  }, [currentEvent, slug]);

  const handleSubmit = async (values: {
    name: string;
    description: string;
    sections: any[];
  }) => {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/events/${slug}/seating-layout/${layoutId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update event layout");
      }

      // Refresh the event data to get the updated layout
      await fetchEvent(slug);
    } catch (error) {
      console.error("Failed to update event layout:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !currentEvent) {
    return <div>Loading...</div>;
  }

  if (!currentEvent.eventLayout) {
    return notFound();
  }

  return (
    <Stack gap="xl">
      <Paper p="xl" withBorder>
        <Stack gap="md">
          <Group>
            <Link href={`/dashboard/events/${currentEvent.id}`}>
              <Button
                variant="subtle"
                leftSection={<IconArrowLeft size={16} />}
              >
                Back to Event
              </Button>
            </Link>
          </Group>
          <Title order={2}>Edit Event Layout</Title>
          <Text c="dimmed">Modify the seating layout for this event</Text>
        </Stack>
      </Paper>

      <SeatingLayoutEditor
        initialLayout={currentEventLayout ?? undefined}
        loading={loading}
        saving={saving}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        title="Edit Event Layout"
        backButton={
          <Link href={`/dashboard/events/${currentEvent.id}`}>
            <Button variant="subtle" leftSection={<IconArrowLeft size={16} />}>
              Back to Event
            </Button>
          </Link>
        }
      />
    </Stack>
  );
}
