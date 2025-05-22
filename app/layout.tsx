import { ClerkProvider } from "@clerk/nextjs";
import React from "react";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/tiptap/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";

import {
  MantineProvider,
  ColorSchemeScript,
  mantineHtmlProps,
} from "@mantine/core";

import ServerHeader from "@/lib/components/app-header/ServerHeader";
import styles from "./_app.module.css";
import { theme } from "../theme";
import { Notifications } from "@mantine/notifications";

export const metadata = {
  title: "Ticket Retreiver",
  description: "Fetch your next event!",
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <ClerkProvider>
      <html lang="en" {...mantineHtmlProps}>
        <head>
          <ColorSchemeScript />
          <link rel="shortcut icon" href="/favicon.png" />
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
          />
        </head>
        <body className={styles.body}>
          <MantineProvider theme={theme}>
            <ServerHeader />
            <Notifications position="top-right" />
            {children}
          </MantineProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
