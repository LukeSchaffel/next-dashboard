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
} from "@mantine/core";
import { Location, Event } from "@prisma/client";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { IconEye, IconEdit, IconTable, IconCopy } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import DescriptionEditor from "../_components/DescriptionEditor";

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
  const [descriptionLoading, setDescriptionLoading] = useState(false);

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
              <Button
                variant="light"
                leftSection={<IconEdit size={16} />}
                onClick={openDescriptionModal}
              >
                Edit Description
              </Button>
              <Link
                href={`/dashboard/locations/create-or-edit?locationId=${location.id}&from=details`}
              >
                <Button variant="light">Edit</Button>
              </Link>
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
          </Group>
          {location.address && (
            <Text size="lg" c="dimmed">
              {location.address}
            </Text>
          )}
          {location.description && (
            <div dangerouslySetInnerHTML={{ __html: location.description }} />
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
                <Anchor
                  href={location.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {location.website}
                </Anchor>
              </Group>
            )}

            {(location.facebookUrl ||
              location.instagramUrl ||
              location.twitterUrl ||
              location.linkedinUrl) && (
              <>
                <Title order={3}>Social Media</Title>
                {location.facebookUrl && (
                  <Group>
                    <Text fw={500}>Facebook:</Text>
                    <Anchor
                      href={location.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {location.facebookUrl}
                    </Anchor>
                  </Group>
                )}
                {location.instagramUrl && (
                  <Group>
                    <Text fw={500}>Instagram:</Text>
                    <Anchor
                      href={location.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {location.instagramUrl}
                    </Anchor>
                  </Group>
                )}
                {location.twitterUrl && (
                  <Group>
                    <Text fw={500}>Twitter:</Text>
                    <Anchor
                      href={location.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {location.twitterUrl}
                    </Anchor>
                  </Group>
                )}
                {location.linkedinUrl && (
                  <Group>
                    <Text fw={500}>LinkedIn:</Text>
                    <Anchor
                      href={location.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {location.linkedinUrl}
                    </Anchor>
                  </Group>
                )}
              </>
            )}
          </Stack>

          <Badge size="lg" variant="light">
            {events.length} {events.length === 1 ? "Event" : "Events"}
          </Badge>
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

      <DescriptionEditor
        opened={descriptionModalOpened}
        onClose={closeDescriptionModal}
        description={location?.description || ""}
        locationId={location?.id || ""}
        onUpdate={setLocation}
      />
    </Stack>
  );
}
