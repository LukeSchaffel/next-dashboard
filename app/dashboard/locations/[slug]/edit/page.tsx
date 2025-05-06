"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Title,
  TextInput,
  Button,
  Group,
  Paper,
  Grid,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useLocationStore } from "@/stores/useLocationStore";
import DescriptionEditor from "../../_components/DescriptionEditor";
import { Location } from "@prisma/client";
import { use } from "react";

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

export default function EditLocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { updateLocation, loading } = useLocationStore();
  const [location, setLocation] = useState<Location | null>(null);
  const [fetching, setFetching] = useState(true);

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
    },
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch(`/api/locations/${slug}`);
        if (!res.ok) throw new Error("Failed to fetch location");
        const data = await res.json();
        setLocation(data);
        form.setValues({
          name: data.name,
          address: data.address || "",
          description: data.description || "",
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
          website: data.website || "",
          facebookUrl: data.facebookUrl || "",
          instagramUrl: data.instagramUrl || "",
          twitterUrl: data.twitterUrl || "",
          linkedinUrl: data.linkedinUrl || "",
        });
      } catch (error) {
        console.error("Failed to fetch location:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchLocation();
  }, [slug]);

  const handleSubmit = async (values: LocationFormValues) => {
    try {
      await updateLocation(slug, values);
      router.push(`/dashboard/locations/${slug}`);
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  };

  const backButton = (
    <Group>
      <Link href={`/dashboard/locations/${slug}`}>
        <Button variant="subtle" leftSection={<IconArrowLeft size={16} />}>
          Back to Location
        </Button>
      </Link>
    </Group>
  );

  if (fetching) {
    return <div>Loading...</div>;
  }

  if (!location) {
    return <div>Location not found</div>;
  }

  return (
    <Stack gap="xl">
      {backButton}
      <Title order={2}>Edit Location</Title>

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
                    placeholder="+1 (555) 123-4567"
                    {...form.getInputProps("phoneNumber")}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Email"
                    placeholder="contact@location.com"
                    {...form.getInputProps("email")}
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
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Stack>
  );
}
