"use client";

import {
  Button,
  Group,
  Text,
  ThemeIcon,
  Title,
  Card,
  CardSection,
  Stack,
  Image,
  Badge,
  rem,
} from "@mantine/core";
import { Carousel, CarouselSlide } from "@mantine/carousel";
import { Event, Location, TicketType } from "@prisma/client";
import dayjs from "dayjs";

interface EventWithDetails extends Event {
  Location: Location | null;
  TicketTypes: TicketType[];
}

interface FeaturedEventsCarouselProps {
  events: EventWithDetails[];
}

export function FeaturedEventsCarousel({
  events,
}: FeaturedEventsCarouselProps) {
  if (events.length === 0) {
    return (
      <div style={{ marginTop: 60, marginBottom: 60 }}>
        <Title order={2} mb="xl" ta="center">
          Featured Events
        </Title>
        <Text ta="center">No upcoming events found</Text>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 60, marginBottom: 60 }}>
      <Title order={2} mb="xl" ta="center">
        Featured Events
      </Title>
      <Carousel
        withIndicators
        height={400}
        slideSize={{ base: "100%", sm: "50%", md: "33.333333%" }}
        slideGap="md"
        withControls
        controlSize={22}
        styles={{
          indicator: {
            width: rem(12),
            height: rem(4),
            transition: "width 250ms ease",
            "&[dataActive]": {
              width: rem(40),
            },
          },
          control: {
            "&[data-inactive]": {
              opacity: 0,
              cursor: "default",
            },
          },
        }}
      >
        {events.map((event) => (
          <CarouselSlide key={event.id}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <CardSection>
                <Image
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070"
                  height={160}
                  alt={event.name}
                />
              </CardSection>

              <Stack mt="md" mb="xs">
                <Group justify="space-between">
                  <Badge color="blue" variant="light">
                    {event.Location?.name || "No Location"}
                  </Badge>
                  <Text fw={500} c="dimmed">
                    {event.TicketTypes[0]
                      ? `$${(event.TicketTypes[0].price / 100).toFixed(2)}`
                      : "Price TBA"}
                  </Text>
                </Group>
                <Text fw={500} size="lg">
                  {event.name}
                </Text>
                <Text size="sm" c="dimmed">
                  {dayjs(event.startsAt).format("MMMM D, YYYY")}
                </Text>
                <Text size="sm" c="dimmed">
                  {event.Location?.address || "Location TBA"}
                </Text>
              </Stack>

              <Button
                variant="light"
                color="blue"
                fullWidth
                mt="md"
                radius="md"
                component="a"
                href={`/events/${event.id}`}
              >
                View Details
              </Button>
            </Card>
          </CarouselSlide>
        ))}
      </Carousel>
    </div>
  );
}
