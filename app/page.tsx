import { IconCheck } from "@tabler/icons-react";
import {
  Button,
  Container,
  Group,
  Image,
  List,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
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

export default async function HomePage() {
  return (
    <Container size="md">
      <div className={classes.inner}>
        <div className={classes.content}>
          <Title className={classes.title}>
            A <span className={classes.highlight}>modern</span> Solution <br />{" "}
            to resource management
          </Title>
          <Text c="dimmed" mt="md">
            A comprehensive Event Management System designed to streamline every
            aspect of your events. From planning to execution, our platform
            helps you manage event details, ticketing, seating layouts, and
            locations all in one place. Create beautiful event pages, handle
            ticket sales, design custom seating arrangements, and track your
            events success with real-time analytics. Whether youre organizing a
            conference, concert, or corporate event, our system provides the
            tools you need to deliver exceptional experiences.
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
              <b>Real-time Analytics</b> – Monitor ticket sales, revenue, and
              event performance with comprehensive dashboards
            </ListItem>
          </List>

          <Group mt={30}>
            <SignedOut>
              <SignInButton>
                <Button radius="xl" size="md" className={classes.control}>
                  Login
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button
                  variant="default"
                  radius="xl"
                  size="md"
                  className={classes.control}
                >
                  Signup
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
  );
}
