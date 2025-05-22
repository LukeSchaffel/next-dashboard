import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
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
  BackgroundImage,
  SimpleGrid,
  Image,
  Anchor,
} from "@mantine/core";
import Link from "next/link";
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconPhoto,
  IconPhone,
  IconMail,
  IconWorld,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandLinkedin,
} from "@tabler/icons-react";

import { listImagesServer } from "@/lib/supabase-server";
import classes from "./_styles.module.css";
import { formatPhoneNumber } from "@/lib/formatters";

const getEvent = async (id: string) => {
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
};

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

  const images = await listImagesServer("event", event.workspaceId, event.id);
  const isUpcoming = dayjs(event.startsAt).isAfter(dayjs());
  const isPast = dayjs(event.endsAt).isBefore(dayjs());
  const isCurrent = !isUpcoming && !isPast;

  const headerImage = event.headerImgUrl || "";

  return (
    <Box>
      {/* Hero Section with Background */}
      <BackgroundImage src={headerImage} h={500}>
        <Box
          style={{
            background:
              "linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8))",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Container size="lg">
            <Grid gutter="xl" align="center">
              <GridCol span={{ base: 12, md: 7 }}>
                <Stack gap="lg">
                  <Badge
                    size="xl"
                    variant={isPast ? "light" : "filled"}
                    color={isPast ? "gray" : isCurrent ? "green" : "blue"}
                    w="fit-content"
                  >
                    {isPast
                      ? "Past Event"
                      : isCurrent
                      ? "Happening Now"
                      : "Upcoming"}
                  </Badge>
                  <Title order={1} size={rem(48)} c="white" lh={1.2}>
                    {event.name}
                  </Title>
                  <Stack gap="md">
                    <Group gap="xl">
                      <Group gap="xs">
                        <IconCalendar size={24} stroke={1.5} color="white" />
                        <Text size="lg" c="gray.3">
                          {dayjs(event.startsAt).format("dddd, MMMM D, YYYY")}
                        </Text>
                      </Group>
                      <Group gap="xs">
                        <IconClock size={24} stroke={1.5} color="white" />
                        <Text size="lg" c="gray.3">
                          {dayjs(event.startsAt).format("h:mm A")} -{" "}
                          {dayjs(event.endsAt).format("h:mm A")}
                        </Text>
                      </Group>
                    </Group>
                    {event.Location && (
                      <Group gap="xs">
                        <IconMapPin size={24} stroke={1.5} color="white" />
                        <Text size="lg" c="gray.3">
                          {event.Location.name}
                        </Text>
                      </Group>
                    )}
                  </Stack>
                </Stack>
              </GridCol>
              {isUpcoming && event.TicketTypes.length > 0 && (
                <GridCol span={{ base: 12, md: 5 }}>
                  <Paper p="md" radius="md" bg="rgba(255, 255, 255, 0.95)">
                    <Stack gap="xs">
                      {event.TicketTypes.map((ticketType) => (
                        <Paper
                          key={ticketType.id}
                          p="sm"
                          radius="sm"
                          withBorder
                        >
                          <Group justify="space-between" align="center">
                            <Stack gap={0}>
                              <Text fw={600}>{ticketType.name}</Text>
                              <Text size="lg" fw={700} c="blue">
                                ${(ticketType.price / 100).toFixed(2)}
                              </Text>
                            </Stack>
                            <Link href={`/purchase/${ticketType.id}`}>
                              <Button
                                size="sm"
                                radius="md"
                                disabled={ticketType.available === 0}
                                variant={
                                  ticketType.available === 0
                                    ? "light"
                                    : "filled"
                                }
                              >
                                {ticketType.available === 0
                                  ? "Sold Out"
                                  : "Buy"}
                              </Button>
                            </Link>
                          </Group>
                          {ticketType.available > 0 && (
                            <Text size="xs" c="dimmed" mt={4}>
                              {ticketType.available} available
                            </Text>
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  </Paper>
                </GridCol>
              )}
            </Grid>
          </Container>
        </Box>
      </BackgroundImage>

      <Container size="lg" py="xl">
        <Grid gutter="xl">
          {/* Main Content Column */}
          <GridCol span={{ base: 12, md: 8 }}>
            {/* Event Description */}
            {event.description && (
              <Paper p="xl" radius="md" mb="xl">
                <div dangerouslySetInnerHTML={{ __html: event.description }} />
              </Paper>
            )}

            {/* Event Images Section */}
            {images.length > 0 && (
              <Paper p="xl" radius="md" mb="xl">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  {images.map((image) => (
                    <Image
                      key={image.name}
                      src={image.url}
                      alt={image.name}
                      height={300}
                      fit="cover"
                      radius="md"
                    />
                  ))}
                </SimpleGrid>
              </Paper>
            )}
          </GridCol>

          {/* Sidebar Column */}
          <GridCol span={{ base: 12, md: 4 }}>
            {/* Location Details */}
            {event.Location && (
              <Paper p="xl" radius="md" mb="xl">
                <Stack gap="md">
                  <Group gap="xs">
                    <IconMapPin size={24} stroke={1.5} />
                    <Text size="lg" fw={500}>
                      Location
                    </Text>
                  </Group>
                  <Divider />
                  <Stack gap="md">
                    <Link
                      href={`/locations/${event.Location.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Text fw={600} size="lg" c="blue">
                        {event.Location.name}
                      </Text>
                    </Link>
                    {event.Location.address && (
                      <Text size="sm" c="dimmed">
                        {event.Location.address}
                      </Text>
                    )}

                    {/* Contact Information */}
                    {(event.Location.phoneNumber ||
                      event.Location.email ||
                      event.Location.website) && (
                      <Stack gap="xs">
                        {event.Location.phoneNumber && (
                          <Group gap="xs">
                            <IconPhone size={18} stroke={1.5} />
                            <Text size="sm">
                              {formatPhoneNumber(event.Location.phoneNumber)}
                            </Text>
                          </Group>
                        )}
                        {event.Location.email && (
                          <Group gap="xs">
                            <IconMail size={18} stroke={1.5} />
                            <Anchor
                              href={`mailto:${event.Location.email}`}
                              size="sm"
                            >
                              {event.Location.email}
                            </Anchor>
                          </Group>
                        )}
                        {event.Location.website && (
                          <Group gap="xs">
                            <IconWorld size={18} stroke={1.5} />
                            <Anchor
                              href={event.Location.website}
                              target="_blank"
                              size="sm"
                            >
                              {event.Location.website}
                            </Anchor>
                          </Group>
                        )}
                      </Stack>
                    )}

                    {/* Social Media Links */}
                    {(event.Location.facebookUrl ||
                      event.Location.instagramUrl ||
                      event.Location.twitterUrl ||
                      event.Location.linkedinUrl) && (
                      <Group gap="xs">
                        {event.Location.facebookUrl && (
                          <Anchor
                            href={event.Location.facebookUrl}
                            target="_blank"
                          >
                            <IconBrandFacebook size={20} stroke={1.5} />
                          </Anchor>
                        )}
                        {event.Location.instagramUrl && (
                          <Anchor
                            href={event.Location.instagramUrl}
                            target="_blank"
                          >
                            <IconBrandInstagram size={20} stroke={1.5} />
                          </Anchor>
                        )}
                        {event.Location.twitterUrl && (
                          <Anchor
                            href={event.Location.twitterUrl}
                            target="_blank"
                          >
                            <IconBrandTwitter size={20} stroke={1.5} />
                          </Anchor>
                        )}
                        {event.Location.linkedinUrl && (
                          <Anchor
                            href={event.Location.linkedinUrl}
                            target="_blank"
                          >
                            <IconBrandLinkedin size={20} stroke={1.5} />
                          </Anchor>
                        )}
                      </Group>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            )}

            {/* Past Event Message */}
            {isPast && (
              <Paper p="xl" radius="md" bg="gray.0">
                <Text ta="center" c="dimmed">
                  This event has ended. Check back for future events at this
                  location.
                </Text>
              </Paper>
            )}
          </GridCol>
        </Grid>
      </Container>
    </Box>
  );
}
