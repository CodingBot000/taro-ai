import { defineConfig, globalIgnores } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@next/next/no-img-element': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['src/providers/AuthProvider.tsx'],
    rules: {
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'next-env.d.ts',
    'node_modules/**',
    'out/**',
    'coverage/**',
  ]),
]);
