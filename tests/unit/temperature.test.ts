import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('convertTemperature', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converte %s °C para %s °F', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
  });

  it('mantém Celsius e retorna null para temperatura ausente', () => {
    expect(convertTemperature(18.4, 'celsius')).toBe(18);
    expect(convertTemperature(null, 'fahrenheit')).toBeNull();
  });

  it('arredonda empates de meio grau para longe de zero', () => {
    expect(convertTemperature(0.5, 'celsius')).toBe(1);
    expect(convertTemperature(-0.5, 'celsius')).toBe(-1);
  });
});

describe('formatTemperature', () => {
  it('arredonda e inclui o símbolo da unidade selecionada', () => {
    expect(formatTemperature(0, 'fahrenheit')).toBe('32 °F');
    expect(formatTemperature(18.6, 'celsius')).toBe('19 °C');
  });

  it('retorna null para temperatura ausente', () => {
    expect(formatTemperature(null, 'celsius')).toBeNull();
  });
});

describe('unitLabel', () => {
  it('retorna o nome de cada unidade', () => {
    expect(unitLabel('celsius')).toBe('Celsius');
    expect(unitLabel('fahrenheit')).toBe('Fahrenheit');
  });
});
