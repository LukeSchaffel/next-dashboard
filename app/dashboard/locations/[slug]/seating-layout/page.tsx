"use client";

import { Stack, Group, Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { use } from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import SeatingLayoutEditor from "../../_components/SeatingLayoutEditor";

export default function CreateSeatingLayoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    try {
      const res = await fetch(`/api/locations/${slug}/seating-layout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("Failed to create seating layout");
      }

      const data = await res.json();
      router.push(`/dashboard/locations/${slug}/seating-layout/${data.id}`);
    } catch (error) {
      console.error("Failed to create seating layout:", error);
    }
  };

  return (
    <Stack gap="xl">
      <Group>
        <Link href={`/dashboard/locations/${slug}`}>
          <Button variant="subtle" leftSection={<IconArrowLeft size={16} />}>
            Back to Location
          </Button>
        </Link>
      </Group>

      <SeatingLayoutEditor onSubmit={handleSubmit} />
    </Stack>
  );
}
