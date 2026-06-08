/**
 * Standalone dev server: Gemini citation extraction for chat Sources chips.
 * Loads ../.env when present (GEMINI_API_KEY, GEMINI_CITATION_MODEL).
 *
 * Start: npm run citation-normalize-server
 * POST /normalize-citations — body either { preamble, blocks, globalTail } (extract) or { citations } (legacy).
 */

const http = require('http');
const path = require('path');

try {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (_) {
  /* optional dependency */
}

const PORT = Number(process.env.CITATION_NORMALIZE_PORT || 8001, 10);

const MAX_BLOCK_CHARS = 28000;

function padBlockCites(blocksLen, rows) {
  const out = Array.isArray(rows) ? rows.map((r) => (Array.isArray(r) ? r : [])) : [];
  while (out.length < blocksLen) out.push([]);
  return out.slice(0, blocksLen).map((row) => row.map((c) => String(c ?? '').trim()).filter(Boolean));
}

function sendJson(res, code, obj) {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(code);
  res.end(JSON.stringify(obj));
}

async function runGeminiExtract({ preamble, blocks, globalTail }) {
  const key = process.env.GEMINI_API_KEY;
  const blocksSafe = blocks.map((b) => String(b ?? '').slice(0, MAX_BLOCK_CHARS));
  const n = blocksSafe.length;

  if (!key) {
    return {
      blockCites: blocksSafe.map(() => []),
      globalCitations: globalTail.map((s) => String(s ?? '').trim()).filter(Boolean),
    };
  }

  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const modelName = process.env.GEMINI_CITATION_MODEL || 'gemini-2.0-flash-lite';
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  const payload = JSON.stringify({
    preamble: String(preamble ?? '').slice(0, MAX_BLOCK_CHARS),
    blocks: blocksSafe,
    globalTail,
  });

  const prompt = `You extract commercial lease citation lines for a PDF viewer UI.

The message is split for you:
- "preamble": text before the first numbered item (1. 2. …) if any.
- "blocks": array of length ${n}. Each string is one numbered section (may include bullets, sub-lists, and inline citation wording).
- "globalTail": strings from a trailing "Citations:" / "Sources:" footer (already split on semicolons), if any. It may also include lines pre-normalized from structured backend objects { "docId", "pageNumbers" (comma-separated string), "section" (comma-separated locators) } in the form: Document: <file.pdf> | Pages: ... | Sections: ...

Return ONLY valid JSON (no markdown):
{
  "blockCites": string[][],
  "globalCitations": string[]
}

Rules:
- blockCites MUST be an array of exactly ${n} arrays (same order as "blocks").
- For each numbered block, list every distinct source/citation that supports THAT block only. Each entry one line, prefer:
  Document: <filename.pdf> | Page <n>[, Section <label>]
  or Document: <file.pdf> | Pages <lo>-<hi> for ranges.
- If a block has no sources, use [] for that index.
- globalCitations: sources that apply to the whole answer, only appear in preamble, or come from the footer/global tail. Merge meaning from globalTail into proper citation lines when possible; you may expand or dedupe.
- If nothing is citable, return empty arrays where appropriate.
- Never output markdown fences.

Input JSON:
${payload}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const out = JSON.parse(text);
  const blockCites = padBlockCites(n, out.blockCites);
  const globalCitations = Array.isArray(out.globalCitations)
    ? out.globalCitations.map((s) => String(s ?? '').trim()).filter(Boolean)
    : [];
  return { blockCites, globalCitations };
}

async function runGeminiNormalize(citations) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return citations;

  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const modelName = process.env.GEMINI_CITATION_MODEL || 'gemini-2.0-flash-lite';
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  });

  const userPayload = JSON.stringify({ citations });
  const prompt = `You normalize commercial lease citation snippets for a PDF viewer.

Output rules:
- Reply with ONLY valid JSON (no markdown fences): {"normalized": string[]}
- "normalized" MUST have exactly ${citations.length} entries in the same order as input.
- Each string should be one concise citation line the app can parse. Prefer this pattern when you can infer a file:
  Document: <filename.pdf> | Page <n>[, Section <label>]
- For page ranges use: Document: <file.pdf> | Pages <lo>-<hi>
- If the input already names a .pdf, keep that filename unless clearly wrong.
- Never drop a citation: if unsure, return the input string unchanged for that index.

Input:
${userPayload}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const out = JSON.parse(text);
  if (Array.isArray(out.normalized) && out.normalized.length === citations.length) {
    return out.normalized.map((x) => String(x ?? '').trim());
  }
  return citations;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/normalize-citations') {
    const reqStarted = Date.now();
    console.log(
      `[citation-server] ${new Date().toISOString()} POST /normalize-citations (body incoming…)`,
    );
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', async () => {
      try {
        const parsed = body ? JSON.parse(body) : {};

        if (Array.isArray(parsed.blocks)) {
          const blocks = parsed.blocks.map((x) => String(x ?? ''));
          if (blocks.length > 80) {
            console.warn('[citation-server] extract rejected: too many blocks', blocks.length);
            sendJson(res, 400, { error: 'Too many blocks (max 80)' });
            return;
          }
          const preamble = String(parsed.preamble ?? '');
          const globalTail = Array.isArray(parsed.globalTail)
            ? parsed.globalTail.map((x) => String(x ?? '').trim()).filter(Boolean)
            : [];
          const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);
          console.log(
            `[citation-server] extract mode | blocks=${blocks.length} globalTailItems=${globalTail.length} preambleChars=${preamble.length} gemini=${geminiConfigured ? 'on' : 'off'}`,
          );

          try {
            const out = await runGeminiExtract({ preamble, blocks, globalTail });
            const blockTotal = out.blockCites.reduce((n, row) => n + row.length, 0);
            console.log(
              `[citation-server] extract ok in ${Date.now() - reqStarted}ms | citesPerBlock=[${out.blockCites.map((r) => r.length).join(',')}] global=${out.globalCitations.length}`,
            );
            sendJson(res, 200, out);
          } catch (e) {
            console.warn('[normalize-citations] extract failed:', e?.message || e);
            console.warn(`[citation-server] extract fallback response (${Date.now() - reqStarted}ms)`);
            sendJson(res, 200, {
              blockCites: blocks.map(() => []),
              globalCitations: globalTail,
            });
          }
          return;
        }

        const citations = Array.isArray(parsed.citations)
          ? parsed.citations.map((x) => String(x ?? '').trim())
          : [];
        if (citations.length > 60) {
          console.warn('[citation-server] legacy rejected: too many citations', citations.length);
          sendJson(res, 400, { error: 'Too many citations (max 60)' });
          return;
        }
        console.log(
          `[citation-server] legacy normalize mode | citations=${citations.length} gemini=${process.env.GEMINI_API_KEY ? 'on' : 'off'}`,
        );

        let normalized = citations;
        try {
          normalized = await runGeminiNormalize(citations);
        } catch (geminiErr) {
          console.warn('[normalize-citations] normalize failed, echoing input:', geminiErr?.message || geminiErr);
        }
        console.log(`[citation-server] legacy ok in ${Date.now() - reqStarted}ms`);
        sendJson(res, 200, { normalized });
      } catch (e) {
        console.warn('[citation-server] invalid JSON body', e?.message || e);
        sendJson(res, 400, { error: 'Invalid JSON body' });
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Citation normalize server at http://localhost:${PORT}`);
  console.log(`  POST /normalize-citations`);
  console.log(`    - extract: { preamble, blocks: string[], globalTail: string[] } (Gemini)`);
  console.log(`    - legacy:  { citations: string[] }`);
});
