import { getDayLabel, getShortDate } from '../lib/format';
import { convertTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

function UnavailableValue() {
  return (
    <span>
      <span aria-hidden="true">—</span>
      <span className="sr-only">Indisponível</span>
    </span>
  );
}

export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const condition = getWeatherCondition(day.weatherCode);
  const minTemperature = convertTemperature(day.minTemperatureC, unit);
  const maxTemperature = convertTemperature(day.maxTemperatureC, unit);
  const unitSymbol = unit === 'celsius' ? '°C' : '°F';
  const hasWeatherData =
    day.weatherCode !== null ||
    day.minTemperatureC !== null ||
    day.maxTemperatureC !== null ||
    day.precipitationProbability !== null;

  return (
    <article className="h-full rounded-lg border border-white/10 bg-white/5 p-4 text-white shadow-glass backdrop-blur-md">
      <header>
        <h3 className="font-semibold">{getDayLabel(day.date, index)}</h3>
        <time className="text-sm text-white/70" dateTime={day.date}>
          {getShortDate(day.date)}
        </time>
      </header>

      {!hasWeatherData ? (
        <p className="mt-6 text-sm font-medium text-white/70">Previsão indisponível</p>
      ) : (
        <>
          <div className="my-5 text-center">
            <span aria-hidden="true" className="block text-4xl">
              {condition.icon}
            </span>
            <p className="mt-2 min-h-10 text-sm text-white/80">
              {condition.label === 'Indisponível' ? <UnavailableValue /> : condition.label}
            </p>
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-white/70">Máx.</dt>
              <dd className="font-semibold">
                {maxTemperature === null ? (
                  <UnavailableValue />
                ) : (
                  `${maxTemperature} ${unitSymbol}`
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-white/70">Mín.</dt>
              <dd className="font-semibold">
                {minTemperature === null ? (
                  <UnavailableValue />
                ) : (
                  `${minTemperature} ${unitSymbol}`
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-white/70">Chuva</dt>
              <dd className="font-semibold">
                {day.precipitationProbability === null ? (
                  <UnavailableValue />
                ) : (
                  `${day.precipitationProbability}%`
                )}
              </dd>
            </div>
          </dl>
        </>
      )}
    </article>
  );
}