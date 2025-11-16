// CHANGE: Recreated numeric formatting helpers from the Compose utilities.
// WHY: Screens expect ruble-formatted values identical to the Kotlin reference implementation.
// QUOTE(TЗ): "Можешь переписать код с KMP на TypeScript React Vite"
// REF: user-message-3
// SOURCE: context.txt §composeApp/src/commonMain/kotlin/com/yet/home/utils/formatTwoDecimalCommon.kt

/**
 * Formats a floating point number using exactly two decimals without relying on locale rounding.
 * @param value Numeric value.
 * @returns Deterministic string with two decimals.
 * @invariant Output always contains a decimal separator to prevent layout jumps.
 */
export const formatTwoDecimalCommon = (value: number): string => {
  const rounded = Math.round(value * 100)
  const integerPart = Math.trunc(rounded / 100)
  const fractionalPart = Math.abs(rounded % 100)
  return `${integerPart}.${fractionalPart.toString().padStart(2, '0')}`
}

/**
 * Adds thin spaces between each group of three digits.
 * @param value Non-negative integer.
 * @returns Readable human string (e.g. 123 456).
 * @invariant Throws if value is negative because monetary fields never drop below zero.
 */
export const formatNumberWithSpaces = (value: number): string => {
  if (value < 0) {
    throw new Error('formatNumberWithSpaces expects non-negative numbers')
  }

  return value
    .toString()
    .split('')
    .reverse()
    .reduce<string[]>((acc, digit, index) => {
      const groupIndex = Math.floor(index / 3)
      if (!acc[groupIndex]) {
        acc[groupIndex] = ''
      }
      acc[groupIndex] = digit + acc[groupIndex]
      return acc
    }, [])
    .reverse()
    .join(' ')
}

/**
 * Formats a currency amount in rubles just like the Compose helper.
 * @param value Monetary amount.
 * @returns Value prefixed with the $ symbol to match the mock dataset.
 */
export const formatCurrencyRubles = (value: number): string => {
  const rounded = Math.round(value)
  const absolute = Math.abs(rounded)
  const sign = rounded < 0 ? '-' : ''
  return `${sign}$${formatNumberWithSpaces(absolute)}`
}

/**
 * Compact currency formatter without thousands separator.
 * @param value Monetary amount.
 * @returns Compact string representation.
 */
export const formatCurrencyRublesCompact = (value: number): string => {
  const rounded = Math.round(value)
  return `$${rounded}`
}

/**
 * Human friendly percentage string.
 * @param value Value expressed in percent.
 * @returns String with percent sign and two decimals.
 */
export const formatPercent = (value: number): string => `${formatTwoDecimalCommon(value)}%`

/**
 * ISO date -> localized date string (yyyy-mm-dd) used for investment lists.
 * @param iso ISO date string.
 * @returns Formatted date representation.
 */
export const formatIsoDate = (iso: string): string => {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('ru-RU')
}
