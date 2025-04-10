import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, startsAt, endsAt, description, userRoleId, locationId } =
      await request.json();

    const { workspaceId } = await getAuthSession();

    const event = await prisma.event.create({
      data: {
        name,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        description,
        userRoleId,
        workspaceId,
        locationId: locationId || null,
      },
      include: { Location: true, Tickets: true },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { workspaceId } = await getAuthSession();
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Missing workspaceId" },
        { status: 400 }
      );
    }
    const events = await prisma.event.findMany({
      where: {
        workspaceId,
      },
      include: {
        Location: true,
        Tickets: true,
      },
      orderBy: {
        startsAt: "asc",
      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
