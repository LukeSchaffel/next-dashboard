import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Location, Event } from "@prisma/client";
import dayjs from "dayjs";
import {
  Stack,
  Title,
  Text,
  Paper,
  Group,
  Badge,
  Grid,
  Anchor,
} from "@mantine/core";
import Link from "next/link";

interface LocationWithEvents extends Location {
  Events: Event[];
}

async function getLocation(id: string): Promise<LocationWithEvents | null> {
  const location = await prisma.location.findUnique({
    where: { id: id },
    include: {
      Events: {
        orderBy: {
          startsAt: "asc",
        },
      },
    },
  });

  return location;
}

export default async function LocationPage({
  params,
}: {
  params: { id: string };
}) {
  const location = await getLocation(params.id);

  if (!location) {
    notFound();
  }

  const now = dayjs();
  const events = location.Events || [];

  const upcomingEvents = events
    .filter((event) => dayjs(event.startsAt).isAfter(now))
    .sort((a, b) => dayjs(a.startsAt).diff(dayjs(b.startsAt)));

  const pastEvents = events
    .filter((event) => dayjs(event.endsAt).isBefore(now))
    .sort((a, b) => dayjs(b.endsAt).diff(dayjs(a.endsAt)));

  return (
    <Stack gap="xl" p="md">
      <Stack gap="md">
        <Title order={1}>{location.name}</Title>
        {location.address && (
          <Text size="lg" c="dimmed">
            {location.address}
          </Text>
        )}
        {location.description && (
          <div dangerouslySetInnerHTML={{ __html: location.description }} />
        )}
      </Stack>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Title order={2}>Contact Information</Title>
          <Grid>
            {location.phoneNumber && (
              <Grid.Col span={6}>
                <Group>
                  <Text fw={500}>Phone:</Text>
                  <Text>{location.phoneNumber}</Text>
                </Group>
              </Grid.Col>
            )}
            {location.email && (
              <Grid.Col span={6}>
                <Group>
                  <Text fw={500}>Email:</Text>
                  <Anchor href={`mailto:${location.email}`}>
                    {location.email}
                  </Anchor>
                </Group>
              </Grid.Col>
            )}
            {location.website && (
              <Grid.Col span={6}>
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
              </Grid.Col>
            )}
          </Grid>
        </Stack>
      </Paper>

      {upcomingEvents.length > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Title order={2}>Upcoming Events</Title>
            <Stack gap="sm">
              {upcomingEvents.map((event) => (
                <Paper key={event.id} p="sm" withBorder>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Title order={3}>{event.name}</Title>
                      <Badge>
                        {dayjs(event.startsAt).format("MMM D, YYYY h:mm A")}
                      </Badge>
                    </Group>
                    {event.description && (
                      <div
                        dangerouslySetInnerHTML={{ __html: event.description }}
                      />
                    )}
                    <Group>
                      <Link href={`/events/${event.id}`}>
                        <Anchor>View Event Details</Anchor>
                      </Link>
                    </Group>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Paper>
      )}

      {pastEvents.length > 0 && (
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Title order={2}>Past Events</Title>
            <Stack gap="sm">
              {pastEvents.map((event) => (
                <Paper key={event.id} p="sm" withBorder>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Title order={3}>{event.name}</Title>
                      <Badge>
                        {dayjs(event.startsAt).format("MMM D, YYYY h:mm A")}
                      </Badge>
                    </Group>
                    {event.description && (
                      <div
                        dangerouslySetInnerHTML={{ __html: event.description }}
                      />
                    )}
                    <Group>
                      <Link href={`/events/${event.id}`}>
                        <Anchor>View Event Details</Anchor>
                      </Link>
                    </Group>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
