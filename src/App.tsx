import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data, error, search, retry } = useWeather();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'success' && data) {
      resultRef.current?.focus();
    }
  }, [status, data]);

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <a
        className="sr-only z-50 bg-white px-4 py-3 font-semibold text-night-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-none focus:ring-2 focus:ring-accent-400"
        href="#main-content"
      >
        Ir para o conteúdo
      </a>
      <header className="border-b border-white/10 bg-night-800/80 backdrop-blur-md">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-sun">Previsão local</p>
              <h1 className="text-2xl font-bold sm:text-3xl">Clima Agora</h1>
            </div>
            <UnitToggle onChange={setUnit} unit={unit} />
          </div>

          <div className="mt-5">
            <SearchBar disabled={status === 'loading'} onSearch={search} />
          </div>
        </div>
      </header>

      <main
        className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
        id="main-content"
        tabIndex={-1}
      >
        <div
          aria-label="Resultado da consulta"
          className="rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-4 focus:ring-offset-night-900"
          ref={resultRef}
          role="region"
          tabIndex={-1}
        >
          {status === 'idle' ? (
            <EmptyState
              hint="Digite o nome de uma cidade para consultar as condições atuais."
              title="Consulte o clima"
            />
          ) : null}

          {status === 'loading' ? <LoadingState message="Carregando dados do clima..." /> : null}

          {status === 'empty' ? (
            <EmptyState
              hint="Revise o nome informado e tente uma nova busca."
              title="Nenhuma cidade encontrada"
            />
          ) : null}

          {status === 'error' ? (
            <ErrorState
              message={error ?? 'Não foi possível carregar os dados do clima.'}
              onRetry={retry}
            />
          ) : null}

          {data ? (
            <div className="space-y-8">
              <CurrentWeather city={data.city} current={data.current} unit={unit} />
              <ForecastList forecast={data.forecast} unit={unit} />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
