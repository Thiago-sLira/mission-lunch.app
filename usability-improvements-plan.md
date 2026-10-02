# Plano de Melhorias de Usabilidade — Mission Lunch App

## Visão Geral

Série de melhorias de usabilidade, textos, validações e navegação no app de agendamento de almoço. As mudanças abrangem cinco áreas: centralização de labels de duplas, tela inicial, tela de escolha de data, formulário de confirmação e tela de visualização dos missionários. Nenhuma mudança na API ou estrutura de dados — apenas camada visual e regras de UI.

---

## Sub-Tarefa 1 — Centralizar Labels das Duplas em `DUPLAS_CONFIG`

**Status:** [ ] pending

### Intent
Os labels visuais atuais ("Élderes 1", "Élderes 2", "Sisteres") estão defasados. Os novos labels são "Dupla Élderes 1", "Dupla Élderes 2" e "Sisteres". Centralizar em `DUPLAS_CONFIG` garante que todas as telas sejam atualizadas automaticamente via um único ponto de edição.

### Expected Outcomes
- `DUPLAS_CONFIG[0].label` e `DUPLAS_CONFIG[0].shortLabel` = `"Dupla Élderes 1"`
- `DUPLAS_CONFIG[1].label` e `DUPLAS_CONFIG[1].shortLabel` = `"Dupla Élderes 2"`
- `DUPLAS_CONFIG[2].label` e `DUPLAS_CONFIG[2].shortLabel` = `"Sisteres"` (sem alteração)
- As chaves `ELDERES_1`, `ELDERES_2`, `SISTERES` do tipo `Dupla` permanecem inalteradas
- Todas as telas que consomem `conf.label` ou `conf.shortLabel` refletem os novos nomes sem outras mudanças

### Todo List
1. Editar `app/types/agendamento.ts`: atualizar `label` e `shortLabel` de `ELDERES_1` para `"Dupla Élderes 1"` e de `ELDERES_2` para `"Dupla Élderes 2"`

### Relevant Context
- Arquivo: `app/types/agendamento.ts` — linhas 44-56 contêm os campos `label` e `shortLabel` de cada dupla
- Consumidores: `FormularioAgendamento.tsx` usa `conf.label` (linha 194), `marcar-almoco/index.tsx` usa `conf.shortLabel` (linha 362), `visualizar-almoco/index.tsx` usa `config.shortLabel` (linha 213)

---

## Sub-Tarefa 2 — Tela Principal (Home)

**Status:** [ ] pending

### Intent
Substituir a saudação genérica pelo nome da ala, remover o lembrete de P-Day (que é um detalhe operacional desnecessário no rodapé visual) e adicionar um rodapé discreto de identificação comunitária da aplicação.

### Expected Outcomes
- Título da tela muda de `"Olá! Seja bem-vindo(a)"` para `"Ala Canhema Taboão"`
- O bloco `<ReminderCard message="Segunda-feira é P-Day (sem agendamento)." />` é removido
- No lugar (ou após o bloco removido), aparece um texto de rodapé discreto: `"Aplicação comunitária sem fins lucrativos desenvolvida para apoio ao trabalho missionário"`
- A estrutura e estilo dos ActionCards não são alterados

### Todo List
1. Editar `app/page.tsx`: trocar o texto `"Olá! Seja bem-vindo(a)"` por `"Ala Canhema Taboão"`
2. Remover o import de `ReminderCard` e o bloco `<div className="mt-auto pt-8">` que o envolve
3. No lugar, adicionar um `<p>` discreto com estilo `text-xs text-center text-gray-400 mt-auto pt-8` contendo o texto comunitário

### Relevant Context
- Arquivo: `app/page.tsx` — linha 34 (saudação), linhas 61-64 (bloco ReminderCard)
- `ReminderCard` estará sem uso após a remoção; remover o import para evitar warnings

---

## Sub-Tarefa 3 — Tela de Escolher Data (Marcar Almoço)

**Status:** [ ] pending

### Intent
Três melhorias independentes: (a) corrigir o scroll ao abrir o formulário de confirmação, (b) adicionar legenda visual entre o seletor de mês e o subtítulo "DIAS DISPONÍVEIS", (c) ajustar os badges de status das duplas nos cards de dia.

### Expected Outcomes
- **Scroll:** Ao clicar "Agendar para este dia", a página de confirmação começa no topo (sem herdar posição de scroll anterior)
- **Legenda:** Entre o card de navegação de mês e o span "DIAS DISPONÍVEIS", existe uma seção compacta com duas tags:
  - Tag verde (estilo `bg-emerald-50 text-emerald-700 border-emerald-200`): "Disponível para agendamento"
  - Tag cinza (estilo `bg-gray-100 text-gray-500 border-gray-200`): "Almoço já agendado ou indisponível"
- **Badges:**
  - Dupla disponível (livre): exibe `"{shortLabel} Livre"` em verde, **sem** o símbolo `✓`
  - Dupla indisponível (agendada): exibe apenas `"{shortLabel}"` em cinza, **sem** o símbolo `✕`
  - Dupla desabilitada: mantém o texto `"Indisponível"` atual

### Todo List
1. Editar `app/features/marcar-almoco/index.tsx`: na função `handleAbrirAgendamento`, chamar `window.scrollTo({ top: 0, behavior: 'instant' })` antes de setar o estado `diaSelecionado`
2. Adicionar bloco de legenda entre o card de navegação de meses (linha ~233) e o `<div className="pt-1">` do subtítulo (linha ~236)
3. Nos badges (linhas 363-369): substituir `"Livre ✓"` por `"Livre"` e substituir `"✕"` (dupla agendada) por string vazia ou só o nome (ver abaixo)

#### Detalhe dos badges após mudança:
- `isLivre` = true: renderiza `<span>{conf.shortLabel}</span><span>Livre</span>` (sem check)
- `isLivre` = false e `isDesabilitada` = false (agendada): renderiza apenas `<span>{conf.shortLabel}</span>` (sem `✕`, sem texto adicional)
- `isDesabilitada` = true: renderiza `<span>{conf.shortLabel}</span><span>Indisponível</span>` (mantém como está)

### Relevant Context
- Arquivo: `app/features/marcar-almoco/index.tsx`
- `handleAbrirAgendamento` está na linha 81
- A transição para `FormularioAgendamento` ocorre na linha 94 (condicional `if (diaSelecionado)`)
- Bloco de legenda deve ser inserido entre as linhas 233 e 236
- Badges estão nas linhas 346-373

---

## Sub-Tarefa 4 — Formulário de Confirmação

**Status:** [ ] pending

### Intent
Quatro ajustes no formulário: (a) dupla única pré-selecionada e desabilitada para deselecionar, (b) label/placeholder e validação do campo nome, (c) renomear label de observações e remover placeholder, (d) atualizar textos dos lembretes de adultos com "pelo menos".

### Expected Outcomes
- **Seleção de Duplas:** Se `duplasDisponiveis.length === 1`, o checkbox da única dupla aparece `checked` e com interação desabilitada (não pode ser desmarcado pelo usuário); as outras duplas indisponíveis continuam desabilitadas como antes
- **Campo Nome:**
  - Label: `"Nome e Sobrenome / Família"` com asterisco obrigatório
  - Placeholder: `"Nome e Sobrenome ou Família"` (ou similar instrucional)
  - Ao `onBlur` com menos de 4 caracteres (após trim), exibe mensagem de erro abaixo: `"Por favor, informe seu nome e sobrenome ou nome da família (mínimo de 4 caracteres)"`
  - `formValido` só é `true` se `nomeFamilia.trim().length >= 4`
- **Campo Observações:**
  - Label muda para `"Instruções para os missionários (opcional)"`
  - Placeholder removido (campo vazio)
- **Lembretes:**
  - `"Apenas Élderes: precisa de pelo menos um homem adulto presente."`
  - `"Apenas Sisteres: precisa de pelo menos uma mulher adulta presente."`
  - `"Élderes e Sisteres: precisa de pelo menos um homem adulto e pelo menos uma mulher adulta presentes."` (também muda "Ambas as duplas" para "Élderes e Sisteres")

### Todo List
1. Editar `app/features/marcar-almoco/FormularioAgendamento.tsx`: quando `duplasDisponiveis.length === 1`, o label da dupla disponível deve renderizar com `pointer-events-none` (ou `onClick` no-op) e aparência visual idêntica ao estado selecionado, impedindo desmarcação
2. Adicionar estado `nomeError: string` e handler `handleNomeBlur` que define a mensagem de erro se `nomeFamilia.trim().length < 4 && nomeFamilia.trim().length > 0`; limpar o erro quando o campo for válido
3. Atualizar `formValido` para exigir `nomeFamilia.trim().length >= 4`
4. Atualizar label do campo nome (linha 211): `"Nome e Sobrenome / Família"`
5. Atualizar placeholder do campo nome (linha 219): `"Nome e Sobrenome ou Família"`
6. Adicionar renderização condicional da mensagem de erro abaixo do input de nome
7. Atualizar label de observação (linha 229): `"Instruções para os missionários (opcional)"`
8. Remover o `placeholder` do input de observação (linha 236)
9. Atualizar os três itens de bullet dos lembretes (linhas 253-260) com "pelo menos" e renomear "Ambas as duplas" para "Élderes e Sisteres"

### Relevant Context
- Arquivo: `app/features/marcar-almoco/FormularioAgendamento.tsx`
- Estado inicial de `duplasSelecionadas` já pré-seleciona a única dupla disponível (linha 24); só é necessário impedir o toggle visual
- `formValido` está na linha 43-46; adicionar condição de `>= 4` ao campo nome
- Quando `duplasDisponiveis.length === 1` e o usuário está no label da dupla, o `onClick={() => toggleDupla(conf.id)}` precisa ser suprimido ou a função `toggleDupla` deve ignorar a chamada se é a única opção selecionada

---

## Sub-Tarefa 5 — Tela de Visualizar Almoços (Missionários)

**Status:** [ ] pending

### Intent
Dois ajustes: (a) substituir a visão fixa de 7 dias por navegação mensal (mês atual a partir de hoje + mês seguinte completo), alinhando com a tela de agendamento, (b) exibir apenas o nome de quem agendou, sem o prefixo "Almoço na/no".

### Expected Outcomes
- **Navegação Mensal:** A tela exibe um seletor de mês (mesmo componente visual da tela de marcar almoço), com as restrições:
  - Mês atual: exibe apenas dias de hoje em diante até o fim do mês
  - Mês seguinte: exibe todos os dias do mês (1º ao último)
  - Não é possível navegar além do mês seguinte nem antes do mês atual
- O header "Próximos 7 Dias" e o badge de data-início/data-fim são substituídos pelo navegador de mês
- **Texto de Agendamento:** O campo que hoje exibe `"Almoço na Família Silva"` passa a exibir apenas `"Família Silva"` (o valor direto de `agendamento.nome_familia`)

### Todo List
1. Editar `app/features/visualizar-almoco/index.tsx`: importar `getDiasDoMes` e `MESES` de `app/utils/date`
2. Adicionar estados `[ano, setAno]` e `[mes, setMes]` inicializados com o mês/ano atual
3. Calcular `mesSeguinte`/`anoSeguinte` (já existe lógica idêntica em `marcar-almoco/index.tsx` — reutilizar padrão)
4. Substituir o bloco do badge "Próximos 7 Dias" pelo mesmo componente de navegação de mês usado em `marcar-almoco/index.tsx` (botões prev/next com `isMesAtual`/`isMesSeguinte`)
5. Substituir `proximos7Dias` pela lista calculada de `getDiasDoMes(ano, mes)` filtrada: no mês atual, filtrar apenas dias `>= hoje`; no mês seguinte, todos os dias
6. Remover imports não usados (`getProximosNDias`, `formatarDataCurta`) após a mudança
7. Substituir a lógica de exibição do nome (linhas 221-224) por `agendamento.nome_familia` diretamente, sem o prefixo condicional

### Relevant Context
- Arquivo: `app/features/visualizar-almoco/index.tsx`
- `getDiasDoMes` e `MESES` estão em `app/utils/date` (já importados em `marcar-almoco/index.tsx`)
- A lógica de navegação de mês está em `marcar-almoco/index.tsx` linhas 23-76 — copiar/adaptar o padrão
- A expressão condicional de exibição do nome está nas linhas 221-224
