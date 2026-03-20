/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // NCare Primary (Teal Healthcare)
        primary: {
          DEFAULT: '#005e53',
          container: '#00796b',
          fixed: '#97f3e2',
          'fixed-dim': '#7ad7c6',
          on: '#ffffff',
        },
        // NCare Secondary (Professional Blue)
        secondary: {
          DEFAULT: '#005db7',
          container: '#64a1ff',
          on: '#ffffff',
          fixed: '#d6e3ff',
          'fixed-dim': '#a9c7ff',
          'on-fixed': '#001b3d',
          'on-fixed-variant': '#00468c',
        },
        // NCare Tertiary
        tertiary: {
          DEFAULT: '#005e58',
          container: '#007971',
          fixed: '#8ef4e9',
          'fixed-dim': '#71d7cd',
          on: '#ffffff',
          'on-fixed': '#00201d',
          'on-fixed-variant': '#00504a',
        },
        // NCare Surfaces
        surface: {
          DEFAULT: '#f8fafb',
          container: {
            lowest: '#ffffff',
            low: '#f2f4f5',
            DEFAULT: '#eceeef',
            high: '#e6e8e9',
            highest: '#e1e3e4',
          },
          dim: '#d8dadb',
          tint: '#006b5e',
          variant: '#e1e3e4',
        },
        // NCare On Surfaces
        'on-surface': {
          DEFAULT: '#191c1d',
          variant: '#3e4946',
        },
        // NCare Background
        background: '#f8fafb',
        // NCare Outlines
        outline: {
          DEFAULT: '#6e7a76',
          variant: '#bdc9c5',
        },
        // NCare Inverse
        inverse: {
          surface: '#2e3132',
          'on-surface': '#eff1f2',
          primary: '#7ad7c6',
        },
        // NCare Error
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
          on: '#ffffff',
          'on-container': '#93000a',
        },
        // Status chips (healthcare-friendly - teal/blue instead of red/green)
        'on-shift': '#64a1ff',
        'offline': '#e1e3e4',
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: '1.5rem',
        '2xl': '2rem',
      },
      boxShadow: {
        ambient: '0 12px 32px rgba(25, 28, 29, 0.04)',
      },
    },
  },
  plugins: [],
}
