import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Event, TicketType, Location } from "@prisma/client";
import dayjs from "dayjs";
import {
  Stack,
  Title,
  Text,
  Paper,
  Group,
  Badge,
  Grid,
  Button,
  List,
  GridCol,
  ListItem,
  Container,
  Box,
  Divider,
  rem,
} from "@mantine/core";
import Link from "next/link";
import { IconCalendar, IconClock, IconMapPin } from "@tabler/icons-react";

interface EventWithDetails extends Event {
  Location: {
    name: string;
    id: string;
    address: string | null;
    description: string | null;
    phoneNumber: string | null;
    email: string | null;
    website: string | null;
    facebookUrl: string | null;
    instagramUrl: string | null;
    twitterUrl: string | null;
    linkedinUrl: string | null;
    workspaceId: string;
  } | null;
  TicketTypes: (TicketType & {
    allowedSections: {
      id: string;
      name: string;
    }[];
    Tickets: {
      id: string;
    }[];
    available: number;
    maxPerOrder: number;
  })[];
  eventLayout: {
    id: string;
    name: string;
    description: string | null;
    sections: {
      id: string;
      name: string;
      description: string | null;
      priceMultiplier: number;
      rows: {
        id: string;
        name: string;
        seats: {
          id: string;
          number: string;
          status: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "DISABLED";
        }[];
      }[];
    }[];
  } | null;
}

async function getEvent(id: string): Promise<EventWithDetails | null> {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      Location: true,
      TicketTypes: {
        include: {
          Tickets: true,
          allowedSections: true,
        },
        orderBy: {
          price: "asc",
        },
      },
      eventLayout: {
        include: {
          sections: {
            include: {
              rows: {
                include: {
                  seats: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!event) return null;

  // Calculate available tickets and max per order for each ticket type
  const ticketTypesWithAvailability = await Promise.all(
    event.TicketTypes.map(async (ticketType) => {
      // For section-specific ticket types, check available seats
      if (ticketType.allowedSections && ticketType.allowedSections.length > 0) {
        const availableSeats =
          event.eventLayout?.sections
            .filter((section) =>
              ticketType.allowedSections.some((as) => as.id === section.id)
            )
            .flatMap((section) =>
              section.rows.flatMap((row) =>
                row.seats.filter((seat) => seat.status === "AVAILABLE")
              )
            ).length || 0;

        return {
          ...ticketType,
          available: availableSeats,
          maxPerOrder: Math.min(10, availableSeats),
        };
      }

      // For general ticket types, check against quantity
      const soldTickets = ticketType.Tickets.length;
      const available = ticketType.quantity
        ? ticketType.quantity - soldTickets
        : Infinity;

      return {
        ...ticketType,
        available,
        maxPerOrder: ticketType.quantity
          ? Math.min(10, ticketType.quantity - soldTickets)
          : 10,
      };
    })
  );

  return {
    ...event,
    TicketTypes: ticketTypesWithAvailability,
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  const isUpcoming = dayjs(event.startsAt).isAfter(dayjs());
  const isPast = dayjs(event.endsAt).isBefore(dayjs());
  const isCurrent = !isUpcoming && !isPast;

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Hero Section */}
        <Paper p="xl" radius="md" withBorder>
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
              <Stack gap="xs">
                <Title order={1} size={rem(42)}>{event.name}</Title>
                <Group gap="xl">
                  <Group gap="xs">
                    <IconCalendar size={20} stroke={1.5} />
                    <Text size="lg">
                      {dayjs(event.startsAt).format("dddd, MMMM D, YYYY")}
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <IconClock size={20} stroke={1.5} />
                    <Text size="lg">
                      {dayjs(event.startsAt).format("h:mm A")} -{" "}
                      {dayjs(event.endsAt).format("h:mm A")}
                    </Text>
                  </Group>
                </Group>
              </Stack>
              <Badge 
                size="xl" 
                variant={isPast ? "light" : "filled"}
                color={isPast ? "gray" : isCurrent ? "green" : "blue"}
              >
                {isPast ? "Past Event" : isCurrent ? "Happening Now" : "Upcoming"}
              </Badge>
            </Group>

            {event.description && (
              <Box mt="md">
                <div dangerouslySetInnerHTML={{ __html: event.description }} />
              </Box>
            )}
          </Stack>
        </Paper>

        {event.Location && (
          <Paper p="xl" radius="md" withBorder>
            <Stack gap="md">
              <Group gap="xs">
                <IconMapPin size={24} stroke={1.5} />
                <Title order={2}>Location</Title>
              </Group>
              <Divider />
              <Stack gap="md">
                <Text size="xl" fw={500}>
                  {event.Location.name}
                </Text>
                {event.Location.address && (
                  <Text size="lg" c="dimmed">
                    {event.Location.address}
                  </Text>
                )}
                <Link href={`/locations/${event.Location.id}`}>
                  <Button variant="light" size="md" radius="md">
                    View Location Details
                  </Button>
                </Link>
              </Stack>
            </Stack>
          </Paper>
        )}

        {isUpcoming && event.TicketTypes.length > 0 && (
          <Paper p="xl" radius="md" withBorder>
            <Stack gap="xl">
              <Title order={2}>Purchase Tickets</Title>
              <Grid gutter="xl">
                {event.TicketTypes.map((ticketType) => (
                  <GridCol key={ticketType.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Paper p="xl" radius="md" withBorder h="100%">
                      <Stack gap="lg" justify="space-between" h="100%">
                        <Stack gap="md">
                          <Stack gap="xs">
                            <Title order={3}>{ticketType.name}</Title>
                            <Text size="xl" fw={700} c="blue">
                              ${(ticketType.price / 100).toFixed(2)}
                            </Text>
                            {ticketType.description && (
                              <Text size="sm" c="dimmed">
                                {ticketType.description}
                              </Text>
                            )}
                          </Stack>
                          <List size="sm" spacing="xs">
                            {ticketType.available > 0 ? (
                              <ListItem>
                                {ticketType.available} tickets remaining
                              </ListItem>
                            ) : (
                              <ListItem c="red">Sold Out</ListItem>
                            )}
                            {ticketType.maxPerOrder && (
                              <ListItem>
                                Maximum {ticketType.maxPerOrder} per order
                              </ListItem>
                            )}
                          </List>
                        </Stack>
                        <Link href={`/purchase/${ticketType.id}`}>
                          <Button 
                            fullWidth 
                            size="lg"
                            radius="md"
                            disabled={ticketType.available === 0}
                            variant={ticketType.available === 0 ? "light" : "filled"}
                          >
                            {ticketType.available === 0
                              ? "Sold Out"
                              : "Select Tickets"}
                          </Button>
                        </Link>
                      </Stack>
                    </Paper>
                  </GridCol>
                ))}
              </Grid>
            </Stack>
          </Paper>
        )}

        {isPast && (
          <Paper p="xl" radius="md" withBorder>
            <Text ta="center" size="lg" c="dimmed">
              This event has ended. Check back for future events at this location.
            </Text>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
