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
import {
  IconEdit,
  IconTable,
  IconMaximize,
  IconMinimize,
  IconTag,
} from "@tabler/icons-react";
import Link from "next/link";
import { Event, Ticket } from "@prisma/client";
import dayjs from "dayjs";
import ImageUploader from "../../../_components/ImageUploader";
import { EventWithDetails } from "@/stores/useEventStore";

interface EventOverviewProps {
  event: EventWithDetails;
  onEditDescription: () => void;
  onToggleFullscreen: () => void;
  fullscreen: boolean;
  onManageTags: () => void;
  imagePath: string | null;
  onImageUploaded: (path: string) => void;
  onImageRemoved: () => void;
}

export default function EventOverview({
  event,
  onEditDescription,
  onToggleFullscreen,
  fullscreen,
  onManageTags,
  imagePath,
  onImageUploaded,
  onImageRemoved,
}: EventOverviewProps) {
  return (
    <Stack gap="xl">
      <Paper p="xl" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={2}>{event.name}</Title>
            <Group>
              <Tooltip label="Edit event description">
                <Button
                  variant="light"
                  leftSection={<IconEdit size={16} />}
                  onClick={onEditDescription}
                >
                  Edit Description
                </Button>
              </Tooltip>
              <Tooltip
                label={
                  event.eventLayout
                    ? "View event layout"
                    : "Create event layout"
                }
              >
                <Link href={`/dashboard/events/${event.id}/event-layout`}>
                  <Button variant="light" leftSection={<IconTable size={16} />}>
                    {event.eventLayout
                      ? "View Event Layout"
                      : "Create Event Layout"}
                  </Button>
                </Link>
              </Tooltip>
              {event.eventLayout && (
                <Tooltip label="View seating chart in fullscreen">
                  <Button
                    variant="light"
                    leftSection={
                      fullscreen ? (
                        <IconMinimize size={16} />
                      ) : (
                        <IconMaximize size={16} />
                      )
                    }
                    onClick={onToggleFullscreen}
                  >
                    View Seating Chart
                  </Button>
                </Tooltip>
              )}
            </Group>
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
            <Button
              variant="subtle"
              leftSection={<IconTag size={16} />}
              onClick={onManageTags}
            >
              Manage Tags
            </Button>
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

          <ImageUploader
            type="events"
            workspaceId={event.workspaceId}
            currentImagePath={imagePath}
            onImageUploaded={onImageUploaded}
            onImageRemoved={onImageRemoved}
            resourceId={event.id}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
