// ============================================
// THEME PROVIDER — wraps ThemeContext
// ============================================

import { ThemeProvider as ThemeContextProvider } from '../context/ThemeContext';

interface Props { children: React.ReactNode; }

const ThemeProvider = ({ children }: Props) => (
  <ThemeContextProvider>{children}</ThemeContextProvider>
);

export default ThemeProvider;
