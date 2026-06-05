/**
 * Parse assistant markdown-ish answers into blocks with optional per-block citations,
 * plus a trailing "Citations:" line often produced by the legal RAG system prompt.
 */

export type CitationBlock = {
  body: string;
  /** Raw citation strings (e.g. "Document: x.pdf | Page 2, Section 3") */
  cites: string[];
};

export type ParsedAssistantStructure = {
  preamble: string;
  blocks: CitationBlock[];
  /** Trailing "Citations: ..." split into segments */
  globalCitations: string[];
};

/** Trailing aggregate block often duplicated per-responsibility cites (markdown optional). */
const TRAILING_CITATIONS_RE =
  /\n\*{0,2}(?:Citations|Sources)\*{0,2}:\s*([\s\S]*)$/i;

/**
 * Lines like "Citation: ..." / "- Citation: ..." / "* Citations: ..." (case-insensitive).
 * List markers are common in assistant markdown.
 */
const CITATION_LINE_RE = /^\s*(?:[-*+]\s+)?Citations?:\s*(.+)$/gim;

/**
 * One line may list several locations, e.g.
 * "Page 8, Section 11(a); Page 9, Section 13 (MTNNN.pdf)"
 * Split so each chip opens the PDF to the correct page.
 */
export function splitCompoundCitationLine(line: string): string[] {
  const t = line.trim();
  if (!t) return [];

  const documentPipe = t.match(/^(Document:\s*[^|]+\|\s*)/i);
  let docPrefix = '';
  let rest = t;
  if (documentPipe) {
    docPrefix = documentPipe[1];
    rest = t.slice(documentPipe[0].length).trim();
  }

  const trailingParen = /\(\s*([^)]+\.pdf)\s*\)\s*$/i.exec(rest);
  let sharedPdf = '';
  let core = rest;
  if (trailingParen) {
    sharedPdf = trailingParen[0].trim();
    core = rest.slice(0, trailingParen.index).trim();
  }

  const byPageBreak = core
    .split(/\s*;\s*(?=\bPage\s+\d+)/i)
    .map((s) => s.trim())
    .filter(Boolean);
  const segments =
    byPageBreak.length > 1 ? byPageBreak : core.includes(';') ? core.split(/\s*;\s*/).map((s) => s.trim()).filter(Boolean) : [core];

  if (segments.length <= 1) {
    return [t];
  }

  return segments.map((seg) => {
    let piece = seg;
    if (docPrefix && !/^Document:/i.test(piece)) {
      piece = `${docPrefix.trimEnd()} ${piece}`;
    }
    if (sharedPdf && !/\b[\w.-]+\.pdf\b/i.test(piece) && !/\([^)]+\.pdf\)/i.test(piece)) {
      piece = `${piece} ${sharedPdf}`;
    }
    return piece.replace(/\s+/g, ' ').trim();
  });
}

function stripCitationLines(block: string): { body: string; cites: string[] } {
  const cites: string[] = [];
  const body = block.replace(CITATION_LINE_RE, (_m, g1: string) => {
    const t = (g1 || '').trim();
    if (t) cites.push(...splitCompoundCitationLine(t));
    return '';
  });
  return { body: body.replace(/\n{3,}/g, '\n\n').trim(), cites };
}

function splitGlobalCitationTail(raw: string): { main: string; global: string[] } {
  const m = raw.match(TRAILING_CITATIONS_RE);
  if (!m || m.index === undefined) {
    return { main: raw.trimEnd(), global: [] };
  }
  const tail = m[1].trim();
  const main = raw.slice(0, m.index).trimEnd();
  if (!tail) return { main, global: [] };
  const parts = tail
    .split(/\s*;\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  return { main, global: parts.length ? parts : [tail] };
}

/** Remove trailing aggregate "Citations:" / "Sources:" block (used for raw markdown fallback). */
export function stripAggregatedCitationFooter(text: string): string {
  return splitGlobalCitationTail(text).main;
}

function splitNumberedBlocks(text: string): { preamble: string; blocks: string[] } {
  const t = text.trim();
  if (!t) return { preamble: '', blocks: [] };
  const idx = t.search(/^\s*\d+\.\s/m);
  if (idx === -1) {
    return { preamble: t, blocks: [] };
  }
  const preamble = idx > 0 ? t.slice(0, idx).trim() : '';
  const fromNum = idx >= 0 ? t.slice(idx) : t;
  const blocks = fromNum
    .split(/\n(?=\s*\d+\.\s)/)
    .map((b) => b.trim())
    .filter(Boolean);
  return { preamble, blocks };
}

/** Short label for chip: "Document: foo.pdf | ..." -> "foo" */
export function shortCitationLabel(raw: string): string {
  const doc = raw.match(/Document:\s*([^|]+)/i);
  if (doc) {
    const name = doc[1].trim().replace(/\.pdf$/i, '');
    return name.length > 14 ? `${name.slice(0, 12)}…` : name;
  }
  const page = raw.match(/page\s*\d+/i);
  if (page) return page[0].slice(0, 12);
  const s = raw.replace(/\s+/g, ' ').trim();
  return s.length > 16 ? `${s.slice(0, 14)}…` : s || 'Source';
}

/** Map a citation string to PDF filename + page list for the viewer. */
export function parseCitationForPdf(raw: string): { documentName: string; pageNumbers: number[] } {
  const text = (raw || '').trim();
  let documentName = '';
  const docPipe = text.match(/Document:\s*([^|]+)/i);
  if (docPipe) {
    documentName = docPipe[1].trim();
  }
  if (!documentName) {
    const pdfFile =
      text.match(/\b([\w.-]+\.pdf)\b/i) || text.match(/\(\s*([\w.-]+\.pdf)\s*\)/i);
    if (pdfFile) documentName = pdfFile[1].trim();
  }
  documentName = documentName.replace(/^["']|["']$/g, '').trim();
  documentName = documentName.replace(/^\(+/, '').replace(/\)+$/, '').trim();
  const pages: number[] = [];
  const range = text.match(/pages?\s*(\d+)\s*[-–—]\s*(\d+)/i);
  if (range) {
    const a = parseInt(range[1], 10);
    const b = parseInt(range[2], 10);
    if (!Number.isNaN(a) && !Number.isNaN(b)) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      for (let p = lo; p <= hi; p++) pages.push(p);
    }
  }
  const pageMatches = [...text.matchAll(/\bPage\s+(\d+)\b/gi)];
  for (const m of pageMatches) {
    const n = parseInt(m[1], 10);
    if (!Number.isNaN(n)) pages.push(n);
  }
  if (pages.length === 0) {
    const loose = [...text.matchAll(/(?:^|[\s,;|/])\s*p\.?\s*(\d{1,4})\b/gi)];
    for (const m of loose) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n) && n > 0 && n < 5000) pages.push(n);
    }
  }
  const uniq = [...new Set(pages)].sort((a, b) => a - b);
  return {
    documentName: documentName.replace(/^["']|["']$/g, '').trim() || 'Unknown',
    pageNumbers: uniq.length ? uniq : [1],
  };
}

function normalizeDocName(name: string): string {
  return name.replace(/\.pdf$/i, '').trim().toLowerCase();
}

/**
 * Merge all citation lines for one responsibility into one PDF open:
 * one document (first non-unknown, or first line) and a sorted unique page list.
 * Citations without a document name are treated as the same document as the anchor.
 */
export function aggregateCitationsForPdf(cites: string[]): { documentName: string; pageNumbers: number[] } {
  if (!cites.length) {
    return { documentName: '', pageNumbers: [1] };
  }
  const parsed = cites.map((raw) => parseCitationForPdf(raw.trim()));
  const anchor =
    parsed.find((p) => p.documentName && p.documentName !== 'Unknown') ?? parsed[0];
  const anchorKey = normalizeDocName(anchor.documentName === 'Unknown' ? '' : anchor.documentName);
  const pages: number[] = [];
  for (const p of parsed) {
    const key = normalizeDocName(p.documentName === 'Unknown' ? '' : p.documentName);
    if (p.documentName === 'Unknown' || !key || key === anchorKey) {
      pages.push(...p.pageNumbers);
    }
  }
  const uniq = [...new Set(pages)].sort((a, b) => a - b);
  return {
    documentName: anchor.documentName,
    pageNumbers: uniq.length ? uniq : [1],
  };
}

/** Same path rules as {@link PDFViewer}: `public/docs` → `/docs/{name}.pdf`. */
export function buildPublicDocPdfUrl(documentName: string, firstPage?: number): string {
  if (!documentName || documentName === 'Unknown') {
    return '';
  }
  let cleanName = documentName.trim();
  while (cleanName.toLowerCase().endsWith('.pdf')) {
    cleanName = cleanName.slice(0, -4);
  }
  const fileName = `${cleanName}.pdf`;
  const path = `/docs/${encodeURIComponent(fileName)}`;
  if (firstPage !== undefined && firstPage > 0) {
    return `${path}#page=${firstPage}`;
  }
  return path;
}

/** Opens the PDF for one citation line in a new browser tab (native viewer; `#page=` when supported). */
export function openCitationSourceInNewTab(rawCitation: string): void {
  const { documentName, pageNumbers } = parseCitationForPdf(rawCitation.trim());
  const first = pageNumbers[0] ?? 1;
  const url = buildPublicDocPdfUrl(documentName, first);
  if (!url) {
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

export type SourcePanelItem = {
  id: string;
  /** Short label (e.g. PDF modal title) */
  title: string;
  /** Full raw citation string */
  snippet: string;
  raw: string;
  /** Display name for the document (no path, .pdf optional) */
  documentName: string;
  /** Duty / obligation type or section label parsed from the citation */
  dutyType: string;
  /** Short preview: first words of the answer block or stripped citation text */
  responsibilityPreview: string;
};

/** First ~maxWords words, or first sentence if found in the first 220 chars. */
export function firstSentenceOrWords(s: string, maxWords: number): string {
  const oneLine = s.replace(/\s+/g, ' ').trim();
  if (!oneLine) return '';
  const sentence = oneLine.match(/^(.{15,220}?[.!?])(?:\s|$)/);
  if (sentence) return sentence[1].trim();
  const words = oneLine.split(/\s+/);
  if (words.length <= maxWords) return oneLine;
  return `${words.slice(0, maxWords).join(' ')}…`;
}

function previewFromCitationRaw(text: string): string {
  let t = text
    .replace(/Document:\s*[^|]+/gi, '')
    .replace(/\bPages?\s*[\d\s–—,-]+/gi, '')
    .replace(/\bPage\s+\d+[^|]*/gi, '')
    .replace(/\|\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return firstSentenceOrWords(t || text, 14);
}

const DUTY_PATTERNS: RegExp[] = [
  /Duty\s*(?:type)?\s*:\s*([^|]+)/i,
  /Obligation\s*(?:type)?\s*:\s*([^|]+)/i,
  /Type\s*of\s*(?:obligation|duty)\s*:\s*([^|]+)/i,
  /Type\s*:\s*([^|]+)/i,
  /Category\s*:\s*([^|]+)/i,
  /(?:^|\|\s*)(Section\s+[^|]+)/i,
];

/**
 * Fields for deep-dive cards: document label, duty type from citation metadata, preview text.
 */
export function parseCitationForDeepDive(raw: string, answerContext?: string): {
  documentName: string;
  dutyType: string;
  responsibilityPreview: string;
} {
  const { documentName: pdfName } = parseCitationForPdf(raw);
  let documentName = pdfName === 'Unknown' ? '' : pdfName.replace(/\.pdf$/i, '').trim();
  if (!documentName) documentName = 'Document';

  const text = (raw || '').trim();
  let dutyType = '';
  for (const re of DUTY_PATTERNS) {
    const m = text.match(re);
    if (m) {
      dutyType = m[1].replace(/\s+/g, ' ').trim();
      break;
    }
  }
  if (!dutyType) {
    const sec = text.match(/\bSection\s+[\d.a-z]+(?:\s*\([^)]+\))?/i);
    if (sec) dutyType = sec[0];
  }
  if (!dutyType) {
    const role = text.match(/\b(Landlord|Tenant|Lessee|Lessor)\b[^|]{0,40}/i);
    if (role) dutyType = role[0].replace(/\s+/g, ' ').trim();
  }
  if (!dutyType) dutyType = 'Responsibility';
  if (dutyType.length > 90) dutyType = `${dutyType.slice(0, 88)}…`;

  const responsibilityPreview = answerContext?.trim()
    ? firstSentenceOrWords(answerContext.trim(), 16)
    : previewFromCitationRaw(text);

  return { documentName, dutyType, responsibilityPreview };
}

export function citationsToPanelItems(
  cites: string[],
  prefix: string,
  opts?: { answerContext?: string },
): SourcePanelItem[] {
  const ctx = opts?.answerContext;
  return cites.map((raw, i) => {
    const trimmed = raw.trim();
    const { documentName, dutyType, responsibilityPreview } = parseCitationForDeepDive(trimmed, ctx);
    return {
      id: `${prefix}-${i}`,
      title: shortCitationLabel(trimmed),
      snippet: trimmed,
      raw: trimmed,
      documentName,
      dutyType,
      responsibilityPreview,
    };
  });
}

/**
 * Remove trailing assistant lines that only state how many sources were used (no citation text).
 * Examples: "Total sources: 3", "**Sources (2)**", "3 sources"
 */
export function stripTrailingSourceCountLines(text: string): string {
  const lines = text.split('\n');
  const isCountLine = (line: string) => {
    const t = line.replace(/\*+/g, '').trim();
    if (!t) return false;
    return (
      /^(?:total\s+)?(?:number\s+of\s+)?sources?\s*[:.]?\s*\d+\s*\.?$/i.test(t) ||
      /^sources?\s*\(\s*\d+\s*\)\s*\.?$/i.test(t) ||
      /^\d+\s+sources?\s*\.?$/i.test(t) ||
      /^total\s+sources?\s*:/i.test(t)
    );
  };
  while (lines.length && isCountLine(lines[lines.length - 1]!)) {
    lines.pop();
  }
  while (lines.length && !lines[lines.length - 1]!.trim()) {
    lines.pop();
  }
  return lines.join('\n');
}

/**
 * Parse full assistant message into blocks with optional per-block citations,
 * plus a trailing "Citations:" tail split into `globalCitations` (often duplicates block cites).
 */
export function parseAssistantForCitations(content: string): ParsedAssistantStructure {
  const { main, global } = splitGlobalCitationTail(content);
  const { preamble, blocks: rawBlocks } = splitNumberedBlocks(main);

  const blocks: CitationBlock[] = rawBlocks.map((rb) => {
    const { body, cites } = stripCitationLines(rb);
    return { body, cites };
  });

  if (rawBlocks.length === 0) {
    const { body, cites } = stripCitationLines(preamble);
    if (cites.length) {
      return { preamble: '', blocks: [{ body, cites }], globalCitations: global };
    }
    return { preamble: body, blocks: [], globalCitations: global };
  }

  return { preamble, blocks, globalCitations: global };
}
