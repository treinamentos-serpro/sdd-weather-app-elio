import { describe, expect, it } from 'vitest';
import { getDayLabel, getShortDate } from '../../src/lib/format';

describe('getDayLabel', () => {
  it('rotula os índices zero e um como hoje e amanhã', () => {
    expect(getDayLabel('2026-09-30', 0)).toBe('Hoje');
    expect(getDayLabel('2026-10-01', 1)).toBe('Amanhã');
  });

  it('formata o dia da semana para os demais índices', () => {
    expect(getDayLabel('2026-10-02', 2)).toBe('sex.');
  });
});

describe('getShortDate', () => {
  it('formata dia e mês sem ano quando a data é do ano corrente', () => {
    expect(getShortDate('2026-09-30', 2026)).toBe('30/09');
  });

  it('inclui o ano quando a data pertence a outro ano', () => {
    expect(getShortDate('2027-01-01', 2026)).toBe('01/01/2027');
  });
});
