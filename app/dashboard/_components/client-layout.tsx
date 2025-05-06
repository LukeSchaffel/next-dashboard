// app/dashboard/_components/client-layout.tsx
"use client";
import { AppShell, Burger, Paper, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import { capitalize } from "lodash";
import { createContext, useContext } from "react";

import { Sider } from "../sider";
import styles from "./_client-layout.module.css";
import { Event, User, UserRole, Workspace } from "@prisma/client";

export const DashboardContext = createContext<{
  userRole: UserRole;
  workspace: Workspace;
}>({ userRole: {} as UserRole, workspace: {} as Workspace });

export default function ClientDashboardLayout({
  children,
  userRole,
  workspace,
}: {
  children: React.ReactNode;
  userRole: UserRole;
  workspace: Workspace;
}) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();

  const formatTitle = () => {
    const split = pathname.split("/");
    let title = "home";

    if (split.includes("events")) title = "events";
    if (split.includes("locations")) title = "locations";
    if (split.includes("users")) title = "users";
    if (split.includes("notifications")) title = "notifications";
    if (split.includes("settings")) title = "settings";

    return capitalize(title);
  };

  return (
    <DashboardContext.Provider value={{ userRole, workspace }}>
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
          <Title pt={"xl"} pb={"md"}>
            {formatTitle()}
          </Title>
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

export const useClientAuthSession = () => {
  const { userRole, workspace } = useContext(DashboardContext);

  return { userRole, workspace };
};
