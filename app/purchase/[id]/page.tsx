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
} from "@mantine/core";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import PurchaseForm from "../_components/PurchaseForm";
import TicketPurchaseContainer from "../_components/TicketPurchaseContainer";
import { prisma } from "@/lib/prisma";

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
    <Flex h={"100vh"} w={"100vw"} p={"xl"}>
      <Group align="middle" flex={1}>
        <Paper p="xl" withBorder flex={1}>
          <Stack gap="md">
            <Title order={2}>{ticketType.Event.name}</Title>
            {ticketType.Event.description && (
              <div
                dangerouslySetInnerHTML={{
                  __html: ticketType.Event.description,
                }}
              />
            )}
            <Text size="lg">
              {dayjs(ticketType.Event.startsAt).format("MMM D, YYYY h:mm A")} -{" "}
              {dayjs(ticketType.Event.endsAt).format("MMM D, YYYY h:mm A")}
            </Text>
            {ticketType.Event.Location && (
              <Text size="lg" c="dimmed">
                {ticketType.Event.Location.name}
                {ticketType.Event.Location.address && (
                  <> - {ticketType.Event.Location.address}</>
                )}
              </Text>
            )}
          </Stack>
        </Paper>

        <Paper p="xl" withBorder flex={1}>
          <Stack gap="md">
            <Title order={3}>Ticket Details</Title>
            <Text size="lg" fw={500}>
              {ticketType.name}
            </Text>
            {ticketType.description && (
              <Text c="dimmed">{ticketType.description}</Text>
            )}
            <Title order={3}>${(ticketType.price / 100).toFixed(2)}</Title>
            {ticketType.quantity && (
              <Text size="sm" c="dimmed">
                {ticketType.Tickets.length} / {ticketType.quantity} tickets sold
              </Text>
            )}
            {isSoldOut ? (
              <Badge color="red" size="xl">
                Sold Out
              </Badge>
            ) : hasLayout && ticketType.Event.eventLayout ? (
              <TicketPurchaseContainer
                sections={ticketType.Event.eventLayout.sections
                  .filter((section) =>
                    allowedSections.some((allowed) => allowed.id === section.id)
                  )
                  .map(section => ({
                    ...section,
                    description: section.description || ""
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
        </Paper>
      </Group>
    </Flex>
  );
}
