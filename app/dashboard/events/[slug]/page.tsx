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
import { Event, Ticket, TicketStatus, TicketType } from "@prisma/client";
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
  IconTrash,
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
  const {
    currentEvent,
    loading,
    fetchEvent,
    addTicketType,
    addTicket,
    updateTicket,
    updateEvent,
    ticketTypes,
    ticketTypesLoading,
    fetchTicketTypes,
    deleteTicketType,
  } = useEventStore();

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
      quantity: (value) =>
        value !== null && value < 0 ? "Quantity must be positive" : null,
    },
  });

  const ticketForm = useForm({
    initialValues: {
      name: "",
      email: "",
      ticketTypeId: "",
      status: "PENDING" as TicketStatus,
      price: 0,
    },
    validate: {
      name: (value) => (value.length < 1 ? "Name is required" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      ticketTypeId: (value) =>
        value.length < 1 ? "Ticket type is required" : null,
      price: (value) => (value < 0 ? "Price must be positive" : null),
    },
  });

  useEffect(() => {
    fetchEvent(slug).catch(() => {
      notFound();
    });
    fetchTicketTypes(slug).catch(console.error);
  }, [slug, fetchEvent, fetchTicketTypes]);

  const handleCreateTicketType = async (
    values: typeof ticketTypeForm.values
  ) => {
    try {
      await addTicketType(slug, values);
      closeTicketTypeModal();
      ticketTypeForm.reset();
    } catch (error) {
      console.error("Failed to create ticket type:", error);
    }
  };

  const handleEditTicketType = async (ticketTypeId: string) => {
    const ticketType = ticketTypes.find((tt) => tt.id === ticketTypeId);
    if (!ticketType) return;

    ticketTypeForm.setValues({
      name: ticketType.name,
      description: ticketType.description || "",
      price: ticketType.price / 100,
      quantity: ticketType.quantity,
    });

    openTicketTypeModal();
  };

  const handleDeleteTicketType = async (ticketTypeId: string) => {
    if (!confirm("Are you sure you want to delete this ticket type?")) return;

    try {
      await deleteTicketType(slug, ticketTypeId);
    } catch (error) {
      console.error("Failed to delete ticket type:", error);
    }
  };

  const handleAddTicket = async (values: typeof ticketForm.values) => {
    setTicketLoading(true);
    try {
      const selectedTicketType = currentEvent?.TicketTypes.find(
        (type) => type.id === values.ticketTypeId
      );

      if (!selectedTicketType) {
        throw new Error("Selected ticket type not found");
      }

      await addTicket(slug, {
        ...values,
        price: selectedTicketType.price,
      });
      closeTicketModal();
      ticketForm.reset();
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
      await updateTicket(slug, ticketId, { status });
    } catch (error) {
      console.error("Failed to update ticket:", error);
    }
  };

  const handleUpdateDescription = async (content: string) => {
    if (!currentEvent) return;

    setDescriptionLoading(true);
    try {
      await updateEvent(currentEvent.id, { description: content });
      closeDescriptionModal();
    } catch (error) {
      console.error("Failed to update description:", error);
    } finally {
      setDescriptionLoading(false);
    }
  };

  if (loading || !currentEvent) {
    return <div>Loading...</div>;
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
            <Title order={2}>{currentEvent.name}</Title>
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
              {currentEvent.Tickets.length}{" "}
              {currentEvent.Tickets.length === 1 ? "Ticket" : "Tickets"}
            </Badge>
            {currentEvent.Location && (
              <Badge size="lg" variant="light">
                {currentEvent.Location.name}
              </Badge>
            )}
          </Group>
          {currentEvent.description && (
            <div
              dangerouslySetInnerHTML={{ __html: currentEvent.description }}
            />
          )}
          <Text size="lg">
            {dayjs(currentEvent.startsAt).format("MMM D, YYYY h:mm A")} -{" "}
            {dayjs(currentEvent.endsAt).format("MMM D, YYYY h:mm A")}
          </Text>
          {currentEvent.Location?.address && (
            <Text size="lg" c="dimmed">
              {currentEvent.Location.address}
            </Text>
          )}

          <Group mt="xl" gap={"xl"}>
            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                Total Tickets Sold
              </Text>
              <Title order={3}>{currentEvent.Tickets.length}</Title>
            </Stack>
            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                Total Revenue
              </Text>
              <Title order={3}>
                $
                {(
                  currentEvent.Tickets.reduce(
                    (sum, ticket) => sum + ticket.price,
                    0
                  ) / 100
                ).toFixed(2)}
              </Title>
            </Stack>
          </Group>

          <Group justify="space-between" mt="xl">
            <Title order={3}>Ticket Types</Title>
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={openTicketTypeModal}
            >
              Add Ticket Type
            </Button>
          </Group>

          {ticketTypesLoading ? (
            <LoadingOverlay visible />
          ) : ticketTypes.length > 0 ? (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Price</Table.Th>
                  <Table.Th>Quantity</Table.Th>
                  <Table.Th>Sold</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {ticketTypes.map((ticketType) => (
                  <Table.Tr key={ticketType.id}>
                    <Table.Td>{ticketType.name}</Table.Td>
                    <Table.Td>${(ticketType.price / 100).toFixed(2)}</Table.Td>
                    <Table.Td>
                      {ticketType.quantity === null
                        ? "Unlimited"
                        : ticketType.quantity}
                    </Table.Td>
                    <Table.Td>{ticketType.Tickets.length}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleEditTicketType(ticketType.id)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDeleteTicketType(ticketType.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <Text c="dimmed">No ticket types yet</Text>
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
          {currentEvent.Tickets.map((ticket) => (
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
        description={currentEvent?.description || ""}
        eventId={currentEvent?.id || ""}
        onUpdate={(content) => {
          if (currentEvent) {
            updateEvent(currentEvent.id, { description: content });
          }
        }}
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
              data={
                currentEvent?.TicketTypes.map((type) => ({
                  value: type.id,
                  label: `${type.name} - $${(type.price / 100).toFixed(2)}`,
                  disabled:
                    type.quantity !== null &&
                    type.Tickets.length >= type.quantity,
                })) || []
              }
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
