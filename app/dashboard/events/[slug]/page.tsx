"use client";
import {
  Flex,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Badge,
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
import TicketTypeForm from "./_components/TicketTypeForm";
import TicketForm from "./_components/TicketForm";
import { useEventStore } from "@/stores/useEventStore";
import { Table } from "@/lib/components";

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
    updateTicketType,
  } = useEventStore();

  const [editingTicketTypeId, setEditingTicketTypeId] = useState<string | null>(
    null
  );
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

  useEffect(() => {
    fetchEvent(slug).catch(() => {
      notFound();
    });
    fetchTicketTypes(slug).catch(console.error);
  }, [slug, fetchEvent, fetchTicketTypes]);

  const handleEditTicketType = async (ticketTypeId: string) => {
    setEditingTicketTypeId(ticketTypeId);
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
        </Stack>
      </Paper>

      <Paper withBorder p="xl">
        <Group justify="space-between">
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
          <Table
            loading={ticketTypesLoading}
            data={{
              head: ["Name", "Price", "Quantity", "Sold", "Actions"],
              body: ticketTypes.map((ticketType) => [
                ticketType.name,
                `$${(ticketType.price / 100).toFixed(2)}`,
                ticketType.quantity === null
                  ? "Unlimited"
                  : ticketType.quantity,
                ticketType.Tickets.length,
                <Group gap="xs" key={ticketType.id}>
                  <CopyButton
                    value={`${window.location.origin}/purchase/${ticketType.id}`}
                  >
                    {({ copied, copy }) => (
                      <Tooltip
                        label={copied ? "Copied!" : "Copy purchase link"}
                        withArrow
                        position="right"
                      >
                        <ActionIcon
                          variant="light"
                          color={copied ? "teal" : "blue"}
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
                </Group>,
              ]),
            }}
          />
        ) : (
          <Text c="dimmed">No ticket types yet</Text>
        )}
      </Paper>

      <Paper withBorder p="xl">
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

        <Table
          data={{
            head: [
              "Name",
              "Email",
              "Ticket Type",
              "Price",
              "Status",
              "Actions",
            ],
            body: currentEvent.Tickets.map((ticket) => [
              ticket.name,
              ticket.email,
              ticket.TicketType?.name || "No type",
              `$${(ticket.price / 100).toFixed(2)}`,
              <Badge key={ticket.id} color={getStatusColor(ticket.status)}>
                {ticket.status}
              </Badge>,
              <Group gap="xs" key={ticket.id}>
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
              </Group>,
            ]),
          }}
        />
      </Paper>

      <TicketTypeForm
        opened={ticketTypeModalOpened}
        onClose={() => {
          closeTicketTypeModal();
          setEditingTicketTypeId(null);
        }}
        eventSlug={slug}
        editingTicketTypeId={editingTicketTypeId || undefined}
      />

      <TicketForm
        opened={ticketModalOpened}
        onClose={closeTicketModal}
        ticketTypes={ticketTypes}
        loading={ticketLoading}
        eventSlug={slug}
      />

      <DescriptionEditor
        opened={descriptionModalOpened}
        onClose={closeDescriptionModal}
        description={currentEvent.description || ""}
        eventId={currentEvent.id}
        onUpdate={(content) => {
          updateEvent(currentEvent.id, { description: content });
        }}
      />
    </Stack>
  );
}
