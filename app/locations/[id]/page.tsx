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
  Container,
  Divider,
  Box,
} from "@mantine/core";
import Link from "next/link";
import {
  IconMapPin,
  IconPhone,
  IconMail,
  IconWorld,
} from "@tabler/icons-react";

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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const location = await getLocation(id);

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
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Paper p="xl" radius="md" withBorder>
          <Stack gap="lg">
            <Box>
              <Title order={1} mb="xs">
                {location.name}
              </Title>
              {location.address && (
                <Group gap="xs" c="dimmed">
                  <IconMapPin size={18} />
                  <Text size="lg">{location.address}</Text>
                </Group>
              )}
            </Box>

            {location.description && (
              <Box>
                <Divider mb="md" />
                <div
                  dangerouslySetInnerHTML={{ __html: location.description }}
                />
              </Box>
            )}
          </Stack>
        </Paper>

        <Paper p="xl" radius="md" withBorder>
          <Stack gap="lg">
            <Title order={2} size="h3">
              Contact Information
            </Title>
            <Grid gutter="xl">
              {location.phoneNumber && (
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Group gap="xs">
                    <IconPhone size={18} />
                    <Text fw={500}>Phone:</Text>
                    <Text>{location.phoneNumber}</Text>
                  </Group>
                </Grid.Col>
              )}
              {location.email && (
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Group gap="xs">
                    <IconMail size={18} />
                    <Text fw={500}>Email:</Text>
                    <Anchor href={`mailto:${location.email}`}>
                      {location.email}
                    </Anchor>
                  </Group>
                </Grid.Col>
              )}
              {location.website && (
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Group gap="xs">
                    <IconWorld size={18} />
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
          <Paper p="xl" radius="md" withBorder>
            <Stack gap="lg">
              <Title order={2} size="h3">
                Upcoming Events
              </Title>
              <Stack gap="md">
                {upcomingEvents.map((event) => (
                  <Paper key={event.id} p="md" radius="sm" withBorder>
                    <Stack gap="sm">
                      <Group justify="space-between" wrap="nowrap">
                        <Title order={3} size="h4" lineClamp={1}>
                          {event.name}
                        </Title>
                        <Badge size="lg" variant="light">
                          {dayjs(event.startsAt).format("MMM D, YYYY h:mm A")}
                        </Badge>
                      </Group>
                      {event.description && (
                        <Box>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: event.description,
                            }}
                          />
                        </Box>
                      )}
                      <Group>
                        <Link href={`/events/${event.id}`}>
                          <Anchor fw={500}>View Event Details →</Anchor>
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
          <Paper p="xl" radius="md" withBorder>
            <Stack gap="lg">
              <Title order={2} size="h3">
                Past Events
              </Title>
              <Stack gap="md">
                {pastEvents.map((event) => (
                  <Paper key={event.id} p="md" radius="sm" withBorder>
                    <Stack gap="sm">
                      <Group justify="space-between" wrap="nowrap">
                        <Title order={3} size="h4" lineClamp={1}>
                          {event.name}
                        </Title>
                        <Badge size="lg" variant="light" color="gray">
                          {dayjs(event.startsAt).format("MMM D, YYYY h:mm A")}
                        </Badge>
                      </Group>
                      {event.description && (
                        <Box>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: event.description,
                            }}
                          />
                        </Box>
                      )}
                      <Group>
                        <Link href={`/events/${event.id}`}>
                          <Anchor fw={500}>View Event Details →</Anchor>
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
    </Container>
  );
}
