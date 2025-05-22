import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";
import {
  validateAndGetLocation,
  processTags,
  createEventLayoutFromTemplate,
  createTicketTypes,
  eventWithDetailsSelector,
} from "@/lib/event-helpers";

export async function POST(request: NextRequest) {
  try {
    const {
      type,
      name,
      description,
      locationId,
      // Series specific fields
      startDate,
      endDate,
      events,
      // Single event fields
      startsAt,
      endsAt,
      ticketTypes,
      use_layout_template,
      tags,
    } = await request.json();
    const { workspaceId, userRoleId } = await getAuthSession();

    // Validate and get location if provided
    let location = null;
    if (locationId) {
      try {
        location = await validateAndGetLocation(locationId, workspaceId);
      } catch (error: any) {
        return NextResponse.json(
          { error: error.message },
          { status: error.message === "Unauthorized" ? 403 : 404 }
        );
      }
    }

    // Handle single event creation
    if (type === "single") {
      const event = await prisma.event.create({
        data: {
          name,
          description,
          locationId: locationId || null,
          startsAt: new Date(startsAt),
          endsAt: new Date(endsAt),
          userRoleId,
          workspaceId,
          TicketTypes: createTicketTypes(ticketTypes),
          tags: await processTags(tags, workspaceId),
          // Create event layout if template is requested and available
          ...(use_layout_template && location?.templateLayout
            ? {
                eventLayout: createEventLayoutFromTemplate(
                  location.templateLayout,
                  name,
                  workspaceId
                ),
              }
            : {}),
        },
        include: eventWithDetailsSelector,
      });

      return NextResponse.json(event, { status: 201 });
    }

    // Handle event series creation
    if (type === "series") {
      // Create the series first
      const series = await prisma.eventSeries.create({
        data: {
          name,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          workspaceId,
        },
      });

      // Create each event individually to handle location and layout properly
      const createdEvents = await Promise.all(
        events.map(async (event: any) => {
          return prisma.event.create({
            data: {
              name: event.name,
              description: event.description,
              locationId: locationId || null,
              startsAt: new Date(event.startsAt),
              endsAt: new Date(event.endsAt),
              userRoleId,
              workspaceId,
              eventSeriesId: series.id,
              tags: await processTags(tags, workspaceId),
              // Create event layout if template is requested and available
              ...(use_layout_template && location?.templateLayout
                ? {
                    eventLayout: createEventLayoutFromTemplate(
                      location.templateLayout,
                      event.name,
                      workspaceId
                    ),
                  }
                : {}),
            },
            include: eventWithDetailsSelector,
          });
        })
      );

      // Fetch the complete series with events
      const completeSeries = await prisma.eventSeries.findUnique({
        where: { id: series.id },
        include: {
          events: {
            include: eventWithDetailsSelector,
          },
        },
      });

      return NextResponse.json(
        { events: createdEvents, series: completeSeries },
        { status: 201 }
      );
    }

    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  } catch (error: any) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { workspaceId } = await getAuthSession();

    const events = await prisma.event.findMany({
      where: {
        workspaceId,
      },
      include: eventWithDetailsSelector,
      orderBy: {
        startsAt: "desc",
      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
