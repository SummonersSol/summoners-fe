import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backgroundColor: {
        'day': '#42CFEE',
        'night': '#171254',
        'default': '#EE4266',
      },
      keyframes: {
        "fade-in": {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        "pulse-spin": {
          '0%': {
            transform: 'rotate(0deg) scale(1)',
          },
          '50%': {
            transform: 'rotate(90deg) scale(1.5)'
          },
          '100%': {
            transform: 'rotate(360deg) scale(1)'
          }
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s linear',
        'fast-fade-in': 'fade-in 0.25s linear',
        'pulse-spin': 'pulse-spin 2s linear infinite',
        'ping-sm': 'ping-sm 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'ping-xxs': 'ping-xxs 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'monster-dead': 'monsterDead 0.08s linear infinite',
        'spin-fast': 'spin 0.08s linear infinite',
        'up-down': 'up-down 0.5s linear infinite',
        'up-down-fast': 'up-down 0.08s linear infinite',
        'heartbeat': 'heartbeat 2.5s linear infinite',
        'jump': 'jump 2s linear infinite',
      },
      fontFamily: {
        press: ['"Press Start 2P"', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        jetbrains: ['JetBrainsMono', 'sans-serif'],
        exo2: ['Exo2', 'serif'],
        starguard: ['Starguard', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config