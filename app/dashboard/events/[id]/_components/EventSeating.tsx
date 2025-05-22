import {
  Paper,
  Stack,
  Group,
  Title,
  Button,
  Tooltip,
  Modal,
  Text,
  Badge,
} from "@mantine/core";
import { IconMaximize } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { SeatSelection } from "@/lib/components";
import { Event } from "@prisma/client";
import {
  useEventStore,
  EventLayoutWithDetails,
  TicketWithSeatingInformation,
} from "@/stores/useEventStore";

interface EventSeatingProps {
  onToggleFullscreen: () => void;
}

export default function EventSeating({
  onToggleFullscreen,
}: EventSeatingProps) {
  const {
    currentEvent: event,
    currentEventLayout,
    fetchEventLayout,
    ticketTypes,
  } = useEventStore();

  useEffect(() => {
    if (event && event?.eventLayout?.id) {
      fetchEventLayout(event.id, event.eventLayout.id);
    }
  }, [event?.id]);

  const [modal, setModal] = useState<{
    ticket: TicketWithSeatingInformation;
  } | null>(null);

  const onSeatClick = (seat: any, section: any) => {
    const allTickets = ticketTypes.flatMap((tt) => tt.Tickets);
    const ticket = allTickets.find((t) => t.id === seat.ticketId);

    if (ticket) {
      setModal({ ticket });
    }
  };

  if (!event || !currentEventLayout) return null;

  return (
    <Paper p="xl" withBorder>
      <Modal
        opened={!!modal}
        onClose={() => setModal(null)}
        title="Ticket Information"
        centered
      >
        {modal?.ticket && (
          <Stack gap="md">
            <Group>
              <Text fw={500}>Customer:</Text>
              <Text>{modal.ticket.name}</Text>
            </Group>
            <Group>
              <Text fw={500}>Email:</Text>
              <Text>{modal.ticket.email}</Text>
            </Group>
            <Group>
              <Text fw={500}>Seat:</Text>
              <Text>
                {modal.ticket.seat?.Row?.name}
                {modal.ticket.seat?.number}
              </Text>
            </Group>
            <Group>
              <Text fw={500}>Status:</Text>
              <Badge
                color={
                  modal.ticket.status === "CONFIRMED"
                    ? "green"
                    : modal.ticket.status === "PENDING"
                    ? "yellow"
                    : modal.ticket.status === "CANCELLED"
                    ? "red"
                    : "blue"
                }
              >
                {modal.ticket.status}
              </Badge>
            </Group>
          </Stack>
        )}
      </Modal>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Seating Chart</Title>
          <Tooltip label="View in fullscreen">
            <Button
              variant="light"
              leftSection={<IconMaximize size={16} />}
              onClick={onToggleFullscreen}
            >
              View Fullscreen
            </Button>
          </Tooltip>
        </Group>
        <SeatSelection
          sections={currentEventLayout.sections}
          basePrice={0}
          selectedSeatIds={[]}
          readOnly
          buttonSize="md"
          showPrices={false}
          onSeatClick={onSeatClick}
        />
      </Stack>
    </Paper>
  );
}
