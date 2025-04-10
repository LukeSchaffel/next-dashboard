"use client";
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Button,
  TextInput,
  NumberInput,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import { use } from "react";

interface PurchaseLink {
  id: string;
  price: number;
  Event: {
    name: string;
    description: string | null;
    startsAt: Date;
    endsAt: Date;
    Location: {
      name: string;
      address: string | null;
    } | null;
  };
}

export default function PurchasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [purchaseLink, setPurchaseLink] = useState<PurchaseLink | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
    },
    validate: {
      name: (value) => (value.length < 1 ? "Name is required" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  useEffect(() => {
    const fetchPurchaseLink = async () => {
      try {
        const res = await fetch(`/api/purchase-links/${id}`);
        if (!res.ok) {
          notFound();
        }
        const data = await res.json();
        setPurchaseLink(data);
      } catch (error) {
        console.error("Failed to fetch purchase link:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseLink();
  }, [id]);

  const handlePurchase = async (values: typeof form.values) => {
    try {
      const response = await fetch(`/api/purchase-links/${id}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        // TODO: Handle successful purchase (e.g., redirect to success page)
        console.log("Purchase successful!");
      }
    } catch (error) {
      console.error("Failed to purchase ticket:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!purchaseLink) {
    return notFound();
  }

  return (
    <Container size="sm" py="xl">
      <Paper p="xl" withBorder>
        <Stack gap="xl">
          <Stack gap="xs">
            <Title order={2}>{purchaseLink.Event.name}</Title>
            {purchaseLink.Event.description && (
              <Text c="dimmed">{purchaseLink.Event.description}</Text>
            )}
            <Text>
              {dayjs(purchaseLink.Event.startsAt).format("MMM D, YYYY h:mm A")}{" "}
              - {dayjs(purchaseLink.Event.endsAt).format("MMM D, YYYY h:mm A")}
            </Text>
            {purchaseLink.Event.Location && (
              <Text c="dimmed">
                {purchaseLink.Event.Location.name}
                {purchaseLink.Event.Location.address && (
                  <> - {purchaseLink.Event.Location.address}</>
                )}
              </Text>
            )}
          </Stack>

          <Group justify="space-between" align="flex-end">
            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                Price
              </Text>
              <Title order={3}>${(purchaseLink.price / 100).toFixed(2)}</Title>
            </Stack>
          </Group>

          <form onSubmit={form.onSubmit(handlePurchase)}>
            <Stack gap="md">
              <TextInput
                label="Name"
                placeholder="Your name"
                required
                {...form.getInputProps("name")}
              />
              <TextInput
                label="Email"
                placeholder="your@email.com"
                required
                {...form.getInputProps("email")}
              />
              <Button type="submit" size="lg" fullWidth>
                Purchase Ticket
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Container>
  );
}
