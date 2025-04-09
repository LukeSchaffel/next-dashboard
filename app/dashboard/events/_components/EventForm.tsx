"use client";
import { User } from "@prisma/client";
import { IconPlus } from "@tabler/icons-react";
import {
  Container,
  Paper,
  TextInput,
  Title,
  Modal,
  Button,
  Flex,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { DateInput } from "@mantine/dates";

const EventForm = ({ userRole }: { userRole: any }) => {
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      startsAt: "",
      endsAt: "",
      description: "",
    },

    validate: {
      // email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  const handleSubmit = (values: any) => {
    console.log(values);
  };
  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Create a new event"
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
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
