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
  };
  Tickets: {
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
        },
      },
      Tickets: {
        select: {
          id: true,
        },
      },
    },
  });

  return ticketType;
}

export default async function PurchasePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const ticketType = await getTicketType(id);

  if (!ticketType) {
    notFound();
  }

  // Check if ticket type is sold out
  const isSoldOut =
    ticketType.quantity !== null &&
    ticketType.Tickets.length >= ticketType.quantity;

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
            ) : (
              <PurchaseForm
                price={ticketType.price}
                ticketTypeId={ticketType.id}
              />
            )}
          </Stack>
        </Paper>
      </Group>
    </Flex>
  );
}
