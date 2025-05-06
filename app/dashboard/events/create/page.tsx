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
  Checkbox,
  SegmentedControl,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateTimePicker } from "@mantine/dates";
import { useLocationStore } from "@/stores/useLocationStore";
import { useEventStore } from "@/stores/useEventStore";
import type { EventSeriesWithDetails } from "@/stores/useEventStore";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowLeft,
  IconEdit,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import DescriptionEditor from "../_components/DescriptionEditor";

type EventType = "single" | "series";

interface EventInstance {
  name: string;
  startsAt: Date;
  endsAt: Date;
}

interface EventFormValues {
  type: EventType;
  name: string;
  description: string;
  locationId: string;
  // Series specific fields
  seriesStartDate: Date;
  seriesEndDate: Date;
  // Event instances
  instances: EventInstance[];
  use_layout_template: boolean;
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
      type: "single",
      name: "",
      description: "",
      locationId: "",
      seriesStartDate: new Date(),
      seriesEndDate: new Date(),
      instances: [{ name: "", startsAt: new Date(), endsAt: new Date() }],
      use_layout_template: false,
    },
    validate: {
      name: (value) => (!value ? "Name is required" : null),
      description: (value) => (!value ? "Description is required" : null),
      instances: {
        name: (value, values) =>
          values.type === "series" && !value ? "Event name is required" : null,
        startsAt: (value) => (!value ? "Start date is required" : null),
        endsAt: (value) => (!value ? "End date is required" : null),
      },
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

  const addInstance = () => {
    form.insertListItem("instances", {
      name: "",
      startsAt: new Date(),
      endsAt: new Date(),
    });
  };

  const removeInstance = (index: number) => {
    form.removeListItem("instances", index);
  };

  const handleSubmit = async (values: EventFormValues) => {
    try {
      if (values.type === "single") {
        const eventData = {
          type: "single" as const,
          name: values.name,
          description: values.description,
          locationId: values.locationId || undefined,
          startsAt: values.instances[0].startsAt,
          endsAt: values.instances[0].endsAt,
          use_layout_template: values.use_layout_template,
        };
        const event = await createEvent(eventData);
        if (!Array.isArray(event)) {
          router.push(`/dashboard/events/${event.id}`);
        }
      } else {
        const seriesData = {
          type: "series" as const,
          name: values.name,
          description: values.description,
          startDate: values.seriesStartDate,
          endDate: values.seriesEndDate,
          use_layout_template: values.use_layout_template,
          locationId: values.locationId || undefined,
          events: values.instances.map((instance) => ({
            name: instance.name,
            description: values.description,
            startsAt: instance.startsAt,
            endsAt: instance.endsAt,
          })),
        };
        const events = await createEvent(seriesData);
        if (Array.isArray(events) && events.length > 0) {
          router.push(`/dashboard/events/`);
        }
      }
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
              <Title order={3}>Event Type</Title>
              <SegmentedControl
                data={[
                  { label: "Single Event", value: "single" },
                  { label: "Event Series", value: "series" },
                ]}
                {...form.getInputProps("type")}
              />
            </Stack>
          </Paper>

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
              </Grid>
            </Stack>
          </Paper>

          {form.values.type === "series" && (
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={3}>Series Schedule</Title>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={addInstance}
                    variant="light"
                  >
                    Add Event
                  </Button>
                </Group>
                <Grid>
                  <Grid.Col span={6}>
                    <DateTimePicker
                      label="Series Start Date"
                      placeholder="Select start date"
                      required
                      {...form.getInputProps("seriesStartDate")}
                      valueFormat="MM/DD/YY hh:mm A"
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <DateTimePicker
                      label="Series End Date"
                      placeholder="Select end date"
                      required
                      {...form.getInputProps("seriesEndDate")}
                      valueFormat="MM/DD/YY hh:mm A"
                    />
                  </Grid.Col>
                </Grid>
                <Divider />
                <Stack gap="md">
                  {form.values.instances.map((_, index) => (
                    <Paper key={index} p="md" withBorder>
                      <Stack gap="md">
                        <Group justify="space-between">
                          <Title order={4}>Event {index + 1}</Title>
                          {index > 0 && (
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              onClick={() => removeInstance(index)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          )}
                        </Group>
                        <Grid>
                          <Grid.Col span={12}>
                            <TextInput
                              label="Event Name"
                              placeholder="Enter event name"
                              required
                              {...form.getInputProps(`instances.${index}.name`)}
                            />
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <DateTimePicker
                              label="Start Date & Time"
                              placeholder="Select start date and time"
                              required
                              {...form.getInputProps(
                                `instances.${index}.startsAt`
                              )}
                              valueFormat="MM/DD/YY hh:mm A"
                            />
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <DateTimePicker
                              label="End Date & Time"
                              placeholder="Select end date and time"
                              required
                              {...form.getInputProps(
                                `instances.${index}.endsAt`
                              )}
                              valueFormat="MM/DD/YY hh:mm A"
                            />
                          </Grid.Col>
                        </Grid>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          )}

          {form.values.type === "single" && (
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Schedule</Title>
                <Grid>
                  <Grid.Col span={6}>
                    <DateTimePicker
                      label="Start Date & Time"
                      placeholder="Select start date and time"
                      required
                      {...form.getInputProps("instances.0.startsAt")}
                      valueFormat="MM/DD/YY hh:mm A"
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <DateTimePicker
                      label="End Date & Time"
                      placeholder="Select end date and time"
                      required
                      {...form.getInputProps("instances.0.endsAt")}
                      valueFormat="MM/DD/YY hh:mm A"
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>
          )}

          {templateLayout && (
            <Paper p="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Seating Layout</Title>
                <Text>
                  This location has a template seating layout available. You can
                  use it as a starting point for your events seating
                  arrangement.
                </Text>
                <Checkbox
                  label="Use template seating layout"
                  {...form.getInputProps("use_layout_template", {
                    type: "checkbox",
                  })}
                />
              </Stack>
            </Paper>
          )}

          <Group justify="flex-end">
            <Button type="submit" loading={eventLoading}>
              Create {form.values.type === "single" ? "Event" : "Event Series"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
