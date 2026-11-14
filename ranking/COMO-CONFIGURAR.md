# Ranking online com Google Planilhas

O GitHub Pages só hospeda arquivos e não consegue gravar dados. Por isso o ranking
fica guardado numa Planilha Google. É grátis, e vocês conseguem ver e apagar nomes direto nela.

Enquanto o ranking online não estiver configurado, o jogo funciona normalmente e
guarda o ranking só no aparelho de cada jogador (aparece "Neste aparelho" ao lado do título).

## Passo a passo (uns 10 minutos)

1. Entre em https://sheets.google.com com a conta Google da Lutex e crie uma **planilha em branco**.
   Dê o nome "Ranking Torre de Toalhas".
2. No menu da planilha, clique em **Extensões → Apps Script**.
3. Apague o código que aparece e cole todo o conteúdo do arquivo `ranking/apps-script.gs`.
   Clique no ícone de **disquete (Salvar)**.
4. Clique em **Implantar → Nova implantação**.
   - Na engrenagem ao lado de "Selecione o tipo", escolha **App da Web**.
   - Descrição: `Ranking`
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
   - Clique em **Implantar**.
5. O Google pede autorização. Clique em **Autorizar acesso** e escolha a conta.
   Se aparecer "O Google não verificou este app", clique em **Avançado → Acessar (não seguro)**.
   O aviso aparece porque o script foi criado por vocês mesmos, e ele só mexe nesta planilha.
6. Copie a **URL do app da Web** (começa com `https://script.google.com/macros/s/...`)
   e envie para o Claude. Ele coloca no jogo e publica.

## Moderação

- Cada partida salva vira uma linha na aba **Ranking**.
- Para tirar um nome impróprio do ranking, é só **apagar a linha**.
- O jogo mostra os 10 melhores. Para mudar, altere `LIMITE` no script e faça uma nova implantação.

## Se alterar o script depois

Use **Implantar → Gerenciar implantações → Editar (lápis) → Versão: Nova versão → Implantar**.
Assim a URL continua a mesma.

## Limitação

Como o jogo roda no navegador, alguém com conhecimento técnico consegue enviar uma pontuação falsa.
O script recusa valores impossíveis, mas não tem como impedir 100%. Se algum resultado parecer
estranho, é só apagar a linha. Por isso, não vale a pena dar prêmios em dinheiro com base nesse ranking.
