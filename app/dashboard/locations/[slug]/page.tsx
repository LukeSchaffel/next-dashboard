"use client";
import {
  Flex,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Badge,
  Divider,
} from "@mantine/core";
import { Location, Event } from "@prisma/client";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { use } from "react";

interface LocationWithEvents extends Location {
  Events: Event[];
}

export default function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [location, setLocation] = useState<LocationWithEvents | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch(`/api/locations/${slug}`);
        if (!res.ok) {
          notFound();
        }
        const data = await res.json();
        setLocation(data);
      } catch (error) {
        console.error("Failed to fetch location:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!location) {
    return notFound();
  }

  const now = dayjs();
  const events = location.Events || [];

  const upcomingEvents = events
    .filter((event) => dayjs(event.startsAt).isAfter(now))
    .sort((a, b) => dayjs(a.startsAt).diff(dayjs(b.startsAt)));

  const currentEvents = events.filter(
    (event) =>
      dayjs(event.startsAt).isBefore(now) && dayjs(event.endsAt).isAfter(now)
  );

  const pastEvents = events
    .filter((event) => dayjs(event.endsAt).isBefore(now))
    .sort((a, b) => dayjs(b.endsAt).diff(dayjs(a.endsAt)));

  const EventCard = ({ event }: { event: Event }) => (
    <Paper p="md" withBorder>
      <Group justify="space-between">
        <Stack gap={0}>
          <Text fw={500}>{event.name}</Text>
          <Text size="sm" c="dimmed">
            {dayjs(event.startsAt).format("MMM D, YYYY h:mm A")} -{" "}
            {dayjs(event.endsAt).format("MMM D, YYYY h:mm A")}
          </Text>
          {event.description && (
            <Text size="sm" mt="xs">
              {event.description}
            </Text>
          )}
        </Stack>
      </Group>
    </Paper>
  );

  return (
    <Stack gap="xl">
      <Paper p="xl" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={2}>{location.name}</Title>
            <Badge size="lg" variant="light">
              {events.length} {events.length === 1 ? "Event" : "Events"}
            </Badge>
          </Group>
          {location.address && (
            <Text size="lg" c="dimmed">
              {location.address}
            </Text>
          )}
        </Stack>
      </Paper>

      {currentEvents.length > 0 && (
        <Stack gap="md">
          <Title order={3}>Currently Happening</Title>
          <Stack gap="sm">
            {currentEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </Stack>
        </Stack>
      )}

      {upcomingEvents.length > 0 && (
        <Stack gap="md">
          <Title order={3}>Upcoming Events</Title>
          <Stack gap="sm">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </Stack>
        </Stack>
      )}

      {pastEvents.length > 0 && (
        <Stack gap="md">
          <Title order={3}>Past Events</Title>
          <Stack gap="sm">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </Stack>
        </Stack>
      )}

      {events.length === 0 && (
        <Paper p="xl" withBorder>
          <Text ta="center" c="dimmed">
            No events have been scheduled at this location yet.
          </Text>
        </Paper>
      )}
    </Stack>
  );
}
