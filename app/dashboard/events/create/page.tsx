"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Title,
  TextInput,
  Button,
  Group,
  Select,
  NumberInput,
  Paper,
  Grid,
  Divider,
  Text,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateTimePicker } from "@mantine/dates";
import { useLocationStore } from "@/stores/useLocationStore";
import { useEventStore } from "@/stores/useEventStore";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowLeft, IconEdit } from "@tabler/icons-react";
import Link from "next/link";
import DescriptionEditor from "../_components/DescriptionEditor";

interface EventFormValues {
  name: string;
  description: string;
  locationId: string;
  startsAt: Date;
  endsAt: Date;
}

export default function CreateEventPage() {
  const router = useRouter();
  const {
    locations,
    loading: locationsLoading,
    hasFetched: locationsFetched,
    fetchLocations,
  } = useLocationStore();
  const { createEvent, loading: eventLoading } = useEventStore();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [templateLayout, setTemplateLayout] = useState<any>(null);
  useEffect(() => {
    if (!locationsFetched) {
      fetchLocations();
    }
  }, [locationsFetched, fetchLocations]);
  const form = useForm<EventFormValues>({
    initialValues: {
      name: "",
      description: "",
      locationId: "",
      startsAt: new Date(),
      endsAt: new Date(),
    },
    validate: {
      name: (value) => (!value ? "Name is required" : null),
      startsAt: (value) => (!value ? "Start date is required" : null),
      endsAt: (value) => (!value ? "End date is required" : null),
    },
  });

  const handleLocationChange = async (locationId: string) => {
    setSelectedLocation(locationId);
    const selectedLocation = locations.find((l) => l.id === locationId);

    if (selectedLocation?.templateLayout) {
      setTemplateLayout(selectedLocation.templateLayout);
    } else {
      setTemplateLayout(null);
    }
  };

  const handleSubmit = async (values: EventFormValues) => {
    try {
      const eventData = {
        ...values,
        locationId: values.locationId || undefined, // Convert empty string to undefined
      };
      const event = await createEvent(eventData);
      router.push(`/dashboard/events/${event.id}`);
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  };

  const handleDescriptionUpdate = (event: any) => {
    form.setFieldValue("description", event.description);
  };

  const backButton = (
    <Group>
      <Link href="/dashboard/events">
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />}>
          Back to Events
        </Button>
      </Link>
    </Group>
  );

  return (
    <Stack gap="xl">
      {backButton}
      <Title order={2}>Create New Event</Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="xl">
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Title order={3}>Event Details</Title>
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Event Name"
                    placeholder="Enter event name"
                    required
                    {...form.getInputProps("name")}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label="Location"
                    placeholder="Select a location"
                    data={locations.map((location) => ({
                      value: location.id,
                      label: location.name,
                    }))}
                    value={form.values.locationId}
                    onChange={(value) => {
                      if (value) {
                        form.setFieldValue("locationId", value);
                        handleLocationChange(value);
                      }
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>
                      Description
                    </Text>
                    <DescriptionEditor
                      value={form.values.description}
                      onChange={(value) =>
                        form.setFieldValue("description", value)
                      }
                    />
                  </Stack>
                </Grid.Col>
                <Grid.Col span={6}>
                  <DateTimePicker
                    label="Start Date & Time"
                    placeholder="Select start date and time"
                    required
                    {...form.getInputProps("startsAt")}
                    valueFormat="MM/DD/YY hh:mm A"
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <DateTimePicker
                    label="End Date & Time"
                    placeholder="Select end date and time"
                    required
                    {...form.getInputProps("endsAt")}
                    valueFormat="MM/DD/YY hh:mm A"
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Paper>

          {templateLayout && (
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Seating Layout</Title>
                <Text>
                  A template layout is available for this location. You can use
                  it as a starting point for your event's seating layout.
                </Text>
                <Button
                  variant="light"
                  onClick={() => {
                    // TODO: Implement template layout copying
                    console.log("Copy template layout");
                  }}
                >
                  Use Template Layout
                </Button>
              </Stack>
            </Paper>
          )}

          <Group justify="flex-end">
            <Button type="submit" loading={eventLoading}>
              Create Event
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
