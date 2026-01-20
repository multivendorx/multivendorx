export interface InvoiceTheme {
  accent: string;
  accentSecondary: string;
  support: string;
  cardBg: string;
  textPrimary: string;
  textMuted: string;
}

export function buildInvoiceTheme(colors: {
  colorPrimary?: string;
  colorSecondary?: string;
  colorAccent?: string;
  colorSupport?: string;
}): InvoiceTheme {
  return {
    accent: colors.colorAccent ?? '#49BEB6',
    accentSecondary: colors.colorSecondary ?? '#FADD3A',
    support: colors.colorSupport ?? '#075F63',
    cardBg: '#ffffff',
    textPrimary: '#111827',
    textMuted: '#6b7280',
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
