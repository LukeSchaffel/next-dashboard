// app/dashboard/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import ClientDashboardLayout from "./_components/client-layout";
import { clerkClient } from "@clerk/clerk-sdk-node";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if the user exists in your Prisma DB
  const existingUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  // If not, fetch info from Clerk and create them
  if (!existingUser) {
    const clerkUser = await clerkClient.users.getUser(userId);

    await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
      },
    });
  }

  return <ClientDashboardLayout>{children}</ClientDashboardLayout>;
}
