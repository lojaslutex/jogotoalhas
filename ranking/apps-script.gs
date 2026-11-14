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
const MAX_PONTOS = 3000;      // trava contra valores absurdos

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

    if (nome.replace(/^'/, '').length < 2) return resposta({ ok: false, erro: 'nome' });
    const valido = pontos >= 1 && pontos <= MAX_PONTOS &&
                   pecas >= 1 && pontos >= pecas && pontos <= pecas * 2 &&
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
