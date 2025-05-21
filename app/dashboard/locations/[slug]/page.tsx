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
  Button,
  LoadingOverlay,
  Anchor,
  Tooltip,
  Tabs,
} from "@mantine/core";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import {
  IconEye,
  IconEdit,
  IconTable,
  IconCopy,
  IconFileDescription,
  IconCalendarEvent,
  IconBuilding,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

import DescriptionEditor from "../_components/DescriptionEditor";
import { Location, Event } from "@prisma/client";

interface LocationWithEvents extends Location {
  Events: Event[];
  templateLayout?: {
    id: string;
    name: string;
    description?: string;
  };
}

export default function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [location, setLocation] = useState<LocationWithEvents | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [
    descriptionModalOpened,
    { open: openDescriptionModal, close: closeDescriptionModal },
  ] = useDisclosure(false);

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

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/locations/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        <Link href={`/dashboard/events/${event.id}`}>
          <Button variant="subtle" leftSection={<IconEye size={16} />}>
            View
          </Button>
        </Link>
      </Group>
    </Paper>
  );

  return (
    <Tabs defaultValue="overview">
      <Tabs.List mb={16}>
        <Tabs.Tab value="overview" leftSection={<IconBuilding size={16} />}>
          Overview
        </Tabs.Tab>
        <Tabs.Tab
          value="description"
          leftSection={<IconFileDescription size={16} />}
        >
          Description
        </Tabs.Tab>
        <Tabs.Tab value="template-layout" leftSection={<IconTable size={16} />}>
          Template Layout
        </Tabs.Tab>
        <Tabs.Tab value="events" leftSection={<IconCalendarEvent size={16} />}>
          Events
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="overview">
        <Stack gap="xl">
          <Paper p="xl" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={2}>{location.name}</Title>
                <Group>
                  <Tooltip label={copied ? "URL Copied!" : "Copy Public URL"}>
                    <Button
                      variant="light"
                      leftSection={<IconCopy size={16} />}
                      onClick={handleCopyUrl}
                    >
                      Copy Public URL
                    </Button>
                  </Tooltip>
                  <Link
                    href={`/dashboard/locations/create-or-edit?locationId=${location.id}&from=details`}
                  >
                    <Button variant="light">Edit</Button>
                  </Link>
                </Group>
              </Group>
              {location.address && (
                <Text size="lg" c="dimmed">
                  {location.address}
                </Text>
              )}

              <Stack gap="md" mt="md">
                <Title order={3}>Contact Information</Title>
                {location.phoneNumber && (
                  <Group>
                    <Text fw={500}>Phone:</Text>
                    <Text>{location.phoneNumber}</Text>
                  </Group>
                )}
                {location.email && (
                  <Group>
                    <Text fw={500}>Email:</Text>
                    <Anchor href={`mailto:${location.email}`}>
                      {location.email}
                    </Anchor>
                  </Group>
                )}
                {location.website && (
                  <Group>
                    <Text fw={500}>Website:</Text>
                    <Anchor href={location.website} target="_blank">
                      {location.website}
                    </Anchor>
                  </Group>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="description">
        <Paper p="xl" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Description</Title>
              <Button
                variant="light"
                leftSection={<IconEdit size={16} />}
                onClick={openDescriptionModal}
              >
                Edit Description
              </Button>
            </Group>
            {location.description ? (
              <div dangerouslySetInnerHTML={{ __html: location.description }} />
            ) : (
              <Text c="dimmed">No description available</Text>
            )}
          </Stack>
        </Paper>
      </Tabs.Panel>

      <Tabs.Panel value="template-layout">
        <Paper p="xl" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Template Layout</Title>
              {location.templateLayout ? (
                <Link
                  href={`/dashboard/locations/${location.id}/template-layout/${location.templateLayout.id}`}
                >
                  <Button variant="light" leftSection={<IconTable size={16} />}>
                    View Template Layout
                  </Button>
                </Link>
              ) : (
                <Link
                  href={`/dashboard/locations/${location.id}/template-layout`}
                >
                  <Button variant="light" leftSection={<IconTable size={16} />}>
                    Create Template Layout
                  </Button>
                </Link>
              )}
            </Group>
            {location.templateLayout ? (
              <Stack gap="md">
                <Text fw={500}>{location.templateLayout.name}</Text>
                {location.templateLayout.description && (
                  <Text>{location.templateLayout.description}</Text>
                )}
              </Stack>
            ) : (
              <Text c="dimmed">No template layout has been created yet</Text>
            )}
          </Stack>
        </Paper>
      </Tabs.Panel>

      <Tabs.Panel value="events">
        <Stack gap="xl">
          {currentEvents.length > 0 && (
            <Stack gap="md">
              <Title order={3}>Current Events</Title>
              {currentEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </Stack>
          )}

          {upcomingEvents.length > 0 && (
            <Stack gap="md">
              <Title order={3}>Upcoming Events</Title>
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </Stack>
          )}

          {pastEvents.length > 0 && (
            <Stack gap="md">
              <Title order={3}>Past Events</Title>
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </Stack>
          )}

          {events.length === 0 && (
            <Paper p="xl" withBorder>
              <Text c="dimmed">
                No events have been scheduled at this location
              </Text>
            </Paper>
          )}
        </Stack>
      </Tabs.Panel>

      <DescriptionEditor
        opened={descriptionModalOpened}
        onClose={closeDescriptionModal}
        locationId={location.id}
        description={location.description || ""}
        onUpdate={(updatedLocation) => {
          setLocation((prev) =>
            prev ? { ...prev, ...updatedLocation } : null
          );
        }}
      />
    </Tabs>
  );
}
