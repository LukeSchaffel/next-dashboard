import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../lib/prisma";

import EventForm from "./_components/EventForm";
import { Flex, Title } from "@mantine/core";
import { DateInput } from "@mantine/dates";
export default async function EventsPage() {
  const { userId } = await auth();
  if (!userId) return;

  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
    },
  });

  const events = await prisma.event.findMany({
    where: { workspaceId: userRole?.workspaceId },
  });

  return (
    <>
      <Flex justify={"space-between"}>
        <Title order={4}>Upcoming events</Title>
        <EventForm userRole={userRole} />
      </Flex>
    </>
  );
}
