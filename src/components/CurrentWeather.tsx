import { formatObservationTime, isObservationStale } from '../lib/dateTime';
import { convertTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
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

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const temperature = convertTemperature(current.temperatureC, unit);
  const condition = getWeatherCondition(current.weatherCode);
  const observationTime = formatObservationTime(current.observedAt);
  const locationContext = [city.admin1, city.country].filter(Boolean).join(', ');
  const unitSymbol = unit === 'celsius' ? '°C' : '°F';

  return (
    <section
      aria-label={`Clima atual em ${city.name}`}
      className="w-full rounded-lg border border-white/10 bg-white/5 p-5 text-white shadow-glass backdrop-blur-md sm:p-8"
    >
      <header>
        <p className="text-sm font-medium text-accent-400">Clima atual</p>
        <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">{city.name}</h2>
        {locationContext ? <p className="mt-1 text-sm text-white/70">{locationContext}</p> : null}
      </header>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="whitespace-nowrap text-6xl font-semibold leading-none text-white sm:text-8xl">
            {temperature === null ? <UnavailableValue /> : `${temperature} ${unitSymbol}`}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span aria-hidden="true" className="text-4xl">
              {condition.icon}
            </span>
            <p className="text-xl font-medium">
              {condition.label === 'Indisponível' ? <UnavailableValue /> : condition.label}
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 text-sm text-white/70 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          {observationTime && current.observedAt ? (
            <p>
              Atualizado às <time dateTime={current.observedAt}>{observationTime}</time>
            </p>
          ) : (
            <p>Horário de atualização indisponível</p>
          )}
          {isObservationStale(current.observedAt) ? (
            <p className="mt-2 font-semibold text-sun">Desatualizado</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
