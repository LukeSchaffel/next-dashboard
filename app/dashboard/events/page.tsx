"use client";
import {
  Flex,
  Title,
  Table,
  Paper,
  Button,
  LoadingOverlay,
  Box,
} from "@mantine/core";
import { Event } from "@prisma/client";

import EventForm from "./_components/EventForm";
import { useContext, useEffect, useState } from "react";
import { DashboardContext } from "../_components/client-layout";
import dayjs from "dayjs";

export default function EventsPage() {
  const { userRole } = useContext(DashboardContext);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(
    undefined
  );
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

  const handleAddEvent = (event: Event) => {
    setEvents([...events, event]);
  };

  const handleUpdateEvent = (event: Event) => {
    setEvents((prev) => prev.map((evt) => (evt.id === event.id ? event : evt)));
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
      <Box style={{ position: "relative" }}>
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <Table
          withTableBorder
          highlightOnHover
          striped
          mt={"md"}
          data={{
            caption: "My events",
            head: ["Name", "Description", "Location", "Start", "End", ""],
            body: events.map((evt) => {
              return [
                evt.name,
                evt.description,
                "n/a",
                dayjs(evt.startsAt).format("MM/DD/YYYY"),
                dayjs(evt.endsAt).format("MM/DD/YYYY"),
                <Button variant="subtle" onClick={() => setSelectedEvent(evt)}>
                  Edit
                </Button>,
              ];
            }),
          }}
        />
      </Box>
    </>
  );
}
