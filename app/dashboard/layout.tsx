// app/dashboard/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClientDashboardLayout from "./_components/client-layout";
import { clerkClient } from "@clerk/clerk-sdk-node";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  let activeRole;
  const existingUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      Roles: { include: { CreatedEvents: true, Workspace: true, User: true } },
    },
  });

  if (!existingUser) {
    const clerkUser = await clerkClient.users.getUser(userId);

    const dbUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
      },
    });

    // Create a workspace for the new user
    const newWorkspace = await prisma.workspace.create({
      data: {
        name: `${clerkUser.firstName}'s Workspace`, // Example name
        ownerId: dbUser.id, // Assuming clerkUser.id is the userId
      },
    });

    // Create a user role for the new user in the new workspace
    activeRole = await prisma.userRole.create({
      data: {
        userId: dbUser.id,
        workspaceId: newWorkspace.id,
        Role: "ADMIN", // Assign a default role
        email: clerkUser.emailAddresses[0].emailAddress,
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
      },
      include: { Workspace: true },
    });
  } else {
    activeRole = existingUser.Roles[0];
  }

  return (
    <ClientDashboardLayout
      userRole={activeRole}
      workspace={activeRole.Workspace}
    >
      {children}
    </ClientDashboardLayout>
  );
}
