"use client";
import { Stack, TextInput, Button, LoadingOverlay } from "@mantine/core";
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
        throw new Error("Failed to purchase ticket");
      }

      // TODO: Handle successful purchase (e.g., redirect to success page)
      console.log("Purchase successful!");
      router.push("/purchase/success");
    } catch (error) {
      console.error("Failed to purchase ticket:", error);
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
