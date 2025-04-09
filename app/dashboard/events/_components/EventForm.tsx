"use client";
import { IconPlus } from "@tabler/icons-react";
import { TextInput, Modal, Button, Flex, LoadingOverlay } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";

import { Event } from "@prisma/client";
import { SetStateAction, useEffect, useState } from "react";

const EventForm = ({
  userRole,
  handleAddEvent,
  selectedEvent,
  setSelectedEvent,
  handleUpdateEvent,
}: {
  userRole: any;
  handleAddEvent: (event: Event) => void;
  selectedEvent?: Event;
  setSelectedEvent: React.Dispatch<SetStateAction<Event | undefined>>;
  handleUpdateEvent: (event: Event) => void;
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      startsAt: dayjs(),
      endsAt: dayjs(),
      description: "",
    },

    validate: {
      // email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  const handleCancel = () => {
    form.reset();
    setLoading(false);
    setSelectedEvent(undefined);
    close();
  };

  useEffect(() => {
    if (selectedEvent) {
      open();
      const { startsAt, endsAt, name, description } = selectedEvent;
      form.setValues((prev) => ({
        ...prev,
        name,
        description: description || "",
        startsAt: dayjs(startsAt),
        endsAt: dayjs(endsAt),
      }));
    }
  }, [selectedEvent]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (selectedEvent) {
        const response = await fetch(`/api/events/${selectedEvent.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            userRoleId: userRole.id, // Assuming userRole has an id
            workspaceId: userRole.workspaceId, // Assuming userRole has a workspaceId
          }),
        });

        if (response.ok) {
          const event: Event = await response.json();
          handleUpdateEvent(event);
        } else {
          console.error("Failed to update event", response);
        }
      } else {
        const response = await fetch("/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            userRoleId: userRole.id, // Assuming userRole has an id
            workspaceId: userRole.workspaceId, // Assuming userRole has a workspaceId
          }),
        });

        if (response.ok) {
          const event: Event = await response.json();
          handleAddEvent(event);
        } else {
          console.error("Failed to create event");
        }
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
        title="Create a new event"
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
            <DateInput
              label="Start date"
              placeholder="Start date"
              required
              {...form.getInputProps("startsAt")}
            />
            <DateInput
              label="End date"
              placeholder="Start date"
              required
              {...form.getInputProps("endsAt")}
            />
            <TextInput
              label="Description"
              placeholder="Describe this event"
              required
              {...form.getInputProps("description")}
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
