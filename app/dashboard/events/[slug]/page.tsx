"use client";
import {
  Flex,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Badge,
  Table,
  Button,
  Modal,
  TextInput,
  NumberInput,
  Select,
  LoadingOverlay,
} from "@mantine/core";
import { Event, Ticket, TicketStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { use } from "react";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";

interface EventWithTickets extends Event {
  Tickets: Ticket[];
  Location: {
    name: string;
    address: string | null;
  } | null;
}

export default function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [event, setEvent] = useState<EventWithTickets | null>(null);
  const [loading, setLoading] = useState(true);

  const [
    ticketModalOpened,
    { open: openTicketModal, close: closeTicketModal },
  ] = useDisclosure(false);
  const [ticketLoading, setTicketLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      price: 0,
      status: "PENDING" as TicketStatus,
    },
    validate: {
      name: (value) => (value.length < 1 ? "Name is required" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      price: (value) => (value < 0 ? "Price must be positive" : null),
    },
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${slug}`);
        if (!res.ok) {
          notFound();
        }
        const data = await res.json();
        setEvent(data);
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  const handleAddTicket = async (values: typeof form.values) => {
    setTicketLoading(true);
    try {
      const response = await fetch(`/api/events/${slug}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const newTicket = await response.json();
        setEvent((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            Tickets: [...prev.Tickets, newTicket],
          };
        });
        closeTicketModal();
        form.reset();
      }
    } catch (error) {
      console.error("Failed to add ticket:", error);
    } finally {
      setTicketLoading(false);
    }
  };

  const handleUpdateTicketStatus = async (
    ticketId: string,
    status: TicketStatus
  ) => {
    try {
      const response = await fetch(`/api/events/${slug}/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedTicket = await response.json();
        setEvent((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            Tickets: prev.Tickets.map((ticket) =>
              ticket.id === ticketId ? updatedTicket : ticket
            ),
          };
        });
      }
    } catch (error) {
      console.error("Failed to update ticket:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return notFound();
  }

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case "PENDING":
        return "yellow";
      case "CONFIRMED":
        return "green";
      case "CANCELLED":
        return "red";
      case "REFUNDED":
        return "gray";
      default:
        return "blue";
    }
  };

  return (
    <Stack gap="xl">
      <Paper p="xl" withBorder>
        <Stack gap="md">
          <Title order={2}>{event.name}</Title>
          <Group>
            <Badge size="lg" variant="light">
              {event.Tickets.length}{" "}
              {event.Tickets.length === 1 ? "Ticket" : "Tickets"}
            </Badge>
            {event.Location && (
              <Badge size="lg" variant="light">
                {event.Location.name}
              </Badge>
            )}
          </Group>
          {event.description && (
            <Text size="lg" c="dimmed">
              {event.description}
            </Text>
          )}
          <Text size="lg">
            {dayjs(event.startsAt).format("MMM D, YYYY h:mm A")} -{" "}
            {dayjs(event.endsAt).format("MMM D, YYYY h:mm A")}
          </Text>
          {event.Location?.address && (
            <Text size="lg" c="dimmed">
              {event.Location.address}
            </Text>
          )}
        </Stack>
      </Paper>

      <Group justify="space-between">
        <Title order={3}>Tickets</Title>
        <Button
          variant="filled"
          onClick={openTicketModal}
          leftSection={<IconPlus size={16} />}
        >
          Add Ticket
        </Button>
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Price</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {event.Tickets.map((ticket) => (
            <Table.Tr key={ticket.id}>
              <Table.Td>{ticket.name}</Table.Td>
              <Table.Td>{ticket.email}</Table.Td>
              <Table.Td>${(ticket.price / 100).toFixed(2)}</Table.Td>
              <Table.Td>
                <Badge color={getStatusColor(ticket.status)}>
                  {ticket.status}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Select
                  value={ticket.status}
                  onChange={(value) =>
                    handleUpdateTicketStatus(ticket.id, value as TicketStatus)
                  }
                  data={Object.values(TicketStatus)}
                  size="xs"
                  w={120}
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={ticketModalOpened}
        onClose={closeTicketModal}
        title="Add New Ticket"
        centered
      >
        <form onSubmit={form.onSubmit(handleAddTicket)}>
          <LoadingOverlay
            visible={ticketLoading}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }}
          />
          <Stack gap="md">
            <TextInput
              label="Name"
              placeholder="Ticket holder's name"
              required
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Email"
              placeholder="ticket@example.com"
              required
              {...form.getInputProps("email")}
            />
            <NumberInput
              label="Price (in cents)"
              placeholder="1000"
              required
              min={0}
              {...form.getInputProps("price")}
            />
            <Select
              label="Status"
              data={Object.values(TicketStatus)}
              defaultValue="PENDING"
              {...form.getInputProps("status")}
            />
            <Button type="submit">Add Ticket</Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
