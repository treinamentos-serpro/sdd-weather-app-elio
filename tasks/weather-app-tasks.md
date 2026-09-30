# Backlog de Tarefas — Weather App

Tarefas derivadas de `plans/weather-app-plan.md` e rastreadas aos requisitos de
`specs/weather-app-spec.md`. Os IDs seguem a ordem de execução; tarefas na mesma
entrega sem dependência mútua podem ser implementadas em paralelo.

## Entrega 1 — Tipos e funções puras

### T-01 — Definir contratos compartilhados do domínio
- **Tipo:** Data
- **Descrição:** Criar tipos de cidade, unidade, clima, previsão, erros e estados de consulta.
- **Critérios de aceite:** `weather.ts` exporta `Unit` (`celsius | fahrenheit`), `City`, `WeatherLocation`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `QueryError` e `QueryState<T>`; este último permite `idle`, `loading`, `empty`, `success` com `data` e `error` com `QueryError`; campos meteorológicos parciais aceitam `null`; `pnpm build` termina com código 0.
- **Dependências:** —
- **Arquivos prováveis:** `src/types/weather.ts`
- **Requisitos:** RF1, RF2, RF3, RF4, RF6

### T-02 — Normalizar consultas de cidade
- **Tipo:** Data
- **Descrição:** Implementar normalização pura de espaços externos e Unicode NFC, preservando acentos.
- **Critérios de aceite:** `"  São Paulo  "` resulta em `"São Paulo"`; formas composta e decomposta de `ã` resultam na mesma string NFC; caracteres internos e acentos permanecem; chamadas repetidas com a mesma entrada retornam a mesma string.
- **Dependências:** —
- **Arquivos prováveis:** `src/lib/citySearch.ts`
- **Requisitos:** RF1

### T-03 — Converter e arredondar temperaturas
- **Tipo:** Data
- **Descrição:** Implementar conversão de Celsius para Celsius/Fahrenheit e arredondamento de apresentação.
- **Critérios de aceite:** conversões assertam 0 °C → 32 °F, 20 °C → 68 °F e -40 °C → -40 °F; empates são arredondados para longe de zero (1,5 → 2; -1,5 → -2); entrada `null` permanece indisponível e não retorna 0.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/temperature.ts`
- **Requisitos:** RF4

### T-04 — Mapear códigos meteorológicos WMO
- **Tipo:** Data
- **Descrição:** Mapear códigos WMO para condições em pt-BR e definir fallback.
- **Critérios de aceite:** a tabela cobre os códigos `0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99`, cada qual com rótulo pt-BR não vazio; asserts verificam `0 → Céu limpo`, `3 → Nublado`, `45 → Nevoeiro`, `61 → Chuva fraca` e `95 → Trovoada`; `-1` e `null` retornam `Indisponível` sem exceção.
- **Dependências:** —
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`
- **Requisitos:** RF2, RF3, RNF6

### T-05 — Implementar funções de datas, fuso e frescor
- **Tipo:** Data
- **Descrição:** Criar funções puras para datas civis da previsão, formatação pt-BR, fuso fallback e idade da observação.
- **Critérios de aceite:** referência 31/12/2026 produz sequência 31/12/2026 a 04/01/2027 sem deslocamento UTC; datas do ano corrente usam `dd/MM` e de outro ano incluem `dd/MM/yyyy`; fuso ausente/inválido retorna `UTC`; idade de 2 h não é stale e 2 h 1 min é stale.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/dateTime.ts`
- **Requisitos:** RF2, RF3, RNF5, RNF6

## Entrega 2 — Services

### T-06 — Implementar busca de cidades na Open-Meteo
- **Tipo:** Data
- **Descrição:** Criar `searchCities` com geocoding, normalização e mapeamento para `City[]`.
- **Critérios de aceite:** request HTTPS contém `name` aparado/NFC, `count=10`, `language=pt` e `format=json`; item válido mapeia id, nome e coordenadas e usa `null` para metadados opcionais ausentes; resposta válida sem resultados retorna `[]`; timeout de 10 s retorna `timeout`; HTTP não-2xx, erro declarado pela API, rede e JSON inválido retornam respectivamente `http`, `api`, `network` e `invalid-response`; abort intencional não gera erro visível.
- **Dependências:** T-01, T-02
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Requisitos:** RF1, RF6, RNF1, RNF7

### T-07 — Implementar consulta de clima atual
- **Tipo:** Data
- **Descrição:** Criar operação independente para consultar e normalizar o clima atual de uma coordenada.
- **Critérios de aceite:** request contém latitude, longitude, `current=temperature_2m,weather_code` e `timezone=auto`; campo ausente/inválido vira `null`; hora válida é normalizada para ISO com `utc_offset_seconds`; quando temperatura e condição são ambas indisponíveis ou o JSON é inválido, retorna `invalid-response`; HTTP não-2xx, erro declarado pela API, rede e timeout de 10 s retornam `http`, `api`, `network` e `timeout`; abort intencional não gera erro.
- **Dependências:** T-01, T-05
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Requisitos:** RF2, RF6, RNF1, RNF5, RNF7

### T-08 — Implementar consulta da previsão diária
- **Tipo:** Data
- **Descrição:** Criar operação independente para normalizar os cinco dias de previsão.
- **Critérios de aceite:** request contém `daily=weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max`, `forecast_days=5` e `timezone=auto`; arrays são combinados pelo índice; resultado contém cinco datas civis consecutivas em ordem; valor ausente/inválido vira `null` e data sem dados permanece com campos meteorológicos nulos; HTTP não-2xx, erro da API, JSON inválido, rede e timeout de 10 s retornam `http`, `api`, `invalid-response`, `network` e `timeout`.
- **Dependências:** T-01, T-05
- **Arquivos prováveis:** `src/services/weatherService.ts`
- **Requisitos:** RF3, RF6, RNF1, RNF5, RNF7

## Entrega 3 — Hook e orquestração

### T-09 — Implementar hook `useWeather`
- **Tipo:** Data
- **Descrição:** Coordenar busca, seleção, estados independentes, unidade, retry e descarte de respostas obsoletas.
- **Critérios de aceite:** estado inicial contém seleção nula, consultas `idle` e unidade Celsius; busca em branco não chama serviço e define `Informe uma cidade`; selecionar cidade limpa dados anteriores e inicia current e forecast em paralelo; cada promise altera apenas seu estado; busca vazia ou falha preserva a seleção; retry chama somente o serviço da consulta afetada; resposta de seleção anterior não altera o estado atual; trocar unidade não aumenta a contagem de requests.
- **Dependências:** T-01, T-06, T-07, T-08
- **Arquivos prováveis:** `src/hooks/useWeather.ts`
- **Requisitos:** RF1, RF2, RF3, RF4, RF6, RNF7

## Entrega 4 — Componentes

### T-10 — Criar formulário de busca acessível
- **Tipo:** UI
- **Descrição:** Implementar entrada e submissão explícita, validação local e aviso de privacidade.
- **Critérios de aceite:** campo tem role `textbox` e nome acessível; botão de submissão tem nome acessível; Enter submete texto preenchido; vazio/espaços exibem `Informe uma cidade` e não chamam callback; junto ao formulário aparece `O texto da busca é enviado ao serviço de geocodificação Open-Meteo.`
- **Dependências:** T-01, T-09
- **Arquivos prováveis:** `src/components/SearchBar.tsx`
- **Requisitos:** RF1, RF6, RNF2, RNF8

### T-11 — Criar lista de resultados e seleção de cidade
- **Tipo:** UI
- **Descrição:** Exibir resultados com contexto geográfico e permitir seleção acessível.
- **Critérios de aceite:** resultados exibem nome, região e país quando disponíveis e nunca imprimem `null`/`undefined`; Enter seleciona a opção focada e envia o mesmo id/latitude/longitude; loading usa `role="status"`; erro usa `role="alert"` e botão `Tentar novamente`; vazio mostra `Nenhuma cidade encontrada` sem `role="alert"`.
- **Dependências:** T-01, T-09
- **Arquivos prováveis:** `src/components/CityResults.tsx`
- **Requisitos:** RF1, RF6, RNF2

### T-12 — Criar seção de clima atual
- **Tipo:** UI
- **Descrição:** Apresentar condição, temperatura e observação associadas à cidade selecionada.
- **Critérios de aceite:** fixture de São Paulo, 18 °C, WMO 3 e hora 14:30 exibe cidade, `18 °C`, `Nublado` e horário; hora nula exibe `Horário de atualização indisponível`; idade 2 h 1 min exibe `Desatualizado`; campo nulo exibe `—` com nome acessível `Indisponível`; loading usa status e erro usa alert com `Tentar novamente`.
- **Dependências:** T-01, T-03, T-04, T-05, T-09
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`
- **Requisitos:** RF2, RF4, RF6, RNF2, RNF5, RNF6

### T-13 — Criar lista de previsão de cinco dias
- **Tipo:** UI
- **Descrição:** Apresentar datas locais, condição, mínimas, máximas e precipitação.
- **Critérios de aceite:** renderiza exatamente cinco datas consecutivas em ordem; campo nulo exibe `—` com nome acessível `Indisponível`; dia sem dados exibe `Previsão indisponível`; mínimas/máximas incluem °C ou °F conforme prop e precipitação inclui `%`; loading usa status e erro usa alert com retry.
- **Dependências:** T-01, T-03, T-04, T-05, T-09
- **Arquivos prováveis:** `src/components/ForecastList.tsx`
- **Requisitos:** RF3, RF4, RF6, RNF2, RNF5, RNF6

### T-14 — Criar controle de unidade
- **Tipo:** UI
- **Descrição:** Implementar seleção acessível entre Celsius e Fahrenheit.
- **Critérios de aceite:** opções acessíveis `Celsius` e `Fahrenheit` expõem a selecionada; teclado permite escolher ambas; cada escolha invoca callback uma vez com `celsius` ou `fahrenheit`; estado visual acompanha a prop recebida.
- **Dependências:** T-01, T-03, T-09
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`
- **Requisitos:** RF4, RNF2, RNF6

## Entrega 5 — Integração

### T-15 — Compor tela no `App`
- **Tipo:** UI
- **Descrição:** Conectar hook e componentes por props/callbacks, sem lógica de serviço no componente raiz.
- **Critérios de aceite:** integração submete busca, seleciona resultado e chama current/forecast com as coordenadas selecionadas; ao trocar de A para B, nenhum valor/erro de A aparece sob B; erro de current mantém forecast success visível e vice-versa; montagem nova começa sem cidade e em Celsius.
- **Dependências:** T-09, T-10, T-11, T-12, T-13, T-14
- **Arquivos prováveis:** `src/App.tsx`
- **Requisitos:** RF1, RF2, RF3, RF4, RF6, RNF7, RNF8

## Entrega 6 — Testes

### T-16 — Completar setup e descoberta do Vitest
- **Tipo:** Infra
- **Descrição:** Criar setup ausente e configurar descoberta de testes unitários, hooks e componentes.
- **Critérios de aceite:** `tests/setup.ts` importa `@testing-library/jest-dom/vitest`; padrões do Vitest incluem `tests/unit`, `tests/hooks` e `tests/components`; adicionar um teste em cada pasta faz `pnpm test` executar os três; `package.json` não recebe dependência duplicada.
- **Dependências:** T-15
- **Arquivos prováveis:** `tests/setup.ts`, `vite.config.ts`
- **Requisitos:** RNF2

### T-17 — Testar normalização de busca
- **Tipo:** Test
- **Descrição:** Cobrir trim, Unicode NFC e preservação de acentos.
- **Critérios de aceite:** teste asserta forma decomposta igual a `São` em NFC, `"  São Paulo  "` igual a `"São Paulo"`, acentos preservados e resultado idêntico em chamadas repetidas; não usa rede; `pnpm test -- tests/unit/citySearch.test.ts` passa.
- **Dependências:** T-02, T-16
- **Arquivos prováveis:** `tests/unit/citySearch.test.ts`
- **Requisitos:** RF1

### T-18 — Testar conversão de temperatura
- **Tipo:** Test
- **Descrição:** Testar unitariamente a conversão entre Celsius e Fahrenheit e o arredondamento de apresentação.
- **Critérios de aceite:** asserts verificam 0 °C → 32 °F, 20 °C → 68 °F, -40 °C → -40 °F, empates positivo e negativo afastados de zero e `null` mantido indisponível; `pnpm test -- tests/unit/temperature.test.ts` passa sem rede.
- **Dependências:** T-03, T-16
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`
- **Requisitos:** RF4

### T-19 — Testar mapeamento de códigos WMO
- **Tipo:** Test
- **Descrição:** Verificar tabela de condições e fallback.
- **Critérios de aceite:** cada código listado em T-04 retorna rótulo não vazio; 0, 3, 45, 61 e 95 retornam os rótulos definidos em T-04; `-1` e `null` retornam `Indisponível`; `pnpm test -- tests/unit/weatherCodes.test.ts` passa.
- **Dependências:** T-04, T-16
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`
- **Requisitos:** RF2, RF3, RNF6

### T-20 — Testar datas, fusos e frescor
- **Tipo:** Test
- **Descrição:** Cobrir datas civis, formatação e idade da observação com relógio/fuso fixados.
- **Critérios de aceite:** asserts verificam sequências 30/09–04/10/2026 e 31/12/2026–04/01/2027; formato `dd/MM`, ano quando diferente, fallback `UTC`, observação exatamente 2 h não stale e 2 h 1 min stale; `pnpm test -- tests/unit/dateTime.test.ts` passa.
- **Dependências:** T-05, T-16
- **Arquivos prováveis:** `tests/unit/dateTime.test.ts`
- **Requisitos:** RF2, RF3, RNF5, RNF6

### T-21 — Testar serviço de geocodificação
- **Tipo:** Test
- **Descrição:** Testar o service de geocoding com `fetch` totalmente mockado.
- **Critérios de aceite:** mock de `fetch` verifica URL/parâmetros e mapeamento com/sem metadados; resposta vazia retorna `[]`; HTTP não-2xx, erro da API, JSON inválido, rede e timeout verificam `http`, `api`, `invalid-response`, `network` e `timeout`; abort intencional não exibe erro; nenhuma URL real é acessada.
- **Dependências:** T-06, T-16
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`
- **Requisitos:** RF1, RF6, RNF1, RNF7

### T-22 — Testar serviço de clima atual
- **Tipo:** Test
- **Descrição:** Testar o service de clima atual com `fetch` mockado.
- **Critérios de aceite:** fixture verifica temperatura/código/hora ISO com offset; campo individual ausente resulta em `null`; ausência dos dois campos gera `invalid-response`; HTTP não-2xx, erro API, JSON, rede e timeout verificam os respectivos `kind`; cada cenário substitui `globalThis.fetch` por mock e nenhum request real é feito.
- **Dependências:** T-07, T-16
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`
- **Requisitos:** RF2, RF6, RNF5, RNF7

### T-23 — Testar serviço de previsão diária
- **Tipo:** Test
- **Descrição:** Testar o service de previsão diária com `fetch` mockado.
- **Critérios de aceite:** fixture completa produz cinco itens ordenados; fixture parcial preserva datas e usa `null`; teste cruza 31/12–01/01; timezone inválido usa UTC; HTTP não-2xx, erro API, JSON inválido, rede e timeout verificam seus `kind`; cada request é interceptado por mock e nenhum request real é feito.
- **Dependências:** T-08, T-16
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`
- **Requisitos:** RF3, RF6, RNF5, RNF7

### T-24 — Testar estados e busca do hook
- **Tipo:** Test
- **Descrição:** Cobrir inicialização, transições de busca e preservação da seleção.
- **Critérios de aceite:** testes observam estado inicial `idle` e transições de busca para `loading`, `success`, `empty` e `error`; busca vazia define `Informe uma cidade` e mantém chamadas em zero; após selecionar cidade, resultado vazio ou erro de busca mantém a mesma seleção.
- **Dependências:** T-09, T-16
- **Arquivos prováveis:** `tests/hooks/useWeather.test.tsx`
- **Requisitos:** RF1, RF6

### T-25 — Testar independência das consultas no hook
- **Tipo:** Test
- **Descrição:** Cobrir requests paralelos, retry isolado e descarte de respostas obsoletas.
- **Critérios de aceite:** promises controladas demonstram current `success` com forecast `error` e vice-versa; retry incrementa somente a chamada da seção afetada; resolver promise antiga após selecionar outra cidade não substitui estado/dados atuais; trocar unidade não muda os contadores de request.
- **Dependências:** T-09, T-16
- **Arquivos prováveis:** `tests/hooks/useWeather.test.tsx`
- **Requisitos:** RF2, RF3, RF4, RF6, RNF7

### T-26 — Testar formulário de busca
- **Tipo:** Test
- **Descrição:** Validar nome acessível, submissão por teclado e busca vazia.
- **Critérios de aceite:** `userEvent` preenche o textbox e pressiona Enter, callback recebe o texto uma vez; vazio/espaços exibem `Informe uma cidade` e deixam callback em zero chamadas; aviso de privacidade está visível; teste direcionado passa.
- **Dependências:** T-10, T-16
- **Arquivos prováveis:** `tests/components/SearchBar.test.tsx`
- **Requisitos:** RF1, RF6, RNF2, RNF8

### T-27 — Testar resultados e seleção de cidade
- **Tipo:** Test
- **Descrição:** Testar o componente de resultados nos estados vazio e sucesso, incluindo seleção por teclado.
- **Critérios de aceite:** fixtures homônimas exibem contextos distintos; ativar a segunda opção por teclado invoca callback uma vez com seu objeto; metadados ausentes não aparecem como `null`/`undefined`; estado vazio exibe `Nenhuma cidade encontrada` e não tem `role="alert"`; teste direcionado passa.
- **Dependências:** T-11, T-16
- **Arquivos prováveis:** `tests/components/CityResults.test.tsx`
- **Requisitos:** RF1, RF6, RNF2

### T-28 — Testar seção de clima atual
- **Tipo:** Test
- **Descrição:** Testar o componente de clima atual nos estados loading, erro e sucesso.
- **Critérios de aceite:** fixture verifica cidade, temperatura/unidade, condição e horário; observação >2 h contém `Desatualizado`; campo nulo tem `—` e nome acessível `Indisponível`; loading usa `role="status"`; erro usa `role="alert"` e retry chama callback uma vez; teste direcionado passa.
- **Dependências:** T-12, T-16
- **Arquivos prováveis:** `tests/components/CurrentWeather.test.tsx`
- **Requisitos:** RF2, RF4, RF6, RNF2

### T-29 — Testar lista de previsão
- **Tipo:** Test
- **Descrição:** Testar o componente de previsão nos estados loading, erro e sucesso.
- **Critérios de aceite:** fixture produz cinco itens na ordem; campo individual nulo exibe `—`/`Indisponível`, dia ausente exibe `Previsão indisponível`; props Celsius/Fahrenheit alteram mínimas/máximas e mantêm percentuais; loading usa `role="status"`; erro usa `role="alert"` e oferece retry; teste direcionado passa.
- **Dependências:** T-13, T-16
- **Arquivos prováveis:** `tests/components/ForecastList.test.tsx`
- **Requisitos:** RF3, RF4, RF6, RNF2

### T-30 — Testar controle de unidade
- **Tipo:** Test
- **Descrição:** Verificar seleção C/F, semântica acessível e teclado.
- **Critérios de aceite:** teclado seleciona Celsius e Fahrenheit; cada opção expõe nome e estado via role/checked ou `aria-pressed`; callback recebe exatamente `celsius` e `fahrenheit`, uma vez por seleção; teste direcionado passa.
- **Dependências:** T-14, T-16
- **Arquivos prováveis:** `tests/components/UnitToggle.test.tsx`
- **Requisitos:** RF4, RNF2

### T-31 — Testar busca e seleção de homônimos
- **Tipo:** Test
- **Descrição:** Cobrir busca manual e seleção explícita da cidade correta no fluxo integrado.
- **Critérios de aceite:** fixture retorna duas cidades homônimas com regiões/países diferentes; selecionar a segunda faz current e forecast usarem sua latitude/longitude; geocoding e rotas meteorológicas são interceptados; nenhuma chamada externa ocorre.
- **Dependências:** T-15, T-21, T-24, T-26, T-27
- **Arquivos prováveis:** `tests/e2e/search.spec.ts`
- **Requisitos:** RF1, RNF7

### T-32 — Testar clima, previsão e alternância de unidade
- **Tipo:** Test
- **Descrição:** Testar o fluxo E2E principal em desktop e viewport mobile.
- **Critérios de aceite:** em viewport desktop e em 320×640, após buscar e selecionar uma cidade a página contém clima atual e exatamente cinco dias; fixtures 0 °C e 20 °C aparecem como 32 °F e 68 °F ao selecionar Fahrenheit; datas, condições e precipitação permanecem iguais; busca, seleção e alternância concluem sem overflow horizontal; todas as respostas são fixtures interceptadas.
- **Dependências:** T-15, T-22, T-23, T-28, T-29, T-30
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`
- **Requisitos:** RF2, RF3, RF4

### T-33 — Testar busca vazia e retry de geocodificação
- **Tipo:** Test
- **Descrição:** Cobrir estados vazio, erro e recuperação da busca integrada.
- **Critérios de aceite:** submissão em branco mantém requests em zero; resposta vazia exibe `Nenhuma cidade encontrada` sem alert; HTTP 500 exibe alert e `Tentar novamente`; retry gera exatamente um request e fixture de sucesso exibe o resultado.
- **Dependências:** T-15, T-21, T-24, T-26, T-27
- **Arquivos prováveis:** `tests/e2e/search-recovery.spec.ts`
- **Requisitos:** RF1, RF6

### T-34 — Testar falhas e retries meteorológicos independentes
- **Tipo:** Test
- **Descrição:** Validar isolamento de falhas entre clima atual e previsão no fluxo integrado.
- **Critérios de aceite:** em dois cenários, falha current preserva forecast válido e falha forecast preserva current válido; retry incrementa somente o contador da rota com falha; timeout encerra loading e mostra alert/retry; todas as rotas usam fixtures.
- **Dependências:** T-15, T-22, T-23, T-25, T-28, T-29
- **Arquivos prováveis:** `tests/e2e/weather-recovery.spec.ts`
- **Requisitos:** RF2, RF3, RF6, RNF7

### T-35 — Testar descarte de dados de cidade anterior
- **Tipo:** Test
- **Descrição:** Impedir que respostas atrasadas de uma seleção apareçam associadas à seguinte.
- **Critérios de aceite:** request de A é atrasado; B é selecionada e concluída primeiro; depois que A também termina, nome, temperatura, previsão e alertas continuam associados somente a B.
- **Dependências:** T-15, T-25
- **Arquivos prováveis:** `tests/e2e/stale-city-data.spec.ts`
- **Requisitos:** RF2, RF3, RF6, RNF7

## Entrega 7 — Hardening

### T-36 — Verificar layout responsivo
- **Tipo:** Test
- **Descrição:** Cobrir largura e sobreposição nos viewports definidos pela spec.
- **Critérios de aceite:** em 320×640, 1280×800 e 1920×1080 `document.documentElement.scrollWidth <= window.innerWidth`; bounding boxes de busca, cidade, clima atual e cada item da previsão ficam dentro da largura; bounding boxes de controles interativos não se sobrepõem; fixtures estão carregadas.
- **Dependências:** T-15, T-32
- **Arquivos prováveis:** `tests/e2e/responsive.spec.ts`
- **Requisitos:** RF5, RNF3

### T-37 — Verificar fluxo por teclado em viewport mobile
- **Tipo:** Test
- **Descrição:** Validar busca, seleção e unidade por teclado em tela pequena.
- **Critérios de aceite:** em 320×640 Playwright completa busca, seleção e alternância usando somente Tab/Enter/Space; antes de cada ação `document.activeElement` é o controle esperado; foco por teclado apresenta outline diferente de `none` com largura >0 px ou box-shadow não transparente.
- **Dependências:** T-15, T-31, T-32, T-36
- **Arquivos prováveis:** `tests/e2e/keyboard-mobile.spec.ts`
- **Requisitos:** RF5, RNF2, RNF3

### T-38 — Executar matriz de navegadores suportados
- **Tipo:** Infra
- **Descrição:** Configurar e executar os projetos Playwright que representem os navegadores alvo.
- **Critérios de aceite:** `playwright.config.ts` declara projetos executáveis para Chromium, Edge, Firefox, WebKit desktop e perfis mobile disponíveis; relatório registra navegador real, versão, plataforma e resultado para Chrome, Edge, Firefox, Safari desktop, Safari iOS e Chrome Android, comparados às duas versões estáveis mais recentes; combinação não executada em navegador/dispositivo real é marcada `não verificada` e não conta como aprovada.
- **Dependências:** T-31, T-32, T-33, T-34, T-35, T-36, T-37
- **Arquivos prováveis:** `playwright.config.ts`, `README.md`
- **Requisitos:** RNF4

### T-39 — Medir o requisito de desempenho
- **Tipo:** Test
- **Descrição:** Medir p95 dos fluxos de busca e seleção sob o perfil de rede especificado.
- **Critérios de aceite:** harness registra 100 durações por fluxo com API ≤1 s e rede de 10 Mbps/100 ms RTT; busca mede submit até resultados visíveis e seleção mede acionamento até clima atual e cinco dias visíveis; p95 nearest-rank (`ceil(0,95 × n)`) de cada fluxo é ≤3000 ms; relatório registra amostras, p95, data e perfil.
- **Dependências:** T-31, T-32
- **Arquivos prováveis:** `tests/e2e/performance.spec.ts`, `README.md`
- **Requisitos:** RNF1

### T-40 — Executar gates automatizados do repositório
- **Tipo:** Infra
- **Descrição:** Executar os comandos de qualidade definidos pelo projeto após a integração.
- **Critérios de aceite:** `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` terminam cada um com código de saída 0; relatório lista os quatro códigos; qualquer comando não executado ou diferente de 0 é gate pendente.
- **Dependências:** T-01 a T-39
- **Arquivos prováveis:** Nenhum; execução dos comandos definidos em `package.json`.
- **Requisitos:** RNF2, RNF4

### T-41 — Confirmar requisitos de uso da Open-Meteo
- **Tipo:** Infra
- **Descrição:** Verificar e registrar condições do provedor necessárias para publicação.
- **Critérios de aceite:** `README.md` registra URLs oficiais, data e evidência para licença, atribuição, limites e cobertura; cada item tem estado `confirmado` ou `bloqueador`; nenhum bloqueador é marcado como liberado para release.
- **Dependências:** T-40
- **Arquivos prováveis:** `README.md`
- **Requisitos:** RNF8; gate de release definido na spec (licença, atribuição, limites e cobertura)

## Rastreabilidade — RF → tarefas

| Requisito funcional | Escopo coberto | Tarefas relacionadas |
| --- | --- | --- |
| **RF1 — Buscar e selecionar cidade** | Normalização NFC/trim e acentos; geocodificação; resultados com contexto geográfico; seleção; vazio; erro e retry; preservação da seleção anterior. | T-02, T-06, T-09, T-10, T-11, T-15, T-17, T-21, T-24, T-26, T-27, T-31, T-33 |
| **RF2 — Consultar clima atual** | Consulta atual; condição, temperatura e horário; fuso e frescor; dados parciais; indisponibilidade; isolamento de falhas e retry. | T-04, T-05, T-07, T-09, T-12, T-15, T-22, T-25, T-28, T-32, T-34, T-35 |
| **RF3 — Consultar previsão de cinco dias** | Cinco datas locais; condição, mínima, máxima e precipitação; dados parciais; datas sem previsão; unidade; isolamento de falhas. | T-04, T-05, T-08, T-09, T-13, T-15, T-23, T-25, T-29, T-32, T-34, T-35 |
| **RF4 — Alternar unidade de temperatura** | Conversão e arredondamento; controle acessível; renderização atual e diária; padrão Celsius; troca sem nova consulta. | T-03, T-09, T-12, T-13, T-14, T-15, T-18, T-25, T-29, T-30, T-32 |
| **RF5 — Consultar em dispositivos móveis** | Fluxo principal em 320×640; ausência de overflow/sobreposição nos viewports definidos; operação por teclado e foco visível em mobile. | T-32, T-36, T-37 |
| **RF6 — Comunicar estados e permitir recuperação** | Loading, vazio e erro; roles semânticos; retry por consulta; timeout; falhas independentes; descarte de dados obsoletos. | T-06, T-07, T-08, T-09, T-10, T-11, T-12, T-13, T-15, T-21, T-22, T-23, T-24, T-25, T-27, T-28, T-29, T-33, T-34, T-35 |

### Lacunas funcionais

Nenhum requisito funcional da spec está sem tarefa correspondente: **RF1, RF2,
RF3, RF4, RF5 e RF6** possuem implementação e validação planejadas no backlog.

## Priorização e tamanho

**Prioridade:** P0 é necessário para uma entrega funcional do MVP; P1 é
importante para qualidade, recuperação e critérios de release; P2 é hardening,
compatibilidade ampliada ou evidência operacional que pode vir depois do fluxo
principal. **Tamanho:** S é pequeno e isolado; M envolve uma unidade de
comportamento com integração local; G envolve várias fronteiras, cenários ou
execuções e deve ser dividido internamente durante a implementação.

| Tarefa | Prioridade | Tamanho | Justificativa curta |
| --- | --- | --- | --- |
| T-01 | P0 | S | Contrato necessário por todas as camadas. |
| T-02 | P0 | S | Regra local necessária para a busca. |
| T-03 | P0 | S | Conversão usada na apresentação das temperaturas. |
| T-04 | P0 | M | Tabela completa de códigos WMO e fallback. |
| T-05 | P0 | M | Datas, fusos e frescor atravessam dados e UI. |
| T-06 | P0 | M | Primeiro acesso externo: geocodificação. |
| T-07 | P0 | M | Consulta necessária para exibir clima atual. |
| T-08 | P0 | M | Consulta necessária para exibir previsão. |
| T-09 | P0 | G | Orquestra três consultas, retries e concorrência. |
| T-10 | P0 | M | Entrada principal do usuário e validação. |
| T-11 | P0 | M | Seleção explícita é necessária para consultar dados. |
| T-12 | P0 | M | Primeira seção meteorológica visível. |
| T-13 | P0 | M | Previsão diária visível no MVP. |
| T-14 | P0 | S | Controle isolado de unidade. |
| T-15 | P0 | M | Conecta o fluxo completo da tela. |
| T-16 | P1 | S | Habilita a execução da suíte automatizada. |
| T-17 | P1 | S | Teste unitário de normalização. |
| T-18 | P1 | S | Teste unitário dedicado de conversão. |
| T-19 | P1 | S | Teste unitário da tabela WMO. |
| T-20 | P1 | M | Testes de datas, fuso e limite de frescor. |
| T-21 | P1 | M | Testes de geocoding com `fetch` mockado. |
| T-22 | P1 | M | Testes de clima atual com `fetch` mockado. |
| T-23 | P1 | M | Testes de previsão com `fetch` mockado. |
| T-24 | P1 | M | Estados de busca e preservação no hook. |
| T-25 | P1 | G | Concorrência, retry e respostas obsoletas. |
| T-26 | P1 | S | Testes do formulário acessível. |
| T-27 | P1 | S | Testes de resultado, vazio e seleção. |
| T-28 | P1 | M | Estados e conteúdo do clima atual. |
| T-29 | P1 | M | Estados e conteúdo da previsão. |
| T-30 | P1 | S | Testes do controle C/F. |
| T-31 | P1 | M | E2E de busca e seleção de homônimos. |
| T-32 | P0 | G | Fluxo principal visível em desktop e mobile. |
| T-33 | P1 | M | Recuperação da busca integrada. |
| T-34 | P1 | G | Falhas independentes e timeout em E2E. |
| T-35 | P1 | M | Proteção contra dados obsoletos em E2E. |
| T-36 | P1 | M | Responsividade nos viewports da spec. |
| T-37 | P1 | M | Operação por teclado e foco no mobile. |
| T-38 | P2 | G | Matriz de navegadores e dispositivos. |
| T-39 | P1 | G | Medição p95 em 100 execuções por fluxo. |
| T-40 | P0 | S | Gate automatizado obrigatório para entrega. |
| T-41 | P0 | M | Gate de licença, atribuição, limites e cobertura. |

## Sequência em fatias verticais

As fatias abaixo atravessam tipos, dados, estado, UI e validação. Cada uma
produz um incremento observável antes de avançar para a próxima.

### Fatia 1 — Buscar e selecionar uma cidade

**Objetivo visível:** usuário digita uma cidade, vê resultados geográficos e
seleciona uma opção, sem ainda depender de dados meteorológicos.

**Tarefas:** T-01 → T-02 → T-03 → T-04 → T-05 → T-06 → T-07 → T-08 →
T-09 → T-10 → T-11 → T-12 → T-13 → T-14 → T-15.

**Validação:** busca preenchida, trim/NFC, lista com região/país, seleção por
teclado, estados de carregamento e associação inicial à cidade selecionada.

### Fatia 2 — Mostrar clima atual

**Objetivo visível:** após selecionar uma cidade, exibir temperatura, condição
e horário em pt-BR.

**Tarefas:** T-17 → T-18 → T-19 → T-20 → T-22 → T-28.

**Validação:** fixture com 18 °C/Nublado/14:30, campo ausente, dado desatualizado
e associação correta à cidade selecionada.

### Fatia 3 — Mostrar previsão e alternar unidade

**Objetivo visível:** exibir cinco dias e alternar todas as temperaturas entre
Celsius e Fahrenheit sem nova consulta.

**Tarefas:** T-23 → T-29 → T-30 → T-32.

**Validação:** cinco datas em ordem, mínimas/máximas, precipitação percentual,
0 °C → 32 °F, 20 °C → 68 °F e unidade Celsius na nova sessão.

### Fatia 4 — Tornar o fluxo recuperável

**Objetivo visível:** comunicar loading, erro e vazio, permitindo retry somente
da consulta afetada.

**Tarefas:** T-16 → T-21 → T-22 → T-23 → T-24 → T-25 → T-26 → T-27 → T-28 →
T-29 → T-30 → T-33 → T-34 → T-35.

**Validação:** testes unitários com `fetch` mockado, roles semânticos, retry
isolado, timeout de 10 s, falhas parciais e descarte de respostas antigas.

### Fatia 5 — Confirmar experiência mobile e release

**Objetivo visível:** completar o fluxo principal em mobile e demonstrar que a
interface cabe e permanece operável.

**Tarefas:** T-17 → T-20 → T-31 → T-32 → T-36 → T-37 → T-39 → T-40 → T-41.

**Validação:** E2E desktop/mobile, viewports 320×640/1280×800/1920×1080,
teclado, foco, p95 e gates de qualidade/provedor.

### Fatia 6 — Ampliar compatibilidade

**Objetivo visível:** registrar cobertura nos navegadores e dispositivos alvo
que não são necessários para o primeiro fluxo funcional.

**Tarefas:** T-38.

**Validação:** relatório por navegador, versão e plataforma, com combinações não
executadas explicitamente marcadas como não verificadas.