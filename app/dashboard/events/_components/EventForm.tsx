"use client";
import { IconPlus } from "@tabler/icons-react";
import {
  TextInput,
  Modal,
  Button,
  Flex,
  LoadingOverlay,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";

import { EventWithLocation } from "@/lib/prisma";
import { Location } from "@prisma/client";
import { SetStateAction, useEffect, useState } from "react";
import { useEventStore } from "@/stores/useEventStore";
import { useLocationStore } from "@/stores/useLocationStore";

const EventForm = ({
  userRole,
  selectedEvent,
  setSelectedEvent,
}: {
  userRole: any;
  selectedEvent?: EventWithLocation;
  setSelectedEvent: React.Dispatch<
    SetStateAction<EventWithLocation | undefined>
  >;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const { locations, fetchLocations } = useLocationStore();
  const { createEvent, updateEvent } = useEventStore();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      startsAt: dayjs().toDate(),
      endsAt: dayjs().add(1, 'hour').toDate(),
      description: "",
      locationId: "",
    },

    validate: {
      endsAt: (value, values) => 
        dayjs(value).isAfter(dayjs(values.startsAt)) 
          ? null 
          : "End time must be after start time",
    },
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCancel = () => {
    form.reset();
    setLoading(false);
    setSelectedEvent(undefined);
    close();
  };

  useEffect(() => {
    if (selectedEvent) {
      open();
      const { name, startsAt, endsAt, description, locationId } = selectedEvent;
      form.setValues((prev) => ({
        ...prev,
        name,
        startsAt: dayjs(startsAt).toDate(),
        endsAt: dayjs(endsAt).toDate(),
        description: description || "",
        locationId: locationId || "",
      }));
    }
  }, [selectedEvent]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (selectedEvent) {
        await updateEvent(selectedEvent.id, {
          ...values,
          workspaceId: userRole.workspaceId,
        });
      } else {
        await createEvent({
          ...values,
          workspaceId: userRole.workspaceId,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      handleCancel();
    }
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title={selectedEvent ? "Edit event" : "Create a new event"}
        centered
        closeButtonProps={{ onClick: handleCancel }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <LoadingOverlay
            visible={loading}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }}
          />
          <Flex gap={"md"} direction={"column"}>
            <TextInput
              label="Event name"
              placeholder="My event"
              required
              {...form.getInputProps("name")}
            />
            <DateTimePicker
              label="Start date and time"
              placeholder="Start date and time"
              required
              valueFormat="MM/DD/YY hh:mm A"
              {...form.getInputProps("startsAt")}
            />
            <DateTimePicker
              label="End date and time"
              placeholder="End date and time"
              required
              valueFormat="MM/DD/YY hh:mm A"
              {...form.getInputProps("endsAt")}
            />
            <TextInput
              label="Description"
              placeholder="Describe this event"
              required
              {...form.getInputProps("description")}
            />
            <Select
              label="Location"
              placeholder="Select a location"
              data={locations.map((loc) => ({
                value: loc.id,
                label: loc.name,
              }))}
              clearable
              {...form.getInputProps("locationId")}
            />
            <Button type="submit">Submit</Button>
          </Flex>
        </form>
      </Modal>

      <Button variant="filled" onClick={open} leftSection={<IconPlus />}>
        New event
      </Button>
    </>
  );
};

export default EventForm;
