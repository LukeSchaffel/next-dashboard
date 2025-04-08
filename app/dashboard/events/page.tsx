import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../lib/prisma";

export default async function EventsPage() {
  const { userId } = await auth();
  if (!userId) return;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  console.log(user);
  return <>Events page</>;
}
