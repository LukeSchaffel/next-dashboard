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
  Collapse,
  Flex,
} from "@mantine/core";
import {
  TicketStatus,
  PurchaseStatus,
  Ticket,
  TicketType,
} from "@prisma/client";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { use } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus,
  IconDownload,
  IconEdit,
  IconTrash,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import { useEventStore } from "@/stores/useEventStore";
import { Table } from "@/lib/components";
import TicketForm from "../../_components/TicketForm";
import Link from "next/link";
import dayjs from "dayjs";

interface Section {
  id: string;
  name: string;
  priceMultiplier: number;
}

interface Seat {
  id: string;
  name: string;
  sectionId: string;
  Row?: { name: string };
  number?: string;
}

interface TicketWithDetails extends Ticket {
  seat?: Seat | null;
  purchase: Purchase;
}

interface Purchase {
  id: string;
  totalAmount: number;
  status: PurchaseStatus;
  customerEmail: string;
  customerName: string | null;
  createdAt: Date;
  tickets: TicketWithDetails[];
}

export default function TicketTypePage({
  params,
}: {
  params: Promise<{ id: string; ticketTypeId: string }>;
}) {
  const { id, ticketTypeId } = use(params);
  const {
    currentEvent,
    loading,
    fetchEvent,
    addTicket,
    updateTicket,
    ticketTypes,
    fetchTicketTypes,
  } = useEventStore();

  const [
    ticketModalOpened,
    { open: openTicketModal, close: closeTicketModal },
  ] = useDisclosure(false);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [expandedPurchases, setExpandedPurchases] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const fetchData = async () => {
      // Only fetch event if it's not already loaded or if it's a different event
      if (!currentEvent || currentEvent.id !== id) {
        try {
          await fetchEvent(id);
        } catch (error) {
          notFound();
        }
      }

      // Only fetch ticket types if the current ticket type isn't already loaded
      const currentTicketTypeExists = ticketTypes.some(
        (tt) => tt.id === ticketTypeId
      );
      if (!currentTicketTypeExists) {
        try {
          await fetchTicketTypes(id);
        } catch (error) {
          console.error("Failed to fetch ticket types:", error);
        }
      }
    };

    fetchData();
  }, [
    id,
    ticketTypeId,
    currentEvent,
    ticketTypes,
    fetchEvent,
    fetchTicketTypes,
  ]);

  const currentTicketType = ticketTypes.find((tt) => tt.id === ticketTypeId);

  const tickets =
    (currentEvent?.Tickets.filter(
      (ticket) => ticket.ticketTypeId === ticketTypeId
    ) as TicketWithDetails[]) || [];

  // Group tickets by purchase
  const purchases = tickets.reduce((acc, ticket) => {
    const purchase = ticket.purchase;
    if (!acc[purchase.id]) {
      acc[purchase.id] = {
        ...purchase,
        tickets: [],
      };
    }
    acc[purchase.id].tickets.push(ticket);
    return acc;
  }, {} as Record<string, Purchase>);

  const handleUpdatePurchaseStatus = async (
    purchaseId: string,
    status: PurchaseStatus
  ) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update purchase status");
      }

      // Refresh the event data to get the updated purchase status
      await fetchEvent(id);
    } catch (error) {
      console.error("Failed to update purchase status:", error);
    }
  };

  const handleDownloadTickets = async (purchase: Purchase) => {
    try {
      const ticketIds = purchase.tickets.map((ticket) => ticket.id);
      const queryString = ticketIds.map((id) => `ticketIds=${id}`).join("&");
      const response = await fetch(`/api/tickets/download?${queryString}`);

      if (!response.ok) {
        throw new Error("Failed to download tickets");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tickets-${purchase.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download tickets:", error);
    }
  };

  const togglePurchase = (purchaseId: string) => {
    setExpandedPurchases((prev) => {
      const next = new Set(prev);
      if (next.has(purchaseId)) {
        next.delete(purchaseId);
      } else {
        next.add(purchaseId);
      }
      return next;
    });
  };

  if (loading || !currentEvent || !currentTicketType) {
    return <div>Loading...</div>;
  }

  const totalTicketsSold = Object.values(purchases).reduce(
    (sum, purchase) => sum + purchase.tickets.length,
    0
  );

  const totalRevenue =
    Object.values(purchases).reduce(
      (sum, purchase) => sum + purchase.totalAmount,
      0
    ) / 100; // Convert cents to dollars

  return (
    <Stack>
      <Group justify="space-between">
        <Stack gap={0}>
          <Title order={4}>{currentTicketType.name}</Title>
          <Text size="sm" c="dimmed">
            {currentTicketType.description}
          </Text>
        </Stack>
        <Group>
          <Badge size="lg" variant="light">
            {totalTicketsSold} tickets sold
          </Badge>
          <Badge size="lg" variant="light" color="green">
            ${totalRevenue.toFixed(2)} revenue
          </Badge>
        </Group>
      </Group>

      <Paper withBorder p="xl">
        <Table
          loading={loading}
          data={{
            head: [
              "",
              "Date",
              "Customer",
              "Tickets",
              "Amount",
              "Status",
              "Actions",
            ],
            body: Object.values(purchases).flatMap((purchase) => {
              const isExpanded = expandedPurchases.has(purchase.id);
              const purchaseRow = [
                <Button
                  key={`toggle-${purchase.id}`}
                  variant="subtle"
                  onClick={() => togglePurchase(purchase.id)}
                  leftSection={
                    isExpanded ? (
                      <IconChevronDown size={16} />
                    ) : (
                      <IconChevronRight size={16} />
                    )
                  }
                >
                  {purchase.tickets.length} Tickets
                </Button>,
                dayjs(purchase.createdAt).format("MMM D, YYYY h:mm A"),
                <Stack key={purchase.id} gap={0}>
                  <Text size="sm">{purchase.customerName || "N/A"}</Text>
                  <Text size="xs" c="dimmed">
                    {purchase.customerEmail}
                  </Text>
                </Stack>,
                <Text key={purchase.id} size="sm">
                  {purchase.tickets.length}
                </Text>,
                <Text key={purchase.id} size="sm">
                  ${(purchase.totalAmount / 100).toFixed(2)}
                </Text>,
                <Badge
                  key={purchase.id}
                  color={
                    purchase.status === "COMPLETED"
                      ? "green"
                      : purchase.status === "CANCELLED"
                      ? "red"
                      : "yellow"
                  }
                >
                  {purchase.status}
                </Badge>,
                <Group key={purchase.id} gap="xs">
                  <Tooltip label="Download Tickets">
                    <ActionIcon
                      variant="light"
                      onClick={() => handleDownloadTickets(purchase)}
                    >
                      <IconDownload size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>,
              ];

              const ticketRows = isExpanded
                ? purchase.tickets.map((ticket) => [
                    "",
                    dayjs(ticket.createdAt).format("MMM D, YYYY h:mm A"),
                    <Text key={ticket.id} size="sm" ml="xl">
                      Ticket #{ticket.id.slice(0, 8)}
                    </Text>,
                    <Text key={ticket.id} size="sm">
                      {ticket.seat
                        ? `Seat ${ticket?.seat?.Row?.name || "-"} ${
                            ticket?.seat?.number || "-"
                          }`
                        : "No seat assigned"}
                    </Text>,
                    <Text key={ticket.id} size="sm">
                      ${(ticket.price / 100).toFixed(2)}
                    </Text>,
                    <Badge
                      key={ticket.id}
                      color={
                        ticket.status === "CONFIRMED"
                          ? "green"
                          : ticket.status === "CANCELLED"
                          ? "red"
                          : "yellow"
                      }
                    >
                      {ticket.status}
                    </Badge>,
                    <Group key={ticket.id} gap="xs">
                      <Tooltip label="Download Ticket">
                        <ActionIcon
                          variant="light"
                          onClick={() =>
                            handleDownloadTickets({
                              tickets: [ticket],
                            } as Purchase)
                          }
                        >
                          <IconDownload size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>,
                  ])
                : [];

              return [purchaseRow, ...ticketRows];
            }),
          }}
        />
      </Paper>

      {/* <TicketForm
        opened={ticketModalOpened}
        onClose={closeTicketModal}
        ticketTypes={ticketTypes}
        loading={ticketLoading}
        eventid={id}
      /> */}
    </Stack>
  );
}
