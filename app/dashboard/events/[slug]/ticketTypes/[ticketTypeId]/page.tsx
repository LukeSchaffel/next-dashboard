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

interface Purchase {
  id: string;
  totalAmount: number;
  status: PurchaseStatus;
  customerEmail: string;
  customerName: string | null;
  createdAt: Date;
  tickets: Ticket[];
}

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
    ticketTypes,
    fetchTicketTypes,
  } = useEventStore();

  const [
    ticketModalOpened,
    { open: openTicketModal, close: closeTicketModal },
  ] = useDisclosure(false);
  const [ticketLoading, setTicketLoading] = useState(false);

  useEffect(() => {
    fetchEvent(slug).catch(() => {
      notFound();
    });
    fetchTicketTypes(slug).catch(console.error);
  }, [slug, fetchEvent, fetchTicketTypes]);

  const currentTicketType = ticketTypes.find((tt) => tt.id === ticketTypeId) as
    | TicketType
    | undefined;

  const tickets =
    (currentEvent?.Tickets.filter(
      (ticket) => ticket.ticketTypeId === ticketTypeId
    ) as (Ticket & { purchase: Purchase })[]) || [];

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
      await fetchEvent(slug);
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

  if (loading || !currentEvent || !currentTicketType) {
    return <div>Loading...</div>;
  }

  const totalTicketsSold = Object.values(purchases).reduce(
    (sum, purchase) => sum + purchase.tickets.length,
    0
  );

  const totalRevenue = Object.values(purchases).reduce(
    (sum, purchase) => sum + purchase.totalAmount,
    0
  );

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
              "Date",
              "Customer",
              "Tickets",
              "Amount",
              "Status",
              "Actions",
            ],
            body: Object.values(purchases).map((purchase) => [
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
                ${purchase.totalAmount.toFixed(2)}
              </Text>,
              <Select
                key={purchase.id}
                value={purchase.status}
                onChange={(value) =>
                  handleUpdatePurchaseStatus(
                    purchase.id,
                    value as PurchaseStatus
                  )
                }
                data={[
                  { value: "PENDING", label: "Pending" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "CANCELLED", label: "Cancelled" },
                ]}
                size="xs"
              />,
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
            ]),
          }}
        />
      </Paper>

      <TicketForm
        opened={ticketModalOpened}
        onClose={closeTicketModal}
        ticketTypes={ticketTypes}
        loading={ticketLoading}
        eventSlug={slug}
      />
    </Stack>
  );
}
