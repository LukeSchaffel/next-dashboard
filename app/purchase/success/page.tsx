"use client";
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Button,
  Group,
} from "@mantine/core";
import Link from "next/link";
import { useEffect } from "react";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import { prisma } from "@/lib/prisma";

interface Ticket {
  id: string;
  name: string;
  email: string;
  price: number;
  status: string;
  Event: {
    name: string;
    description: string | null;
    startsAt: Date;
    endsAt: Date;
    Location: {
      name: string;
      address: string | null;
    } | null;
  };
}

async function getTicket(id: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      Event: {
        include: {
          Location: true,
        },
      },
    },
  });

  return ticket;
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ticketId?: string }>;
}) {
  const { ticketId } = await searchParams;

  if (!ticketId) {
    notFound();
  }

  const ticket = await getTicket(ticketId);

  if (!ticket) {
    notFound();
  }

  const handleDownload = async () => {
    if (!ticketId) return;

    try {
      const response = await fetch(`/api/tickets/${ticketId}/pdf`);
      if (!response.ok) {
        throw new Error("Failed to download ticket");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-${ticketId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download ticket:", error);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper p="xl" withBorder>
        <Stack gap="xl">
          <Stack gap="xs">
            <Title order={2}>Thank you for your purchase!</Title>
            <Text>
              Your ticket for {ticket.Event.name} has been confirmed. Here are
              the details:
            </Text>
          </Stack>

          <Stack gap="md">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Event
              </Text>
              <Text>{ticket.Event.name}</Text>
            </Group>

            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Date & Time
              </Text>
              <Text>
                {dayjs(ticket.Event.startsAt).format("MMM D, YYYY h:mm A")} -{" "}
                {dayjs(ticket.Event.endsAt).format("MMM D, YYYY h:mm A")}
              </Text>
            </Group>

            {ticket.Event.Location && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Location
                </Text>
                <Text>
                  {ticket.Event.Location.name}
                  {ticket.Event.Location.address && (
                    <> - {ticket.Event.Location.address}</>
                  )}
                </Text>
              </Group>
            )}

            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Ticket Holder
              </Text>
              <Text>
                {ticket.name} ({ticket.email})
              </Text>
            </Group>

            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Price
              </Text>
              <Text>${(ticket.price / 100).toFixed(2)}</Text>
            </Group>
          </Stack>

          <Group>
            {ticketId && (
              <Button onClick={handleDownload} variant="outline" size="lg">
                Download Ticket
              </Button>
            )}
            <Button component={Link} href="/" size="lg">
              Return to Home
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
