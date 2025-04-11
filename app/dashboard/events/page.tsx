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
} from "@mantine/core";
import { EventWithLocation } from "@/lib/prisma";

import { Table } from "@/lib/components";
import EventForm from "./_components/EventForm";
import { useContext, useEffect, useState } from "react";
import { DashboardContext } from "../_components/client-layout";
import Link from "next/link";
import { IconEye, IconRefresh } from "@tabler/icons-react";
import { useEventStore } from "@/stores/useEventStore";

export default function EventsPage() {
  const { userRole } = useContext(DashboardContext);
  const [selectedEvent, setSelectedEvent] = useState<EventWithLocation | undefined>(undefined);
  const { events, loading, hasFetched, fetchEvents, deleteEvent } = useEventStore();

  useEffect(() => {
    if (!hasFetched) {
      fetchEvents();
    }
  }, [hasFetched, fetchEvents]);

  return (
    <>
      <Flex justify={"space-between"}>
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
        <EventForm
          userRole={userRole}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
        />
      </Flex>

      <Table
        loading={loading}
        data={{
          caption: "My events",
          head: ["", "Name", "Location", "Start Date", "End Date", "Tickets", ""],
          body: events.map((event) => {
            return [
              <Link href={`/dashboard/events/${event.id}`} key={event.id}>
                <Button variant="subtle" leftSection={<IconEye size={16} />}>
                  View
                </Button>
              </Link>,
              event.name,
              event.Location?.name || "No location",
              event.startsAt ? new Date(event.startsAt).toLocaleString() : "Not set",
              event.endsAt ? new Date(event.endsAt).toLocaleString() : "Not set",
              <Badge size="lg" variant="light">
                {event.Tickets?.length || 0} {event.Tickets?.length === 1 ? "Ticket" : "Tickets"}
              </Badge>,
              <Flex>
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
                    <Text size="xs">Are you sure you want to delete this?</Text>
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
    </>
  );
}
