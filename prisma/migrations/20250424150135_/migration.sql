-- CreateTable
CREATE TABLE "_TicketTypeSections" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TicketTypeSections_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TicketTypeSections_B_index" ON "_TicketTypeSections"("B");

-- AddForeignKey
ALTER TABLE "_TicketTypeSections" ADD CONSTRAINT "_TicketTypeSections_A_fkey" FOREIGN KEY ("A") REFERENCES "EventSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TicketTypeSections" ADD CONSTRAINT "_TicketTypeSections_B_fkey" FOREIGN KEY ("B") REFERENCES "TicketType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
