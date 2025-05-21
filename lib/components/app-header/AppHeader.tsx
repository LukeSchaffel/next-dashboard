"use client";
import { AppShellHeader, Burger, Button, Group, Image } from "@mantine/core";
import { usePathname } from "next/navigation";
import { useAuth, SignInButton, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

import { useAppStateStore } from "@/stores/useAppState";

export default function AppHeader() {
  const { isSignedIn } = useAuth();
  const path = usePathname();
  const { siderCollapsed, toggleSiderCollapsed } = useAppStateStore();

  const getHeaderRight = () => {
    if (!isSignedIn) {
      return (
        <SignInButton>
          <Button variant="transparent">Sign in</Button>
        </SignInButton>
      );
    }
    return path.includes("dashboard") ? (
      <SignOutButton>
        <Button variant="transparent">Sign out</Button>
      </SignOutButton>
    ) : (
      <Link href="/dashboard">
        <Button radius={"xl"}>Dashboard</Button>
      </Link>
    );
  };

  return (
    <AppShellHeader>
      <Group p={16} justify="space-between" wrap={"nowrap"}>
        <Group gap={16}>
          <Burger
            opened={!siderCollapsed}
            onClick={toggleSiderCollapsed}
            hiddenFrom="sm"
            size="sm"
          />

          <Link href={"/"}>
            <Image src="/logo.png" alt="Logo" width={150} height={80} />
          </Link>
          <Link href="/discover">Discover</Link>
          <Link href="/events">Events</Link>
          <Link href="/locations">Locations</Link>
        </Group>

        {getHeaderRight()}
      </Group>
    </AppShellHeader>
  );
}
