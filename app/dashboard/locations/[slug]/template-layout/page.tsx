"use client";

import { Stack, Group, Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { use } from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { SeatingLayoutEditor } from "@/lib/components";

export default function CreateTemplateLayoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    try {
      const res = await fetch(`/api/locations/${slug}/template-layout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("Failed to create template layout");
      }

      const data = await res.json();
      console.log("Template layout created:", data);

      router.push(`/dashboard/locations/${slug}`);
    } catch (error) {
      console.error("Failed to create template layout:", error);
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

  return (
    <SeatingLayoutEditor
      onSubmit={handleSubmit}
      backButton={backButton}
      title="Create Template Layout"
    />
  );
}
