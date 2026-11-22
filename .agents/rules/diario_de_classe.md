# Regra do Workspace — Diário de Classe 2026

- Responda sempre em **português do Brasil (pt-BR)**, preservando termos técnicos, nomes de arquivos, componentes e comandos originais.
- Antes de propor alterações ou refatorações, leia **`CONTEXTO_PROJETO.md`** na raiz do repositório. Para decisões e detalhes da criação original, consulte **`docs/HISTORICO_COMPLETO_CONVERSA.md`**.
- **Regras obrigatórias deste projeto:**
  - Preserve **100% de retrocompatibilidade** com o esquema salvo em `localStorage` e com os backups `.json` já exportados pelo professor.
  - Mantenha o `base: './'` no `vite.config.js` e a estrutura do PWA (`public/manifest.json`, `public/sw.js`, meta tags Apple iOS) para que o deploy automático no GitHub Pages e o app instalado no iPhone/iPad mini continuem funcionando sem quebrar.
  - Preserve intactos os dados reais das 12 turmas / 464 alunos em `src/data/turmas2026.js`, salvo quando o usuário pedir explicitamente uma alteração.
  - Valide o build com `npm run build` antes de concluir qualquer alteração.