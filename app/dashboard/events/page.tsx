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
  Badge,
} from "@mantine/core";
import { EventWithLocation } from "@/lib/prisma";

import { Table } from "@/lib/components";
import EventForm from "./_components/EventForm";
import { useContext, useEffect, useState } from "react";
import { DashboardContext } from "../_components/client-layout";
import dayjs from "dayjs";
import Link from "next/link";
import { IconEye } from "@tabler/icons-react";

export default function EventsPage() {
  const { userRole } = useContext(DashboardContext);
  const [events, setEvents] = useState<EventWithLocation[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<
    EventWithLocation | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getEvents = async () => {
      setLoading(true);
      const res = await fetch(
        `/api/events?workspaceId=${userRole.workspaceId}`
      );
      const eventsJSON = await res.json();
      setEvents(eventsJSON);
      setLoading(false);
    };
    getEvents();
  }, []);

  const handleAddEvent = (event: EventWithLocation) => {
    setEvents([...events, event]);
  };

  const handleUpdateEvent = (event: EventWithLocation) => {
    setEvents((prev) => prev.map((evt) => (evt.id === event.id ? event : evt)));
  };

  const handleDeleteEvent = async (event: EventWithLocation) => {
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
      if (res.ok) {
        const deltedEvent = res.json();
        setEvents((prev) => [...prev].filter((e) => e.id !== event.id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Flex justify={"space-between"}>
        <Title order={4}>Upcoming events</Title>
        <EventForm
          userRole={userRole}
          handleAddEvent={handleAddEvent}
          selectedEvent={selectedEvent}
          setSelectedEvent={setSelectedEvent}
          handleUpdateEvent={handleUpdateEvent}
        />
      </Flex>

      <Table
        loading={loading}
        data={{
          caption: "My events",
          head: [
            "",
            "Name",
            "Description",
            "Location",
            "Start",
            "End",
            "Tickets",
            "",
          ],
          body: events.map((evt) => {
            return [
              <Link href={`/dashboard/events/${evt.id}`} key={evt.id}>
                <Button variant="subtle" leftSection={<IconEye size={16} />}>
                  View
                </Button>
              </Link>,
              evt.name,
              evt.description,
              evt.Location?.name || "No location",
              dayjs(evt.startsAt).format("MM/DD/YYYY"),
              dayjs(evt.endsAt).format("MM/DD/YYYY"),
              <Badge size="lg" variant="light">
                {evt.Tickets?.length || 0}{" "}
                {evt.Tickets?.length === 1 ? "Ticket" : "Tickets"}
              </Badge>,
              <Flex>
                <Button variant="subtle" onClick={() => setSelectedEvent(evt)}>
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
                      onClick={() => handleDeleteEvent(evt)}
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
