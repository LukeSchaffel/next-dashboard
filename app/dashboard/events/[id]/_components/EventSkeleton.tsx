import { Stack, Paper, Group, Skeleton } from "@mantine/core";

export default function EventSkeleton() {
  return (
    <Stack gap="xl">
      <Paper p="xl" withBorder>
        <Stack gap="md">
          <Skeleton height={40} width={300} />
          <Group>
            <Skeleton height={30} width={100} />
            <Skeleton height={30} width={150} />
          </Group>
          <Skeleton height={100} />
          <Skeleton height={24} width={200} />
          <Skeleton height={24} width={300} />
          <Group mt="xl" gap="xl">
            <Stack gap={0}>
              <Skeleton height={20} width={120} />
              <Skeleton height={32} width={80} />
            </Stack>
            <Stack gap={0}>
              <Skeleton height={20} width={100} />
              <Skeleton height={32} width={100} />
            </Stack>
          </Group>
        </Stack>
      </Paper>
      <Paper withBorder p="xl">
        <Skeleton height={32} width={200} mb="md" />
        <Skeleton height={200} />
      </Paper>
    </Stack>
  );
}
