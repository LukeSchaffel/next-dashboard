import {
  Paper,
  Stack,
  Group,
  Title,
  Button,
  Text,
  Tooltip,
  ActionIcon,
  LoadingOverlay,
} from "@mantine/core";
import {
  IconPlus,
  IconEye,
  IconCopy,
  IconCheck,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { CopyButton } from "@mantine/core";
import { Table } from "@/lib/components";
import { Event, TicketType, Ticket } from "@prisma/client";
import { useEventStore } from "@/stores/useEventStore";

interface EventTicketsProps {
  onAddTicketType: () => void;
  onEditTicketType: (id: string) => void;
  onDeleteTicketType: (id: string) => void;
}

export default function EventTickets({
  onAddTicketType,
  onEditTicketType,
  onDeleteTicketType,
}: EventTicketsProps) {
  const {
    currentEvent: event,
    ticketTypes,
    ticketTypesLoading: loading,
  } = useEventStore();

  if (!event) return <></>;

  const allTickets = ticketTypes.flatMap((tt) => tt.Tickets);

  return (
    <Paper p="xl" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Ticket Types</Title>
          <Tooltip label="Add a new ticket type">
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={onAddTicketType}
            >
              Add Ticket Type
            </Button>
          </Tooltip>
        </Group>

        {loading ? (
          <LoadingOverlay visible />
        ) : ticketTypes.length > 0 ? (
          <Table
            loading={loading}
            data={{
              head: ["", "Name", "Price", "Quantity", "Sold", "Actions"],
              body: ticketTypes.map((ticketType) => [
                <Link
                  key={ticketType.id}
                  href={`/dashboard/events/${event.id}/ticketTypes/${ticketType.id}`}
                >
                  <Tooltip label="View ticket type details">
                    <Button
                      variant="subtle"
                      leftSection={<IconEye size={16} />}
                    >
                      View
                    </Button>
                  </Tooltip>
                </Link>,
                ticketType.name,
                `$${(ticketType.price / 100).toFixed(2)}`,
                ticketType.quantity === null
                  ? "Unlimited"
                  : ticketType.quantity,
                allTickets.filter((t) => t.ticketTypeId === ticketType.id)
                  .length || 0,
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
                  <Tooltip label="Edit ticket type">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => onEditTicketType(ticketType.id)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete ticket type">
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to delete this ticket type? This action cannot be undone."
                          )
                        ) {
                          onDeleteTicketType(ticketType.id);
                        }
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>,
              ]),
            }}
          />
        ) : (
          <Text c="dimmed">No ticket types yet</Text>
        )}
      </Stack>
    </Paper>
  );
}
