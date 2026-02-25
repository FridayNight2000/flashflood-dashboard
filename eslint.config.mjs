import tseslint from '@typescript-eslint/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default ignores of eslint-config-next.
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'inspect_db.js']),

  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Import sorting (readability)
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Prefer `import type` for types
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
    },
  },
]);

export default eslintConfig;
