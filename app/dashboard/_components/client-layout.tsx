"use client";
import { AppShell, Paper, Title } from "@mantine/core";
import { usePathname } from "next/navigation";
import { capitalize } from "lodash";
import { createContext, useContext, useEffect } from "react";

import { Sider } from "../sider";
import { UserRole, Workspace } from "@prisma/client";
import { useAppStateStore } from "@/stores/useAppState";
import AppHeader from "@/lib/components/app-header/AppHeader";
import styles from "./_client-layout.module.css";

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
  const pathname = usePathname();
  const { siderCollapsed } = useAppStateStore();

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
        header={{ height: 80 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: siderCollapsed },
        }}
        padding="md"
      >
        <AppHeader />
        <AppShell.Navbar>
          <Sider />
        </AppShell.Navbar>

        <AppShell.Main className={styles.main}>
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

export const useClientAuthSession = () => {
  const { userRole, workspace } = useContext(DashboardContext);

  return { userRole, workspace };
};
