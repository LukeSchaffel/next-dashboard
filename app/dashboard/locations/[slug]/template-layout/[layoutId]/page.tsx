"use client";

import { Group, Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { use } from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SeatingLayoutEditor, SeatingLayout } from "@/lib/components";

export default function EditTemplateLayoutPage({
  params,
}: {
  params: Promise<{ slug: string; layoutId: string }>;
}) {
  const { slug, layoutId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [layout, setLayout] = useState<SeatingLayout | null>(null);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const res = await fetch(
          `/api/locations/${slug}/template-layout/${layoutId}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch template layout");
        }
        const data = await res.json();
        setLayout(data);
      } catch (error) {
        console.error("Failed to fetch template layout:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
  }, [slug, layoutId]);

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/locations/${slug}/template-layout/${layoutId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update template layout");
      }

      const data = await res.json();
      setLayout(data);
    } catch (error) {
      console.error("Failed to update template layout:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!layout) {
    return null;
  }

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
      initialLayout={layout}
      loading={loading}
      saving={saving}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
      title="Edit Template Layout"
      backButton={backButton}
    />
  );
}
