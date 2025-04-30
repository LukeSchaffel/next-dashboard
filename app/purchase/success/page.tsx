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
  Divider,
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
  seat?: {
    number: string;
    Row: {
      name: string;
    };
  };
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

interface Purchase {
  id: string;
  totalAmount: number;
  status: string;
  customerEmail: string;
  customerName: string | null;
  tickets: Ticket[];
}

export default function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ purchaseId?: string }>;
}) {
  const router = useRouter();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const { purchaseId } = use(searchParams);

  useEffect(() => {
    if (!purchaseId) {
      router.push("/404");
      return;
    }

    const fetchPurchase = async () => {
      try {
        const response = await fetch(`/api/purchases/${purchaseId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch purchase");
        }
        const data = await response.json();
        setPurchase(data);
      } catch (error) {
        console.error("Error fetching purchase:", error);
        router.push("/404");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchase();
  }, [purchaseId, router]);

  const handleDownload = async () => {
    if (!purchaseId) return;

    try {
      const response = await fetch(`/api/purchases/${purchaseId}/pdf`);
      if (!response.ok) {
        throw new Error("Failed to download tickets");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tickets-${purchaseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download tickets:", error);
    }
  };

  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Paper p="xl" withBorder>
          <Stack align="center" gap="xl">
            <Loader size="xl" />
            <Text>Loading your purchase information...</Text>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (!purchase) {
    return null;
  }

  return (
    <Container size="sm" py="xl">
      <Paper p="xl" withBorder>
        <Stack gap="xl">
          <Stack gap="xs">
            <Title order={2}>Thank you for your purchase!</Title>
            <Text>
              Your tickets for {purchase.tickets[0].Event.name} have been
              confirmed. Here are the details:
            </Text>
          </Stack>

          <Stack gap="md">
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Event
              </Text>
              <Text>{purchase.tickets[0].Event.name}</Text>
            </Group>

            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Date & Time
              </Text>
              <Text>
                {dayjs(purchase.tickets[0].Event.startsAt).format(
                  "MMM D, YYYY h:mm A"
                )}{" "}
                -{" "}
                {dayjs(purchase.tickets[0].Event.endsAt).format(
                  "MMM D, YYYY h:mm A"
                )}
              </Text>
            </Group>

            {purchase.tickets[0].Event.Location && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Location
                </Text>
                <Text>
                  {purchase.tickets[0].Event.Location.name}
                  {purchase.tickets[0].Event.Location.address && (
                    <> - {purchase.tickets[0].Event.Location.address}</>
                  )}
                </Text>
              </Group>
            )}

            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Customer
              </Text>
              <Text>
                {purchase.customerName} ({purchase.customerEmail})
              </Text>
            </Group>

            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Total Amount
              </Text>
              <Text>${(purchase.totalAmount / 100).toFixed(2)}</Text>
            </Group>

            <Divider />

            <Title order={3}>Tickets</Title>
            {purchase.tickets.map((ticket, index) => (
              <Paper key={ticket.id} p="md" withBorder>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Ticket #{index + 1}
                    </Text>
                    <Text>${(ticket.price / 100).toFixed(2)}</Text>
                  </Group>
                  <Text size="sm">
                    {ticket.name} ({ticket.email})
                  </Text>
                  {ticket.seat && (
                    <Text size="sm" c="dimmed">
                      Seat: {ticket.seat.Row.name}-{ticket.seat.number}
                    </Text>
                  )}
                </Stack>
              </Paper>
            ))}

            <Button onClick={handleDownload} fullWidth>
              Download All Tickets
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
