import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			// Brand colors for Noor AlTayseer
  			brand: {
  				DEFAULT: '#0B72B9', // Ocean Blue
  				50: '#EBF5FF',
  				100: '#D7EBFF',
  				200: '#B8DDFF',
  				300: '#87C8FF',
  				400: '#4FA8FF',
  				500: '#2B86FF',
  				600: '#0B72B9', // Primary
  				700: '#0A5A8F',
  				800: '#0F4973',
  				900: '#134061',
  			},
  			gold: {
  				DEFAULT: '#E6C36A', // Light Golden
  				50: '#FDF9F0',
  				100: '#FAF0D9',
  				200: '#F4E0B2',
  				300: '#EDCA81',
  				400: '#E6C36A', // Primary
  				500: '#DFB553',
  				600: '#CB9F48',
  				700: '#A98240',
  				800: '#886A3A',
  				900: '#705632',
  			},
  			ink: '#0F172A', // Neutral dark
  			bg: '#F8FAFC', // Neutral light
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: '1rem',
  			'2xl': '1.25rem',
  		},
  		boxShadow: {
  			card: '0 6px 20px rgba(0,0,0,0.08)',
  			header: '0 4px 14px rgba(0,0,0,0.06)',
  		},
  		ringColor: {
  			DEFAULT: '#E6C36A', // Golden focus rings
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
