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
  Tickets: Ticket[];
  Location: {
    name: string;
    address: string | null;
  } | null;
  PurchaseLinks: {
    id: string;
    price: number;
    createdAt: Date;
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
  const [purchaseLink, setPurchaseLink] = useState<string | null>(null);
  const { updateEvent } = useEventStore();

  const [
    ticketModalOpened,
    { open: openTicketModal, close: closeTicketModal },
  ] = useDisclosure(false);
  const [
    purchaseLinkModalOpened,
    { open: openPurchaseLinkModal, close: closePurchaseLinkModal },
  ] = useDisclosure(false);
  const [
    descriptionModalOpened,
    { open: openDescriptionModal, close: closeDescriptionModal },
  ] = useDisclosure(false);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [descriptionLoading, setDescriptionLoading] = useState(false);

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

  const ticketForm = useForm({
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

  const purchaseLinkForm = useForm({
    initialValues: {
      price: 0,
    },
    validate: {
      price: (value) => (value < 0 ? "Price must be positive" : null),
    },
  });

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

  const handleCreatePurchaseLink = async (
    values: typeof purchaseLinkForm.values
  ) => {
    try {
      const response = await fetch(`/api/events/${slug}/purchase-links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: values.price,
        }),
      });

      if (response.ok) {
        const { id } = await response.json();
        const link = `${window.location.origin}/purchase/${id}`;
        setPurchaseLink(link);
      }
    } catch (error) {
      console.error("Failed to create purchase link:", error);
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
              <Button variant="light" onClick={openPurchaseLinkModal}>
                Create Purchase Link
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
            <Title order={3}>Purchase Links</Title>
            <Button variant="light" onClick={openPurchaseLinkModal}>
              Create New Link
            </Button>
          </Group>

          {(event.PurchaseLinks || []).length > 0 ? (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Price</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Link</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {(event.PurchaseLinks || []).map((link) => (
                  <Table.Tr key={link.id}>
                    <Table.Td>${(link.price / 100).toFixed(2)}</Table.Td>
                    <Table.Td>
                      {dayjs(link.createdAt).format("MMM D, YYYY h:mm A")}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Text size="sm" c="dimmed">
                          {`${window.location.origin}/purchase/${link.id}`}
                        </Text>
                        <CopyButton
                          value={`${window.location.origin}/purchase/${link.id}`}
                        >
                          {({ copied, copy }) => (
                            <Tooltip label={copied ? "Copied!" : "Copy link"}>
                              <ActionIcon
                                variant="subtle"
                                color={copied ? "teal" : "gray"}
                                onClick={copy}
                              >
                                {copied ? (
                                  <IconCheck size={16} />
                                ) : (
                                  <IconCopy size={16} />
                                )}
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </CopyButton>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <Text c="dimmed">No purchase links created yet</Text>
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
                <Group gap="xs">
                  <Select
                    value={ticket.status}
                    onChange={(value) =>
                      handleUpdateTicketStatus(ticket.id, value as TicketStatus)
                    }
                    data={Object.values(TicketStatus)}
                    size="xs"
                    w={120}
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
            <NumberInput
              label="Price (in cents)"
              placeholder="1000"
              required
              min={0}
              {...ticketForm.getInputProps("price")}
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
        opened={purchaseLinkModalOpened}
        onClose={closePurchaseLinkModal}
        title="Create Purchase Link"
        centered
      >
        <form onSubmit={purchaseLinkForm.onSubmit(handleCreatePurchaseLink)}>
          <Stack gap="md">
            <NumberInput
              label="Price (in cents)"
              placeholder="1000"
              required
              min={0}
              {...purchaseLinkForm.getInputProps("price")}
            />
            <Button type="submit">Generate Link</Button>
          </Stack>
        </form>

        {purchaseLink && (
          <Stack gap="sm" mt="md">
            <Text size="sm" fw={500}>
              Purchase Link:
            </Text>
            <Group>
              <Text size="sm" style={{ flex: 1 }} truncate>
                {purchaseLink}
              </Text>
              <CopyButton value={purchaseLink} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "Copied!" : "Copy"}>
                    <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                      {copied ? (
                        <IconCheck size={16} />
                      ) : (
                        <IconCopy size={16} />
                      )}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
