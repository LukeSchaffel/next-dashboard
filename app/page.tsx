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
            An Event Management System (EMS) designed to streamline the
            planning, organization, and execution of events. It helps event
            planners manage tasks such as registration, scheduling, ticketing,
            guest lists, vendor coordination, and communication in one
            centralized platform. The system enhances efficiency, reduces manual
            errors, and provides real-time updates to ensure events run smoothly
            from start to finish.
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
              <b>TypeScript based</b> – build type safe applications, all
              components and hooks export types
            </ListItem>
            <ListItem>
              <b>Free and open source</b> – all packages have MIT license, you
              can use Mantine in any project
            </ListItem>
            <ListItem>
              <b>No annoying focus ring</b> – focus ring will appear only when
              user navigates with keyboard
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
