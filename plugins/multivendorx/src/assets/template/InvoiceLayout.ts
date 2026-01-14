export interface InvoiceTheme {
    accent: string;
    accentSecondary: string;
    support: string;
    cardBg: string;
    textPrimary: string;
    textMuted: string;
  }
  
  export function buildInvoiceTheme(themeVars: Record<string, string>): InvoiceTheme {
    return {
      accent: themeVars['--accent'] ?? '#6366f1',
      accentSecondary: themeVars['--accent-secondary'] ?? '#a3a3a3',
      support: themeVars['--support'] ?? '#22c55e',
      cardBg: themeVars['--bg-card'] ?? '#ffffff',
      textPrimary: themeVars['--text-primary'] ?? '#1f2937',
      textMuted: themeVars['--text-muted'] ?? '#6b7280',
    };
  }
  
  export function getInvoiceRows() {
    return [
      {
        description: 'Premium SaaS Subscription',
        unit: 'Plan',
        qty: 1,
        price: 6000,
      },
    ];
  }
  