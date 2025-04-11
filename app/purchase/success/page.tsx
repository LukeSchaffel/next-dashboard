"use client";
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Button,
  Group,
} from "@mantine/core";
import Link from "next/link";
import { useEffect } from "react";

interface PageProps {
  searchParams: {
    ticketId?: string;
  };
}

export default function PurchaseSuccessPage({ searchParams }: PageProps) {
  const { ticketId } = searchParams;

  useEffect(() => {
    console.log("Ticket ID:", ticketId); // Debug log
  }, [ticketId]);

  const handleDownload = async () => {
    if (!ticketId) return;

    try {
      const response = await fetch(`/api/tickets/${ticketId}/pdf`);
      if (!response.ok) {
        throw new Error("Failed to download ticket");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-${ticketId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download ticket:", error);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper p="xl" withBorder>
        <Stack gap="xl" align="center">
          <Title order={2}>Purchase Successful!</Title>
          <Text size="lg" ta="center">
            Thank you for your purchase. Your ticket has been sent to your
            email.
          </Text>
          <Group>
            {ticketId && (
              <Button onClick={handleDownload} variant="outline" size="lg">
                Download Ticket
              </Button>
            )}
            <Button component={Link} href="/" size="lg">
              Return to Home
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
