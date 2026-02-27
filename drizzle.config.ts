import { defineConfig } from 'drizzle-kit';
import path from 'path';

export default defineConfig({
  dialect: 'sqlite',
  schema: './lib/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    // drizzle-kit 执行时 cwd=web/，path.join 结果与 lib/db.ts 一致
    url: path.join(process.cwd(), '..', 'hydrology_data.db'),
  },
});
