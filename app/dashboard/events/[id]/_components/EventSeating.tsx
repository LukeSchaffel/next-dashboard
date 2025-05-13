import { Paper, Stack, Group, Title, Button, Tooltip } from "@mantine/core";
import { IconMaximize } from "@tabler/icons-react";
import { SeatSelection } from "@/lib/components";
import { Event } from "@prisma/client";

interface EventSeatingProps {
  event: Event & {
    eventLayout?: {
      sections: any[];
    } | null;
  };
  onToggleFullscreen: () => void;
  onSeatClick: (seat: { id: string }, section: any) => void;
}

export default function EventSeating({
  event,
  onToggleFullscreen,
  onSeatClick,
}: EventSeatingProps) {
  if (!event.eventLayout) return null;

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
          sections={event.eventLayout.sections}
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
