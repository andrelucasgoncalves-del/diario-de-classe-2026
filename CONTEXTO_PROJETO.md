# Contexto do Projeto — Diário de Classe (EREFEM Pedro Pires Ferreira — 2026)

Este repositório contém o aplicativo web/PWA **Diário de Classe 2026** do professor Lucas (EREFEM Pedro Pires Ferreira — Tabira, PE), publicado em produção via **GitHub Pages**:

- **URL em produção:** https://andrelucasgoncalves-del.github.io/diario-de-classe-2026/
- **Histórico completo da criação:** [`docs/HISTORICO_COMPLETO_CONVERSA.md`](docs/HISTORICO_COMPLETO_CONVERSA.md)

## Stack & Arquitetura
- **Frontend:** React + Vite + Tailwind CSS + `lucide-react`
- **PWA (iOS / iPad mini / Android / Desktop):**
  - `public/manifest.json`, `public/sw.js`, `index.html` com `apple-mobile-web-app-capable="yes"`, `viewport-fit=cover` e ícones PNG (`apple-touch-icon.png` 180×180, `icon-192.png`, `icon-512.png`, `icon.svg`).
  - Funciona offline em sala de aula (dados persistidos em `localStorage` com exportação/importação de Backup JSON e Boletim CSV).
- **Base real de 2026 (`src/data/turmas2026.js`):**
  - 12 turmas na ordem exata (`6º A` até `3º B Médio`), totalizando **464 alunos** reais com matrículas e nomes preservados.
- **Funcionalidades principais:**
  - **Modo Grade** (visão geral por turma/atividades) e **Modo Sala** (lançamento rápido otimizado para toque no iPhone/iPad mini com filtros *Todos*, *Pendentes*, *Não fez*, *Fez*, ajuste `-`/`+` e observação inline).
  - Gestão de atividades (`ActivityModal.jsx`) com replicação para outras turmas e atalho *"Mesmo ano"*.
  - Gestão de alunos (`StudentModal.jsx`): adição individual, em lote, edição e remoção.
  - Exportação de Backup `.json`, Boletim `.csv` e impressão limpa.
- **Deploy automático:**
  - `vite.config.js` configurado com `base: './'`.
  - GitHub Actions publica automaticamente na branch `main` no GitHub Pages (`dist/`).

## Pontos de Atenção ao Refinar o App
- Sempre manter compatibilidade com **Safari iOS (iPhone e iPad mini)** em modo PWA tela cheia (`viewport-fit=cover`, safe-areas e botões táteis grandes).
- Sempre preservar retrocompatibilidade do formato de dados no `localStorage` e nos backups `.json` existentes para o professor nunca perder notas já lançadas.
- Sempre testar `npm run build` antes de fazer push na `main` (o push aciona deploy direto para o GitHub Pages).