/**
 * Ranking da Torre de Toalhas (Lutex)
 * Cole este código em Extensões > Apps Script de uma Planilha Google
 * e publique como "App da Web". Passo a passo em ranking/COMO-CONFIGURAR.md.
 *
 * Cada partida salva vira uma linha na aba "Ranking".
 * Para remover um nome do ranking, basta apagar a linha na planilha.
 */

const ABA = 'Ranking';
const LIMITE = 10;            // quantas posições o jogo mostra
const MAX_PONTOS = 50000;     // trava contra valores absurdos

// Filtro de nomes impróprios (mesma lista no jogo e no script da planilha).
// Trechos que bloqueiam em qualquer parte do nome, mesmo com espaços ou pontos no meio:
const PALAVRAS_PROIBIDAS = [
  'caralh', 'buceta', 'merd', 'foder', 'fodid', 'fodase', 'fuder', 'fudid', 'arrombad',
  'xoxota', 'xereca', 'punheta', 'piroca', 'boquete', 'babaca', 'otari', 'imbecil', 'idiot',
  'vagabund', 'vadia', 'bosta', 'bostinh', 'cuzao', 'putaria', 'putinha', 'filhodaputa', 'filhadaputa',
  'desgracad', 'retardad', 'escrot', 'cacete', 'traveco', 'sapatao', 'hitler',
  'fuck', 'shit', 'bitch', 'pussy', 'nigg', 'asshole'
];
// Palavras que só bloqueiam sozinhas (evita barrar nomes como Lucas, Disputa ou Porangaba):
const PALAVRAS_INTEIRAS = [
  'cu', 'cus', 'puta', 'putas', 'puto', 'putos', 'porra', 'fdp', 'pqp', 'vsf', 'vtnc', 'tnc',
  'krl', 'crl', 'kct', 'bct', 'foda', 'fodas', 'viado', 'viada', 'corno', 'cornos', 'nazi',
  'bicha', 'dick', 'cock'
];

function nomeImproprio(nome) {
  const colapsar = t => t.replace(/(.)\1+/g, '$1');            // "caralhooo" -> "caralho"
  const trocas = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i', '|': 'i' };
  const s = String(nome || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[0134578@$!|]/g, c => trocas[c]);
  const partes = s.split(/[^a-z]+/).filter(Boolean).map(colapsar);
  const junto = colapsar(partes.join(''));
  if (PALAVRAS_PROIBIDAS.some(p => junto.includes(colapsar(p)))) return true;
  const inteiras = PALAVRAS_INTEIRAS.map(colapsar);
  return partes.some(t => inteiras.includes(t));
}

function doGet() {
  return resposta({ ok: true, top: topN() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');

    let nome = String(d.nome || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
    if (/^[=+\-@]/.test(nome)) nome = "'" + nome;   // evita fórmulas na planilha
    const pontos = Math.floor(Number(d.pontos));
    const pecas = Math.floor(Number(d.pecas));
    const altura = Math.floor(Number(d.altura));

    if (nome.replace(/^'/, '').length < 2 || nomeImproprio(nome)) return resposta({ ok: false, erro: 'nome' });
    const valido = pontos >= 1 && pontos <= MAX_PONTOS &&
                   // máximo possível: todas as peças perfeitas em sequência (2 + 3 + 4 + ...)
                   pecas >= 1 && pontos >= pecas && pontos <= pecas * (pecas + 3) / 2 &&
                   altura >= 0 && altura <= pecas * 10;
    if (!valido) return resposta({ ok: false, erro: 'dados' });

    aba().appendRow([new Date(), nome, pontos, pecas, altura]);
    return resposta({ ok: true, top: topN() });
  } catch (err) {
    return resposta({ ok: false, erro: 'falha' });
  } finally {
    lock.releaseLock();
  }
}

function aba() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(ABA);
  if (!sh) {
    sh = ss.insertSheet(ABA);
    sh.appendRow(['Data', 'Nome', 'Pontos', 'Peças', 'Altura (cm)']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function topN() {
  const sh = aba();
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, 5).getValues()
    .filter(r => r[1] !== '' && r[2] !== '')
    .sort((a, b) => Number(b[2]) - Number(a[2]) || new Date(a[0]) - new Date(b[0]))
    .slice(0, LIMITE)
    .map(r => ({ nome: String(r[1]).replace(/^'/, ''), pontos: Number(r[2]), pecas: Number(r[3]), altura: Number(r[4]) }));
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
