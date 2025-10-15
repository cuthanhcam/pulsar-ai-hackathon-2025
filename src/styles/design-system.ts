// PulsarTeam Design System - Factory/Augment Inspired
// Color Palette: Black, Silver/White, Orange

export const colors = {
  // Primary - Orange
  primary: {
    DEFAULT: '#f97316', // orange-500
    dark: '#ea580c',    // orange-600
    light: '#fb923c',   // orange-400
    glow: 'rgba(249, 115, 22, 0.2)',
  },
  
  // Neutrals - Black & Silver
  neutral: {
    black: '#000000',
    zinc900: '#18181b',
    zinc800: '#27272a',
    zinc700: '#3f3f46',
    zinc600: '#52525b',
    zinc400: '#a1a1aa',
    zinc300: '#d4d4d8',
    zinc100: '#f4f4f5',
    white: '#ffffff',
  },
  
  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
}

export const spacing = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
}

export const borderRadius = {
  sm: '0.5rem',   // 8px
  md: '0.75rem',  // 12px
  lg: '1rem',     // 16px
  xl: '1.5rem',   // 24px
  '2xl': '2rem',  // 32px
  full: '9999px',
}

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  glow: '0 0 20px rgba(249, 115, 22, 0.3)',
}

export const transitions = {
  fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
}

// Component Classes
export const components = {
  // Buttons
  button: {
    base: 'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20',
    secondary: 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700',
    ghost: 'text-zinc-400 hover:text-orange-500 hover:bg-zinc-800/50',
    sizes: {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2 text-base rounded-xl',
      lg: 'px-6 py-3 text-lg rounded-2xl',
    }
  },
  
  // Cards
  card: {
    base: 'rounded-2xl border transition-all duration-200',
    glass: 'bg-zinc-900/50 backdrop-blur-sm border-zinc-800 hover:border-orange-500/50',
    solid: 'bg-zinc-900 border-zinc-800 hover:border-zinc-700',
    elevated: 'bg-zinc-900 border-zinc-800 shadow-xl',
  },
  
  // Inputs
  input: {
    base: 'w-full px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all',
  },
  
  // Badges
  badge: {
    base: 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
    primary: 'bg-orange-500/10 border border-orange-500/20 text-orange-400',
    neutral: 'bg-zinc-800/50 border border-zinc-700 text-zinc-300',
  },
  
  // Icons - Hover effects
  icon: {
    base: 'transition-all duration-200',
    hover: 'group-hover:text-orange-500 group-hover:scale-110',
    active: 'text-orange-500',
    inactive: 'text-zinc-400',
  }
}
