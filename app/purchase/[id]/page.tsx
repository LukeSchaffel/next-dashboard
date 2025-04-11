import { Container, Title, Text, Paper, Stack, Group } from "@mantine/core";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import PurchaseForm from "../_components/PurchaseForm";
import { prisma } from "@/lib/prisma";

interface PurchaseLink {
  id: string;
  price: number;
  Event: {
    name: string;
    description: string | null;
    startsAt: Date;
    endsAt: Date;
    Location: {
      name: string;
      address: string | null;
    } | null;
  };
}

async function getPurchaseLink(id: string) {
  const purchaseLink = await prisma.purchaseLink.findUnique({
    where: { id },
    include: {
      Event: {
        include: {
          Location: true,
        },
      },
    },
  });

  return purchaseLink;
}

export default async function PurchasePage({
  params,
}: {
  params: { id: string };
}) {
  const purchaseLink = await getPurchaseLink(params.id);

  if (!purchaseLink) {
    notFound();
  }

  return (
    <Container size="sm" py="xl">
      <Paper p="xl" withBorder>
        <Stack gap="xl">
          <Stack gap="xs">
            <Title order={2}>{purchaseLink.Event.name}</Title>
            {purchaseLink.Event.description && (
              <div
                dangerouslySetInnerHTML={{
                  __html: purchaseLink.Event.description,
                }}
              />
            )}
            <Text>
              {dayjs(purchaseLink.Event.startsAt).format("MMM D, YYYY h:mm A")}{" "}
              - {dayjs(purchaseLink.Event.endsAt).format("MMM D, YYYY h:mm A")}
            </Text>
            {purchaseLink.Event.Location && (
              <Text c="dimmed">
                {purchaseLink.Event.Location.name}
                {purchaseLink.Event.Location.address && (
                  <> - {purchaseLink.Event.Location.address}</>
                )}
              </Text>
            )}
          </Stack>

          <Group justify="space-between" align="flex-end">
            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                Price
              </Text>
              <Title order={3}>${(purchaseLink.price / 100).toFixed(2)}</Title>
            </Stack>
          </Group>

          <PurchaseForm
            price={purchaseLink.price}
            purchaseLinkId={purchaseLink.id}
          />
        </Stack>
      </Paper>
    </Container>
  );
}
