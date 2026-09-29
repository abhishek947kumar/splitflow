// Currency conversion service with live API and resilient fallback
const RATES_STORAGE_KEY = 'splitflow_currency_rates_v1';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour cache

// Resilient fallback rates anchored to USD = 1.0
export const FALLBACK_RATES = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 153.5,
  CAD: 1.36,
  AUD: 1.52,
  INR: 83.5,
  CHF: 0.90,
  SGD: 1.34,
  AED: 3.67,
  CNY: 7.24,
  HKD: 7.82,
  NZD: 1.66,
  SEK: 10.65,
  NOK: 10.82,
  DKK: 6.89,
  KRW: 1370.0,
  THB: 36.8,
  MXN: 17.1,
  BRL: 5.15,
  ZAR: 18.4,
  TRY: 32.5,
  IDR: 16200.0,
  PHP: 57.5,
  MYR: 4.72,
  VND: 25400.0,
};

export async function fetchLiveRates(forceRefresh = false) {
  try {
    if (!forceRefresh) {
      const cached = localStorage.getItem(RATES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const age = Date.now() - (parsed.timestamp || 0);
        if (age < CACHE_DURATION_MS && parsed.rates) {
          return {
            rates: { ...FALLBACK_RATES, ...parsed.rates },
            timestamp: parsed.timestamp,
            isLive: true,
            fromCache: true,
          };
        }
      }
    }

    // Free Open Exchange Rate API (ExchangeRate-API free tier / open endpoint)
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    if (data && data.rates) {
      const combinedRates = { ...FALLBACK_RATES, ...data.rates };
      const cachePayload = {
        rates: combinedRates,
        timestamp: Date.now(),
        provider: 'ExchangeRate-API',
      };
      localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(cachePayload));
      return {
        rates: combinedRates,
        timestamp: Date.now(),
        isLive: true,
        fromCache: false,
      };
    }
    throw new Error('Invalid rates data received');
  } catch (err) {
    console.warn('SplitFlow: Using fallback exchange rates due to network/API status:', err.message);
    return {
      rates: FALLBACK_RATES,
      timestamp: Date.now(),
      isLive: false,
      fromCache: false,
      error: err.message,
    };
  }
}

/**
 * Converts an amount from one currency to another using a base rates table (USD anchor)
 */
export function convertCurrency(amount, fromCode, toCode, rates = FALLBACK_RATES) {
  const num = Number(amount) || 0;
  if (!fromCode || !toCode || fromCode === toCode) return num;

  const fromRate = rates[fromCode] || FALLBACK_RATES[fromCode] || 1;
  const toRate = rates[toCode] || FALLBACK_RATES[toCode] || 1;

  // Convert from fromCode -> USD -> toCode
  // Since rates are: 1 USD = fromRate [FROM], amount in USD = amount / fromRate
  // amount in toCode = (amount / fromRate) * toRate
  const converted = (num / fromRate) * toRate;
  return Math.round(converted * 100) / 100;
}

/**
 * Returns exchange rate of fromCode in terms of toCode (e.g., 1 EUR = 1.08 USD)
 */
export function getExchangeRate(fromCode, toCode, rates = FALLBACK_RATES) {
  if (fromCode === toCode) return 1;
  const fromRate = rates[fromCode] || FALLBACK_RATES[fromCode] || 1;
  const toRate = rates[toCode] || FALLBACK_RATES[toCode] || 1;
  return toRate / fromRate;
}
