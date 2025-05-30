-- CreateTable
CREATE TABLE "PendingIng" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PendingIng_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingIng_name_key" ON "PendingIng"("name");
