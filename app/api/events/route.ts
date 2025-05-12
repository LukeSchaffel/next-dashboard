import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

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

    // Only check location if one is provided
    let location = null;
    if (locationId) {
      location = await prisma.location.findUnique({
        where: { id: locationId },
        include: {
          templateLayout: {
            include: {
              sections: {
                include: {
                  rows: {
                    include: {
                      seats: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!location) {
        return NextResponse.json(
          { error: "Location not found" },
          { status: 404 }
        );
      }

      if (location.workspaceId !== workspaceId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
          TicketTypes: ticketTypes
            ? {
                create: ticketTypes.map((type: any) => ({
                  name: type.name,
                  description: type.description,
                  price: type.price,
                  quantity: type.quantity,
                })),
              }
            : undefined,
          tags: tags
            ? {
                create: await Promise.all(
                  tags.map(async (tag: { id: string; name?: string }) => {
                    // If name is not provided, fetch it from the Tag
                    let tagName = tag.name;
                    if (!tagName) {
                      const tagData = await prisma.tag.findUnique({
                        where: { id: tag.id },
                        select: { name: true },
                      });
                      tagName = tagData?.name || "";
                    }
                    return {
                      tagId: tag.id,
                      workspaceId,
                      name: tagName,
                    };
                  })
                ),
              }
            : undefined,
          // Create event layout if template is requested and available
          ...(use_layout_template && location?.templateLayout
            ? {
                eventLayout: {
                  create: {
                    name: `${name} Seating Layout`,
                    description: `Seating layout for ${name}`,
                    workspaceId,
                    templateId: location.templateLayout.id,
                    sections: {
                      create: location.templateLayout.sections.map(
                        (section) => ({
                          name: section.name,
                          description: section.description,
                          priceMultiplier: section.priceMultiplier,
                          workspaceId: workspaceId,
                          rows: {
                            create: section.rows.map((row) => ({
                              name: row.name,
                              workspaceId: workspaceId,
                              seats: {
                                create: row.seats.map((seat) => ({
                                  number: seat.number,
                                  status: seat.status,
                                  workspaceId: workspaceId,
                                })),
                              },
                            })),
                          },
                        })
                      ),
                    },
                  },
                },
              }
            : {}),
        },
        include: {
          Location: {
            select: {
              id: true,
              name: true,
            },
          },
          TicketTypes: true,
          EventSeries: true,
          tags: true,
          eventLayout: {
            include: {
              sections: {
                include: {
                  rows: {
                    include: {
                      seats: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return NextResponse.json(event, { status: 201 });
    }

    // Handle event series creation
    if (type === "series") {
      let eventLocation = null;
      if (locationId) {
        eventLocation = await prisma.location.findUnique({
          where: { id: locationId },
          include: {
            templateLayout: {
              include: {
                sections: {
                  include: {
                    rows: {
                      include: {
                        seats: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!eventLocation) {
          return NextResponse.json(
            { error: "Location not found" },
            { status: 404 }
          );
        }

        if (eventLocation.workspaceId !== workspaceId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
      }

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
          // Check location for each event if provided

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
              tags: tags
                ? {
                    create: await Promise.all(
                      tags.map(async (tag: { id: string; name?: string }) => {
                        // If name is not provided, fetch it from the Tag
                        let tagName = tag.name;
                        if (!tagName) {
                          const tagData = await prisma.tag.findUnique({
                            where: { id: tag.id },
                            select: { name: true },
                          });
                          tagName = tagData?.name || "";
                        }
                        return {
                          tagId: tag.id,
                          workspaceId,
                          name: tagName,
                        };
                      })
                    ),
                  }
                : undefined,
              // Create event layout if template is requested and available
              ...(use_layout_template && eventLocation?.templateLayout
                ? {
                    eventLayout: {
                      create: {
                        name: `${event.name} Seating Layout`,
                        description: `Seating layout for ${event.name}`,
                        workspaceId,
                        templateId: eventLocation.templateLayout.id,
                        sections: {
                          create: eventLocation.templateLayout.sections.map(
                            (section) => ({
                              name: section.name,
                              description: section.description,
                              priceMultiplier: section.priceMultiplier,
                              workspaceId: workspaceId,
                              rows: {
                                create: section.rows.map((row) => ({
                                  name: row.name,
                                  workspaceId: workspaceId,
                                  seats: {
                                    create: row.seats.map((seat) => ({
                                      number: seat.number,
                                      status: seat.status,
                                      workspaceId: workspaceId,
                                    })),
                                  },
                                })),
                              },
                            })
                          ),
                        },
                      },
                    },
                  }
                : {}),
            },
            include: {
              Location: {
                select: {
                  id: true,
                  name: true,
                },
              },
              TicketTypes: true,
              EventSeries: true,
              tags: true,
              eventLayout: {
                include: {
                  sections: {
                    include: {
                      rows: {
                        include: {
                          seats: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        })
      );

      // Fetch the complete series with events
      const completeSeries = await prisma.eventSeries.findUnique({
        where: { id: series.id },
        include: {
          events: {
            include: {
              Location: {
                select: {
                  id: true,
                  name: true,
                },
              },
              TicketTypes: true,
              EventSeries: true,
              tags: true,
              eventLayout: {
                include: {
                  sections: {
                    include: {
                      rows: {
                        include: {
                          seats: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      return NextResponse.json(
        { events: createdEvents, series: completeSeries },
        { status: 201 }
      );
    }

    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
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
      include: {
        Location: {
          select: {
            id: true,
            name: true,
          },
        },
        TicketTypes: true,
        EventSeries: true,
        tags: true,
      },
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
