# Padoka — site do cardápio

Site estático da Padoka Pães & Doces, feito para funcionar diretamente em GitHub Pages, Cloudflare Pages ou qualquer hospedagem de arquivos estáticos.

## Estrutura

```text
.
├── index.html                 # Página principal
├── styles.css                 # Identidade visual e responsividade
├── script.js                  # Navegação otimizada, zoom e WhatsApp
├── CNAME                      # Domínio personalizado do GitHub Pages
├── robots.txt                 # Permite rastreamento e aponta para o sitemap
├── sitemap.xml                # URL principal para o Google Search Console
├── img/                       # Logo, ícone e WhatsApp oficiais
│   ├── menu/                  # Páginas WebP leves para abertura rápida
│   └── menu-hq/               # Páginas JPEG em alta resolução usadas no zoom
└── assets/
    └── cardapio-padoka.pdf    # Cardápio otimizado para carregamento rápido
```

O cardápio visualizado no site usa as páginas originais do PDF convertidas para WebP
leve. Assim os fundos, fotos, destaques, tipografia e proporções do material impresso
são preservados sem carregar o PDF pesado no navegador. Quando o visitante amplia a
página, uma versão JPEG em alta resolução é carregada sob demanda para manter o texto
mais nítido. A página 10 repetida foi retirada apenas da visualização do site.

O botão “Abrir cardápio” abre um popup próprio, com animação de virar páginas, setas,
gesto no celular, zoom pelo scroll do mouse ou pinça e WhatsApp sempre acessível. O
download abre o PDF original por um link externo do GitHub; o arquivo pesado não faz
parte dos assets publicados pelo Cloudflare.

## SEO local e Google

O `index.html` já inclui título e descrição para a busca “padaria em Barretos”,
Open Graph, canonical, conteúdo rastreável em HTML e dados estruturados JSON-LD
para a organização, as unidades Padoka 28, Padoka 30 e Padokinha, horários e perguntas frequentes.

Depois de publicar, cadastre ou reivindique as três unidades no Perfil da Empresa
no Google, mantendo nome, telefone, endereço e horários exatamente iguais aos do site.
Também vale enviar `https://padoka.me/sitemap.xml` no Google Search Console.

Dados estruturados ajudam o Google a entender o negócio, mas não garantem posição,
avaliações ou presença no mapa. A manutenção do Perfil da Empresa, avaliações reais
e citações consistentes em outros diretórios continuam sendo necessárias.

## Antes de publicar

O WhatsApp já está configurado no arquivo `script.js` com o número da Padoka. Para alterá-lo no futuro, use o formato internacional sem `+`, espaços ou parênteses.

## Publicar pelo GitHub Pages

1. Crie um repositório no GitHub e envie estes arquivos para a branch `main`.
2. No GitHub, abra **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**, branch `main` e pasta `/ (root)`.
4. Salve e aguarde o endereço padrão do GitHub Pages ficar disponível.

Como este projeto não usa build, não é necessário instalar dependências ou rodar comandos antes do deploy.

## Configurar o domínio `padoka.me` na Cloudflare

Se o repositório estiver usando GitHub Pages, no GitHub abra **Settings → Pages → Custom domain** e informe `padoka.me`.

Na zona DNS da Cloudflare, use:

- `CNAME` para `www` apontando para `SEU_USUARIO.github.io`.
- Para o domínio raiz `padoka.me`, configure os registros indicados pelo GitHub Pages para o seu repositório. O GitHub mostra os quatro endereços atuais na tela de configuração do domínio.

Depois, aguarde a propagação, ative **Enforce HTTPS** no GitHub Pages e teste `https://padoka.me`.

> Caso prefira Cloudflare Pages, basta conectar o mesmo repositório, usar a raiz como diretório de saída e deixar o comando de build vazio.
