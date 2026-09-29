import React from 'react';
import { formatCurrency, getCurrencyInfo } from '../../constants/currencies';
import { convertCurrency } from '../../services/currencyService';
import { useApp } from '../../context/AppContext';

export function CurrencyDisplay({
  amount,
  currency = 'USD',
  showConverted = false,
  targetCurrency = 'USD',
  colored = false,
  className = '',
}) {
  const { currencyRates } = useApp();
  const num = Number(amount) || 0;
  const isPositive = num > 0.005;
  const isNegative = num < -0.005;

  const colorClass = colored
    ? isPositive
      ? 'positive'
      : isNegative
      ? 'negative'
      : 'settled'
    : '';

  const primaryFormatted = formatCurrency(Math.abs(num), currency);
  const sign = num < -0.005 ? '-' : colored && isPositive ? '+' : '';

  // Calculate converted equivalent if requested and currencies differ
  let convertedText = null;
  if (showConverted && currency !== targetCurrency) {
    const convertedVal = convertCurrency(num, currency, targetCurrency, currencyRates);
    convertedText = `≈ ${formatCurrency(Math.abs(convertedVal), targetCurrency)}`;
  }

  return (
    <span className={`currency-display-wrap tabular-nums ${colorClass} ${className}`}>
      <span className="currency-main">
        {sign}
        {primaryFormatted}
      </span>
      {convertedText && (
        <span className="currency-converted-sub" title={`Converted from ${currency} to ${targetCurrency}`}>
          {' '}({convertedText})
        </span>
      )}
    </span>
  );
}
