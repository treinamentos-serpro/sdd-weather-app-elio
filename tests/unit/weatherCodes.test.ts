import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('getWeatherCondition', () => {
  it('retorna a condição correspondente a um código conhecido', () => {
    expect(getWeatherCondition(3)).toEqual({ icon: '☁️', label: 'Nublado' });
  });

  it.each([999, null])('retorna fallback para o código %s', (code) => {
    expect(getWeatherCondition(code)).toEqual({ icon: '—', label: 'Indisponível' });
  });
});
