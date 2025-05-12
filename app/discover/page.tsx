import {
  Container,
  Title,
  Text,
  Box,
  TextInput,
  Group,
  Select,
  SimpleGrid,
  Card,
  CardSection,
  Image,
  Badge,
  Stack,
  Button,
  MultiSelect,
} from "@mantine/core";
import { prisma } from "@/lib/prisma";
import { IconSearch, IconCalendar, IconMapPin, IconTag } from "@tabler/icons-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface SearchParams {
  search?: string;
  sort?: string;
  tags?: string;
  location?: string;
  dateRange?: string;
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { search, sort, tags, location, dateRange } = await searchParams;

  // Build the where clause based on search parameters
  const where: any = {
    startsAt: {
      gte: new Date(),
    },
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (tags) {
    const tagIds = tags.split(",");
    where.tags = {
      some: {
        tagId: {
          in: tagIds,
        },
      },
    };
  }

  if (location) {
    where.Location = {
      id: location,
    };
  }

  if (dateRange) {
    const now = new Date();
    switch (dateRange) {
      case "today":
        where.startsAt = {
          gte: new Date(now.setHours(0, 0, 0, 0)),
          lt: new Date(now.setHours(23, 59, 59, 999)),
        };
        break;
      case "week":
        const weekStart = new Date(now.setHours(0, 0, 0, 0));
        const weekEnd = new Date(now.setDate(now.getDate() + 7));
        where.startsAt = {
          gte: weekStart,
          lt: weekEnd,
        };
        break;
      case "month":
        const monthStart = new Date(now.setHours(0, 0, 0, 0));
        const monthEnd = new Date(now.setMonth(now.getMonth() + 1));
        where.startsAt = {
          gte: monthStart,
          lt: monthEnd,
        };
        break;
    }
  }

  // Build the orderBy clause based on sort parameter
  const orderBy: any = {};
  if (sort) {
    switch (sort) {
      case "date":
        orderBy.startsAt = "asc";
        break;
      case "price":
        // We'll need to join with TicketTypes to sort by price
        // This is a simplified version
        orderBy.startsAt = "asc";
        break;
      case "popularity":
        // We could sort by number of tickets sold
        // This is a simplified version
        orderBy.startsAt = "asc";
        break;
      default:
        orderBy.startsAt = "asc";
    }
  } else {
    orderBy.startsAt = "asc";
  }

  const events = await prisma.event.findMany({
    where,
    include: {
      Location: true,
      TicketTypes: true,
      EventSeries: {
        select: {
          name: true,
        },
      },
      tags: {
        include: {
          Tag: true,
        },
      },
    },
    orderBy,
  });

  // Get all locations for the location filter
  const locations = await prisma.location.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  // Get all available tags for the tag filter
  const availableTags = await prisma.tag.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <Box py={50}>
      <Container size="lg">
        <Title order={1} mb="xl">
          Discover Events
        </Title>
        <Text c="dimmed" mb="xl">
          Find and explore upcoming events in your area
        </Text>

        {/* Search and Filters Section */}
        <Box mb={40}>
          <form action="/discover" method="get">
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
              <MultiSelect
                name="tags"
                placeholder="Filter by tags"
                data={availableTags.map((tag) => ({
                  value: tag.id,
                  label: tag.name,
                }))}
                style={{ width: 250 }}
                defaultValue={tags?.split(",")}
                leftSection={<IconTag size={16} />}
                searchable
                clearable
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

        {/* Events Grid */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {events.map((event) => (
            <Card
              key={event.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
            >
              <CardSection>
                <Image
                  src="https://placehold.co/600x400?text=Event"
                  height={160}
                  alt={event.name}
                />
              </CardSection>

              <Stack mt="md" mb="xs">
                <Group justify="space-between">
                  <Text fw={500} size="lg" lineClamp={1}>
                    {event.name}
                  </Text>
                  {event.EventSeries && (
                    <Badge color="blue" variant="light">
                      {event.EventSeries.name}
                    </Badge>
                  )}
                </Group>

                <Group gap="xs">
                  <IconCalendar
                    size={16}
                    style={{ color: "var(--mantine-color-dimmed)" }}
                  />
                  <Text size="sm" c="dimmed">
                    {event.startsAt
                      ? new Date(event.startsAt).toLocaleDateString()
                      : "Date TBA"}
                  </Text>
                </Group>

                <Group gap="xs">
                  <IconMapPin
                    size={16}
                    style={{ color: "var(--mantine-color-dimmed)" }}
                  />
                  <Text size="sm" c="dimmed" lineClamp={1}>
                    {event.Location?.name || "Location TBA"}
                  </Text>
                </Group>

                {event.tags && event.tags.length > 0 && (
                  <Group gap="xs" wrap="wrap">
                    {event.tags.map((eventTag) => (
                      <Badge
                        key={eventTag.id}
                        variant="light"
                        color="gray"
                        size="sm"
                      >
                        {eventTag.Tag.name}
                      </Badge>
                    ))}
                  </Group>
                )}

                <Group justify="space-between" mt="xs">
                  <Text fw={500} size="sm">
                    {event.TicketTypes.length > 0
                      ? `From $${Math.min(
                          ...event.TicketTypes.map((t) => t.price)
                        )}`
                      : "Price TBA"}
                  </Text>
                  <Link
                    href={`/events/${event.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Button variant="light" radius="xl" size="sm">
                      View Details
                    </Button>
                  </Link>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
