import type { ReactNode } from 'react';
import {
  openCitationSourceInNewTab,
  parseAssistantForCitations,
  shortCitationLabel,
  stripAggregatedCitationFooter,
  stripTrailingSourceCountLines,
} from './citationParse';
import { formatMessageBody } from './chatFormatting';
import { CHAT_ACCENT_ON_LIGHT, CHAT_TEXT_SECONDARY } from '../../constants/landRecord';

type Props = {
  content: string;
  messageKey: string;
  isStreaming: boolean;
};

function SourceCitationButtons({ cites }: { cites: string[] }) {
  if (!cites.length) return null;
  return (
    <div className="mt-1.5 flex flex-col gap-1">
      <span className="text-[11px] font-semibold tracking-wide" style={{ color: CHAT_TEXT_SECONDARY }}>
        Sources
      </span>
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Citation sources">
        {cites.map((raw, i) => (
          <button
            key={i}
            type="button"
            onClick={() => openCitationSourceInNewTab(raw)}
            title={shortCitationLabel(raw)}
            className="inline-flex h-7 min-w-[1.75rem] cursor-pointer items-center justify-center rounded-md border border-slate-200/90 bg-white px-2 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
            style={{ color: CHAT_ACCENT_ON_LIGHT }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AssistantBubbleContent({ content, messageKey, isStreaming }: Props): ReactNode {
  if (isStreaming || !content.trim()) {
    return formatMessageBody(content, messageKey, 'assistant');
  }

  const cleaned = stripTrailingSourceCountLines(content.trim());
  const parsed = parseAssistantForCitations(cleaned);
  const hasStructure =
    parsed.blocks.some((b) => b.cites.length > 0) || parsed.globalCitations.length > 0;

  if (!hasStructure) {
    return formatMessageBody(stripAggregatedCitationFooter(cleaned), messageKey, 'assistant');
  }

  const parts: ReactNode[] = [];

  if (parsed.preamble.trim()) {
    parts.push(
      <div key={`${messageKey}-pre`} className="mb-2">
        {formatMessageBody(parsed.preamble, `${messageKey}-pre`, 'assistant')}
      </div>
    );
  }

  parsed.blocks.forEach((block, bi) => {
    if (!block.body.trim() && !block.cites.length) return;
    const chip = block.cites.length > 0 ? <SourceCitationButtons cites={block.cites} /> : null;
    parts.push(
      <div key={`${messageKey}-blk-${bi}`} className="mb-3 last:mb-0">
        {block.body.trim() ? (
          <>
            <div>{formatMessageBody(block.body, `${messageKey}-blk-${bi}`, 'assistant')}</div>
            {chip}
          </>
        ) : (
          chip
        )}
      </div>
    );
  });

  const anyBlockCites = parsed.blocks.some((b) => b.cites.length > 0);
  // Trailing "Citations:" / "Sources:" with no per-block lines: show footer as Sources.
  // When there are numbered blocks (many responsibilities), collapse to one chip for generic cites.
  if (parsed.globalCitations.length > 0 && !anyBlockCites) {
    const citesForFooter =
      parsed.blocks.length > 0
        ? [parsed.globalCitations.map((s) => s.trim()).filter(Boolean).join('; ')].filter(Boolean)
        : parsed.globalCitations;
    parts.push(
      <div key={`${messageKey}-global-cites`} className="mb-2">
        <SourceCitationButtons cites={citesForFooter} />
      </div>
    );
  }

  return <div className="assistant-cited-content">{parts}</div>;
}
