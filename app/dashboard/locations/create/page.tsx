"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Title,
  TextInput,
  Button,
  Group,
  Paper,
  Grid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

import { useLocationStore } from "@/stores/useLocationStore";
import { formatPhoneNumber, unformatPhoneNumber } from "@/lib";
import DescriptionEditor from "../_components/DescriptionEditor";

interface LocationFormValues {
  name: string;
  address: string;
  description: string;
  phoneNumber: string;
  email: string;
  website: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
}

export default function CreateLocationPage() {
  const router = useRouter();
  const { createLocation, loading } = useLocationStore();

  const form = useForm<LocationFormValues>({
    initialValues: {
      name: "",
      address: "",
      description: "",
      phoneNumber: "",
      email: "",
      website: "",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      linkedinUrl: "",
    },
    validate: {
      name: (value) => (!value ? "Name is required" : null),
      email: (value) =>
        value && !/^\S+@\S+$/.test(value) ? "Invalid email" : null,
      website: (value) =>
        value && !/^https?:\/\/.+/.test(value) ? "Invalid URL" : null,
      facebookUrl: (value) =>
        value && !/^https?:\/\/.+/.test(value) ? "Invalid URL" : null,
      instagramUrl: (value) =>
        value && !/^https?:\/\/.+/.test(value) ? "Invalid URL" : null,
      twitterUrl: (value) =>
        value && !/^https?:\/\/.+/.test(value) ? "Invalid URL" : null,
      linkedinUrl: (value) =>
        value && !/^https?:\/\/.+/.test(value) ? "Invalid URL" : null,
      phoneNumber: (value) => {
        if (!value) return "Phone number is required";
        const digits = value.replace(/\D/g, "");
        if (digits.length !== 10) return "Phone number must be 10 digits";
        return null;
      },
    },
  });

  const [displayPhoneNumber, setDisplayPhoneNumber] = useState("");

  const handlePhoneNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawValue = unformatPhoneNumber(event.target.value);
    const formatted = formatPhoneNumber(rawValue);
    setDisplayPhoneNumber(formatted);
    form.setFieldValue("phoneNumber", rawValue);
  };

  const handleSubmit = async (values: LocationFormValues) => {
    try {
      // Ensure phone number is stored as raw digits
      const submitValues = {
        ...values,
        phoneNumber: unformatPhoneNumber(values.phoneNumber),
      };
      const location = await createLocation(submitValues);
      router.push(`/dashboard/locations/${location.id}`);
    } catch (error) {
      console.error("Failed to create location:", error);
    }
  };

  const backButton = (
    <Group>
      <Link href="/dashboard/locations">
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />}>
          Back to Locations
        </Button>
      </Link>
    </Group>
  );

  return (
    <Stack gap="xl">
      {backButton}
      <Title order={2}>Create New Location</Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="xl">
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Title order={3}>Location Details</Title>
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Location Name"
                    placeholder="Enter location name"
                    required
                    {...form.getInputProps("name")}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Address"
                    placeholder="Enter location address"
                    required
                    {...form.getInputProps("address")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  {/* <Stack gap="xs">
                    <Title order={4}>Description</Title>
                    <DescriptionEditor
                      value={form.values.description}
                      onChange={(value) =>
                        form.setFieldValue("description", value)
                      }
                    />
                  </Stack> */}
                </Grid.Col>
              </Grid>
            </Stack>
          </Paper>

          <Paper p="md" withBorder>
            <Stack gap="md">
              <Title order={3}>Contact Information</Title>
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Phone Number"
                    placeholder="(555) 123-4567"
                    value={displayPhoneNumber}
                    onChange={handlePhoneNumberChange}
                    maxLength={14}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Email"
                    placeholder="contact@location.com"
                    {...form.getInputProps("email")}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Website"
                    placeholder="https://www.location.com"
                    {...form.getInputProps("website")}
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Paper>

          <Paper p="md" withBorder>
            <Stack gap="md">
              <Title order={3}>Social Media</Title>
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Facebook"
                    placeholder="https://facebook.com/location"
                    {...form.getInputProps("facebookUrl")}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Instagram"
                    placeholder="https://instagram.com/location"
                    {...form.getInputProps("instagramUrl")}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Twitter"
                    placeholder="https://twitter.com/location"
                    {...form.getInputProps("twitterUrl")}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="LinkedIn"
                    placeholder="https://linkedin.com/company/location"
                    {...form.getInputProps("linkedinUrl")}
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Paper>

          <Group justify="flex-end">
            <Button type="submit" loading={loading}>
              Create Location
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
