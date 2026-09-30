# Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa precisa de uma aplicação de previsão do tempo para que usuários consultem as condições meteorológicas de cidades escolhidas por eles. O briefing estabelece quatro capacidades centrais: buscar cidades, consultar o clima atual, visualizar a previsão para cinco dias e alternar entre Celsius e Fahrenheit. A aplicação também deve ser utilizável em dispositivos móveis.

O público-alvo, as fontes de dados, os detalhes meteorológicos exibidos e os critérios de qualidade ainda não foram definidos. Esses pontos precisam ser esclarecidos antes de fechar a especificação e as decisões de implementação.

## Personas (Hipóteses)

As personas abaixo são hipóteses baseadas nas funções do briefing; devem ser validadas com usuários antes de orientar decisões definitivas de produto. As métricas são sinais propostos de sucesso individual, não metas de negócio aprovadas.

### Marina — Decide a rotina do dia

- **Objetivo principal:** saber rapidamente como está o tempo na cidade onde está para decidir o que vestir ou se precisa levar proteção contra chuva.
- **Contexto de uso:** principalmente mobile, em uma consulta rápida antes de sair de casa ou durante o deslocamento; ocasionalmente desktop.
- **Métrica de sucesso pessoal:** consegue localizar a cidade e identificar temperatura e condição atual em até 15 segundos, sem precisar refazer a busca.

### Diego — Planeja uma viagem curta

- **Objetivo principal:** consultar a previsão de cinco dias para o destino e escolher quando e o que planejar.
- **Contexto de uso:** desktop ao organizar a viagem; mobile para conferir novamente durante o trajeto ou a estadia.
- **Métrica de sucesso pessoal:** encontra o destino correto e consegue consultar os cinco dias da previsão em uma única sessão, sem confundir datas ou localização.

### Alex — Prefere Fahrenheit

- **Objetivo principal:** consultar o clima atual e a previsão em Fahrenheit, sem precisar converter mentalmente os valores.
- **Contexto de uso:** principalmente mobile, com consultas ocasionais em desktop; pode estar verificando uma cidade diferente da cidade habitual.
- **Métrica de sucesso pessoal:** alterna para Fahrenheit e consegue confirmar que os valores de temperatura do clima atual e da previsão estão nessa unidade, com rótulos claros.

## Requisitos Funcionais

- **RF1 — Buscar cidade:** permitir que o usuário informe uma cidade e encontre a localização correspondente para consulta.
- **RF2 — Consultar clima atual:** exibir as condições meteorológicas atuais da cidade selecionada.
- **RF3 — Consultar previsão:** exibir a previsão do tempo para os próximos cinco dias para a cidade selecionada.
- **RF4 — Alternar unidade:** permitir alternar a apresentação da temperatura entre Celsius e Fahrenheit; esclarecer quais informações, além da temperatura, devem ser convertidas.
- **RF5 — Consultar em dispositivos móveis:** disponibilizar as funções de busca e consulta em dispositivos móveis, com apresentação adequada ao tamanho da tela.

## Requisitos Não-Funcionais

- **RNF1 — Responsividade:** a interface deve permanecer legível e funcional em dispositivos móveis. Tamanhos de tela e navegadores mínimos ainda precisam ser definidos.
- **RNF2 — Usabilidade:** busca, seleção de cidade e leitura das condições devem ser compreensíveis sem etapas desnecessárias. O nível de usabilidade esperado precisa ser validado com usuários.
- **RNF3 — Desempenho:** os tempos aceitáveis para busca e carregamento dos dados ainda não foram estabelecidos; definir metas para conexões e dispositivos representativos.
- **RNF4 — Acessibilidade:** definir e atender ao nível de acessibilidade desejado, incluindo navegação por teclado, estrutura semântica e contraste adequado.
- **RNF5 — Confiabilidade dos dados:** apresentar dados atuais e previsão associados à localização correta, informando horário de atualização e fuso horário quando aplicável.
- **RNF6 — Resiliência:** falhas de rede, indisponibilidade da fonte meteorológica e resultados de busca vazios não devem deixar a interface sem orientação; definir mensagens e opções de recuperação.
- **RNF7 — Compatibilidade:** navegadores e sistemas operacionais suportados devem ser acordados, com atenção ao uso móvel.

## Riscos

| Tipo | Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- | --- |
| Técnico | A fonte meteorológica fica indisponível, limita requisições ou apresenta latência elevada. | Média | Alto: consultas falham ou demoram, prejudicando a confiança e o uso recorrente. | Avaliar SLA, limites, cobertura e termos de uso antes da escolha; tratar falhas e timeouts, monitorar erros e considerar cache ou fonte alternativa. |
| Técnico | A fonte fornece dados incompletos, desatualizados ou com cobertura desigual por localidade. | Média | Alto: previsões enganosas podem levar a decisões ruins e reduzir a credibilidade do app. | Definir critérios de frescor e cobertura, exibir horário da atualização e comunicar indisponibilidade ou idade dos dados. |
| Técnico | Busca retorna uma cidade homônima ou uma localização imprecisa. | Média | Alto: o usuário recebe a previsão do local errado. | Mostrar região/estado e país nos resultados, permitir seleção explícita e validar coordenadas associadas à previsão. |
| Técnico | Conversão ou rótulo de Celsius/Fahrenheit está incorreto ou inconsistente. | Baixa | Alto: valores mal interpretados comprometem decisões e confiança. | Converter a partir de um valor canônico, indicar a unidade em todo contexto e cobrir conversões e alternância com testes. |
| Técnico | Falhas de rede, API ou busca sem resultados deixam o usuário sem orientação. | Média | Médio: o fluxo é interrompido e o usuário pode abandonar a consulta. | Definir estados de carregamento, vazio e erro; oferecer nova tentativa e, se houver cache, marcar claramente dados antigos. |
| Técnico | Performance insuficiente em redes móveis ou dispositivos modestos. | Média | Alto: consultas lentas aumentam abandono e prejudicam a experiência mobile. | Estabelecer metas mensuráveis, limitar dados carregados, otimizar chamadas e testar em condições móveis representativas. |
| Técnico | Interface ou controles não funcionam em determinados tamanhos de tela, navegadores ou com tecnologia assistiva. | Média | Alto: parte dos usuários não consegue completar tarefas. | Definir matriz de suporte, projetar mobile-first e validar responsividade, teclado, leitor de tela e contraste em testes. |
| Técnico | Geolocalização ou preferências são coletadas/armazenadas sem expectativa ou proteção adequada. | Baixa | Alto: pode causar perda de confiança e exposição a riscos de privacidade ou conformidade. | Preferir busca manual até validar a necessidade; pedir consentimento explícito, minimizar dados e definir retenção e armazenamento. |
| Produto | O produto resolve uma necessidade diferente da dos usuários prioritários ou não oferece valor suficiente para uso recorrente. | Média | Alto: baixa adoção e investimento sem retorno. | Validar público, contexto de uso e proposta de valor com usuários; definir métricas de sucesso e testar um escopo mínimo. |
| Produto | Escopo de clima atual, previsão de cinco dias e unidades permanece ambíguo. | Alta | Médio: produto, design e desenvolvimento podem entregar resultados diferentes do esperado. | Resolver as perguntas de discovery e registrar critérios de aceite antes do desenvolvimento. |
| Produto | A cobertura geográfica, idioma ou convenções regionais não correspondem ao mercado-alvo. | Média | Alto: buscas sem resultado ou conteúdo difícil de interpretar limitam o alcance do app. | Confirmar mercados e idiomas prioritários; validar cobertura do provedor e formatos locais com exemplos representativos. |
| Produto | A experiência mobile não atende às situações reais de consulta dos usuários. | Média | Médio: o principal fluxo pode ser difícil de usar em movimento ou em telas pequenas. | Fazer validação de usabilidade em dispositivos móveis e priorizar acesso rápido à busca, localização e previsão essencial. |

## Perguntas em Aberto

1. **Quem são os usuários prioritários e em quais situações consultarão o app?** **Impacto:** sem público e contexto de uso, não é possível priorizar fluxos, conteúdo ou experiência mobile.
2. **Qual problema de negócio o app deve resolver e como será medido o sucesso?** Por exemplo, consultas concluídas, uso recorrente ou satisfação. **Impacto:** sem objetivo e métricas, não há base para priorizar funcionalidades ou avaliar se o produto deu certo.
3. **Quais localidades devem ser cobertas?** Apenas cidades de um país ou cidades do mundo todo? **Impacto:** define cobertura e qualidade do geocoding, idiomas, formatos e tratamento de localidades.
4. **Como o usuário inicia uma consulta?** Busca manual, cidade padrão, localização automática ou combinação dessas opções? **Impacto:** muda o fluxo inicial, as permissões do dispositivo e o tratamento de privacidade.
5. **Como a busca deve funcionar?** Busca por nome parcial, sugestões enquanto digita, seleção explícita e suporte a acentos ou nomes em outros idiomas são esperados? **Impacto:** afeta a experiência, os requisitos do serviço de geocoding e os estados de busca.
6. **Como distinguir cidades homônimas?** Quais dados de contexto devem ser mostrados, como estado/região, país ou coordenadas? **Impacto:** uma seleção ambígua pode associar a previsão ao local errado.
7. **O que deve ser mostrado no clima “atual”?** Quais campos são necessários além da temperatura e condição, e qual nível de detalhe é relevante? **Impacto:** define o contrato de dados, a hierarquia visual e o que conta como consulta completa.
8. **Qual é a idade máxima aceitável para um dado ser considerado atual?** O horário da medição ou da última atualização deve ser exibido? **Impacto:** sem limite de frescor, dados antigos podem parecer atuais e induzir decisões equivocadas.
9. **O que significa “previsão de 5 dias”?** Inclui hoje ou os cinco dias seguintes? É diária, horária ou ambas? **Impacto:** define período, granularidade, volume de dados e organização da previsão.
10. **Que informações devem aparecer em cada período da previsão?** Por exemplo, mínimas/máximas, precipitação ou vento. **Impacto:** afeta a seleção da fonte de dados e a utilidade da previsão para o usuário.
11. **Quais temperaturas e outras grandezas podem alternar entre unidades?** A unidade padrão será Celsius ou Fahrenheit? **Impacto:** determina conversões, rótulos e consistência; uma unidade inicial inadequada pode confundir o usuário.
12. **A preferência de unidade e a cidade escolhida devem persistir entre visitas ou dispositivos?** **Impacto:** pode exigir armazenamento local, conta ou sincronização e altera expectativas de privacidade.
13. **Quais idiomas, formatos de data/hora e convenções regionais são necessários?** **Impacto:** afeta tradução, leitura de datas, unidades, nomes de localidades e testes de localização.
14. **Quais dispositivos, larguras de tela, navegadores e versões devem ser suportados?** **Impacto:** sem uma matriz de suporte, responsividade e compatibilidade não podem ser verificadas objetivamente.
15. **Quais metas mensuráveis de performance são aceitáveis para busca e carregamento da previsão?** Em quais condições de rede e dispositivo? **Impacto:** sem metas e condições de medição, lentidão não tem critério de aceite claro.
16. **Qual nível de acessibilidade é obrigatório?** Há padrão de conformidade e requisitos para teclado, leitor de tela, contraste e movimento reduzido? **Impacto:** decisões tardias podem exigir retrabalho e excluir pessoas da experiência.
17. **Qual disponibilidade é esperada e qual comportamento deve ocorrer quando a API ou a rede falhar?** Pode haver cache, nova tentativa ou dados anteriores identificados como desatualizados? **Impacto:** afeta arquitetura, custo e confiança do usuário durante indisponibilidades.
18. **Quais limites, custos, licenças, atribuições e garantias de cobertura a fonte meteorológica precisa atender?** **Impacto:** uma fonte inadequada pode impedir o lançamento, exceder orçamento ou restringir o uso dos dados.
19. **O app deve funcionar offline ou manter dados em cache? Por quanto tempo e com qual indicação de atualização?** **Impacto:** altera persistência, privacidade, comportamento de atualização e risco de apresentar dados vencidos.
20. **É necessário oferecer favoritos, histórico, múltiplas cidades ou compartilhamento?** **Impacto:** expande navegação, persistência e escopo além da consulta pontual descrita no briefing.
21. **Autenticação é necessária? Se não, quais preferências podem ser guardadas localmente?** **Impacto:** autenticação adiciona fluxos, segurança e manutenção; sem ela, preferências não sincronizam entre dispositivos.
22. **Quais requisitos de privacidade se aplicam à localização e aos dados de uso?** **Impacto:** determina consentimento, retenção, armazenamento e obrigações de conformidade.
23. **Há requisitos de monetização, publicidade ou conteúdo patrocinado?** **Impacto:** podem alterar layout, desempenho, privacidade e prioridades do produto.
24. **Quais critérios de aceite definem que busca, clima atual, previsão de cinco dias e alternância estão corretos?** **Impacto:** sem critérios observáveis, produto e desenvolvimento podem considerar resultados diferentes como concluídos.

## Decisões

1. **Fonte de dados: Open-Meteo, sem API key.** **Justificativa:** evita exigir uma chave de API na configuração inicial e simplifica a integração. **Perguntas resolvidas:** define a fonte e elimina a necessidade de chave na consulta (Q18). Custos, licença, atribuição, limites e cobertura ainda devem ser confirmados.
2. **“5 dias” = hoje + os quatro dias seguintes.** **Justificativa:** estabelece um período previsível de cinco datas incluindo o dia da consulta. **Pergunta resolvida:** esclarece a inclusão de hoje (Q9); a granularidade diária ou horária continua em aberto.
3. **Unidade padrão: Celsius.** **Justificativa:** oferece uma configuração inicial coerente com a interface em pt-BR. **Pergunta resolvida:** define a unidade inicial (Q11); ainda é necessário definir quais grandezas serão convertidas.
4. **Sem autenticação e sem persistência de servidor.** **Justificativa:** mantém a primeira versão simples e evita contas e infraestrutura de dados do usuário no servidor. **Perguntas resolvidas:** decide que login não é necessário (Q21) e descarta sincronização de preferências pelo servidor (Q12). Persistência local de cidade ou unidade ainda não foi decidida.
5. **Idioma da interface: pt-BR.** **Justificativa:** fixa o idioma da primeira versão para o público brasileiro. **Pergunta resolvida:** define o idioma da UI (Q13); formatos regionais e suporte a outros idiomas continuam pendentes.

## Suposições

- A consulta é iniciada pelo usuário escolhendo uma cidade; o briefing não confirma geolocalização automática.
- A preferência de unidade e a cidade escolhida podem não persistir entre sessões; a decisão sobre persistência local permanece em aberto.
- A alternância de unidade afeta pelo menos a temperatura apresentada no clima atual e na previsão.
- Os dados meteorológicos serão obtidos da API Open-Meteo; a adequação de cobertura e os termos de uso ainda precisam ser confirmados.
- A previsão inclui hoje e os quatro dias seguintes; a granularidade permanece indefinida.
- Dispositivos móveis são um contexto de uso obrigatório; não foram informados dispositivos, navegadores ou larguras mínimas específicas.
