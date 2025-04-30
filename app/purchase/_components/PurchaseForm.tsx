"use client";
import {
  Stack,
  TextInput,
  Button,
  LoadingOverlay,
  Text,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface PurchaseFormProps {
  price: number;
  ticketTypeId: string;
  selectedSeatIds: string[];
  quantity: number;
}

export default function PurchaseForm({
  price,
  ticketTypeId,
  selectedSeatIds,
  quantity,
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
    if (selectedSeatIds.length === 0) {
      setError("Please select at least one seat");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/ticket-types/${ticketTypeId}/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            seatIds: selectedSeatIds,
            quantity: quantity,
          }),
        }
      );

      if (response.ok) {
        const { purchaseId } = await response.json();
        router.push(`/purchase/success?purchaseId=${purchaseId}`);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to purchase tickets");
      }
    } catch (error) {
      console.error("Failed to purchase tickets:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
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
        <Button type="submit">
          Purchase {quantity} {quantity === 1 ? "Ticket" : "Tickets"} for $
          {(price / 100).toFixed(2)}
        </Button>
      </Stack>
    </form>
  );
}
