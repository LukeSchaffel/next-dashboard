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

export default function CreateEventLayoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { currentEvent, loading, fetchEvent } = useEventStore();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEvent(slug).catch(() => {
      notFound();
    });
  }, [slug, fetchEvent]);

  // Redirect to the layout page if the event already has a layout
  useEffect(() => {
    if (currentEvent?.eventLayout) {
      redirect(
        `/dashboard/events/${slug}/event-layout/${currentEvent.eventLayout.id}`
      );
    }
  }, [currentEvent, slug]);

  const handleSubmit = async (values: {
    name: string;
    description: string;
    sections: any[];
  }) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${slug}/seating-layout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("Failed to create event layout");
      }

      // Refresh the event data to get the new layout
      await fetchEvent(slug);
    } catch (error) {
      console.error("Failed to create event layout:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !currentEvent) {
    return <div>Loading...</div>;
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
          <Title order={2}>Create Event Layout</Title>
          <Text c="dimmed">Create a new seating layout for this event</Text>
        </Stack>
      </Paper>

      <SeatingLayoutEditor
        loading={loading}
        saving={saving}
        onSubmit={handleSubmit}
        submitLabel="Create Layout"
        title="Create Event Layout"
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
