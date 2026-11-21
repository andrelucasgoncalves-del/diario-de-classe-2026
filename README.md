# Diário de Classe - EREFEM Pedro Pires Ferreira (2026)

Aplicação web PWA (React + Vite + Tailwind CSS + Lucide Icons) otimizada para uso rápido em **iPhone, iPad mini e Desktop**, com suporte offline (`Service Worker` + `localStorage`) e base inicial com as **12 turmas reais de 2026**.

## Desenvolvimento Local

```bash
npm install
npm run dev -- --host
```

## Build de Produção

```bash
npm run build
```

## Publicação Gratuita (Vercel ou GitHub Pages)

### Vercel (Mais rápido)
1. Suba esta pasta para um repositório no GitHub (ou arraste/importe via Vercel CLI).
2. Acesse [vercel.com](https://vercel.com), clique em **Add New Project** e selecione o repositório.
3. Clique em **Deploy** (o Vite já é detectado automaticamente).

### GitHub Pages
1. Suba o projeto para um repositório no GitHub na branch `main`.
2. Em **Settings > Pages > Source**, selecione **GitHub Actions**.
3. A cada push na branch `main`, o workflow `.github/workflows/deploy.yml` publica o app automaticamente.

## Instalação no iPhone / iPad mini (Tela Cheia)
1. Abra o link publicado no **Safari**.
2. Toque no botão **Compartilhar** e escolha **Adicionar à Tela de Início**.
3. O app aparecerá com ícone próprio e abrirá em tela cheia (`standalone`), sem barras do navegador.
