"use client";
import {
  Flex,
  Title,
  Button,
  Box,
  Popover,
  Text,
  ScrollArea,
  Anchor,
  Group,
  Badge,
  SimpleGrid,
  SegmentedControl,
} from "@mantine/core";
import { EventWithDetails } from "@/stores/useEventStore";

import { Table } from "@/lib/components";
import { useContext, useEffect, useState } from "react";
import { DashboardContext } from "../_components/client-layout";
import Link from "next/link";
import {
  IconEye,
  IconRefresh,
  IconCalendar,
  IconTable,
  IconPlus,
} from "@tabler/icons-react";
import { useEventStore } from "@/stores/useEventStore";
import CalendarView from "./_components/CalendarView";

type ViewType = "table" | "calendar";

export default function EventsPage() {
  const { userRole } = useContext(DashboardContext);
  const [selectedEvent, setSelectedEvent] = useState<EventWithDetails | undefined>(undefined);
  const [view, setView] = useState<ViewType>("table");
  const { events, loading, hasFetched, fetchEvents, deleteEvent } =
    useEventStore();

  useEffect(() => {
    if (!hasFetched) {
      fetchEvents();
    }
  }, [hasFetched, fetchEvents]);

  return (
    <>
      <Flex justify={"space-between"} align="center">
        <Group>
          <Title order={4}>Events</Title>
          <Button
            variant="subtle"
            leftSection={<IconRefresh size={16} />}
            onClick={fetchEvents}
            loading={loading}
          >
            Refresh
          </Button>
        </Group>
        <Group>
          <SegmentedControl
            value={view}
            onChange={(value) => setView(value as ViewType)}
            data={[
              { label: <IconTable size={16} />, value: "table" },
              { label: <IconCalendar size={16} />, value: "calendar" },
            ]}
          />
          <Link href="/dashboard/events/create">
            <Button leftSection={<IconPlus size={16} />}>New Event</Button>
          </Link>
        </Group>
      </Flex>

      {view === "table" ? (
        <Table
          loading={loading}
          data={{
            caption: "My events",
            head: [
              "",
              "Name",
              "Location",
              "Start Date",
              "End Date",
              "Tickets",
              "",
            ],
            body: events.map((event) => {
              return [
                <Link
                  href={`/dashboard/events/${event.id}`}
                  key={`view-${event.id}`}
                >
                  <Button variant="subtle" leftSection={<IconEye size={16} />}>
                    View
                  </Button>
                </Link>,
                event.name,
                event.Location?.name || "No location",
                event.startsAt
                  ? new Date(event.startsAt).toLocaleString()
                  : "Not set",
                event.endsAt
                  ? new Date(event.endsAt).toLocaleString()
                  : "Not set",
                <Badge key={`badge-${event.id}`} size="lg" variant="light">
                  {event.Tickets?.length || 0}{" "}
                  {event.Tickets?.length === 1 ? "Ticket" : "Tickets"}
                </Badge>,
                <Flex key={`actions-${event.id}`}>
                  <Button
                    variant="subtle"
                    onClick={() => setSelectedEvent(event)}
                  >
                    Edit
                  </Button>

                  <Popover shadow="md">
                    <Popover.Target>
                      <Button color="red" variant="transparent">
                        Delete
                      </Button>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Text size="xs">
                        Are you sure you want to delete this?
                      </Text>
                      <Button
                        variant="transparent"
                        size="xs"
                        onClick={() => deleteEvent(event.id)}
                        color="red"
                      >
                        Yes
                      </Button>
                    </Popover.Dropdown>
                  </Popover>
                </Flex>,
              ];
            }),
          }}
        />
      ) : (
        <CalendarView events={events} />
      )}
    </>
  );
}
