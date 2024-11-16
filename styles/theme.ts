// styles/theme.ts
export const designSystem = {
    colors: {
      primary: {
        main: '#4A3AFF',      // Bleu profond
        light: '#6B5FFF',
        dark: '#2D1FE5',
        contrast: '#FFFFFF'
      },
      secondary: {
        main: '#FF3A8C',      // Rose japonais
        light: '#FF5FA3',
        dark: '#E51F71',
        contrast: '#FFFFFF'
      },
      neutral: {
        white: '#FFFFFF',
        gray100: '#F7F7F8',
        gray200: '#E8E8ED',
        gray300: '#C9C9D2',
        gray400: '#9999A6',
        gray500: '#666673',
        gray600: '#333340',
        black: '#1A1A27',
        red: '#FF0000'
      },
      semantic: {
        success: '#22C55E',
        warning: '#FBBF24',
        error: '#EF4444',
        info: '#3B82F6'
      },
      accents: {
        sakura: '#FFB7C5',    // Rose cerisier
        matcha: '#90B77D',    // Vert thé
        sunset: '#FF9B50',    // Orange temple
        ocean: '#2E94B9'      // Bleu vague
      },
      chart: {
        1: '#4A3AFF',
        2: '#FF3A8C',
        3: '#90B77D',
        4: '#FFB7C5',
        5: '#2E94B9'
      }
    },
    typography: {
      fonts: {
        primary: 'Work Sans',
        secondary: 'Noto Sans JP',
        mono: 'Fira Code',
        display: 'Beau Rivage',
        cursive: 'Lavishly Yours'
      },
      sizes: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        base: '1rem',     // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
        '2xl': '1.5rem',  // 24px
        '3xl': '1.875rem',// 30px
        '4xl': '2.25rem', // 36px
      },
      weights: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    spacing: {
      xs: '0.25rem',  // 4px
      sm: '0.5rem',   // 8px
      md: '1rem',     // 16px
      lg: '1.5rem',   // 24px
      xl: '2rem',     // 32px
      '2xl': '2.5rem',// 40px
      '3xl': '3rem'   // 48px
    },
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px rgba(0, 0, 0, 0.07)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.15)'
    },
    radius: {
      sm: '0.25rem',  // 4px
      md: '0.375rem', // 6px
      lg: '0.5rem',   // 8px
      xl: '0.75rem',  // 12px
      '2xl': '1rem'   // 16px
    }
  };