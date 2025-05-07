import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Badge,
  Grid,
  GridCol,
  Flex,
  Box,
  BackgroundImage,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import PurchaseForm from "../_components/PurchaseForm";
import TicketPurchaseContainer from "../_components/TicketPurchaseContainer";
import { prisma } from "@/lib/prisma";
import { IconCalendar, IconMapPin } from "@tabler/icons-react";
import classes from "./_styles.module.css";

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number | null;
  Event: {
    id: string;
    name: string;
    description: string | null;
    startsAt: Date;
    endsAt: Date;
    Location: {
      name: string;
      address: string | null;
    } | null;
    eventLayout: {
      sections: {
        id: string;
      }[];
    } | null;
  };
  Tickets: {
    id: string;
  }[];
  allowedSections: {
    id: string;
  }[];
}

async function getTicketType(id: string) {
  const ticketType = await prisma.ticketType.findUnique({
    where: { id },
    include: {
      Event: {
        include: {
          Location: true,
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
      },
      Tickets: {
        select: {
          id: true,
          seatId: true,
        },
      },
      allowedSections: true,
    },
  });

  return ticketType;
}

export default async function PurchasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticketType = await getTicketType(id);

  if (!ticketType) {
    notFound();
  }

  // Check if ticket type is sold out
  const isSoldOut =
    ticketType.quantity !== null &&
    ticketType.Tickets.length >= ticketType.quantity;

  const hasLayout = ticketType.Event.eventLayout !== null;
  const allowedSections = ticketType.allowedSections;

  return (
    <Box>
      {/* Hero Section with Background */}
      <BackgroundImage
        src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070"
        h={300}
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
                {ticketType.Event.name}
              </Title>
              <Group gap="xs" c="gray.3">
                <ThemeIcon size="lg" variant="light" radius="xl">
                  <IconCalendar size={18} />
                </ThemeIcon>
                <Text size="lg">
                  {dayjs(ticketType.Event.startsAt).format(
                    "MMM D, YYYY h:mm A"
                  )}{" "}
                  -{" "}
                  {dayjs(ticketType.Event.endsAt).format("MMM D, YYYY h:mm A")}
                </Text>
              </Group>
              {ticketType.Event.Location && (
                <Group gap="xs" c="gray.3">
                  <ThemeIcon size="lg" variant="light" radius="xl">
                    <IconMapPin size={18} />
                  </ThemeIcon>
                  <Text size="lg">
                    {ticketType.Event.Location.name}
                    {ticketType.Event.Location.address && (
                      <> - {ticketType.Event.Location.address}</>
                    )}
                  </Text>
                </Group>
              )}
            </Stack>
          </Container>
        </Box>
      </BackgroundImage>

      <Container size="lg" py="xl">
        <Stack gap="xl">
          {/* Event Information */}
          {ticketType.Event.description && (
            <Paper p="xl" radius="md" withBorder>
              <Stack gap="lg">
                <Title order={2} className={classes.sectionTitle}>
                  About This Event
                </Title>
                <div
                  className={classes.sectionContent}
                  dangerouslySetInnerHTML={{
                    __html: ticketType.Event.description,
                  }}
                />
              </Stack>
            </Paper>
          )}

          {/* Ticket Purchase Section */}
          <Paper p="xl" radius="md" withBorder>
            <Stack gap="lg">
              <Title order={2} className={classes.sectionTitle}>
                Purchase Tickets
              </Title>
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <Stack gap="xs">
                    <Text size="lg" fw={500}>
                      {ticketType.name}
                    </Text>
                    {ticketType.description && (
                      <Text c="dimmed">{ticketType.description}</Text>
                    )}
                  </Stack>
                  <Stack align="flex-end" gap="xs">
                    <Title order={3}>
                      ${(ticketType.price / 100).toFixed(2)}
                    </Title>
                    {ticketType.quantity && (
                      <Text size="sm" c="dimmed">
                        {ticketType.Tickets.length} / {ticketType.quantity}{" "}
                        tickets sold
                      </Text>
                    )}
                  </Stack>
                </Group>

                {isSoldOut ? (
                  <Badge color="red" size="xl">
                    Sold Out
                  </Badge>
                ) : hasLayout && ticketType.Event.eventLayout ? (
                  <TicketPurchaseContainer
                    sections={ticketType.Event.eventLayout.sections
                      .filter((section) =>
                        allowedSections.some(
                          (allowed) => allowed.id === section.id
                        )
                      )
                      .map((section) => ({
                        ...section,
                        description: section.description || "",
                      }))}
                    basePrice={ticketType.price}
                    ticketTypeId={ticketType.id}
                  />
                ) : (
                  <PurchaseForm
                    price={ticketType.price}
                    ticketTypeId={ticketType.id}
                    selectedSeatIds={[]}
                    quantity={1}
                  />
                )}
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
