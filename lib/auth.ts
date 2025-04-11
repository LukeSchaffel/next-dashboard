import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const getAuthSession = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existingUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      Roles: { include: { CreatedEvents: true, Workspace: true, User: true } },
    },
  });
  if (!existingUser) {
    throw new Error("No existing user");
  }
  return {
    userId: existingUser.id,
    userRoleId: existingUser.Roles[0].id,
    workspaceId: existingUser.Roles[0].Workspace.id,
  };
};
