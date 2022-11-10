-- CreateTable
CREATE TABLE "pokemon" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_featured" BOOLEAN DEFAULT false,
    "image_url" TEXT,

    CONSTRAINT "pokemon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pokemon_id_key" ON "pokemon"("id");
