# 📱 Learn Letters — Guia de Publicação na Play Store

## Estrutura do projeto
```
learn-letters/
  index.html        ← página principal
  manifest.json     ← configuração do PWA
  sw.js             ← service worker (offline)
  css/style.css
  js/game.js
  js/levels.js
  js/sound.js
  icons/            ← ícones em todos os tamanhos
```

---

## PASSO 1 — Subir no GitHub Pages (grátis, sem limite)

1. Acesse https://github.com e crie uma conta (se não tiver)
2. Clique em **"New repository"**
3. Nome: `learn-letters` | Marque **Public** | Clique em **Create**
4. Na página do repositório, clique em **"uploading an existing file"**
5. Arraste TODOS os arquivos desta pasta (index.html, manifest.json, sw.js, pasta css/, pasta js/, pasta icons/)
6. Clique em **"Commit changes"**
7. Vá em **Settings → Pages → Branch: main → / (root)** → Clique em **Save**
8. Aguarde 2 minutos. Seu jogo estará em:
   👉 `https://SEU-USUARIO.github.io/learn-letters`

---

## PASSO 2 — Gerar o APK (sem Android Studio!)

1. Acesse https://www.pwabuilder.com
2. Cole a URL do GitHub Pages no campo de entrada
3. Clique em **"Start"** e aguarde a análise
4. Clique em **"Package for Stores"**
5. Selecione **Android**
6. Clique em **"Generate Package"**
7. Baixe o arquivo `.apk` ou `.aab` gerado ✅

> ⚠️ O PWABuilder pode pedir para você criar uma chave de assinatura.
> Siga as instruções na tela — é simples e gratuito.

---

## PASSO 3 — Publicar na Play Store

1. Acesse https://play.google.com/console
2. Pague a taxa única de **U$ 25** para criar sua conta de desenvolvedor
3. Clique em **"Criar app"**
4. Preencha: nome, descrição, categoria (Jogos → Puzzle), classificação etária
5. Faça upload do arquivo `.aab` gerado pelo PWABuilder
6. Adicione prints de tela (pode tirar do próprio celular)
7. Clique em **"Publicar"**
8. Aguarde a revisão do Google (normalmente 1–3 dias)

---

## PASSO 4 — Jogar offline sem loja (alternativa mais rápida)

Se quiser apenas instalar no seu celular SEM publicar na Play Store:

1. Abra o jogo no Chrome do Android pela URL do GitHub Pages
2. Toque no menu (⋮) → **"Adicionar à tela inicial"**
3. O jogo aparece como ícone na tela do celular
4. Funciona 100% offline depois de instalado!

---

## Dúvidas frequentes

**O jogo funciona sem internet?**
Sim! O service worker (sw.js) guarda tudo no celular após a primeira visita.

**Precisa pagar hospedagem?**
Não. O GitHub Pages é gratuito para sempre para projetos públicos.

**Posso mudar o nome do jogo?**
Sim! Edite o campo "name" e "short_name" no arquivo `manifest.json`.

**Como atualizar o jogo depois de publicado?**
Edite os arquivos no GitHub. O service worker baixa a nova versão automaticamente.
