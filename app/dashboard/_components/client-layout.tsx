// app/dashboard/_components/client-layout.tsx
"use client";

import { AppShell } from "@mantine/core";
import { Sider } from "../sider";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: false },
      }}
      padding="md"
    >
      <AppShell.Header>
        <div>Logo</div>
      </AppShell.Header>

      <AppShell.Navbar>
        <Sider />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
