import { Paper, Stack, Group, Title, Button, Tooltip } from "@mantine/core";
import { IconMaximize } from "@tabler/icons-react";
import { SeatSelection } from "@/lib/components";
import { Event } from "@prisma/client";
import { useEventStore, EventLayoutWithDetails } from "@/stores/useEventStore";
import { useEffect } from "react";

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

  const onSeatClick = (seat: any, section: any) => {
    const allTickets = ticketTypes.flatMap((tt) => tt.Tickets);
  };

  if (!event || !currentEventLayout) return null;

  return (
    <Paper p="xl" withBorder>
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
