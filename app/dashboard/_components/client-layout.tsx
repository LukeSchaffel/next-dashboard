// app/dashboard/_components/client-layout.tsx
"use client";
import { AppShell, Burger, Paper, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import { capitalize } from "lodash";
import { createContext } from "react";

import { Sider } from "../sider";
import styles from "./_client-layout.module.css";
import { Event, User, UserRole, Workspace } from "@prisma/client";

export const DashboardContext = createContext<{
  userRole: UserRole;
}>({ userRole: {} as UserRole });

export default function ClientDashboardLayout({
  children,
  userRole,
}: {
  children: React.ReactNode;
  userRole: UserRole;
}) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();

  const formatTitle = () => {
    const split = pathname.split("/");
    return capitalize(split[split.length - 1]);
  };

  return (
    <DashboardContext.Provider value={{ userRole }}>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <div>Logo</div>
        </AppShell.Header>

        <AppShell.Navbar>
          <Sider />
        </AppShell.Navbar>

        <AppShell.Main className={styles.main} pt={40}>
          <Title pb={"md"}>{formatTitle()}</Title>
          <Paper
            className={styles.mainContent}
            p={"xl"}
            radius={"md"}
            withBorder
          >
            {children}
          </Paper>
        </AppShell.Main>
      </AppShell>
    </DashboardContext.Provider>
  );
}
