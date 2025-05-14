import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Location, Event, EventSeries } from "@prisma/client";
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
  BackgroundImage,
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
import classes from "./_styles.module.css";

interface EventWithSeries extends Event {
  EventSeries: {
    id: string;
    name: string;
  } | null;
}

interface LocationWithEvents extends Location {
  Events: EventWithSeries[];
}

async function getLocation(id: string): Promise<LocationWithEvents | null> {
  const location = await prisma.location.findUnique({
    where: { id: id },
    include: {
      Events: {
        include: {
          EventSeries: {
            select: {
              name: true,
              id: true,
            },
          },
        },
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

  // Group events by series
  const eventsBySeries = events.reduce((acc, event) => {
    const seriesId = event.EventSeries?.id || "no-series";
    if (!acc[seriesId]) {
      acc[seriesId] = {
        series: event.EventSeries,
        events: [],
      };
    }
    acc[seriesId].events.push(event);
    return acc;
  }, {} as Record<string, { series: { id: string; name: string } | null; events: EventWithSeries[] }>);

  // Sort events within each series
  Object.values(eventsBySeries).forEach((group) => {
    group.events.sort((a, b) => {
      if (!a.startsAt || !b.startsAt) return 0;
      return dayjs(a.startsAt).diff(dayjs(b.startsAt));
    });
  });

  // Separate upcoming and past events
  const upcomingEventsBySeries = Object.entries(eventsBySeries).reduce(
    (acc, [seriesId, group]) => {
      const upcomingEvents = group.events.filter((event) =>
        dayjs(event.startsAt).isAfter(now)
      );
      if (upcomingEvents.length > 0) {
        acc[seriesId] = {
          series: group.series,
          events: upcomingEvents,
        };
      }
      return acc;
    },
    {} as Record<
      string,
      { series: { id: string; name: string } | null; events: EventWithSeries[] }
    >
  );

  const pastEventsBySeries = Object.entries(eventsBySeries).reduce(
    (acc, [seriesId, group]) => {
      const pastEvents = group.events.filter((event) =>
        dayjs(event.endsAt).isBefore(now)
      );
      if (pastEvents.length > 0) {
        acc[seriesId] = {
          series: group.series,
          events: pastEvents,
        };
      }
      return acc;
    },
    {} as Record<
      string,
      { series: { id: string; name: string } | null; events: EventWithSeries[] }
    >
  );

  return (
    <Box>
      {/* Hero Section with Background */}
      <BackgroundImage
        src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070"
        h={400}
      >
        <Box
          style={{
            background:
              "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Container size="lg">
            <Stack gap="md">
              <Title className={classes.title} c="white">
                {location.name}
              </Title>
              {location.address && (
                <Group gap="xs" c="gray.3">
                  <ThemeIcon size="lg" variant="light" radius="xl">
                    <IconMapPin size={18} />
                  </ThemeIcon>
                  <Text size="lg">{location.address}</Text>
                </Group>
              )}
            </Stack>
          </Container>
        </Box>
      </BackgroundImage>

      <Container size="lg" py="xl">
        <Stack gap="xl">
          {/* Contact Information */}
          {(location.phoneNumber || location.email || location.website) && (
            <Paper p="xl" radius="md" withBorder>
              <Stack gap="lg">
                <Title order={2} className={classes.sectionTitle}>
                  Contact Information
                </Title>
                <Grid gutter="xl">
                  {location.phoneNumber && (
                    <GridCol span={{ base: 12, sm: 4 }}>
                      <div className={classes.contactInfo}>
                        <ThemeIcon size="xl" radius="xl" variant="light">
                          <IconPhone size={20} />
                        </ThemeIcon>
                        <Stack gap={4}>
                          <Text size="sm" c="dimmed">
                            Phone
                          </Text>
                          <Text fw={500}>{location.phoneNumber}</Text>
                        </Stack>
                      </div>
                    </GridCol>
                  )}
                  {location.email && (
                    <GridCol span={{ base: 12, sm: 4 }}>
                      <div className={classes.contactInfo}>
                        <ThemeIcon size="xl" radius="xl" variant="light">
                          <IconMail size={20} />
                        </ThemeIcon>
                        <Stack gap={4}>
                          <Text size="sm" c="dimmed">
                            Email
                          </Text>
                          <Anchor href={`mailto:${location.email}`} fw={500}>
                            {location.email}
                          </Anchor>
                        </Stack>
                      </div>
                    </GridCol>
                  )}
                  {location.website && (
                    <GridCol span={{ base: 12, sm: 4 }}>
                      <div className={classes.contactInfo}>
                        <ThemeIcon size="xl" radius="xl" variant="light">
                          <IconWorld size={20} />
                        </ThemeIcon>
                        <Stack gap={4}>
                          <Text size="sm" c="dimmed">
                            Website
                          </Text>
                          <Anchor
                            href={location.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            fw={500}
                          >
                            {location.website}
                          </Anchor>
                        </Stack>
                      </div>
                    </GridCol>
                  )}
                </Grid>
              </Stack>
            </Paper>
          )}

          {/* Description */}
          {location.description && (
            <Paper p="xl" radius="md" withBorder>
              <Stack gap="lg">
                <Title order={2} className={classes.sectionTitle}>
                  About This Venue
                </Title>
                <div
                  className={classes.sectionContent}
                  dangerouslySetInnerHTML={{ __html: location.description }}
                />
              </Stack>
            </Paper>
          )}

          {/* Upcoming Events */}
          {Object.keys(upcomingEventsBySeries).length > 0 && (
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
                    {Object.values(upcomingEventsBySeries).reduce(
                      (acc, group) => acc + group.events.length,
                      0
                    )}{" "}
                    Events
                  </Badge>
                </Group>
                <Stack gap="xl">
                  {Object.entries(upcomingEventsBySeries).map(
                    ([seriesId, group]) => (
                      <Stack key={seriesId} gap="md">
                        {group.series && (
                          <Title
                            order={3}
                            size="h4"
                            className={classes.seriesTitle}
                          >
                            {group.series.name}
                          </Title>
                        )}
                        <Stack gap="md">
                          {group.events.map((event) => (
                            <Card
                              key={event.id}
                              withBorder
                              radius="md"
                              p={0}
                              className={classes.eventCard}
                            >
                              <Group wrap="nowrap" align="stretch">
                                <div className={classes.eventImage}>
                                  <Image
                                    src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070"
                                    height={160}
                                    width={240}
                                    alt={event.name}
                                    style={{ objectFit: "cover" }}
                                  />
                                </div>
                                <Stack gap="md" p="md" style={{ flex: 1 }}>
                                  <Group justify="space-between" wrap="nowrap">
                                    <Stack gap={4}>
                                      <Title order={3} size="h4" lineClamp={1}>
                                        {event.name}
                                      </Title>
                                      <Group gap="xs">
                                        <ThemeIcon
                                          size="sm"
                                          radius="xl"
                                          variant="light"
                                        >
                                          <IconCalendar size={14} />
                                        </ThemeIcon>
                                        <Text size="sm" c="dimmed">
                                          {dayjs(event.startsAt).format(
                                            "MMM D, YYYY h:mm A"
                                          )}
                                        </Text>
                                      </Group>
                                    </Stack>
                                    <Badge
                                      size="lg"
                                      variant="light"
                                      color="blue"
                                    >
                                      Upcoming
                                    </Badge>
                                  </Group>
                                  <Group justify="flex-end">
                                    <Link href={`/events/${event.id}`}>
                                      <Button
                                        variant="light"
                                        rightSection={
                                          <IconArrowRight size={16} />
                                        }
                                      >
                                        View Event Details
                                      </Button>
                                    </Link>
                                  </Group>
                                </Stack>
                              </Group>
                            </Card>
                          ))}
                        </Stack>
                      </Stack>
                    )
                  )}
                </Stack>
              </Stack>
            </Paper>
          )}

          {/* Past Events */}
          {Object.keys(pastEventsBySeries).length > 0 && (
            <Paper p="xl" radius="md" withBorder>
              <Stack gap="lg">
                <Group justify="space-between" align="center">
                  <Group gap="xs">
                    <ThemeIcon
                      size="lg"
                      radius="xl"
                      variant="light"
                      color="gray"
                    >
                      <IconCalendar size={20} />
                    </ThemeIcon>
                    <Title order={2} size="h3">
                      Past Events
                    </Title>
                  </Group>
                  <Badge size="lg" variant="light" color="gray">
                    {Object.values(pastEventsBySeries).reduce(
                      (acc, group) => acc + group.events.length,
                      0
                    )}{" "}
                    Events
                  </Badge>
                </Group>
                <Stack gap="xl">
                  {Object.entries(pastEventsBySeries).map(
                    ([seriesId, group]) => (
                      <Stack key={seriesId} gap="md">
                        {group.series && (
                          <Title
                            order={3}
                            size="h4"
                            className={classes.seriesTitle}
                          >
                            {group.series.name}
                          </Title>
                        )}
                        <Stack gap="md">
                          {group.events.map((event) => (
                            <Card
                              key={event.id}
                              withBorder
                              radius="md"
                              p={0}
                              className={classes.eventCard}
                            >
                              <Group wrap="nowrap" align="stretch">
                                <div className={classes.eventImage}>
                                  <Image
                                    src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070"
                                    height={160}
                                    width={240}
                                    alt={event.name}
                                    style={{ objectFit: "cover" }}
                                  />
                                </div>
                                <Stack gap="md" p="md" style={{ flex: 1 }}>
                                  <Group justify="space-between" wrap="nowrap">
                                    <Stack gap={4}>
                                      <Title order={3} size="h4" lineClamp={1}>
                                        {event.name}
                                      </Title>
                                      <Group gap="xs">
                                        <ThemeIcon
                                          size="sm"
                                          radius="xl"
                                          variant="light"
                                          color="gray"
                                        >
                                          <IconCalendar size={14} />
                                        </ThemeIcon>
                                        <Text size="sm" c="dimmed">
                                          {dayjs(event.startsAt).format(
                                            "MMM D, YYYY h:mm A"
                                          )}
                                        </Text>
                                      </Group>
                                    </Stack>
                                    <Badge
                                      size="lg"
                                      variant="light"
                                      color="gray"
                                    >
                                      Past Event
                                    </Badge>
                                  </Group>
                                  <Group justify="flex-end">
                                    <Link href={`/events/${event.id}`}>
                                      <Button
                                        variant="light"
                                        color="gray"
                                        rightSection={
                                          <IconArrowRight size={16} />
                                        }
                                      >
                                        View Event Details
                                      </Button>
                                    </Link>
                                  </Group>
                                </Stack>
                              </Group>
                            </Card>
                          ))}
                        </Stack>
                      </Stack>
                    )
                  )}
                </Stack>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
