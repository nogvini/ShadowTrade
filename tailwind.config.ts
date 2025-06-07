import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // Adicione outros diretórios se necessário
  ],
  theme: {
    extend: {
      fontFamily: {
        'press-start': ['"Press Start 2P"', 'cursive'],
      },
      colors: {
        'bg-primary': '#000000',
        'bg-secondary': '#130e13',
        'bg-tertiary': '#271d27',
        'bg-quaternary': '#3a2b3a',
        'bg-quinary': '#4d3a4d',
        'text-primary': '#b39bad',
        'text-secondary': '#b39bad', // Usando a mesma cor para consistência
        'success': '#decad9', // Verde para sucesso
        'error': '#ef4444', // Vermelho para erro
        // Adicione outras cores conforme necessário
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        chainMove: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(2px)' },
        },
        // Adicionar animação de glow aqui se for via keyframes
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        chainMove: 'chainMove 3s ease-in-out infinite',
      },
      boxShadow: {
        'glow-success': '0 0 15px 5px rgba(74, 222, 128, 0.3)',
        'glow-error': '0 0 15px 5px rgba(239, 68, 68, 0.3)',
      }
    },
  },
  plugins: [],
};

export default config; 