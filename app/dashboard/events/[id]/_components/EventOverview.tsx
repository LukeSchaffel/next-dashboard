import {
  Paper,
  Stack,
  Group,
  Title,
  Badge,
  Button,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconTag } from "@tabler/icons-react";
import Link from "next/link";
import { Event, Ticket } from "@prisma/client";
import dayjs from "dayjs";
import ImageUploader from "../../../_components/ImageUploader";
import { EventWithDetails } from "@/stores/useEventStore";

interface EventOverviewProps {
  event: EventWithDetails;
  onManageTags: () => void;
}

export default function EventOverview({
  event,
  onManageTags,
}: EventOverviewProps) {
  return (
    <Stack gap="xl">
      <Paper p="xl" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={2}>{event.name}</Title>
            <Button
              variant="subtle"
              leftSection={<IconTag size={16} />}
              onClick={onManageTags}
            >
              Manage Tags
            </Button>
          </Group>
          <Group>
            <Badge size="lg" variant="light">
              {event.Tickets.length}{" "}
              {event.Tickets.length === 1 ? "Ticket" : "Tickets"}
            </Badge>
            {event.Location && (
              <Badge size="lg" variant="light">
                {event.Location.name}
              </Badge>
            )}
            {event.tags && event.tags.length > 0 && (
              <>
                {event.tags.map((tag) => (
                  <Badge key={tag.id} size="lg" variant="light" color="blue">
                    {tag.name}
                  </Badge>
                ))}
              </>
            )}
          </Group>
          {event.description && (
            <div dangerouslySetInnerHTML={{ __html: event.description }} />
          )}
          <Text size="lg">
            {dayjs(event.startsAt).format("MMM D, YYYY h:mm A")} -{" "}
            {dayjs(event.endsAt).format("MMM D, YYYY h:mm A")}
          </Text>
          {event.Location?.address && (
            <Text size="lg" c="dimmed">
              {event.Location.address}
            </Text>
          )}

          <Group mt="xl" gap="xl">
            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                Total Tickets Sold
              </Text>
              <Title order={3}>{event.Tickets.length}</Title>
            </Stack>
            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                Total Revenue
              </Text>
              <Title order={3}>
                $
                {(
                  event.Tickets.reduce(
                    (sum: number, ticket: Ticket) => sum + ticket.price,
                    0
                  ) / 100
                ).toFixed(2)}
              </Title>
            </Stack>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
