import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  typography: (theme: any) => ({
    DEFAULT: {
      css: {
        '--tw-prose-body': 'var(--text-primary)',
        '--tw-prose-headings': 'var(--text-primary)',
        '--tw-prose-lead': 'var(--text-secondary)',
        '--tw-prose-links': 'var(--text-primary)',
        '--tw-prose-bold': 'var(--text-primary)',
        '--tw-prose-counters': 'var(--text-muted)',
        '--tw-prose-bullets': 'var(--text-muted)',
        '--tw-prose-hr': 'var(--border)',
        '--tw-prose-quotes': 'var(--text-primary)',
        '--tw-prose-quote-borders': 'var(--border)',
        '--tw-prose-captions': 'var(--text-muted)',
        '--tw-prose-code': 'var(--text-primary)',
        '--tw-prose-pre-code': 'var(--text-primary)',
        '--tw-prose-pre-bg': 'var(--surface-muted)',
        '--tw-prose-th-borders': 'var(--border)',
        '--tw-prose-td-borders': 'var(--border)',
      },
    },
  }),
}
export default config
