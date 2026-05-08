import type { ReactNode } from 'react';
import {
  citationsToPanelItems,
  parseAssistantForCitations,
  shortCitationLabel,
  type SourcePanelItem,
} from './citationParse';
import type { CitationPanelState } from './CitationSidePanel';
import { formatMessageBody } from './chatFormatting';
import { CHAT_ACCENT_ON_LIGHT, CHAT_TEXT_SECONDARY } from '../../constants/landRecord';

type Props = {
  content: string;
  messageKey: string;
  isStreaming: boolean;
  onOpenSources: (panel: CitationPanelState) => void;
};

function CitationChip({
  label,
  extraCount,
  onClick,
}: {
  label: string;
  extraCount: number;
  onClick: () => void;
}) {
  const suffix = extraCount > 0 ? ` +${extraCount}` : '';
  return (
    <button
      type="button"
      onClick={onClick}
      className="ml-1 inline-flex max-w-[9rem] cursor-pointer items-center gap-0.5 rounded-full border border-slate-200/90 bg-slate-100/95 px-2 py-0.5 align-baseline text-[11px] font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-200/90"
      style={{ verticalAlign: 'baseline' }}
    >
      <span className="truncate">{label}</span>
      {suffix ? <span className="flex-shrink-0 text-slate-500">{suffix}</span> : null}
    </button>
  );
}

export function AssistantBubbleContent({ content, messageKey, isStreaming, onOpenSources }: Props): ReactNode {
  if (isStreaming || !content.trim()) {
    return formatMessageBody(content, messageKey, 'assistant');
  }

  const parsed = parseAssistantForCitations(content);
  const hasStructure =
    parsed.blocks.some((b) => b.cites.length > 0) || parsed.globalCitations.length > 0;

  if (!hasStructure) {
    return formatMessageBody(content, messageKey, 'assistant');
  }

  const openBlock = (cites: string[], blockPreview: string) => {
    const items = citationsToPanelItems(cites, messageKey, { answerContext: blockPreview });
    const title = cites.length === 1 ? shortCitationLabel(cites[0]) : 'Citations';
    const subtitle = blockPreview.replace(/\s+/g, ' ').trim().slice(0, 120);
    onOpenSources({ title, subtitle: subtitle || undefined, items });
  };

  const openGlobal = () => {
    const items = citationsToPanelItems(parsed.globalCitations, `${messageKey}-g`);
    onOpenSources({
      title: 'All sources',
      subtitle: 'From the Citations line in this answer',
      items,
    });
  };

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
    const preview = block.body.trim() || parsed.preamble.trim() || 'Answer';
    const chip =
      block.cites.length > 0 ? (
        <CitationChip
          label={shortCitationLabel(block.cites[0])}
          extraCount={block.cites.length - 1}
          onClick={() => openBlock(block.cites, preview)}
        />
      ) : null;
    parts.push(
      <div key={`${messageKey}-blk-${bi}`} className="mb-3 last:mb-0">
        {block.body.trim() ? (
          <>
            <div>{formatMessageBody(block.body, `${messageKey}-blk-${bi}`, 'assistant')}</div>
            {chip ? <div className="mt-1.5 flex flex-wrap items-center gap-1">{chip}</div> : null}
          </>
        ) : (
          chip
        )}
      </div>
    );
  });

  if (parsed.globalCitations.length > 0) {
    parts.push(
      <div
        key={`${messageKey}-global`}
        className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-3"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: CHAT_TEXT_SECONDARY }}>
          Sources
        </span>
        <button
          type="button"
          onClick={openGlobal}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <span style={{ color: CHAT_ACCENT_ON_LIGHT }}>{parsed.globalCitations.length}</span>
          <span>citation{parsed.globalCitations.length === 1 ? '' : 's'}</span>
        </button>
      </div>
    );
  }

  return <div className="assistant-cited-content">{parts}</div>;
}

export type { SourcePanelItem };
