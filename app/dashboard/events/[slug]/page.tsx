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
  Box,
} from "@mantine/core";
import { Event, Ticket, TicketStatus, TicketType } from "@prisma/client";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { use } from "react";
import { useForm } from "@mantine/form";
import { useDisclosure, useFullscreen } from "@mantine/hooks";
import {
  IconPlus,
  IconCopy,
  IconCheck,
  IconDownload,
  IconEdit,
  IconTrash,
  IconEye,
  IconTable,
  IconMaximize,
  IconMinimize,
  IconX,
} from "@tabler/icons-react";
import DescriptionEditor from "../_components/DescriptionEditor";
import TicketTypeForm from "./_components/TicketTypeForm";
import TicketForm from "./_components/TicketForm";
import { useEventStore } from "@/stores/useEventStore";
import { Table, SeatSelection } from "@/lib/components";
import Link from "next/link";
import DescriptionEditorModal from "../_components/DescriptionEditorModal";

export default function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { ref, toggle, fullscreen } = useFullscreen();
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
  const [descriptionContent, setDescriptionContent] = useState(
    currentEvent?.description || ""
  );
  const [showFullscreenSeating, setShowFullscreenSeating] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

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

  const handleUpdateDescription = async () => {
    if (!currentEvent) return;

    setDescriptionLoading(true);
    try {
      await updateEvent(currentEvent.id, { description: descriptionContent });
      closeDescriptionModal();
    } catch (error) {
      console.error("Failed to update description:", error);
    } finally {
      setDescriptionLoading(false);
    }
  };

  const handleSeatClick = (seat: { id: string }, section: any) => {
    const ticket = currentEvent?.Tickets.find((t) => t.seat?.id === seat.id);
    if (ticket) {
      setSelectedTicket(ticket);
    }
  };

  if (loading || !currentEvent) {
    return <div>Loading...</div>;
  }

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
              <Link href={`/dashboard/events/${currentEvent.id}/event-layout`}>
                <Button variant="light" leftSection={<IconTable size={16} />}>
                  {currentEvent.eventLayout
                    ? "View Event Layout"
                    : "Create Event Layout"}
                </Button>
              </Link>
              {currentEvent.eventLayout && (
                <Button
                  variant="light"
                  leftSection={
                    fullscreen ? (
                      <IconMinimize size={16} />
                    ) : (
                      <IconMaximize size={16} />
                    )
                  }
                  onClick={() => {
                    setShowFullscreenSeating(true);
                    toggle();
                  }}
                >
                  View Seating Chart
                </Button>
              )}
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
                    (sum: number, ticket: Ticket) => sum + ticket.price,
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
              head: ["", "Name", "Price", "Quantity", "Sold", "Actions"],
              body: ticketTypes.map((ticketType) => [
                <Link
                  key={ticketType.id}
                  href={`/dashboard/events/${slug}/ticketTypes/${ticketType.id}`}
                >
                  <Button variant="subtle" leftSection={<IconEye size={16} />}>
                    View
                  </Button>
                </Link>,
                ticketType.name,
                `$${(ticketType.price / 100).toFixed(2)}`,
                ticketType.quantity === null
                  ? "Unlimited"
                  : ticketType.quantity,
                currentEvent?.Tickets.filter(
                  (t) => t.ticketTypeId === ticketType.id
                ).length || 0,
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

      <TicketTypeForm
        opened={ticketTypeModalOpened}
        onClose={() => {
          closeTicketTypeModal();
          setEditingTicketTypeId(null);
        }}
        eventSlug={slug}
        editingTicketTypeId={editingTicketTypeId || undefined}
      />

      {/* <TicketForm
        opened={ticketModalOpened}
        onClose={closeTicketModal}
        ticketTypes={ticketTypes}
        loading={ticketLoading}
        eventSlug={slug}
      /> */}

      <DescriptionEditorModal
        opened={descriptionModalOpened}
        onClose={closeDescriptionModal}
        value={descriptionContent}
        onChange={setDescriptionContent}
        onSave={handleUpdateDescription}
        loading={descriptionLoading}
      />

      {showFullscreenSeating && currentEvent.eventLayout && (
        <Box
          ref={ref}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "white",
            zIndex: 1000,
            padding: "2rem",
            overflow: "auto",
          }}
        >
          {selectedTicket && (
            <Box
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 2000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => setSelectedTicket(null)}
            >
              <Paper
                p="xl"
                radius="md"
                style={{
                  maxWidth: "400px",
                  width: "100%",
                  zIndex: 2001,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Stack>
                  <Group justify="space-between">
                    <Title order={3}>Ticket Information</Title>
                    <ActionIcon
                      variant="subtle"
                      onClick={() => setSelectedTicket(null)}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                  <Text>
                    <Text span fw={500}>
                      Purchaser:
                    </Text>{" "}
                    {selectedTicket.name}
                  </Text>
                  <Text>
                    <Text span fw={500}>
                      Email:
                    </Text>{" "}
                    {selectedTicket.email}
                  </Text>
                  <Text>
                    <Text span fw={500}>
                      Purchase Date:
                    </Text>{" "}
                    {new Date(selectedTicket.createdAt).toLocaleDateString()}
                  </Text>
                  <Text>
                    <Text span fw={500}>
                      Price:
                    </Text>{" "}
                    ${(selectedTicket.price / 100).toFixed(2)}
                  </Text>
                </Stack>
              </Paper>
            </Box>
          )}
          <Stack>
            <Group justify="space-between">
              <Title order={2}>Seating Chart</Title>
              <Button
                variant="light"
                leftSection={
                  fullscreen ? (
                    <IconMinimize size={16} />
                  ) : (
                    <IconMaximize size={16} />
                  )
                }
                onClick={() => {
                  toggle();
                  if (fullscreen) {
                    setShowFullscreenSeating(false);
                  }
                }}
              >
                {fullscreen ? "Exit Fullscreen" : "Close"}
              </Button>
            </Group>
            <SeatSelection
              sections={currentEvent.eventLayout.sections}
              basePrice={0}
              selectedSeatIds={[]}
              readOnly
              buttonSize="md"
              showPrices={false}
              onSeatClick={handleSeatClick}
            />
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
