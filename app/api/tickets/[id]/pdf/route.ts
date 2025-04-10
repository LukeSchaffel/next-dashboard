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

    // Add ticket information
    page.drawText(`Ticket for ${ticket.Event.name}`, {
      x: 50,
      y: 800,
      size: 20,
      font,
    });

    page.drawText(`Name: ${ticket.name}`, {
      x: 50,
      y: 500,
      size: 12,
      font,
    });

    page.drawText(`Email: ${ticket.email}`, {
      x: 50,
      y: 480,
      size: 12,
      font,
    });

    page.drawText(`Price: $${(ticket.price / 100).toFixed(2)}`, {
      x: 50,
      y: 460,
      size: 12,
      font,
    });

    page.drawText(
      `Date: ${ticket.Event.startsAt ? new Date(ticket.Event.startsAt).toLocaleDateString() : 'TBD'}`,
      {
        x: 50,
        y: 440,
        size: 12,
        font,
      }
    );

    if (ticket.Event.Location) {
      page.drawText(`Location: ${ticket.Event.Location.name}`, {
        x: 50,
        y: 420,
        size: 12,
        font,
      });
    }

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
