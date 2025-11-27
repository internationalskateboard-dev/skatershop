/*
  Warnings:

  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductVariant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sale` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_productId_fkey";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "ProductVariant";

-- DropTable
DROP TABLE "Sale";

-- CreateTable
CREATE TABLE "category" (
    "idcategory" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("idcategory")
);

-- CreateTable
CREATE TABLE "product_type" (
    "idtype" BIGSERIAL NOT NULL,
    "typename" TEXT NOT NULL,

    CONSTRAINT "product_type_pkey" PRIMARY KEY ("idtype")
);

-- CreateTable
CREATE TABLE "colorsprod" (
    "idcolorsprod" BIGSERIAL NOT NULL,
    "namecolorsprod" TEXT NOT NULL,

    CONSTRAINT "colorsprod_pkey" PRIMARY KEY ("idcolorsprod")
);

-- CreateTable
CREATE TABLE "sizesprod" (
    "idsizesprod" BIGSERIAL NOT NULL,
    "sizesprod" TEXT NOT NULL,
    "idtype_fk" BIGINT NOT NULL,

    CONSTRAINT "sizesprod_pkey" PRIMARY KEY ("idsizesprod")
);

-- CreateTable
CREATE TABLE "product" (
    "idprod" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "desc" TEXT,
    "details" TEXT,
    "idtype_fk" BIGINT NOT NULL,
    "idcategory_fk" BIGINT,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_pkey" PRIMARY KEY ("idprod")
);

-- CreateTable
CREATE TABLE "product_color_image" (
    "id" BIGSERIAL NOT NULL,
    "idprod_fk" BIGINT NOT NULL,
    "idcolor_fk" BIGINT NOT NULL,
    "image_url" TEXT NOT NULL,

    CONSTRAINT "product_color_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_color_size" (
    "id_stock_color_size" BIGSERIAL NOT NULL,
    "id_prod_fk" BIGINT NOT NULL,
    "id_color_fk" BIGINT NOT NULL,
    "id_size_fk" BIGINT NOT NULL,
    "stock" INTEGER NOT NULL,

    CONSTRAINT "stock_color_size_pkey" PRIMARY KEY ("id_stock_color_size")
);

-- CreateTable
CREATE TABLE "productvariant" (
    "idvariant" BIGSERIAL NOT NULL,
    "idprod_fk" BIGINT NOT NULL,
    "idcolor_fk" BIGINT NOT NULL,
    "idsize_fk" BIGINT NOT NULL,
    "id_stock_color_size" BIGINT NOT NULL,

    CONSTRAINT "productvariant_pkey" PRIMARY KEY ("idvariant")
);

-- CreateTable
CREATE TABLE "users" (
    "iduser" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "fullname" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("iduser")
);

-- CreateTable
CREATE TABLE "roles" (
    "idrole" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("idrole")
);

-- CreateTable
CREATE TABLE "user_role" (
    "iduser_fk" BIGINT NOT NULL,
    "idrole_fk" BIGINT NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("iduser_fk","idrole_fk")
);

-- CreateTable
CREATE TABLE "orders" (
    "idorder" BIGSERIAL NOT NULL,
    "iduser_fk" BIGINT,
    "total" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("idorder")
);

-- CreateTable
CREATE TABLE "order_items" (
    "idorder_item" BIGSERIAL NOT NULL,
    "idorder_fk" BIGINT NOT NULL,
    "id_prod_fk" BIGINT NOT NULL,
    "id_color_fk" BIGINT NOT NULL,
    "id_size_fk" BIGINT NOT NULL,
    "id_stock_color_size" BIGINT NOT NULL,
    "qty" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("idorder_item")
);

-- CreateTable
CREATE TABLE "sold_stock_log" (
    "idsold" BIGSERIAL NOT NULL,
    "id_stock_color_size" BIGINT NOT NULL,
    "qty" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sold_stock_log_pkey" PRIMARY KEY ("idsold")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_type_typename_key" ON "product_type"("typename");

-- CreateIndex
CREATE UNIQUE INDEX "colorsprod_namecolorsprod_key" ON "colorsprod"("namecolorsprod");

-- CreateIndex
CREATE UNIQUE INDEX "product_slug_key" ON "product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- AddForeignKey
ALTER TABLE "sizesprod" ADD CONSTRAINT "sizesprod_idtype_fk_fkey" FOREIGN KEY ("idtype_fk") REFERENCES "product_type"("idtype") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_idtype_fk_fkey" FOREIGN KEY ("idtype_fk") REFERENCES "product_type"("idtype") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_idcategory_fk_fkey" FOREIGN KEY ("idcategory_fk") REFERENCES "category"("idcategory") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_color_image" ADD CONSTRAINT "product_color_image_idprod_fk_fkey" FOREIGN KEY ("idprod_fk") REFERENCES "product"("idprod") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_color_image" ADD CONSTRAINT "product_color_image_idcolor_fk_fkey" FOREIGN KEY ("idcolor_fk") REFERENCES "colorsprod"("idcolorsprod") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_color_size" ADD CONSTRAINT "stock_color_size_id_prod_fk_fkey" FOREIGN KEY ("id_prod_fk") REFERENCES "product"("idprod") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_color_size" ADD CONSTRAINT "stock_color_size_id_color_fk_fkey" FOREIGN KEY ("id_color_fk") REFERENCES "colorsprod"("idcolorsprod") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_color_size" ADD CONSTRAINT "stock_color_size_id_size_fk_fkey" FOREIGN KEY ("id_size_fk") REFERENCES "sizesprod"("idsizesprod") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productvariant" ADD CONSTRAINT "productvariant_idprod_fk_fkey" FOREIGN KEY ("idprod_fk") REFERENCES "product"("idprod") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productvariant" ADD CONSTRAINT "productvariant_idcolor_fk_fkey" FOREIGN KEY ("idcolor_fk") REFERENCES "colorsprod"("idcolorsprod") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productvariant" ADD CONSTRAINT "productvariant_idsize_fk_fkey" FOREIGN KEY ("idsize_fk") REFERENCES "sizesprod"("idsizesprod") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productvariant" ADD CONSTRAINT "productvariant_id_stock_color_size_fkey" FOREIGN KEY ("id_stock_color_size") REFERENCES "stock_color_size"("id_stock_color_size") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_iduser_fk_fkey" FOREIGN KEY ("iduser_fk") REFERENCES "users"("iduser") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_idrole_fk_fkey" FOREIGN KEY ("idrole_fk") REFERENCES "roles"("idrole") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_iduser_fk_fkey" FOREIGN KEY ("iduser_fk") REFERENCES "users"("iduser") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_idorder_fk_fkey" FOREIGN KEY ("idorder_fk") REFERENCES "orders"("idorder") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_id_prod_fk_fkey" FOREIGN KEY ("id_prod_fk") REFERENCES "product"("idprod") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_id_color_fk_fkey" FOREIGN KEY ("id_color_fk") REFERENCES "colorsprod"("idcolorsprod") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_id_size_fk_fkey" FOREIGN KEY ("id_size_fk") REFERENCES "sizesprod"("idsizesprod") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_id_stock_color_size_fkey" FOREIGN KEY ("id_stock_color_size") REFERENCES "stock_color_size"("id_stock_color_size") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sold_stock_log" ADD CONSTRAINT "sold_stock_log_id_stock_color_size_fkey" FOREIGN KEY ("id_stock_color_size") REFERENCES "stock_color_size"("id_stock_color_size") ON DELETE RESTRICT ON UPDATE CASCADE;
