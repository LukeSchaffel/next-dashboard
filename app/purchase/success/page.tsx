"use client";
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Button,
  Group,
  Loader,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { use, useEffect, useState } from "react";

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

export default function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ticketId?: string }>;
}) {
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const { ticketId } = use(searchParams);

  useEffect(() => {
    if (!ticketId) {
      router.push("/404");
      return;
    }

    const fetchTicket = async () => {
      try {
        const response = await fetch(`/api/tickets/${ticketId}`);
        console.log(response);
        if (!response.ok) {
          throw new Error("Failed to fetch ticket");
        }
        const data = await response.json();
        setTicket(data);
      } catch (error) {
        console.error("Error fetching ticket:", error);
        router.push("/404");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId, router]);

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

  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Paper p="xl" withBorder>
          <Stack align="center" gap="xl">
            <Loader size="xl" />
            <Text>Loading your ticket information...</Text>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (!ticket) {
    return null;
  }

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
