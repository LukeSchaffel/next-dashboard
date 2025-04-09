import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  const { name, startsAt, endsAt, description, userRoleId, workspaceId } =
    await request.json();

  try {
    const event = await prisma.event.create({
      data: {
        name,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        description,
        userRoleId,
        workspaceId,
      },
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
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
  }

  try {
    const events = await prisma.event.findMany({
      where: {
        workspaceId,
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
