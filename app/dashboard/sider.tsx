"use client";
import { useState } from "react";
import {
  Icon2fa,
  IconBellRinging,
  IconDatabaseImport,
  IconFileAnalytics,
  IconFingerprint,
  IconKey,
  IconLicense,
  IconLogout,
  IconMessage2,
  IconMessages,
  IconReceipt2,
  IconReceiptRefund,
  IconSettings,
  IconShoppingCart,
  IconSwitchHorizontal,
  IconUsers,
  IconHome,
  IconCalendar,
  IconMap,
} from "@tabler/icons-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignOutButton, UserButton } from "@clerk/nextjs";
import { Flex, SegmentedControl, Text } from "@mantine/core";
import classes from "./_sider.module.css";

const tabs = {
  account: [
    {
      link: "/dashboard",
      label: "Home",
      icon: IconHome,
    },
    { link: "/dashboard/events", label: "Events", icon: IconCalendar },
    { link: "/dashboard/locations", label: "Locations", icon: IconMap },
    { link: "/dashboard/users", label: "Users", icon: IconUsers },
    {
      link: "/dashboard/notifications",
      label: "Notifications",
      icon: IconBellRinging,
    },
    { link: "/dashboard/settings", label: "Settings", icon: IconSettings },
  ],
  general: [
    { link: "", label: "Orders", icon: IconShoppingCart },
    { link: "", label: "Receipts", icon: IconLicense },
    { link: "", label: "Reviews", icon: IconMessage2 },
    { link: "", label: "Messages", icon: IconMessages },
    { link: "", label: "Customers", icon: IconUsers },
    { link: "", label: "Refunds", icon: IconReceiptRefund },
    { link: "", label: "Files", icon: IconFileAnalytics },
  ],
};

export function Sider() {
  const [section, setSection] = useState<"account" | "general">("account");
  const [active, setActive] = useState("Billing");

  const links = tabs[section].map((item) => (
    <Link
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </Link>
  ));

  return (
    <nav className={classes.navbar}>
      <div>
        <SegmentedControl
          value={section}
          onChange={(value: any) => setSection(value)}
          transitionTimingFunction="ease"
          fullWidth
          data={[
            { label: "Account", value: "account" },
            { label: "System", value: "general" },
          ]}
        />
      </div>

      <div className={classes.navbarMain}>{links}</div>

      <div className={classes.footer}>
        <a
          href="#"
          className={classes.link}
          onClick={(event) => event.preventDefault()}
        >
          <Flex gap={"sm"} align={"center"}>
            <UserButton></UserButton>
            <span>Mangage account</span>
          </Flex>
        </a>

        <SignOutButton>
          <a
            href="#"
            className={classes.link}
            onClick={(event) => event.preventDefault()}
          >
            <IconLogout className={classes.linkIcon} stroke={1.5} />
            <span>Logout</span>
          </a>
        </SignOutButton>
      </div>
    </nav>
  );
}
