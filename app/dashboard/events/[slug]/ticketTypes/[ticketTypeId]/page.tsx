"use client";

import {
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Badge,
  Button,
  LoadingOverlay,
  ActionIcon,
  Select,
  Tooltip,
} from "@mantine/core";
import { TicketStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { use } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus,
  IconDownload,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { useEventStore } from "@/stores/useEventStore";
import { Table } from "@/lib/components";
import TicketForm from "../../_components/TicketForm";
import Link from "next/link";

export default function TicketTypePage({
  params,
}: {
  params: Promise<{ slug: string; ticketTypeId: string }>;
}) {
  const { slug, ticketTypeId } = use(params);
  const {
    currentEvent,
    loading,
    fetchEvent,
    addTicket,
    updateTicket,
    deleteTicket,
    ticketTypes,
    fetchTicketTypes,
  } = useEventStore();

  const [ticketModalOpened, { open: openTicketModal, close: closeTicketModal }] =
    useDisclosure(false);
  const [ticketLoading, setTicketLoading] = useState(false);

  useEffect(() => {
    fetchEvent(slug).catch(() => {
      notFound();
    });
    fetchTicketTypes(slug).catch(console.error);
  }, [slug, fetchEvent, fetchTicketTypes]);

  const currentTicketType = ticketTypes.find((tt) => tt.id === ticketTypeId);
  const tickets = currentEvent?.Tickets.filter(
    (ticket) => ticket.ticketTypeId === ticketTypeId
  ) || [];

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

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    try {
      await deleteTicket(slug, ticketId);
    } catch (error) {
      console.error("Failed to delete ticket:", error);
    }
  };

  if (loading || !currentEvent || !currentTicketType) {
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
            <Stack gap={0}>
              <Title order={1}>{currentTicketType.name}</Title>
              <Text c="dimmed">
                {currentEvent.name} - ${(currentTicketType.price / 100).toFixed(2)}
              </Text>
            </Stack>
            <Group>
              <Button
                variant="light"
                component={Link}
                href={`/dashboard/events/${slug}`}
              >
                Back to Event
              </Button>
              <Button
                variant="light"
                onClick={openTicketModal}
                leftSection={<IconPlus size={16} />}
              >
                Add Ticket
              </Button>
            </Group>
          </Group>

          <Group>
            <Badge size="lg" variant="light">
              {tickets.length} Tickets Sold
            </Badge>
            <Badge size="lg" variant="light">
              {currentTicketType.quantity === null
                ? "Unlimited"
                : `${currentTicketType.quantity - tickets.length} Remaining`}
            </Badge>
            <Badge size="lg" variant="light">
              $
              {(
                tickets.reduce((sum, ticket) => sum + ticket.price, 0) / 100
              ).toFixed(2)}{" "}
              Revenue
            </Badge>
          </Group>

          {currentTicketType.description && (
            <Text>{currentTicketType.description}</Text>
          )}
        </Stack>
      </Paper>

      <Paper p="xl" withBorder>
        <Title order={3} mb="md">
          Tickets
        </Title>

        <Table
          data={{
            head: ["Name", "Email", "Status", "Actions"],
            body: tickets.map((ticket) => [
              ticket.name,
              ticket.email,
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
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => handleDeleteTicket(ticket.id)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>,
            ]),
          }}
        />
      </Paper>

      <TicketForm
        opened={ticketModalOpened}
        onClose={closeTicketModal}
        eventSlug={slug}
        ticketTypes={[currentTicketType]}
        loading={ticketLoading}
      />
    </Stack>
  );
} 