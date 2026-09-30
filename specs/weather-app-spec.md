# Especificação de Produto — Aplicação de Previsão do Tempo

## Overview

Aplicação web em pt-BR para buscar cidades e consultar clima atual e previsão diária. A v1 permite selecionar uma cidade, ver temperatura e condição atuais, consultar a previsão de hoje mais quatro dias e alternar temperaturas entre Celsius e Fahrenheit. A busca é manual; geolocalização automática e conta de usuário não são necessárias.

A fonte de dados definida no discovery é Open-Meteo. Esta especificação fecha o comportamento funcional da v1 e define metas iniciais de qualidade para validação. A confirmação de licença, atribuição, limites e cobertura do provedor é gate de lançamento.

## Functional Requirements

- **RF1 — Buscar e selecionar cidade:** aceitar busca manual submetida pelo usuário; remover espaços externos e normalizar Unicode para NFC sem remover acentos. Exibir nome, região/estado e país quando disponíveis, e permitir selecionar uma correspondência. A busca sem resultados é um estado vazio, distinto de falha do serviço.
- **RF2 — Consultar clima atual:** após selecionar uma cidade, exibir temperatura, condição meteorológica e horário de atualização, todos associados à cidade selecionada. Textos e datas devem estar em pt-BR; valores ausentes devem ser identificados sem serem inventados.
- **RF3 — Consultar previsão de cinco dias:** exibir cinco entradas diárias para a data local da cidade selecionada: hoje e os quatro dias seguintes. Cada entrada contém condição, temperaturas mínima e máxima e probabilidade de precipitação. Valores ausentes são identificados individualmente.
- **RF4 — Alternar unidade de temperatura:** permitir alternar entre Celsius e Fahrenheit em todas as temperaturas atuais e previstas. Exibir unidade em cada valor; usar Celsius como padrão em cada nova sessão.
- **RF5 — Consultar em dispositivos móveis:** permitir completar busca, seleção e leitura do clima atual e da previsão em viewports de 320 a 1920 CSS pixels, sem perda de conteúdo nem rolagem horizontal da página.
- **RF6 — Comunicar estados e permitir recuperação:** distinguir carregamento, vazio e erro para geocodificação, clima atual e previsão. Falhas devem encerrar o carregamento, explicar qual consulta falhou e oferecer nova tentativa para essa consulta.

## User Stories

- **US1 — Consulta rápida:** Como Marina, que decide a rotina do dia, quero buscar e selecionar minha cidade para ver a temperatura e condição atuais e decidir como me preparar. **Requisitos relacionados:** RF1, RF2.
- **US2 — Planejamento de viagem:** Como Diego, que planeja uma viagem curta, quero comparar as mínimas, máximas e chance de chuva dos próximos cinco dias para escolher quando e o que planejar. **Requisito relacionado:** RF3.
- **US3 — Unidade familiar:** Como Alex, que prefere Fahrenheit, quero alternar a unidade das temperaturas atuais e previstas para entendê-las sem conversão mental. **Requisito relacionado:** RF4.
- **US4 — Consulta em movimento:** Como Marina, que consulta o tempo principalmente pelo celular, quero buscar uma cidade e ler seus dados em uma tela pequena para me preparar ao sair. **Requisito relacionado:** RF5.
- **US5 — Recuperação da consulta:** Como Diego, quero saber qual consulta falhou e tentar novamente sem perder a cidade que selecionei para concluir o planejamento. **Requisito relacionado:** RF6.

## Acceptance Criteria

Todos os critérios usam os passos **Given / When / Then**. Testes devem fixar relógio e fuso da cidade e controlar respostas, latências e falhas do provedor. “Indisponível” deve ser exposto como texto acessível, não somente por ícone ou cor.

**RF1 — Buscar e selecionar cidade**

- **AC1.1** Given o usuário informa uma consulta com texto após remover espaços externos, When submete a busca, Then o texto é normalizado para Unicode NFC, os acentos são preservados e uma consulta de geocodificação é enviada.
- **AC1.2** Given a busca retorna uma ou mais cidades, When os resultados são exibidos, Then cada resultado mostra nome, região/estado e país quando fornecidos pela fonte.
- **AC1.3** Given a busca retorna duas cidades homônimas em regiões ou países distintos, When os resultados são exibidos, Then seus dados geográficos visíveis permitem identificar qual cidade será selecionada.
- **AC1.4** Given uma lista de resultados, When o usuário seleciona uma cidade, Then o nome e contexto geográfico selecionados são exibidos e as consultas de clima atual e previsão usam a localização desse resultado.
- **AC1.5** Given o campo está vazio ou contém somente espaços, When o usuário submete a busca, Then aparece a orientação `Informe uma cidade` e nenhuma consulta é enviada; cidade e dados meteorológicos já selecionados permanecem inalterados.
- **AC1.6** Given uma busca retorna zero correspondências, When a resposta é recebida, Then aparece `Nenhuma cidade encontrada`, os resultados de busca anteriores são removidos e a seleção meteorológica anterior permanece claramente identificada.
- **AC1.7** Given uma busca contém caracteres acentuados, When a geocodificação retorna uma correspondência, Then a entrada enviada e os nomes recebidos são exibidos sem corrupção de caracteres; não é exigida equivalência entre formas com e sem acento.
- **AC1.8** Given a geocodificação retorna erro ou timeout, When a falha é recebida, Then aparece um erro de busca com ação `Tentar novamente`, nenhum resultado é tratado como correspondência e a cidade previamente selecionada permanece identificada.

**RF2 — Consultar clima atual**

- **AC2.1** Given a cidade selecionada tem resposta com temperatura `18 °C`, condição `Nublado` e atualização às `14:30` no fuso da cidade, When o clima atual é exibido, Then os três valores aparecem associados ao nome da cidade e a condição aparece em pt-BR.
- **AC2.2** Given a resposta não contém horário de atualização, When o clima atual é exibido, Then o horário é indicado como `Horário de atualização indisponível` e nenhum horário é inferido.
- **AC2.3** Given o horário da observação tem mais de duas horas, When o clima atual é exibido, Then os dados recebem a indicação textual `Desatualizado` e não são apresentados como atuais sem ressalva.
- **AC2.4** Given uma resposta parcial contém temperatura mas não condição, When o clima atual é exibido, Then a temperatura válida permanece visível e a condição mostra `—` com nome acessível `Indisponível`.
- **AC2.5** Given a resposta não contém temperatura nem condição válidas, When a consulta termina, Then nenhum valor meteorológico é inventado e a seção de clima atual apresenta estado indisponível e opção de nova tentativa.

**RF3 — Consultar previsão de cinco dias**

- **AC3.1** Given o relógio de teste está fixado em `2026-09-30 12:00` no fuso `America/Sao_Paulo` e há previsão para cinco dias, When a previsão é exibida, Then há exatamente cinco entradas para 30/09, 01/10, 02/10, 03/10 e 04/10, em ordem cronológica.
- **AC3.2** Given uma entrada diária tem mín `12 °C`, máx `20 °C`, condição `Nublado` e precipitação `40%`, When a previsão é exibida em pt-BR, Then a entrada mostra data, condição, mín `12 °C`, máx `20 °C` e precipitação `40%` associados à cidade selecionada.
- **AC3.3** Given o dado de um campo de previsão está ausente, When as cinco datas são exibidas, Then a data permanece na lista e somente o campo ausente mostra `—` com nome acessível `Indisponível`.
- **AC3.4** Given a fonte não fornece nenhuma previsão para uma das cinco datas, When a previsão é exibida, Then a entrada dessa data continua visível com estado `Previsão indisponível`, sem valores copiados de outro dia.
- **AC3.5** Given a unidade selecionada é Fahrenheit, When as mínimas e máximas da previsão são exibidas, Then ambas usam °F; a probabilidade de precipitação continua expressa em porcentagem.
- **AC3.6** Given o relógio de teste está fixado em `2026-12-31 12:00` no fuso `America/Sao_Paulo`, When as cinco datas são exibidas, Then a sequência inclui `31/12/2026`, `01/01/2027`, `02/01/2027`, `03/01/2027` e `04/01/2027`.

**RF4 — Alternar unidade de temperatura**

- **AC4.1** Given as temperaturas atuais e previstas incluem `0 °C` e `20 °C`, When o usuário seleciona Fahrenheit, Then os valores são `32 °F` e `68 °F` e todos os valores de temperatura visíveis mostram °F.
- **AC4.2** Given as temperaturas atuais e previstas incluem `32 °F` e `68 °F`, When o usuário seleciona Celsius, Then os valores são `0 °C` e `20 °C` e todos os valores de temperatura visíveis mostram °C.
- **AC4.3** Given a temperatura de origem é `-40 °C`, When o usuário seleciona Fahrenheit, Then o valor exibido é `-40 °F`; valores são arredondados para o inteiro mais próximo, com empate de meio grau arredondado para longe de zero.
- **AC4.4** Given a aplicação inicia uma nova sessão sem preferência persistida, When dados meteorológicos são exibidos, Then a unidade selecionada é Celsius.
- **AC4.5** Given uma cidade e sua previsão estão visíveis, When a unidade é alternada, Then a cidade, as cinco datas, as condições e a probabilidade de precipitação permanecem inalteradas.

**RF5 — Consultar em dispositivos móveis**

- **AC5.1** Given viewports de `320 × 640`, `1280 × 800` e `1920 × 1080` CSS pixels com busca, clima atual e previsão carregados, When a página é renderizada, Then o conteúdo cabe na largura do viewport, sem rolagem horizontal nem sobreposição de texto ou controles.
- **AC5.2** Given uma viewport de `320 × 640` CSS pixels, When o usuário navega por teclado e conclui busca, seleção e alternância de unidade, Then cada controle recebe foco visível e pode ser acionado sem gesto de precisão.

**RF6 — Comunicar estados e permitir recuperação**

- **AC6.1** Given uma operação de busca ou consulta está pendente, When a resposta ainda não chegou, Then a região correspondente expõe `role=status` com o texto `Buscando cidades...`, `Carregando clima atual...` ou `Carregando previsão...`, conforme a operação.
- **AC6.2** Given geocodificação, clima atual ou previsão retorna erro, When a falha é recebida, Then o carregamento termina, a região afetada expõe `role=alert`, identifica a consulta que falhou e apresenta `Tentar novamente`.
- **AC6.3** Given uma consulta falhou e `Tentar novamente` está disponível, When o usuário aciona a ação, Then somente a consulta afetada é repetida; com resposta válida, o alerta desaparece e o resultado é exibido.
- **AC6.4** Given uma busca retorna sucesso com zero resultados, When a resposta é apresentada, Then o estado vazio `Nenhuma cidade encontrada` é exibido sem `role=alert`.
- **AC6.5** Given uma consulta não recebeu resposta em 10 segundos, When o limite é atingido, Then o carregamento termina, a região afetada expõe alerta de timeout e ação `Tentar novamente`, preservando o nome da cidade selecionada.
- **AC6.6** Given a consulta atual ou previsão falha depois da seleção de uma nova cidade, When a falha é apresentada, Then dados de outra cidade não aparecem como se pertencessem à cidade recém-selecionada.

## Non-Functional Requirements

- **RNF1 — Desempenho:** com a API respondendo em até 1 segundo e perfil de rede de 10 Mbps/100 ms RTT, p95 entre submissão da busca ou seleção da cidade e exibição do resultado correspondente deve ser ≤ 3 segundos, medido em 100 execuções por fluxo. Toda chamada deve terminar em sucesso ou estado de erro em até 10 segundos.
- **RNF2 — Acessibilidade:** atender WCAG 2.2 nível AA; todos os fluxos devem ser operáveis por teclado, ter nomes acessíveis e foco visível. Erro, vazio e carregamento devem ser anunciados semanticamente; informação não pode depender somente de cor.
- **RNF3 — Responsividade:** suportar largura de 320 CSS px até 1920 CSS px, sem rolagem horizontal da página, sobreposição ou perda de função. Critérios de viewport estão em AC5.1–AC5.2.
- **RNF4 — Compatibilidade:** suportar as duas versões estáveis mais recentes, na data do lançamento, de Chrome, Edge, Firefox e Safari desktop; Safari no iOS e Chrome no Android nas duas versões principais mais recentes.
- **RNF5 — Frescor e localização dos dados:** dados devem estar associados à cidade selecionada. Exibir a hora da observação no fuso da cidade; observações com mais de duas horas recebem `Desatualizado`. Datas diárias usam o fuso IANA da cidade fornecido pela fonte.
- **RNF6 — Localização:** interface, mensagens, condições meteorológicas e datas em português do Brasil; datas no formato `dd/MM`, acrescentando o ano quando diferente do ano corrente na cidade. Temperaturas usam o formato definido em RF4; precipitação é porcentagem.
- **RNF7 — Resiliência:** cada operação externa deve terminar em sucesso ou erro em até 10 segundos. Erro em uma seção não pode substituir dados válidos de outra seção; não se exibem dados de uma cidade sob o rótulo de outra.
- **RNF8 — Segurança e privacidade:** servir a aplicação por HTTPS; não solicitar geolocalização, não exigir autenticação e não persistir cidade, unidade ou texto de busca após encerrar a sessão. Informar ao usuário que o texto de busca é enviado ao serviço de geocodificação.

## Edge Cases

| Situação | Comportamento esperado |
| --- | --- |
| Campo vazio ou só com espaços | Mostrar `Informe uma cidade`; não enviar pedido nem alterar a seleção/dados visíveis. |
| Cidade inexistente/geocoding sem resultados | Mostrar `Nenhuma cidade encontrada`, remover resultados de busca anteriores e distinguir estado vazio de erro de serviço. |
| Cidades homônimas | Mostrar região/estado e país disponíveis em cada resultado antes da seleção. |
| Acentos e caracteres Unicode | Normalizar para NFC sem remover acentos; preservar os caracteres ao exibir entrada e resultados. Formas com e sem acento não são equivalentes por contrato. |
| Falha de geocodificação | Encerrar carregamento, indicar falha de busca e oferecer nova tentativa; preservar a cidade previamente selecionada. |
| Falha da API meteorológica | Encerrar somente o carregamento da seção afetada; mostrar alerta contextual e nova tentativa; nunca rotular resposta de erro como dado. |
| Timeout | Após 10 segundos sem resposta, encerrar carregamento, exibir alerta de timeout e nova tentativa. |
| Resposta parcial | Manter campos válidos; para cada campo ausente exibir `—` e nome acessível `Indisponível`; não completar com dado de outro período. |
| Previsão ausente em uma data | Preservar a entrada da data e mostrar `Previsão indisponível`; manter cinco datas no total. |
| Temperatura inválida ou ausente | Não converter nem exibir como zero; mostrar `—` e `Indisponível`. |
| Mudança de cidade seguida de falha | Não exibir dados da cidade anterior sob o nome da cidade recém-selecionada. |

## Assumptions

- As personas Marina, Diego e Alex são hipóteses; prioridades e sucesso devem ser validados com usuários, mas não alteram os critérios funcionais desta v1.
- A busca é por envio explícito; não há sugestões automáticas enquanto se digita. Espaços externos são removidos; acentos são preservados e significativos.
- Open-Meteo é a fonte definida, sem chave de API do usuário. A disponibilidade, cobertura, licença, atribuição e limites devem ser verificados antes do lançamento.
- “Cinco dias” significa hoje e os quatro dias seguintes no fuso da cidade; a previsão é diária.
- A previsão diária v1 contém condição, mínima, máxima e probabilidade de precipitação.
- A unidade padrão é Celsius; unidade e cidade são mantidas somente durante a sessão atual e não são sincronizadas nem persistidas.
- Uma sessão corresponde ao carregamento atual da aplicação; recarregar a página inicia nova sessão, sem restaurar cidade ou unidade.
- Quando o fuso IANA da cidade não vier na resposta, usar UTC e identificar `UTC` junto das datas/horas.
- Metas de desempenho, acessibilidade e compatibilidade desta spec são critérios de release da v1, sujeitos a aprovação do responsável pelo produto.

## Risks

| Risco | Impacto potencial | Mitigação proposta |
| --- | --- | --- |
| Indisponibilidade, latência, limites ou cobertura insuficiente da Open-Meteo | Consulta pode falhar ou não cobrir uma localidade. | Aplicar timeout, estado de erro e retentativa; confirmar cobertura, limite, licença e atribuição como gates de lançamento. |
| Geocodificação ambígua | Previsão pode ser associada à cidade errada. | Exibir nome, região/estado e país disponíveis e exigir seleção explícita. |
| Dados meteorológicos antigos | Usuário pode tomar decisão usando observação vencida. | Exibir horário no fuso correto e marcar observações com mais de duas horas como desatualizadas. |
| Falha isolada de uma seção | Uma resposta parcial do serviço pode ocultar dados válidos de outra seção. | Manter estados e retentativa independentes para clima atual e previsão. |
| Conversão ou rótulo incorreto | Temperatura pode ser interpretada de forma errada. | Aplicar regra de arredondamento de RF4 e validar valores positivos, negativos e em ambas as unidades. |
| Metas de qualidade não aprovadas ou não atingidas | Release pode não atender às expectativas de desempenho, acessibilidade ou suporte. | Aprovar RNFs antes do release e executar testes sob as condições definidas. |

## Out of Scope

- Previsões horárias, intradiárias, mensais ou para períodos além dos cinco dias definidos; a v1 mostra previsão diária.
- Dados meteorológicos além dos campos definidos em RF2 e RF3, incluindo sensação térmica, umidade, vento, pressão, nascer/pôr do sol, índice UV, qualidade do ar, mapas, radar e histórico climático.
- Contas, autenticação, perfis, sincronização entre dispositivos ou persistência da cidade, unidade e buscas entre sessões, tanto local quanto em servidor.
- Geolocalização automática, localização contínua ou uso da localização do dispositivo para iniciar uma busca.
- Favoritos, histórico de consultas, comparação simultânea de cidades ou gerenciamento de várias cidades salvas; o usuário pode substituir a cidade ativa por uma nova busca.
- Alertas meteorológicos severos, notificações push ou outros avisos proativos. Mensagens de erro e estados de carregamento da interface continuam dentro do escopo via RF6.
- Funcionamento offline, cache para uso sem rede, widgets, compartilhamento, exportação ou integração com calendários.
- Idiomas além de pt-BR, formatos regionais alternativos e personalização de idioma.
- Conversão de unidades além de temperatura; precipitação permanece em porcentagem na v1.
- Publicidade, monetização e conteúdo patrocinado.

## Open Questions

O escopo funcional da v1 está fechado. Antes do lançamento, confirmar: (1) licença, atribuição, limites e cobertura da Open-Meteo; (2) aprovação das metas RNF pelo responsável do produto; (3) validação das personas e métricas de sucesso de negócio, que não foram fornecidas no discovery.

## Rastreabilidade

| User Story | Requisitos funcionais | Acceptance Criteria | Requisitos não funcionais relevantes |
| --- | --- | --- | --- |
| US1 — Consulta rápida | RF1, RF2 | AC1.1–AC1.8; AC2.1–AC2.5 | RNF1, RNF2, RNF4, RNF5, RNF6, RNF7, RNF8 |
| US2 — Planejamento de viagem | RF3 | AC3.1–AC3.6 | RNF1, RNF2, RNF3, RNF4, RNF5, RNF6, RNF7 |
| US3 — Unidade familiar | RF4 | AC4.1–AC4.5 | RNF2, RNF3, RNF4, RNF6 |
| US4 — Consulta em movimento | RF5 | AC5.1–AC5.2 | RNF1, RNF2, RNF3, RNF4, RNF6 |
| US5 — Recuperação da consulta | RF6 | AC1.8; AC2.5; AC6.1–AC6.3; AC6.5–AC6.6 | RNF1, RNF2, RNF4, RNF7, RNF8 |
