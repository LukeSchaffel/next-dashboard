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
  GridCol,
  Button,
  rem,
  Card,
  Image,
  ThemeIcon,
} from "@mantine/core";
import Link from "next/link";
import {
  IconMapPin,
  IconPhone,
  IconMail,
  IconWorld,
  IconCalendar,
  IconArrowRight,
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
        {/* Hero Section with Contact Info */}
        <Paper p="xl" radius="md" withBorder>
          <Stack gap="xl">
            <Box>
              <Title order={1} size={rem(42)} mb="md">
                {location.name}
              </Title>
              {location.address && (
                <Group gap="xs" c="dimmed">
                  <ThemeIcon size="lg" variant="light" radius="xl">
                    <IconMapPin size={18} />
                  </ThemeIcon>
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

            {(location.phoneNumber || location.email || location.website) && (
              <Box>
                <Divider mb="md" />
                <Grid gutter="xl">
                  {location.phoneNumber && (
                    <GridCol span={{ base: 12, sm: 4 }}>
                      <Group gap="md">
                        <ThemeIcon size="xl" radius="xl" variant="light">
                          <IconPhone size={20} />
                        </ThemeIcon>
                        <Stack gap={4}>
                          <Text size="sm" c="dimmed">Phone</Text>
                          <Text fw={500}>{location.phoneNumber}</Text>
                        </Stack>
                      </Group>
                    </GridCol>
                  )}
                  {location.email && (
                    <GridCol span={{ base: 12, sm: 4 }}>
                      <Group gap="md">
                        <ThemeIcon size="xl" radius="xl" variant="light">
                          <IconMail size={20} />
                        </ThemeIcon>
                        <Stack gap={4}>
                          <Text size="sm" c="dimmed">Email</Text>
                          <Anchor href={`mailto:${location.email}`} fw={500}>
                            {location.email}
                          </Anchor>
                        </Stack>
                      </Group>
                    </GridCol>
                  )}
                  {location.website && (
                    <GridCol span={{ base: 12, sm: 4 }}>
                      <Group gap="md">
                        <ThemeIcon size="xl" radius="xl" variant="light">
                          <IconWorld size={20} />
                        </ThemeIcon>
                        <Stack gap={4}>
                          <Text size="sm" c="dimmed">Website</Text>
                          <Anchor
                            href={location.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            fw={500}
                          >
                            {location.website}
                          </Anchor>
                        </Stack>
                      </Group>
                    </GridCol>
                  )}
                </Grid>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <Paper p="xl" radius="md" withBorder>
            <Stack gap="lg">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <ThemeIcon size="lg" radius="xl" variant="light">
                    <IconCalendar size={20} />
                  </ThemeIcon>
                  <Title order={2} size="h3">
                    Upcoming Events
                  </Title>
                </Group>
                <Badge size="lg" variant="light" color="blue">
                  {upcomingEvents.length} Events
                </Badge>
              </Group>
              <Stack gap="md">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} withBorder radius="md" p="md">
                    <Stack gap="md">
                      <Group justify="space-between" wrap="nowrap">
                        <Stack gap={4}>
                          <Title order={3} size="h4" lineClamp={1}>
                            {event.name}
                          </Title>
                          <Group gap="xs">
                            <ThemeIcon size="sm" radius="xl" variant="light">
                              <IconCalendar size={14} />
                            </ThemeIcon>
                            <Text size="sm" c="dimmed">
                              {dayjs(event.startsAt).format("MMM D, YYYY h:mm A")}
                            </Text>
                          </Group>
                        </Stack>
                        <Badge size="lg" variant="light" color="blue">
                          Upcoming
                        </Badge>
                      </Group>
                      {/* {event.description && (
                        <Box>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: event.description,
                            }}
                          />
                        </Box>
                      )} */}
                      <Group justify="flex-end">
                        <Link href={`/events/${event.id}`}>
                          <Button
                            variant="light"
                            rightSection={<IconArrowRight size={16} />}
                          >
                            View Event Details
                          </Button>
                        </Link>
                      </Group>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Paper>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <Paper p="xl" radius="md" withBorder>
            <Stack gap="lg">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <ThemeIcon size="lg" radius="xl" variant="light" color="gray">
                    <IconCalendar size={20} />
                  </ThemeIcon>
                  <Title order={2} size="h3">
                    Past Events
                  </Title>
                </Group>
                <Badge size="lg" variant="light" color="gray">
                  {pastEvents.length} Events
                </Badge>
              </Group>
              <Stack gap="md">
                {pastEvents.map((event) => (
                  <Card key={event.id} withBorder radius="md" p="md">
                    <Stack gap="md">
                      <Group justify="space-between" wrap="nowrap">
                        <Stack gap={4}>
                          <Title order={3} size="h4" lineClamp={1}>
                            {event.name}
                          </Title>
                          <Group gap="xs">
                            <ThemeIcon size="sm" radius="xl" variant="light" color="gray">
                              <IconCalendar size={14} />
                            </ThemeIcon>
                            <Text size="sm" c="dimmed">
                              {dayjs(event.startsAt).format("MMM D, YYYY h:mm A")}
                            </Text>
                          </Group>
                        </Stack>
                        <Badge size="lg" variant="light" color="gray">
                          Past Event
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
                      <Group justify="flex-end">
                        <Link href={`/events/${event.id}`}>
                          <Button
                            variant="light"
                            color="gray"
                            rightSection={<IconArrowRight size={16} />}
                          >
                            View Event Details
                          </Button>
                        </Link>
                      </Group>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
