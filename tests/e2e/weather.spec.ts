import { expect, type Page, test } from '@playwright/test';

const geocodingResponse = {
  results: [
    {
      id: 3448439,
      name: 'São Paulo',
      latitude: -23.55,
      longitude: -46.63,
      admin1: 'São Paulo',
      country: 'Brasil',
    },
  ],
};

const forecastResponse = {
  timezone: 'America/Sao_Paulo',
  utc_offset_seconds: -10800,
  current: {
    time: '2026-09-30T14:30',
    temperature_2m: 0,
    weather_code: 0,
  },
  daily: {
    time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
    weather_code: [0, 1, 2, 3, 61],
    temperature_2m_min: [0, 1, 2, 3, 4],
    temperature_2m_max: [10, 11, 12, 13, 14],
    precipitation_probability_max: [0, 10, 20, 30, 40],
  },
};

async function mockWeatherApis(page: Page, searchResponse: object = geocodingResponse) {
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ status: 200, json: searchResponse }),
  );
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({ status: 200, json: forecastResponse }),
  );
}

test('atalho de teclado move o foco para o conteúdo principal', async ({ page }) => {
  await page.goto('/');

  const skipLink = page.getByRole('link', { name: 'Ir para o conteúdo' });
  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test('busca uma cidade, exibe a previsão e converte a temperatura para Fahrenheit', async ({
  page,
}) => {
  await mockWeatherApis(page);

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  const current = page.getByRole('region', { name: 'Clima atual em São Paulo' });
  await expect(current.getByText('0 °C', { exact: true })).toBeVisible();

  // O input é sr-only; o <span> visual do label intercepta o clique.
  await page.getByRole('radio', { name: 'Fahrenheit' }).check({ force: true });

  await expect(current.getByText('32 °F', { exact: true })).toBeVisible();
});

test('mostra estado vazio quando o geocoding não retorna resultados', async ({ page }) => {
  await mockWeatherApis(page, {});

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
});

test('renderiza o clima no viewport mobile de 375x812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockWeatherApis(page);

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  const current = page.getByRole('region', { name: 'Clima atual em São Paulo' });
  await expect(current).toBeVisible();
  await expect(current.getByText('0 °C', { exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
});
