"use client";
import {
  Title,
  Text,
  Paper,
  Group,
  Stack,
  SimpleGrid,
  RingProgress,
  Center,
  ThemeIcon,
  rem,
} from "@mantine/core";
import { IconTicket, IconCalendar, IconTrendingUp } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { AreaChart, LineChart, DonutChart } from "@mantine/charts";
import dayjs from "dayjs";

interface DashboardStats {
  totalTickets: number;
  totalRevenue: number;
  eventsThisMonth: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  monthlyRevenue: { month: string; revenue: number }[];
  ticketStatusCounts: {
    PENDING: number;
    CONFIRMED: number;
    CANCELLED: number;
    REFUNDED: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) {
    return <div>Loading...</div>;
  }

  const revenueChange =
    ((stats.revenueThisMonth - stats.revenueLastMonth) /
      stats.revenueLastMonth) *
    100;
  const revenueChangeColor = revenueChange >= 0 ? "green" : "red";

  return (
    <Stack gap="xl">
      <Title order={2}>Dashboard Overview</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <Paper p="md" withBorder>
          <Group justify="space-between">
            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                Total Tickets
              </Text>
              <Title order={3}>{stats.totalTickets}</Title>
            </Stack>
            <ThemeIcon size="lg" radius="md" variant="light">
              <IconTicket style={{ width: rem(20), height: rem(20) }} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="md" withBorder>
          <Group justify="space-between">
            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                Total Revenue
              </Text>
              <Title order={3}>${(stats.totalRevenue / 100).toFixed(2)}</Title>
            </Stack>
            <ThemeIcon size="lg" radius="md" variant="light" color="green">
              <IconTrendingUp style={{ width: rem(20), height: rem(20) }} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="md" withBorder>
          <Group justify="space-between">
            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                Events This Month
              </Text>
              <Title order={3}>{stats.eventsThisMonth}</Title>
            </Stack>
            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
              <IconCalendar style={{ width: rem(20), height: rem(20) }} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper p="md" withBorder>
          <Group justify="space-between">
            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                Monthly Revenue Change
              </Text>
              <Title order={3} c={revenueChangeColor}>
                {revenueChange >= 0 ? "+" : ""}
                {revenueChange.toFixed(1)}%
              </Title>
            </Stack>
            <ThemeIcon
              size="lg"
              radius="md"
              variant="light"
              color={revenueChangeColor}
            >
              <IconTrendingUp style={{ width: rem(20), height: rem(20) }} />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Paper p="md" withBorder>
          <Title order={3} mb="md">
            Revenue Trend
          </Title>
          <LineChart
            h={300}
            data={stats.monthlyRevenue}
            dataKey="month"
            series={[{ name: "revenue", color: "blue" }]}
            valueFormatter={(value) => `$${(value / 100).toFixed(2)}`}
          />
        </Paper>

        <Paper p="md" withBorder>
          <Title order={3} mb="md">
            Ticket Status Distribution
          </Title>
          <Center>
            <DonutChart
              withLabelsLine
              labelsType="value"
              withLabels
              h={300}
              data={[
                {
                  value: parseFloat(
                    (
                      (stats.ticketStatusCounts.CONFIRMED /
                        stats.totalTickets) *
                      100
                    ).toFixed(2)
                  ),
                  color: "green",
                  name: "Confirmed",
                },
                {
                  value: parseFloat(
                    (
                      (stats.ticketStatusCounts.PENDING / stats.totalTickets) *
                      100
                    ).toFixed(2)
                  ),
                  color: "yellow",
                  name: "Pending",
                },
                {
                  value: parseFloat(
                    (
                      (stats.ticketStatusCounts.CANCELLED /
                        stats.totalTickets) *
                      100
                    ).toFixed(2)
                  ),
                  color: "red",
                  name: "Cancelled",
                },
                {
                  value: parseFloat(
                    (
                      (stats.ticketStatusCounts.REFUNDED / stats.totalTickets) *
                      100
                    ).toFixed(2)
                  ),
                  color: "gray",
                  name: "Refunded",
                },
              ]}
            />
          </Center>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
