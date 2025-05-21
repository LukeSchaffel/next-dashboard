"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
} from "@clerk/nextjs";
import { Button, Group, Image } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ServerHeader() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard")) return <></>;
  return (
    <header>
      <Group p={16} justify="space-between" wrap={"nowrap"}>
        <Group gap={16}>
          <Link href={"/"}>
            <Image src="/logo.png" alt="Logo" width={150} height={60} />
          </Link>
          <Link href="/discover">Discover</Link>
          <Link href="/events">Events</Link>
          <Link href="/locations">Locations</Link>
        </Group>

        <SignedOut>
          <SignInButton>
            <Button variant="transparent">Sign in</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <SignOutButton>
            <Button variant="transparent">Sign out</Button>
          </SignOutButton>
        </SignedIn>
      </Group>
    </header>
  );
}
