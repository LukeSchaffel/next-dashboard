import {
  IconCheck,
  IconTicket,
  IconCalendarEvent,
  IconChartBar,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import {
  Button,
  Container,
  Group,
  Image,
  List,
  Text,
  ThemeIcon,
  Title,
  SimpleGrid,
  Card,
  CardSection,
  Stack,
  Divider,
  Badge,
  rem,
  BackgroundImage,
  Box,
} from "@mantine/core";
import { Carousel, CarouselSlide } from "@mantine/carousel";
// import image from './image.svg';
import classes from "./_landing.module.css";
import { ListItem } from "@mantine/core";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { FeaturedEventsCarousel } from "./components/FeaturedEventsCarousel";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  const events = await prisma.event.findMany({
    where: {
      startsAt: {
        gte: new Date(),
      },
    },
    include: {
      Location: true,
      TicketTypes: true,
      EventSeries: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      startsAt: "asc",
    },
    take: 6,
  });

  return (
    <Box>
      {/* Hero Section with Background */}
      <BackgroundImage
        src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070"
        h={600}
      >
        <Box
          style={{
            background:
              "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Container size="lg">
            <div className={classes.inner}>
              <div className={classes.content}>
                <Title className={classes.title} c="white">
                  Find Your Next{" "}
                  <span className={classes.highlight}>Experience</span>
                </Title>
                <Text c="gray.3" mt="md" size="lg">
                  Discover and book tickets for amazing events in your area.
                  From concerts and sports to conferences and workshops - find
                  your perfect event and secure your spot with just a few
                  clicks.
                </Text>

                <Group mt={30}>
                  <SignedOut>
                    <Link href="/discover">
                      <Button radius="xl" size="md" className={classes.control}>
                        Browse Events
                      </Button>
                    </Link>
                    <SignUpButton>
                      <Button
                        variant="white"
                        radius="xl"
                        size="md"
                        className={classes.control}
                      >
                        Create Account
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href={"/dashboard"}>
                      <Button radius="xl" size="md" className={classes.control}>
                        Go to dashboard
                      </Button>
                    </Link>
                  </SignedIn>
                </Group>
              </div>
            </div>
          </Container>
        </Box>
      </BackgroundImage>

      {/* Featured Events Carousel */}
      <Box py={50} bg="gray.0">
        <Container size="lg">
          <FeaturedEventsCarousel events={events} />
        </Container>
      </Box>

      {/* Features for Ticket Buyers */}
      <Box py={50}>
        <Container size="lg">
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack align="center" gap="xs">
                <ThemeIcon size={50} radius="md" variant="light">
                  <IconTicket size={30} />
                </ThemeIcon>
                <Text fw={500} size="lg">
                  Easy Booking
                </Text>
                <Text c="dimmed" ta="center">
                  Secure your tickets in seconds with our streamlined booking
                  process
                </Text>
              </Stack>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack align="center" gap="xs">
                <ThemeIcon size={50} radius="md" variant="light">
                  <IconCalendarEvent size={30} />
                </ThemeIcon>
                <Text fw={500} size="lg">
                  Event Discovery
                </Text>
                <Text c="dimmed" ta="center">
                  Find events tailored to your interests and preferences
                </Text>
              </Stack>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack align="center" gap="xs">
                <ThemeIcon size={50} radius="md" variant="light">
                  <IconChartBar size={30} />
                </ThemeIcon>
                <Text fw={500} size="lg">
                  Real-time Updates
                </Text>
                <Text c="dimmed" ta="center">
                  Stay informed with instant notifications about your events
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Event Organizers Section */}
      <Box py={50} bg="gray.0">
        <Container size="lg">
          <div className={classes.inner}>
            <div className={classes.content}>
              <Title className={classes.title}>
                For Event <span className={classes.highlight}>Organizers</span>
              </Title>
              <Text c="dimmed" mt="md">
                A comprehensive Event Management System designed to streamline
                every aspect of your events. From planning to execution, our
                platform helps you manage event details, ticketing, seating
                layouts, and locations all in one place.
              </Text>

              <List
                mt={30}
                spacing="sm"
                size="sm"
                icon={
                  <ThemeIcon size={20} radius="xl">
                    <IconCheck size={12} stroke={1.5} />
                  </ThemeIcon>
                }
              >
                <ListItem>
                  <b>Smart Event Management</b> – Create and manage events with
                  detailed information, locations, and custom seating layouts
                </ListItem>
                <ListItem>
                  <b>Advanced Ticketing System</b> – Handle ticket sales, track
                  attendance, and manage different ticket types with ease
                </ListItem>
                <ListItem>
                  <b>Real-time Analytics</b> – Monitor ticket sales, revenue,
                  and event performance with comprehensive dashboards
                </ListItem>
              </List>

              <Group mt={30}>
                <SignUpButton>
                  <Button radius="xl" size="md" className={classes.control}>
                    Start Organizing
                  </Button>
                </SignUpButton>
              </Group>
            </div>
          </div>
        </Container>
      </Box>
    </Box>
  );
}
