// import { defineConfig, env } from 'prisma/config';

// export default defineConfig({
//   schema: 'prisma/schema.prisma',
//   datasource: {
//     url: env('DATABASE_URL'),
//   },
// });

import { defineConfig } from 'prisma/config';

//configure dotenv
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/taskboard?schema=public",
  },
}); 