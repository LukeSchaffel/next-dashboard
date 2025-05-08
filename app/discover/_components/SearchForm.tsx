"use client";

import { Box, TextInput, Group, Select, Button } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchFormProps {
  locations: { id: string; name: string }[];
}

export function SearchForm({ locations }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";
  const type = searchParams.get("type") || "";
  const location = searchParams.get("location") || "";
  const dateRange = searchParams.get("dateRange") || "";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    // Only add non-empty parameters
    for (const [key, value] of formData.entries()) {
      if (value) {
        params.append(key, value.toString());
      }
    }

    router.push(`/discover?${params.toString()}`);
  };

  return (
    <Box mb={40}>
      <form onSubmit={handleSubmit}>
        <Group gap="md" mb="md">
          <TextInput
            name="search"
            placeholder="Search events..."
            leftSection={<IconSearch size={16} />}
            style={{ flex: 1 }}
            defaultValue={search}
          />
          <Select
            name="sort"
            placeholder="Sort by"
            data={[
              { value: "date", label: "Date" },
              { value: "price", label: "Price" },
              { value: "popularity", label: "Popularity" },
            ]}
            style={{ width: 150 }}
            defaultValue={sort}
          />
        </Group>
        <Group gap="md">
          <Select
            name="type"
            placeholder="Event Type"
            data={[
              { value: "concert", label: "Concert" },
              { value: "sports", label: "Sports" },
              { value: "conference", label: "Conference" },
              { value: "workshop", label: "Workshop" },
            ]}
            style={{ width: 150 }}
            defaultValue={type}
          />
          <Select
            name="location"
            placeholder="Location"
            data={locations.map((loc) => ({
              value: loc.id,
              label: loc.name,
            }))}
            style={{ width: 150 }}
            defaultValue={location}
          />
          <Select
            name="dateRange"
            placeholder="Date Range"
            data={[
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
            ]}
            style={{ width: 150 }}
            defaultValue={dateRange}
          />
          <Button type="submit" variant="light">
            Search
          </Button>
        </Group>
      </form>
    </Box>
  );
}
