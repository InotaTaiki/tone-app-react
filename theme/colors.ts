// Ported 1:1 from the web app's style.css custom properties, so the
// mobile app reads visually like the same product.
export const colors = {
  accentDark: '#4038B8',
  accentInk: '#EDEBFC',
  accent: '#5B4FE8',
  bgPanel: '#FFFFFF',
  bgSunken: '#EEEBF9',
  bg: '#F5F3FB',
  borderStrong: '#C6C0E6',
  border: '#DEDAF0',
  coral: '#E85B4F',
  gold: '#E8A628',
  inkFaint: '#8C89A6',
  inkSoft: '#5B5876',
  ink: '#1B1930',
  teal: '#1FA394',
  white: '#FFFFFF',
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export const shadow = {
  panel: {
    shadowColor: '#1B1930',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  btn: {
    shadowColor: '#5B4FE8',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
} as const;
