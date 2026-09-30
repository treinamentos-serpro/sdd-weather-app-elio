import type { Unit } from '../types/weather';

function roundHalfAwayFromZero(value: number) {
  return Math.sign(value) * Math.round(Math.abs(value));
}

export function convertTemperature(valueC: number | null, unit: Unit): number | null {
  if (valueC === null) {
    return null;
  }

  const convertedValue = unit === 'fahrenheit' ? (valueC * 9) / 5 + 32 : valueC;
  return roundHalfAwayFromZero(convertedValue);
}

export function formatTemperature(valueC: number | null, unit: Unit): string | null {
  const temperature = convertTemperature(valueC, unit);
  if (temperature === null) {
    return null;
  }

  return `${temperature} ${unit === 'celsius' ? '°C' : '°F'}`;
}

export function unitLabel(unit: Unit): string {
  return unit === 'celsius' ? 'Celsius' : 'Fahrenheit';
}
