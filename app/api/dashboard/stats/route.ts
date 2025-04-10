import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import { getAuthSession } from "@/lib/auth";
import { Ticket, Event } from "@prisma/client";

export async function GET() {
  try {
    const { workspaceId } = await getAuthSession();

    // Get all tickets and events

    const events = await prisma.event.findMany({
      where: { workspaceId },
      include: { Tickets: { include: { Event: true } } },
    });

    const tickets = events.flatMap((e) =>
      e.Tickets.map((t) => ({ ...t, Event: e }))
    );

    // Calculate total tickets and revenue
    const totalTickets = tickets.length;
    const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

    // Get current month's events
    const currentMonth = dayjs().startOf("month");
    const eventsThisMonth = events.filter((event) =>
      dayjs(event.startsAt).isSame(currentMonth, "month")
    ).length;

    // Calculate monthly revenue
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const month = dayjs().subtract(i, "month");
      const monthTickets = tickets.filter((ticket) =>
        dayjs(ticket.Event.startsAt).isSame(month, "month")
      );
      return {
        month: month.format("MMM YYYY"),
        revenue: monthTickets.reduce((sum, ticket) => sum + ticket.price, 0),
      };
    }).reverse();

    // Calculate this month's and last month's revenue
    const revenueThisMonth = monthlyRevenue[monthlyRevenue.length - 1].revenue;
    const revenueLastMonth = monthlyRevenue[monthlyRevenue.length - 2].revenue;

    // Count tickets by status
    const ticketStatusCounts = {
      PENDING: tickets.filter((ticket) => ticket.status === "PENDING").length,
      CONFIRMED: tickets.filter((ticket) => ticket.status === "CONFIRMED")
        .length,
      CANCELLED: tickets.filter((ticket) => ticket.status === "CANCELLED")
        .length,
      REFUNDED: tickets.filter((ticket) => ticket.status === "REFUNDED").length,
    };

    return NextResponse.json({
      totalTickets,
      totalRevenue,
      eventsThisMonth,
      revenueThisMonth,
      revenueLastMonth,
      monthlyRevenue,
      ticketStatusCounts,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
