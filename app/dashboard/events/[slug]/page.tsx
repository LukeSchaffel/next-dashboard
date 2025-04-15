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
  CopyButton,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import { Event, Ticket, TicketStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { use } from "react";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus,
  IconCopy,
  IconCheck,
  IconDownload,
  IconEdit,
} from "@tabler/icons-react";
import DescriptionEditor from "../_components/DescriptionEditor";
import { useEventStore } from "@/stores/useEventStore";

interface EventWithTickets extends Event {
  Tickets: (Ticket & {
    TicketType: {
      id: string;
      name: string;
      description: string | null;
      price: number;
      quantity: number | null;
    } | null;
  })[];
  Location: {
    name: string;
    address: string | null;
  } | null;
  TicketTypes: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    quantity: number | null;
    createdAt: Date;
    Tickets: Ticket[];
  }[];
}

export default function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [event, setEvent] = useState<EventWithTickets | null>(null);
  const [loading, setLoading] = useState(true);
  const { updateEvent } = useEventStore();

  const [
    ticketTypeModalOpened,
    { open: openTicketTypeModal, close: closeTicketTypeModal },
  ] = useDisclosure(false);
  const [
    ticketModalOpened,
    { open: openTicketModal, close: closeTicketModal },
  ] = useDisclosure(false);
  const [
    descriptionModalOpened,
    { open: openDescriptionModal, close: closeDescriptionModal },
  ] = useDisclosure(false);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [descriptionLoading, setDescriptionLoading] = useState(false);

  const ticketTypeForm = useForm({
    initialValues: {
      name: "",
      description: "",
      price: 0,
      quantity: null as number | null,
    },
    validate: {
      name: (value) => (value.length < 1 ? "Name is required" : null),
      price: (value) => (value < 0 ? "Price must be positive" : null),
      quantity: (value) => (value !== null && value < 0 ? "Quantity must be positive" : null),
    },
  });

  const ticketForm = useForm({
    initialValues: {
      name: "",
      email: "",
      ticketTypeId: "",
      status: "PENDING" as TicketStatus,
    },
    validate: {
      name: (value) => (value.length < 1 ? "Name is required" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      ticketTypeId: (value) => (value.length < 1 ? "Ticket type is required" : null),
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

  const handleCreateTicketType = async (values: typeof ticketTypeForm.values) => {
    try {
      const response = await fetch(`/api/events/${slug}/ticket-types`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const newTicketType = await response.json();
        setEvent((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            TicketTypes: [...prev.TicketTypes, newTicketType],
          };
        });
        closeTicketTypeModal();
        ticketTypeForm.reset();
      }
    } catch (error) {
      console.error("Failed to create ticket type:", error);
    }
  };

  const handleAddTicket = async (values: typeof ticketForm.values) => {
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
        ticketForm.reset();
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

  const handleUpdateDescription = async (content: string) => {
    if (!event) return;
    
    setDescriptionLoading(true);
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: content,
        }),
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvent(updatedEvent);
        closeDescriptionModal();
      }
    } catch (error) {
      console.error('Failed to update description:', error);
    } finally {
      setDescriptionLoading(false);
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
          <Group justify="space-between">
            <Title order={2}>{event.name}</Title>
            <Group>
              <Button 
                variant="light" 
                leftSection={<IconEdit size={16} />}
                onClick={openDescriptionModal}
              >
                Edit Description
              </Button>
            </Group>
          </Group>
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
            <div dangerouslySetInnerHTML={{ __html: event.description }} />
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

          <Group mt="xl" gap={"xl"}>
            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                Total Tickets Sold
              </Text>
              <Title order={3}>{event.Tickets.length}</Title>
            </Stack>
            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                Total Revenue
              </Text>
              <Title order={3}>
                $
                {(
                  event.Tickets.reduce((sum, ticket) => sum + ticket.price, 0) /
                  100
                ).toFixed(2)}
              </Title>
            </Stack>
          </Group>
        </Stack>
      </Paper>

      <Paper p="xl" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={3}>Ticket Types</Title>
            <Button variant="light" onClick={openTicketTypeModal}>
              Create New Ticket Type
            </Button>
          </Group>
          {event.TicketTypes.length > 0 ? (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Price</Table.Th>
                  <Table.Th>Quantity</Table.Th>
                  <Table.Th>Sold</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {event.TicketTypes.map((ticketType) => (
                  <Table.Tr key={ticketType.id}>
                    <Table.Td>{ticketType.name}</Table.Td>
                    <Table.Td>{ticketType.description}</Table.Td>
                    <Table.Td>${(ticketType.price / 100).toFixed(2)}</Table.Td>
                    <Table.Td>{ticketType.quantity || "Unlimited"}</Table.Td>
                    <Table.Td>{ticketType.Tickets.length}</Table.Td>
                    <Table.Td>
                      <CopyButton value={`${window.location.origin}/purchase/${ticketType.id}`}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? "Copied!" : "Copy purchase link"}>
                            <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <Text c="dimmed">No ticket types created yet</Text>
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
            <Table.Th>Ticket Type</Table.Th>
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
              <Table.Td>{ticket.TicketType?.name || "No type"}</Table.Td>
              <Table.Td>${(ticket.price / 100).toFixed(2)}</Table.Td>
              <Table.Td>
                <Badge color={getStatusColor(ticket.status)}>
                  {ticket.status}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Select
                    value={ticket.status}
                    data={Object.values(TicketStatus)}
                    onChange={(value) =>
                      handleUpdateTicketStatus(ticket.id, value as TicketStatus)
                    }
                  />
                  <Tooltip label="Download Ticket PDF">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() =>
                        window.open(`/api/tickets/${ticket.id}/pdf`, "_blank")
                      }
                    >
                      <IconDownload size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <DescriptionEditor
        opened={descriptionModalOpened}
        onClose={closeDescriptionModal}
        description={event?.description || ''}
        eventId={event?.id || ''}
        onUpdate={setEvent}
      />

      <Modal
        opened={ticketModalOpened}
        onClose={closeTicketModal}
        title="Add New Ticket"
        centered
      >
        <form onSubmit={ticketForm.onSubmit(handleAddTicket)}>
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
              {...ticketForm.getInputProps("name")}
            />
            <TextInput
              label="Email"
              placeholder="ticket@example.com"
              required
              {...ticketForm.getInputProps("email")}
            />
            <Select
              label="Ticket Type"
              placeholder="Select a ticket type"
              data={event?.TicketTypes.map((type) => ({
                value: type.id,
                label: `${type.name} - $${(type.price / 100).toFixed(2)}`,
                disabled: type.quantity !== null && type.Tickets.length >= type.quantity,
              })) || []}
              {...ticketForm.getInputProps("ticketTypeId")}
            />
            <Select
              label="Status"
              data={Object.values(TicketStatus)}
              defaultValue="PENDING"
              {...ticketForm.getInputProps("status")}
            />
            <Button type="submit">Add Ticket</Button>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={ticketTypeModalOpened}
        onClose={closeTicketTypeModal}
        title="Create New Ticket Type"
        centered
      >
        <form onSubmit={ticketTypeForm.onSubmit(handleCreateTicketType)}>
          <Stack gap="md">
            <TextInput
              label="Name"
              placeholder="General Admission"
              required
              {...ticketTypeForm.getInputProps("name")}
            />
            <TextInput
              label="Description"
              placeholder="Description of this ticket type"
              {...ticketTypeForm.getInputProps("description")}
            />
            <NumberInput
              label="Price (in cents)"
              placeholder="1000"
              required
              min={0}
              {...ticketTypeForm.getInputProps("price")}
            />
            <NumberInput
              label="Quantity (leave empty for unlimited)"
              placeholder="100"
              min={0}
              {...ticketTypeForm.getInputProps("quantity")}
            />
            <Button type="submit">Create Ticket Type</Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
