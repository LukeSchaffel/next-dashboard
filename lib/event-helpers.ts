import { prisma } from "@/lib/prisma";
import { Event, EventTag, Tag } from "@prisma/client";

interface TagInput {
  id: string;
  name?: string;
}

/**
 * Validates that a location belongs to the workspace and fetches its template layout
 */
export async function validateAndGetLocation(
  locationId: string | null,
  workspaceId: string
) {
  if (!locationId) return null;

  const location = await prisma.location.findUnique({
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
    throw new Error("Location not found");
  }

  if (location.workspaceId !== workspaceId) {
    throw new Error("Unauthorized");
  }

  return location;
}

/**
 * Processes tag inputs and returns the format needed for Prisma operations
 */
export async function processTags(
  tags: TagInput[] | undefined,
  workspaceId: string
) {
  if (!tags) return undefined;

  return {
    create: await Promise.all(
      tags.map(async (tag) => {
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
  };
}

/**
 * Creates an event layout from a template
 */
export function createEventLayoutFromTemplate(
  templateLayout: any,
  eventName: string,
  workspaceId: string
) {
  return {
    create: {
      name: `${eventName} Seating Layout`,
      description: `Seating layout for ${eventName}`,
      workspaceId,
      templateId: templateLayout.id,
      sections: {
        create: templateLayout.sections.map((section: any) => ({
          name: section.name,
          description: section.description,
          priceMultiplier: section.priceMultiplier,
          workspaceId,
          rows: {
            create: section.rows.map((row: any) => ({
              name: row.name,
              workspaceId,
              seats: {
                create: row.seats.map((seat: any) => ({
                  number: seat.number,
                  status: seat.status,
                  workspaceId,
                })),
              },
            })),
          },
        })),
      },
    },
  };
}

/**
 * Common event include options for Prisma queries
 */
export const eventIncludeOptions = {
  Location: {
    select: {
      id: true,
      name: true,
      address: true,
    },
  },
  Tickets: {
    include: {
      TicketType: true,
      seat: { include: { Row: true } },
      purchase: true,
    },
  },
  TicketTypes: {
    include: {
      Tickets: true,
    },
  },
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
};

/**
 * Lighter event include options for list views - only includes the minimum needed data
 */
export const eventListIncludeOptions = {
  Location: {
    select: {
      id: true,
      name: true,
    },
  },
  EventSeries: {
    select: {
      id: true,
      name: true,
      description: true,
    },
  },
};

/**
 * Updates event tags with proper Prisma operations
 */
export async function updateEventTags(
  tags: TagInput[] | undefined,
  workspaceId: string
) {
  if (tags === undefined) return undefined;

  return {
    deleteMany: {}, // First delete all existing tags
    create: await Promise.all(
      tags.map(async (tag) => {
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
  };
}

/**
 * Creates ticket types for an event
 */
export function createTicketTypes(ticketTypes: any[] | undefined) {
  if (!ticketTypes) return undefined;

  return {
    create: ticketTypes.map((type) => ({
      name: type.name,
      description: type.description,
      price: type.price,
      quantity: type.quantity,
      workspaceId: type.workspaceId,
    })),
  };
}

/**
 * Validates that an event belongs to the workspace
 */
export async function validateEventAccess(
  eventId: string,
  workspaceId: string
) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.workspaceId !== workspaceId) {
    throw new Error("Unauthorized");
  }

  return event;
}
