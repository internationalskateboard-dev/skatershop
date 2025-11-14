/**Ese import "dotenv/config"; hace que se lea tu archivo .env antes de que se ejecute env("DATABASE_URL"). 
 * Sin eso, Prisma detecta prisma.config.ts 
 * y deja de autoleer .env, por eso te dice que falta DATABASE_URL */
import "dotenv/config"; // 👈 IMPORTANTE: carga las variables del .env
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
