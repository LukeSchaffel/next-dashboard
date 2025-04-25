import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { workspaceId } = await getAuthSession();

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        Event: {
          include: {
            Location: true,
          },
        },
        seat: {
          include: {
            Row: {
              include: {
                Section: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

    // Load the standard font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Add ticket information
    page.drawText(`Ticket for ${ticket.Event.name}`, {
      x: 50,
      y: 800,
      size: 24,
      font: boldFont,
    });

    // Add event details
    page.drawText("Event Details:", {
      x: 50,
      y: 750,
      size: 16,
      font: boldFont,
    });

    page.drawText(`Date: ${ticket.Event.startsAt ? new Date(ticket.Event.startsAt).toLocaleDateString() : 'TBD'}`, {
      x: 50,
      y: 720,
      size: 12,
      font,
    });

    if (ticket.Event.Location) {
      page.drawText(`Location: ${ticket.Event.Location.name}`, {
        x: 50,
        y: 700,
        size: 12,
        font,
      });
    }

    // Add ticket holder details
    page.drawText("Ticket Holder:", {
      x: 50,
      y: 650,
      size: 16,
      font: boldFont,
    });

    page.drawText(`Name: ${ticket.name}`, {
      x: 50,
      y: 620,
      size: 12,
      font,
    });

    page.drawText(`Email: ${ticket.email}`, {
      x: 50,
      y: 600,
      size: 12,
      font,
    });

    // Add seat information if available
    if (ticket.seat) {
      page.drawText("Seat Information:", {
        x: 50,
        y: 550,
        size: 16,
        font: boldFont,
      });

      page.drawText(`Section: ${ticket.seat.Row?.Section?.name || 'N/A'}`, {
        x: 50,
        y: 520,
        size: 12,
        font,
      });

      page.drawText(`Row: ${ticket.seat.Row?.name || 'N/A'}`, {
        x: 50,
        y: 500,
        size: 12,
        font,
      });

      page.drawText(`Seat: ${ticket.seat.number}`, {
        x: 50,
        y: 480,
        size: 12,
        font,
      });
    }

    // Add price information
    page.drawText("Price Information:", {
      x: 50,
      y: 430,
      size: 16,
      font: boldFont,
    });

    page.drawText(`Total Price: $${(ticket.price / 100).toFixed(2)}`, {
      x: 50,
      y: 400,
      size: 12,
      font,
    });

    // Generate QR code
    const origin = request.headers.get("origin") || "http://localhost:3000";
    const verificationUrl = `${origin}/api/tickets/${ticket.id}/verify`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

    // Convert QR code to PNG and embed in PDF
    const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);
    page.drawImage(qrCodeImage, {
      x: 100,
      y: 200,
      width: 200,
      height: 200,
    });

    // Add verification text
    page.drawText("Scan to verify ticket", {
      x: 150,
      y: 180,
      size: 12,
      font,
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();

    // Return the PDF
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ticket-${ticket.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
