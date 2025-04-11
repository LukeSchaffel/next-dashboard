"use client";
import { Stack, TextInput, Button, LoadingOverlay, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface PurchaseFormProps {
  price: number;
  purchaseLinkId: string;
}

export default function PurchaseForm({
  price,
  purchaseLinkId,
}: PurchaseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/purchase-links/${purchaseLinkId}/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to purchase ticket");
      }

      const data = await response.json();
      router.push(`/purchase/success?ticketId=${data.id}`);
    } catch (error) {
      console.error("Failed to purchase ticket:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        {error && (
          <Text c="red" size="sm">
            {error}
          </Text>
        )}
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
          Purchase Ticket for ${(price / 100).toFixed(2)}
        </Button>
      </Stack>
    </form>
  );
}
