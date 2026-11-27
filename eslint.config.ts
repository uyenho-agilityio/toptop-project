import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Every function is an arrow function: `const fn = () => {}`.
    rules: {
      'func-style': ['error', 'expression'],
      'prefer-arrow-callback': 'error',
      // Import a folder through its index.ts: `@/utils`, not `@/utils/cn`.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex:
                '^@/(constants|schemas|types|stores|hooks|services|utils|i18n)/',
              message:
                'Import from the folder index (for example `@/utils`), not a file inside it.',
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.open-next/**',
    '.wrangler/**',
  ]),
]);

export default eslintConfig;
