function parseCivilDate(date: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) {
    return null;
  }

  const parsedDate = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));

  if (
    parsedDate.getUTCFullYear() !== Number(match[1]) ||
    parsedDate.getUTCMonth() !== Number(match[2]) - 1 ||
    parsedDate.getUTCDate() !== Number(match[3])
  ) {
    return null;
  }

  return parsedDate;
}

export function getDayLabel(date: string, index: number): string {
  if (index === 0) {
    return 'Hoje';
  }

  if (index === 1) {
    return 'Amanhã';
  }

  const parsedDate = parseCivilDate(date);

  if (!parsedDate) {
    return 'Data indisponível';
  }

  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', weekday: 'short' }).format(parsedDate);
}

export function getShortDate(date: string, currentYear = new Date().getFullYear()): string {
  const parsedDate = parseCivilDate(date);

  if (!parsedDate) {
    return 'Data indisponível';
  }

  const includesYear = parsedDate.getUTCFullYear() !== currentYear;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
    ...(includesYear ? { year: 'numeric' } : {}),
  }).format(parsedDate);
}