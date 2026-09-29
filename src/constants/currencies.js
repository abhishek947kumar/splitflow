// Supported Currencies with metadata
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', decimals: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', decimals: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', decimals: 0 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦', decimals: 2 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', decimals: 2 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', decimals: 2 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', decimals: 2 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', decimals: 2 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪', decimals: 2 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', decimals: 2 },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', flag: '🇭🇰', decimals: 2 },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', flag: '🇳🇿', decimals: 2 },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪', decimals: 2 },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', flag: '🇳🇴', decimals: 2 },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', flag: '🇩🇰', decimals: 2 },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷', decimals: 0 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭', decimals: 2 },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', flag: '🇲🇽', decimals: 2 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷', decimals: 2 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦', decimals: 2 },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷', decimals: 2 },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', flag: '🇮🇩', decimals: 0 },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭', decimals: 2 },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾', decimals: 2 },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', flag: '🇻🇳', decimals: 0 },
];

export const CURRENCY_MAP = CURRENCIES.reduce((acc, c) => {
  acc[c.code] = c;
  return acc;
}, {});

export function getCurrencyInfo(code = 'USD') {
  return CURRENCY_MAP[code] || { code, symbol: code, name: code, flag: '🌐', decimals: 2 };
}

export function formatCurrency(amount, code = 'USD', showSymbol = true) {
  const num = Number(amount) || 0;
  const curr = getCurrencyInfo(code);
  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: curr.decimals,
    maximumFractionDigits: curr.decimals,
  });
  return showSymbol ? `${curr.symbol} ${formatted}` : formatted;
}
