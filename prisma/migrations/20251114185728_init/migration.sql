-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "desc" TEXT,
    "details" TEXT,
    "image" TEXT,
    "sizesJson" JSONB,
    "stock" INTEGER,
    "colorsJson" JSONB,
    "sizeGuide" TEXT,
    "isClothing" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemsJson" JSONB NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "customerJson" JSONB,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);
