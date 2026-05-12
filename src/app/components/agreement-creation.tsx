import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Eye, EyeOff, ChevronDown, Plus, Search, User, ArrowLeft, X, Maximize2, Trash2, Edit3 } from 'lucide-react';

type ResponsibleParty = 'Client' | 'Property Owner';

type ResponsibilityTab = {
  id: string;
  label: string;
  key: string;
};

interface Responsibility {
  id: string;
  title: string;
  type: 'modified' | 'added' | 'removed';
  party: ResponsibleParty;
  summary: string;
  fullDescription: string;
  reasoning: string;
  citation: string;
}

interface PreviewResponsibility {
  id: string;
  label: string;
  responsibility: string;
  reasoning: string;
  isModified?: boolean;
  isAdded?: boolean;
  isRemoved?: boolean;
  tab?: string; // Which tab this responsibility belongs to
}

const PARTY_ORDER: ResponsibleParty[] = ['Client', 'Property Owner'];

function groupChangesByParty(changes: Responsibility[]) {
  return PARTY_ORDER.map((party) => ({
    party,
    items: changes.filter((c) => c.party === party),
  })).filter((g) => g.items.length > 0);
}

const aiChanges: Responsibility[] = [
  {
    id: 'resp-1',
    title: 'Responsibility (i):',
    type: 'modified',
    party: 'Client',
    summary: 'Initially the cost of maintenance, repair and all for facility management was completely taken care by property owner and now its handed over to the client',
    fullDescription: 'Maintain, repair, and replace sprinkler systems, mechanical, HVAC, electrical, and plumbing systems at own cost and expense',
    reasoning: 'Explicitly assigned to Tenant at its own cost and expense without reimbursement',
    citation: 'Page 9, Section 18.4'
  },
  {
    id: 'resp-2',
    title: 'Responsibility (ii):',
    type: 'added',
    party: 'Client',
    summary: 'New obligation requiring Client to provide timely premises access during business hours for Provider personnel',
    fullDescription: 'Perform alterations, additions, or improvements at its own cost and expense',
    reasoning: 'The lease explicitly assigns the financial burden of alterations and improvements to the Tenant',
    citation: 'Page 5, Section 18.4'
  },
  {
    id: 'resp-3',
    title: 'Responsibility (iii):',
    type: 'removed',
    party: 'Client',
    summary: 'Obligation to provide quarterly financial reports to Provider has been removed from Client responsibilities',
    fullDescription: 'Erect and maintain all signs (electrical or otherwise) at its own expense',
    reasoning: 'The lease explicitly assigns the financial burden of signage to the Tenant',
    citation: 'Page 9, Section 16.4'
  },
  {
    id: 'resp-4',
    title: 'Responsibility (iv):',
    type: 'modified',
    party: 'Client',
    summary: 'Insurance coverage requirement for the premises has been updated from $1M to $2M per occurrence, increasing Tenant financial exposure',
    fullDescription: 'Maintain commercial general liability insurance with coverage of not less than $2,000,000 per occurrence and $4,000,000 in the aggregate',
    reasoning: 'The increased coverage amount reflects current market standards and better protects both parties in case of liability claims',
    citation: 'Page 6, Section 20.1'
  },
  {
    id: 'resp-5',
    title: 'Responsibility (v):',
    type: 'added',
    party: 'Client',
    summary: 'New obligation requiring Tenant to provide 90 days written notice prior to vacating the premises instead of previous 30-day requirement',
    fullDescription: 'Provide written notice of at least ninety (90) days prior to vacating or terminating occupancy of the Premises',
    reasoning: 'Ensures adequate time for the Landlord to find a replacement tenant and avoid extended vacancies in the property',
    citation: 'Page 7, Section 22.3'
  },
  {
    id: 'resp-6',
    title: 'Responsibility (vi):',
    type: 'removed',
    party: 'Property Owner',
    summary: "Landlord's obligation to provide 10 free parking spaces for Tenant employees has been removed from the agreement",
    fullDescription: 'Landlord shall provide ten (10) designated parking spaces at no additional cost to the Tenant during the lease term',
    reasoning: 'The parking provision was removed due to increased demand for parking in the facility complex and third-party management',
    citation: 'Page 8, Section 24.5'
  },
  {
    id: 'resp-7',
    title: 'Responsibility (vii):',
    type: 'modified',
    party: 'Client',
    summary: 'Maintenance response time for critical system failures has changed from 48 hours to 24 hours placing more operational burden on Tenant',
    fullDescription: 'Respond to and begin repair of critical system failures within twenty-four (24) hours of notification from Landlord',
    reasoning: 'Stricter timeline ensures business continuity and reduces operational disruption for both parties in the facility',
    citation: 'Page 10, Section 26.2'
  },
  {
    id: 'resp-8',
    title: 'Responsibility (viii):',
    type: 'added',
    party: 'Client',
    summary: 'New green energy compliance requirement mandating Tenant to reduce energy consumption by 15% annually from the established baseline',
    fullDescription: 'Implement energy efficiency measures and reduce overall energy consumption by not less than 15% per annum from the established baseline measurement',
    reasoning: 'New environmental regulation compliance requirement applicable to all commercial tenants effective from the current lease period',
    citation: 'Page 11, Section 28.1'
  },
  {
    id: 'resp-9',
    title: 'Responsibility (ix):',
    type: 'removed',
    party: 'Client',
    summary: "Tenant's right to sublet up to 30% of premises without prior written consent has been removed, now requiring full approval",
    fullDescription: "Tenant may sublet any portion of the Premises not exceeding 30% of total floor area without Landlord's prior written consent",
    reasoning: 'Removal ensures Landlord maintains full control over all occupancy and sub-tenancy within the managed premises',
    citation: 'Page 12, Section 30.4'
  },
];

const AI_CHANGE_IDS = new Set(aiChanges.map((c) => c.id));

function isAiLinkedPreviewId(id: string) {
  return AI_CHANGE_IDS.has(id);
}

// Before/Original versions of modified responsibilities for comparison
const originalResponsibilities: Record<string, { responsibility: string; reasoning: string; citation: string }> = {
  'resp-1': {
    responsibility: 'Property Owner shall maintain, repair, and replace sprinkler systems, mechanical, HVAC, electrical, and plumbing systems at their own cost and expense',
    reasoning: 'Standard landlord obligation to maintain building systems and infrastructure',
    citation: 'Page 9, Section 18.4 (Previous Version)'
  },
  'resp-3': {
    responsibility: 'Maintain commercial general liability insurance with coverage of not less than $1,000,000 per occurrence and $2,000,000 in the aggregate',
    reasoning: 'Previous insurance requirement with lower coverage amounts',
    citation: 'Page 6, Section 20.1 (Previous Version)'
  },
  'resp-4': {
    responsibility: 'Provide written notice of at least thirty (30) days prior to vacating or terminating occupancy of the Premises',
    reasoning: 'Previous notice requirement allowed for shorter notification period',
    citation: 'Page 7, Section 22.3 (Previous Version)'
  }
};

/** Intersection ratios → id with max visibility (smooth “what you’re reading”) */
function pickMostVisibleId(ratios: Map<string, number>, minRatio = 0.06) {
  let best: string | null = null;
  let max = 0;
  for (const [id, r] of ratios) {
    if (r > max) {
      max = r;
      best = id;
    }
  }
  return max >= minRatio ? best : null;
}

const IO_THRESHOLDS = [0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix'] as const;

/** Scroll so element sits below sticky header (scrollIntoView is often clipped). */
function scrollPageToElement(el: HTMLElement, stickyTopPx = 80) {
  const rect = el.getBoundingClientRect();
  const y = window.scrollY + rect.top - stickyTopPx;
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
}

const oldResponsibilities: PreviewResponsibility[] = [
  // Tenant responsibilities (unchanged)
  {
    id: 'old-1',
    label: 'Responsibility (i):',
    responsibility: 'Pay Base Rent in the amount of $____ per month;',
    reasoning: 'Contractual obligation for the use of the Premises;',
    tab: 'tenant'
  },
  {
    id: 'old-2',
    label: 'Responsibility (ii):',
    responsibility: 'Pay Base Rent to Landlord in equal monthly installments during the initial five years of the Term;',
    reasoning: 'Structured payment obligation to ensure consistent cash flow for both parties',
    tab: 'tenant'
  },
  {
    id: 'old-3',
    label: 'Responsibility (iii):',
    responsibility: "Pay the first month's Base Rent upon execution of this Lease; Make rental payments without demand, counterclaim or setoff",
    reasoning: 'Initial payment requirement and terms for ongoing payment compliance',
    tab: 'tenant'
  },
  {
    id: 'old-4',
    label: 'Responsibility (iv):',
    responsibility: 'Maintain the Premises in good condition and repair, ordinary wear and tear excepted',
    reasoning: 'Standard tenant obligation to preserve property condition during tenancy',
    tab: 'tenant'
  },
  // Landlord responsibilities (unchanged)
  {
    id: 'old-5',
    label: 'Responsibility (i):',
    responsibility: 'Provide quiet enjoyment of the Premises to Tenant',
    reasoning: 'Fundamental landlord obligation to ensure tenant can use premises without interference',
    tab: 'landlord'
  },
  {
    id: 'old-6',
    label: 'Responsibility (ii):',
    responsibility: 'Maintain structural integrity of the building and common areas',
    reasoning: 'Landlord responsibility for major building systems and shared spaces',
    tab: 'landlord'
  },
  {
    id: 'old-7',
    label: 'Responsibility (iii):',
    responsibility: 'Provide adequate heating, ventilation, and air conditioning to the Premises',
    reasoning: 'Essential building services that landlord must maintain for tenant comfort and business operations',
    tab: 'landlord'
  },
  // Insurance responsibilities (unchanged)
  {
    id: 'old-8',
    label: 'Responsibility (i):',
    responsibility: 'Maintain property insurance covering the building structure',
    reasoning: 'Landlord obligation to protect the physical building asset',
    tab: 'insurance'
  },
  {
    id: 'old-9',
    label: 'Responsibility (ii):',
    responsibility: 'Tenant shall maintain general liability insurance with minimum coverage as specified',
    reasoning: 'Standard requirement to protect against third-party claims arising from tenant operations',
    tab: 'insurance'
  }
];

const documents = [
  { name: 'Example_Document.pdf', uploader: 'svc_team_24247137', date: '1/7/2026 2:08PM', status: 'New', checked: false },
  { name: 'Example_Document_V2.pdf', uploader: 'svc_team_24247137', date: '1/7/2026 2:08PM', status: 'New', checked: false },
  { name: 'MTNN.pdf', uploader: 'svc_team_24247137', date: '1/7/2026 2:08PM', status: 'New', checked: false },
  { name: 'MTNNN.pdf', uploader: 'svc_team_24247137', date: '1/7/2026 2:08PM', status: 'New', checked: false },
  { name: 'Perfect_Update_Obligations_Schedule.pdf', uploader: 'svc_team_24247137', date: '1/7/2026 2:08PM', status: 'New', checked: false },
  { name: 'commercial_lease_agreement.pdf', uploader: 'svc_team_24247137', date: '1/7/2026 2:08PM', status: 'New', checked: true },
  { name: 'commercial_lease_agreement_V2.pdf', uploader: 'svc_team_24247137', date: '1/7/2026 2:08PM', status: 'New', checked: false },
  { name: 'fictional_facility_management.pdf', uploader: 'svc_team_24247137', date: '1/7/2026 2:08PM', status: 'New', checked: false },
  { name: 'fictional_facility_management_v2.pdf', uploader: 'svc_team_24247137', date: '1/7/2026 2:08PM', status: 'New', checked: false },
];

function getTypeStyles(type: 'modified' | 'added' | 'removed') {
  switch (type) {
    case 'modified':
      return { bg: 'bg-white', border: 'border-[#e5e7eb]', badge: 'bg-[#2563eb]', label: 'MODIFIED' };
    case 'added':
      return { bg: 'bg-[#f0fdf4]', border: 'border-[#bbf7d0]', badge: 'bg-[#16a34a]', label: 'ADDED' };
    case 'removed':
      return { bg: 'bg-[#fef2f2]', border: 'border-[#fecaca]', badge: 'bg-[#dc2626]', label: 'REMOVED' };
  }
}

/* ─── Detail Popup ─── */
function DetailPopup({
  resp, onClose, onAccept, isSelected, expandedComparisons, onToggleComparison,
}: {
  resp: Responsibility; 
  onClose: () => void; 
  onAccept: () => void; 
  isSelected: boolean;
  expandedComparisons: Set<string>;
  onToggleComparison: (id: string) => void;
}) {
  // Color palette per type
  const palette = {
    modified: {
      headerBg: 'bg-gray-100',
      headerText: 'text-gray-600',
      bodyBg: 'bg-white',
      responsibilityBg: 'bg-white border border-gray-200',
      responsibilityText: 'text-gray-700',
      reasoningBg: 'bg-white border border-gray-200',
      reasoningText: 'text-gray-600',
      citationBg: 'bg-[#f5f5f5]',
      showAiSummary: true,
    },
    added: {
      headerBg: 'bg-[#f0fdf4]',
      headerText: 'text-[#16a34a]',
      bodyBg: 'bg-white',
      responsibilityBg: 'bg-[#f0fdf4] border border-[#bbf7d0]',
      responsibilityText: 'text-[#166534]',
      reasoningBg: 'bg-[#f0fdf4] border border-[#bbf7d0]',
      reasoningText: 'text-[#166534]',
      citationBg: 'bg-[#f5f5f5]',
      showAiSummary: false,
    },
    removed: {
      headerBg: 'bg-[#fef2f2]',
      headerText: 'text-[#dc2626]',
      bodyBg: 'bg-white',
      responsibilityBg: 'bg-[#fef2f2] border border-[#fecaca]',
      responsibilityText: 'text-[#991b1b]',
      reasoningBg: 'bg-[#fef2f2] border border-[#fecaca]',
      reasoningText: 'text-[#991b1b]',
      citationBg: 'bg-[#f5f5f5]',
      showAiSummary: false,
    },
  };

  const p = palette[resp.type];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-black overflow-hidden"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Tree header */}
        <div className={`flex items-center gap-3 px-5 pt-5 pb-3 ${p.headerBg}`}>
          <button className="w-5 h-5 border border-gray-300 bg-white rounded flex items-center justify-center text-gray-500 text-xs flex-shrink-0 hover:bg-gray-50">-</button>
          <span className={`text-[11px] font-bold uppercase tracking-[0.12em] ${p.headerText} bg-white/60 px-3 py-1 rounded`}>
            {resp.title.replace(':', '').toUpperCase()}
          </span>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tree body with left line */}
        <div className="flex px-5 pt-4 pb-2">
          <div className="flex flex-col items-center mr-4 ml-1.5">
            <div className="w-px flex-1 bg-gray-200" />
          </div>
          <div className="flex-1 space-y-4 pt-1 pb-2">
            {/* Responsibility */}
            <div className={`rounded-lg px-4 py-3 ${p.responsibilityBg}`}>
              <p className={`text-sm leading-relaxed ${p.responsibilityText}`}>
                <span className="mr-2">•</span>{resp.fullDescription}
              </p>
            </div>

            {/* REASONING */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-1.5">REASONING</p>
              <div className={`rounded-lg px-4 py-3 ${p.reasoningBg}`}>
                <p className={`text-sm leading-relaxed ${p.reasoningText}`}>
                  <span className="mr-2">•</span>{resp.reasoning}
                </p>
              </div>
            </div>

            {/* CITATION */}
            <div className={`rounded px-3 py-2.5 ${p.citationBg}`}>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-1">CITATION</p>
              <p className="text-sm text-gray-600">{resp.citation}</p>
            </div>

            {/* BEFORE/AFTER COMPARISON — only for MODIFIED with original data */}
            {resp.type === 'modified' && originalResponsibilities[resp.id] && expandedComparisons.has(resp.id) && (
              <div className="space-y-3">
                {/* Before (Original) */}
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">BEFORE</span>
                    <span className="text-[11px] text-red-700 font-medium">Original Responsibility</span>
                  </div>
                  <p className="text-sm text-red-800 leading-relaxed mb-3">
                    <span className="mr-2">•</span>{originalResponsibilities[resp.id].responsibility}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-red-400 mb-1">REASONING</p>
                      <p className="text-sm text-red-700 leading-relaxed">
                        <span className="mr-2">•</span>{originalResponsibilities[resp.id].reasoning}
                      </p>
                    </div>
                    <div className="bg-red-100 rounded px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-red-400 mb-1">CITATION</p>
                      <p className="text-sm text-red-600">{originalResponsibilities[resp.id].citation}</p>
                    </div>
                  </div>
                </div>
                
                {/* After (New) */}
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">AFTER</span>
                    <span className="text-[11px] text-green-700 font-medium">Modified Responsibility</span>
                  </div>
                  <p className="text-sm text-green-800 leading-relaxed mb-3">
                    <span className="mr-2">•</span>{resp.fullDescription}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-green-400 mb-1">REASONING</p>
                      <p className="text-sm text-green-700 leading-relaxed">
                        <span className="mr-2">•</span>{resp.reasoning}
                      </p>
                    </div>
                    <div className="bg-green-100 rounded px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-green-400 mb-1">CITATION</p>
                      <p className="text-sm text-green-600">{resp.citation}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI SUMMARY — only for MODIFIED */}
            {p.showAiSummary && (
              <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-[#6366f1] uppercase tracking-wider bg-[#dbeafe] px-2 py-0.5 rounded">AI SUMMARY</span>
                    <span className="text-[10px] text-[#6366f1]">{resp.title} changes</span>
                  </div>
                  
                  {/* Eye button for comparison (only for modified items with original data) */}
                  {resp.type === 'modified' && originalResponsibilities[resp.id] && (
                    <button
                      type="button"
                      onClick={() => onToggleComparison(resp.id)}
                      className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition ${
                        expandedComparisons.has(resp.id)
                          ? 'bg-blue-200 text-blue-700 hover:bg-blue-300'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                      title={expandedComparisons.has(resp.id) ? "Hide before/after comparison" : "Show before/after comparison"}
                    >
                      {expandedComparisons.has(resp.id) ? (
                        <EyeOff className="w-4 h-4 stroke-2" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-2" />
                      )}
                    </button>
                  )}
                </div>
                <p className="text-sm text-[#1e40af] leading-relaxed">{resp.summary}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4">
          <button type="button" onClick={onClose}
            className="px-5 py-2 rounded text-sm font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition">
            Close
          </button>
          <button type="button" onClick={onAccept}
            className="bg-[#2563eb] text-white rounded-full px-7 py-2.5 font-medium text-sm hover:bg-[#1d4ed8] transition">
            {isSelected ? 'Unselect' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TreeLegend({ className }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-gray-600 ${className ?? ''}`}>
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#dc2626]" aria-hidden /> Removed
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#16a34a]" aria-hidden /> Added
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#2563eb]" aria-hidden /> Modified
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#7dd3fc]" aria-hidden /> AI Summary
      </span>
    </div>
  );
}

function treeBlockShell(type: Responsibility['type']) {
  switch (type) {
    case 'modified':
      return 'bg-white border-2 border-[#93c5fd] rounded-lg overflow-hidden';
    case 'added':
      return 'bg-[#f0fdf4] border-2 border-[#86efac] rounded-lg overflow-hidden';
    case 'removed':
      return 'bg-[#fef2f2] border-2 border-[#fca5a5] rounded-lg overflow-hidden';
  }
}

/* ─── Show changes: full tree modal (all parties + all responsibilities) ─── */
function ChangesTreeModal({
  onClose,
  grouped,
  selectedChanges,
  onToggleChange,
}: {
  onClose: () => void;
  grouped: { party: ResponsibleParty; items: Responsibility[] }[];
  selectedChanges: Set<string>;
  onToggleChange: (id: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 sm:p-6">
      <div
        className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
        style={{ maxHeight: 'min(92vh, 900px)' }}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">All proposed changes</h2>
            <p className="mt-1 text-xs text-gray-500">Tree view by responsible party. Use Accept changes on each item to include it in the agreement preview.</p>
            <TreeLegend className="mt-3" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-8">
            {grouped.map(({ party, items }) => (
              <section key={party}>
                <div
                  className={`mb-3 rounded-lg border px-4 py-2.5 text-sm font-semibold ${
                    party === 'Client'
                      ? 'border-gray-200 bg-white text-gray-900'
                      : 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]'
                  }`}
                >
                  Responsible party — {party}
                </div>

                <div className="relative ml-2 border-l-2 border-gray-200 pl-5">
                  <div className="space-y-5">
                    {items.map((resp) => {
                      const p = paletteForTree(resp.type);
                      return (
                        <article key={resp.id} className={treeBlockShell(resp.type)}>
                          <div className={`flex items-center gap-2 border-b px-3 py-2 ${p.headerBar}`}>
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-[10px] text-gray-500">
                              −
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-[0.1em] ${p.headerBadge}`}>
                              {resp.title.replace(':', '').toUpperCase()}
                            </span>
                          </div>
                          <div className="space-y-3 p-4">
                            <div className={`rounded-lg px-3 py-2.5 ${p.respBox}`}>
                              <p className={`text-sm leading-relaxed ${p.respText}`}>
                                <span className="mr-2">•</span>
                                {resp.fullDescription}
                              </p>
                            </div>
                            <div>
                              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Reasoning</p>
                              <div className={`rounded-lg px-3 py-2.5 ${p.reasonBox}`}>
                                <p className={`text-sm leading-relaxed ${p.reasonText}`}>
                                  <span className="mr-2">•</span>
                                  {resp.reasoning}
                                </p>
                              </div>
                            </div>
                            <div className={`rounded-md px-3 py-2 ${p.citeBox}`}>
                              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Citation</p>
                              <p className="text-sm text-gray-600">{resp.citation}</p>
                            </div>
                            {resp.type === 'modified' && (
                              <div className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-3 py-2.5">
                                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                  <span className="rounded bg-[#dbeafe] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6366f1]">
                                    AI Summary
                                  </span>
                                  <span className="text-[10px] text-[#6366f1]">{resp.title} changes</span>
                                </div>
                                <p className="text-sm leading-relaxed text-[#1e40af]">{resp.summary}</p>
                              </div>
                            )}
                            <div className="flex justify-end border-t border-black/5 pt-3">
                              <button
                                type="button"
                                onClick={() => onToggleChange(resp.id)}
                                className="flex items-center gap-1.5 rounded border border-[#16a34a] bg-white px-4 py-2 text-sm font-semibold text-[#16a34a] hover:bg-green-50"
                              >
                                {selectedChanges.has(resp.id) ? 'Unselect' : 'Select'}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </section>
            ))}
          </div>
          <TreeLegend className="mt-8 border-t border-gray-100 pt-4" />
        </div>

      </div>
    </div>
  );
}

function paletteForTree(type: Responsibility['type']) {
  switch (type) {
    case 'modified':
      return {
        headerBar: 'bg-slate-50 border-slate-100',
        headerBadge: 'text-[#1d4ed8]',
        respBox: 'bg-white border border-gray-200',
        respText: 'text-gray-800',
        reasonBox: 'bg-white border border-gray-200',
        reasonText: 'text-gray-700',
        citeBox: 'bg-[#f5f5f5]',
      };
    case 'added':
      return {
        headerBar: 'bg-[#ecfdf5] border-[#bbf7d0]',
        headerBadge: 'text-[#15803d]',
        respBox: 'bg-white/80 border border-[#bbf7d0]',
        respText: 'text-[#166534]',
        reasonBox: 'bg-white/80 border border-[#bbf7d0]',
        reasonText: 'text-[#166534]',
        citeBox: 'bg-white/60',
      };
    case 'removed':
      return {
        headerBar: 'bg-[#fef2f2] border-[#fecaca]',
        headerBadge: 'text-[#b91c1c]',
        respBox: 'bg-white/70 border border-[#fecaca]',
        respText: 'text-[#7f1d1d]',
        reasonBox: 'bg-white/70 border border-[#fecaca]',
        reasonText: 'text-[#991b1b]',
        citeBox: 'bg-[#fff1f2]',
      };
  }
}

/* ─── Main Component ─── */
export default function AgreementCreation() {
  const [selectedChanges, setSelectedChanges] = useState<Set<string>>(new Set());
  const [showPreviewMode, setShowPreviewMode] = useState(false);
  const [showChangesTreeModal, setShowChangesTreeModal] = useState(false);
  const [aiSummaryVisible, setAiSummaryVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('tenant');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  // Tab management states
  const [responsibilityTabs, setResponsibilityTabs] = useState<ResponsibilityTab[]>([
    { id: 'tenant', label: 'Tenant', key: 'tenant' },
    { id: 'landlord', label: 'Landlord', key: 'landlord' },
    { id: 'insurance', label: 'Insurance Company', key: 'insurance' }
  ]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabLabel, setEditingTabLabel] = useState('');
  const [expandedComparisons, setExpandedComparisons] = useState<Set<string>>(new Set());
  const [detailModal, setDetailModal] = useState<Responsibility | null>(null);
  const [hasProcessedAiSummary, setHasProcessedAiSummary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentResponsibilities, setCurrentResponsibilities] = useState<PreviewResponsibility[]>(oldResponsibilities);
  const [docChecks, setDocChecks] = useState<boolean[]>(documents.map(d => d.checked));
  const [allDocsChecked, setAllDocsChecked] = useState(false);
  const [respEdits, setRespEdits] = useState<Record<string, { responsibility: string; reasoning: string }>>({});
  const [editDraft, setEditDraft] = useState<Record<string, { responsibility: string; reasoning: string }>>({});
  const [lastClickedPreviewId, setLastClickedPreviewId] = useState<string | null>(null);

  // Ref for scrolling back to AI summary
  const aiSummaryRef = useRef<HTMLDivElement>(null);
  const previewSectionRef = useRef<HTMLDivElement>(null);
  const snippetRowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const previewCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [snippetContextId, setSnippetContextId] = useState<string | null>(null);
  const [previewContextId, setPreviewContextId] = useState<string | null>(null);
  const [pulseSnippetId, setPulseSnippetId] = useState<string | null>(null);
  const [pulsePreviewId, setPulsePreviewId] = useState<string | null>(null);

  const snippetRatiosRef = useRef<Map<string, number>>(new Map());
  const previewRatiosRef = useRef<Map<string, number>>(new Map());
  const snippetContextIdRef = useRef<string | null>(null);
  const previewContextIdRef = useRef<string | null>(null);
  const selectedChangesRef = useRef(selectedChanges);

  useEffect(() => {
    snippetContextIdRef.current = snippetContextId;
  }, [snippetContextId]);
  useEffect(() => {
    previewContextIdRef.current = previewContextId;
  }, [previewContextId]);
  useEffect(() => {
    selectedChangesRef.current = selectedChanges;
  }, [selectedChanges]);

  const snippetSelectAllRef = useRef<HTMLInputElement>(null);

  const toggleChange = (id: string) => {
    const newSelected = new Set(selectedChanges);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedChanges(newSelected);
    setSnippetContextId((prev) => {
      if (newSelected.has(id)) return id;
      if (prev === id) {
        return aiChanges.find((c) => newSelected.has(c.id))?.id ?? null;
      }
      return prev;
    });
  };

  const allSnippetSelected =
    aiChanges.length > 0 && selectedChanges.size === aiChanges.length;
  const someSnippetSelected =
    selectedChanges.size > 0 && selectedChanges.size < aiChanges.length;

  useEffect(() => {
    const el = snippetSelectAllRef.current;
    if (el) el.indeterminate = someSnippetSelected;
  }, [someSnippetSelected]);

  const toggleSelectAllSnippet = () => {
    if (allSnippetSelected) {
      setSelectedChanges(new Set());
      setSnippetContextId(null);
    } else {
      const next = new Set(aiChanges.map((c) => c.id));
      setSelectedChanges(next);
      setSnippetContextId(aiChanges[0]?.id ?? null);
    }
  };

  // Tab management functions
  const handleAddTab = useCallback(() => {
    const newId = `tab-${Date.now()}`;
    const newTab: ResponsibilityTab = {
      id: newId,
      label: 'New Tab',
      key: newId
    };
    setResponsibilityTabs(prev => [...prev, newTab]);
    setActiveTab(newId);
    setEditingTabId(newId);
    setEditingTabLabel('New Tab');
  }, []);

  const handleDeleteTab = useCallback((tabId: string) => {
    if (responsibilityTabs.length <= 1) return; // Don't delete the last tab
    
    setResponsibilityTabs(prev => prev.filter(tab => tab.id !== tabId));
    
    // If we're deleting the active tab, switch to the first remaining tab
    if (activeTab === tabId) {
      const remainingTabs = responsibilityTabs.filter(tab => tab.id !== tabId);
      if (remainingTabs.length > 0) {
        setActiveTab(remainingTabs[0].id);
      }
    }
  }, [responsibilityTabs, activeTab]);

  const handleStartEditingTab = useCallback((tabId: string, currentLabel: string) => {
    setEditingTabId(tabId);
    setEditingTabLabel(currentLabel);
  }, []);

  const handleSaveTabEdit = useCallback(() => {
    if (editingTabId && editingTabLabel.trim()) {
      setResponsibilityTabs(prev => 
        prev.map(tab => 
          tab.id === editingTabId 
            ? { ...tab, label: editingTabLabel.trim() }
            : tab
        )
      );
    }
    setEditingTabId(null);
    setEditingTabLabel('');
  }, [editingTabId, editingTabLabel]);

  const handleCancelTabEdit = useCallback(() => {
    setEditingTabId(null);
    setEditingTabLabel('');
  }, []);

  const toggleDeleteMode = useCallback(() => {
    setIsDeleteMode(prev => !prev);
    if (editingTabId) {
      handleCancelTabEdit();
    }
  }, [editingTabId, handleCancelTabEdit]);

  const toggleComparisonView = useCallback((changeId: string) => {
    setExpandedComparisons(prev => {
      const next = new Set(prev);
      if (next.has(changeId)) {
        next.delete(changeId);
      } else {
        next.add(changeId);
      }
      return next;
    });
  }, []);

  // Function to add new responsibility at specific position
  const handleAddResponsibilityAt = useCallback((insertAfterIndex: number) => {
    const newId = `resp-new-${Date.now()}`;
    const newResponsibility: PreviewResponsibility = {
      id: newId,
      label: `Responsibility (${ROMAN[currentResponsibilities.length] || currentResponsibilities.length + 1}):`,
      responsibility: 'New responsibility description...',
      reasoning: 'Reasoning for this responsibility...',
      isAdded: true,
      tab: activeTab // Assign to current active tab
    };
    
    setCurrentResponsibilities(prev => {
      const newArray = [...prev];
      newArray.splice(insertAfterIndex + 1, 0, newResponsibility);
      return newArray;
    });
    
    // Auto-expand the new card for editing
    setExpandedCards(prev => new Set([...prev, newId]));
    
    // Set up the edit draft for the new responsibility
    setEditDraft(prev => ({
      ...prev,
      [newId]: {
        responsibility: newResponsibility.responsibility,
        reasoning: newResponsibility.reasoning
      }
    }));
  }, [currentResponsibilities, activeTab]);

  // Function to delete a responsibility
  const handleDeleteResponsibility = useCallback((responsibilityId: string) => {
    // Remove from current responsibilities
    setCurrentResponsibilities(prev => prev.filter(resp => resp.id !== responsibilityId));
    
    // Clean up related state
    setExpandedCards(prev => {
      const next = new Set(prev);
      next.delete(responsibilityId);
      return next;
    });
    
    setEditDraft(prev => {
      const next = { ...prev };
      delete next[responsibilityId];
      return next;
    });
    
    setRespEdits(prev => {
      const next = { ...prev };
      delete next[responsibilityId];
      return next;
    });
    
    // Clear context if this was the last clicked item
    if (lastClickedPreviewId === responsibilityId) {
      setLastClickedPreviewId(null);
    }
    if (previewContextId === responsibilityId) {
      setPreviewContextId(null);
    }
  }, [lastClickedPreviewId, previewContextId]);

  // Disabled if no responsibilities are checked
  const handlePreviewToggle = () => {
    if (selectedChanges.size === 0) return;
    setShowPreviewMode(p => !p);
  };

  const handleAccept = () => {
    const accepted: PreviewResponsibility[] = aiChanges
      .filter(c => selectedChanges.has(c.id))
      .map((c, i) => ({
        id: c.id,
        label: `Responsibility (${ROMAN[i]}):`,
        responsibility: respEdits[c.id]?.responsibility ?? c.fullDescription,
        reasoning: respEdits[c.id]?.reasoning ?? c.reasoning,
        isModified: c.type === 'modified',
        isAdded: c.type === 'added',
        isRemoved: c.type === 'removed',
      }));
    if (accepted.length > 0) setCurrentResponsibilities(accepted);
    setAiSummaryVisible(false);
    setSelectedChanges(new Set());
    setShowPreviewMode(false);
    setExpandedCards(new Set());
    setRespEdits({});
    setEditDraft({});
    setLastClickedPreviewId(null);
    setExpandedComparisons(new Set());
    setHasProcessedAiSummary(true);
  };

  const handleReject = () => {
    setSelectedChanges(new Set());
    setShowPreviewMode(false);
    setRespEdits({});
    setEditDraft({});
    setExpandedCards(new Set());
    setLastClickedPreviewId(null);
    setExpandedComparisons(new Set());
    setAiSummaryVisible(false);
    setHasProcessedAiSummary(true);
  };

  const handleTreeModalReject = () => {
    setShowChangesTreeModal(false);
    handleReject();
  };

  const handleTreeModalAccept = () => {
    if (selectedChanges.size === 0) return;
    handleAccept();
    setShowChangesTreeModal(false);
  };

  const changesGroupedByParty = groupChangesByParty(aiChanges);

  const toggleAllDocs = (checked: boolean) => {
    setAllDocsChecked(checked);
    setDocChecks(documents.map(() => checked));
  };

  const addedCount    = aiChanges.filter(c => c.type === 'added').length;
  const modifiedCount = aiChanges.filter(c => c.type === 'modified').length;
  const removedCount  = aiChanges.filter(c => c.type === 'removed').length;
  const noneChecked   = selectedChanges.size === 0;

  const selectedIdsKey = [...selectedChanges].sort().join(',');

  const rawDisplayedResponsibilities = useMemo((): PreviewResponsibility[] => {
    if (showPreviewMode && selectedChanges.size > 0) {
      return aiChanges
        .filter((c) => selectedChanges.has(c.id))
        .map((c, i) => ({
          id: c.id,
          label: `Responsibility (${ROMAN[i]}):`,
          responsibility: c.fullDescription,
          reasoning: c.reasoning,
          isModified: c.type === 'modified',
          isAdded: c.type === 'added',
          isRemoved: c.type === 'removed',
        }));
    }
    return currentResponsibilities;
  }, [showPreviewMode, selectedIdsKey, currentResponsibilities]);

  const displayedResponsibilities = useMemo(
    () =>
      rawDisplayedResponsibilities
        .filter((r) => {
          // If tab is specified, filter by it; otherwise show in default tabs
          if (r.tab) {
            return r.tab === activeTab;
          }
          // For items without tab specified, show in tenant tab by default
          return activeTab === 'tenant';
        })
        .map((r) => ({
          ...r,
          responsibility: respEdits[r.id]?.responsibility ?? r.responsibility,
          reasoning: respEdits[r.id]?.reasoning ?? r.reasoning,
        })),
    [rawDisplayedResponsibilities, respEdits, activeTab]
  );

  // Calculate tab indicators - which tabs have changes
  const tabIndicators = useMemo(() => {
    const indicators: Record<string, { hasModified: boolean; hasAdded: boolean; hasRemoved: boolean }> = {};
    
    // Initialize all tabs
    responsibilityTabs.forEach(tab => {
      indicators[tab.id] = { hasModified: false, hasAdded: false, hasRemoved: false };
    });
    
    // Check selected AI changes for each tab
    if (showPreviewMode && selectedChanges.size > 0) {
      aiChanges
        .filter((c) => selectedChanges.has(c.id))
        .forEach((change) => {
          // Map AI changes to tabs based on content/type
          // For now, distribute them across tabs (this could be made more sophisticated)
          let targetTab = 'tenant'; // default
          
          // Simple heuristic based on content
          if (change.fullDescription.toLowerCase().includes('insurance') || 
              change.fullDescription.toLowerCase().includes('liability') ||
              change.fullDescription.toLowerCase().includes('coverage')) {
            targetTab = 'insurance';
          } else if (change.fullDescription.toLowerCase().includes('landlord') ||
                     change.fullDescription.toLowerCase().includes('property owner') ||
                     change.fullDescription.toLowerCase().includes('maintain') && 
                     change.fullDescription.toLowerCase().includes('building')) {
            targetTab = 'landlord';
          }
          
          if (indicators[targetTab]) {
            if (change.type === 'modified') indicators[targetTab].hasModified = true;
            if (change.type === 'added') indicators[targetTab].hasAdded = true;
            if (change.type === 'removed') indicators[targetTab].hasRemoved = true;
          }
        });
    }
    
    return indicators;
  }, [responsibilityTabs, showPreviewMode, selectedChanges, aiChanges]);

  const previewRowIdsKey = displayedResponsibilities.map((r) => r.id).join(',');

  const editDraftRef = useRef(editDraft);
  editDraftRef.current = editDraft;

  const toggleCardExpansion = useCallback(
    (id: string) => {
      setExpandedCards((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          setEditDraft((d) => {
            const { [id]: _, ...rest } = d;
            return rest;
          });
        } else {
          next.add(id);
          const raw = rawDisplayedResponsibilities.find((r) => r.id === id);
          if (raw) {
            setEditDraft((d) => ({
              ...d,
              [id]: {
                responsibility: respEdits[id]?.responsibility ?? raw.responsibility,
                reasoning: respEdits[id]?.reasoning ?? raw.reasoning,
              },
            }));
          }
        }
        return next;
      });
    },
    [rawDisplayedResponsibilities, respEdits]
  );

  const handleSaveResponsibilityCard = useCallback((id: string) => {
    const draft = editDraftRef.current[id];
    if (draft) {
      setRespEdits((e) => ({ ...e, [id]: draft }));
    }
    setEditDraft((d) => {
      const { [id]: _, ...rest } = d;
      return rest;
    });
    setExpandedCards((p) => {
      const n = new Set(p);
      n.delete(id);
      return n;
    });
  }, []);

  const flashSnippetRow = useCallback((id: string) => {
    setPulseSnippetId(id);
    window.setTimeout(() => {
      setPulseSnippetId((cur) => (cur === id ? null : cur));
    }, 2000);
  }, []);

  const flashPreviewCard = useCallback((id: string) => {
    setPulsePreviewId(id);
    window.setTimeout(() => {
      setPulsePreviewId((cur) => (cur === id ? null : cur));
    }, 2000);
  }, []);

  // Track which AI snippet row is most visible while the summary is on screen
  useEffect(() => {
    if (!aiSummaryVisible || !aiSummaryRef.current) return;
    const root = aiSummaryRef.current;
    const els = root.querySelectorAll<HTMLElement>('[data-snippet-row]');
    if (els.length === 0) return;

    const map = snippetRatiosRef.current;
    map.clear();

    const io = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          const id = ent.target.getAttribute('data-snippet-row');
          if (id) map.set(id, ent.intersectionRatio);
        }
        const best = pickMostVisibleId(map);
        if (best) {
          setSnippetContextId(best);
        }
      },
      { threshold: IO_THRESHOLDS, root: null }
    );

    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      map.clear();
    };
  }, [aiSummaryVisible]);

  // Track which preview card is most visible (AI-linked rows only, preview mode)
  useEffect(() => {
    if (!previewSectionRef.current) return;
    if (!showPreviewMode || selectedChanges.size === 0) {
      previewRatiosRef.current.clear();
      setPreviewContextId(null);
      return;
    }

    const root = previewSectionRef.current;
    const els = root.querySelectorAll<HTMLElement>('[data-preview-row]');
    const map = previewRatiosRef.current;
    map.clear();

    const io = new IntersectionObserver(
      (entries) => {
        const sel = selectedChangesRef.current;
        for (const ent of entries) {
          const id = ent.target.getAttribute('data-preview-row');
          if (!id || !isAiLinkedPreviewId(id)) continue;
          map.set(id, ent.intersectionRatio);
        }
        const filtered = new Map<string, number>();
        for (const [id, r] of map) {
          if (sel.has(id)) filtered.set(id, r);
        }
        const best = pickMostVisibleId(filtered);
        if (best) setPreviewContextId(best);
      },
      { threshold: IO_THRESHOLDS, root: null }
    );

    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
    };
  }, [showPreviewMode, selectedIdsKey, previewRowIdsKey]);

  const handleBackToSnippet = useCallback(() => {
    setAiSummaryVisible(true);
    const targetId = lastClickedPreviewId ?? previewContextId;
    const scrollToRow = () => {
      if (!targetId) {
        aiSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const fromDom =
        aiSummaryRef.current?.querySelector<HTMLElement>(`[data-snippet-row="${targetId}"]`) ?? null;
      const el = fromDom ?? snippetRowRefs.current[targetId] ?? null;
      if (el) {
        scrollPageToElement(el, 80);
        flashSnippetRow(targetId);
      } else {
        aiSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    window.requestAnimationFrame(() => {
      window.setTimeout(scrollToRow, 80);
    });
  }, [flashSnippetRow, lastClickedPreviewId, previewContextId]);

  const scrollPreviewCardIntoView = useCallback(
    (id: string) => {
      const maxAttempts = 80;
      let attempt = 0;
      const tryScroll = () => {
        const fromDom =
          previewSectionRef.current?.querySelector<HTMLElement>(`[data-preview-row="${id}"]`) ?? null;
        const el = fromDom ?? previewCardRefs.current[id] ?? null;
        if (el) {
          scrollPageToElement(el, 80);
          flashPreviewCard(id);
          return;
        }
        attempt += 1;
        if (attempt < maxAttempts) {
          requestAnimationFrame(tryScroll);
        }
      };
      requestAnimationFrame(tryScroll);
    },
    [flashPreviewCard]
  );

  const handleBackToPreview = useCallback(() => {
    const id = snippetContextId ?? snippetContextIdRef.current;
    if (!id || !selectedChangesRef.current.has(id)) return;

    if (!showPreviewMode) {
      setShowPreviewMode(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.setTimeout(() => scrollPreviewCardIntoView(id), 0);
        });
      });
    } else {
      scrollPreviewCardIntoView(id);
    }
  }, [showPreviewMode, snippetContextId, scrollPreviewCardIntoView]);

  const canBackToPreview =
    snippetContextId !== null && selectedChanges.has(snippetContextId);
  const contextSnippetTitle = snippetContextId
    ? aiChanges.find((c) => c.id === snippetContextId)?.title.replace(':', '') ?? null
    : null;
  const backToSnippetTargetId = lastClickedPreviewId ?? previewContextId;
  const backToSnippetSubtitle = backToSnippetTargetId
    ? displayedResponsibilities.find((r) => r.id === backToSnippetTargetId)?.label.replace(':', '') ??
      aiChanges.find((c) => c.id === backToSnippetTargetId)?.title.replace(':', '') ??
      null
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
          <div className="flex items-center">
            <div className="bg-[#dc2626] px-2 py-0.5">
              <span className="text-white font-bold text-sm tracking-tight">LOCATION</span>
            </div>
            <div className="bg-[#dc2626] w-5 h-5 ml-px flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">HQ</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Search className="w-5 h-5 text-gray-600 cursor-pointer" />
            <div className="w-8 h-8 bg-[#374151] rounded-full flex items-center justify-center cursor-pointer">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Back */}
        <button className="flex items-center gap-1.5 text-gray-700 mb-6 hover:text-black text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="font-bold text-[22px] text-black mb-6">Add agreement</h1>

        {/* ── Identification ── */}
        <section className="mb-7">
          <h2 className="font-bold text-[15px] text-black mb-4">Identification</h2>
          <div className="grid grid-cols-2 gap-5 mb-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">Agreement name *</label>
              <input type="text" placeholder="Agreement name"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">Agreement date *</label>
              <input type="text" placeholder="MM/DD/YYYY"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1.5">Notes *</label>
            <textarea placeholder="Enter any additional notes about this agreement"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </section>

        {/* ── Maintenance ── */}
        <section className="mb-6">
          <h2 className="font-bold text-[15px] text-black mb-1">Maintenance</h2>
          <p className="text-sm text-gray-500 mb-3">The documents below are available in the Documents tab on the Land details page</p>
          <div className="mb-2 rounded-md border border-gray-200 bg-white p-2">
            <table className="w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr>
                  <th className="w-10 rounded-tl-md bg-gray-50 px-4 py-3.5 text-left text-xs font-semibold text-gray-700">
                    <input type="checkbox" checked={allDocsChecked} onChange={e => toggleAllDocs(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300" />
                  </th>
                  <th className="bg-gray-50 px-4 py-3.5 text-left text-xs font-semibold text-gray-700">File name</th>
                  <th className="bg-gray-50 px-4 py-3.5 text-left text-xs font-semibold text-gray-700">Uploaded by</th>
                  <th className="bg-gray-50 px-4 py-3.5 text-left text-xs font-semibold text-gray-700">Uploaded date</th>
                  <th className="rounded-tr-md bg-gray-50 px-4 py-3.5 text-left text-xs font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, idx) => (
                  <tr
                    key={idx}
                    className={`${docChecks[idx] ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                  >
                    <td className="rounded-l-md border border-gray-100 px-4 py-4 align-middle">
                      <input type="checkbox" checked={docChecks[idx]}
                        onChange={e => { const n = [...docChecks]; n[idx] = e.target.checked; setDocChecks(n); }}
                        className="h-4 w-4 rounded border-gray-300 accent-blue-600" />
                    </td>
                    <td className="border border-l-0 border-gray-100 px-4 py-4 align-middle text-[#2563eb] font-medium leading-snug">{doc.name}</td>
                    <td className="border border-l-0 border-gray-100 px-4 py-4 align-middle text-gray-700 leading-snug">{doc.uploader}</td>
                    <td className="border border-l-0 border-gray-100 px-4 py-4 align-middle text-gray-700 leading-snug">{doc.date}</td>
                    <td className="rounded-r-md border border-l-0 border-gray-100 px-4 py-4 align-middle">
                      <span className="inline-block bg-[#16a34a] px-2.5 py-1 text-[11px] font-bold text-white rounded">{doc.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <select className="border border-gray-300 rounded px-2 py-1 text-sm">
              <option>10</option><option>25</option><option>50</option>
            </select>
            <span>1 - 1 of 1 rows</span>
            <div className="flex gap-1 ml-auto">
              <button className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 text-gray-400">
                <ChevronDown className="w-3 h-3 rotate-90" />
              </button>
              <button className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 text-gray-400">
                <ChevronDown className="w-3 h-3 -rotate-90" />
              </button>
            </div>
          </div>
        </section>

        {/* AI Search - Only show after processing AI summary */}
        {hasProcessedAiSummary && (
          <div className="flex items-center gap-3 mb-6">
            {/* Search bar spanning most of the width */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search responsibilities, terms, or clauses..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* AI Search button */}
            <button
              type="button"
              className="flex items-center gap-2 bg-[#2563eb] text-white rounded-full px-7 py-2.5 font-medium text-sm hover:bg-[#1d4ed8] transition flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              AI Search
            </button>
          </div>
        )}

        {/* ── AI Summary Section (ref here for scroll-back) ── */}
        <div ref={aiSummaryRef}>
          {aiSummaryVisible && (
            <div className="relative mb-5 pb-14">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-[15px] text-[#1a1a1a]">AI Summary of Changes</span>
                <div className="flex items-center gap-5">
                  <button
                    type="button"
                    onClick={() => setShowChangesTreeModal(true)}
                    className="text-sm font-medium text-[#ff0004] transition hover:underline"
                  >
                    Show changes
                  </button>
                  <button className="text-[#2563eb] text-sm font-medium hover:underline">
                    View Legal Evidence
                  </button>
                </div>
              </div>

              {/* Summary Container */}
              <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-sm overflow-hidden">
                <label className="flex cursor-pointer items-center gap-2 border-b border-gray-100 bg-[#fafbfc] px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100/80">
                  <input
                    ref={snippetSelectAllRef}
                    type="checkbox"
                    checked={allSnippetSelected}
                    onChange={toggleSelectAllSnippet}
                    className="h-4 w-4 shrink-0 rounded border-gray-400 accent-blue-600"
                  />
                  <span className="font-medium">Select all</span>
                  <span className="text-xs font-normal text-gray-500">
                    ({selectedChanges.size}/{aiChanges.length} selected)
                  </span>
                </label>
                <div className="space-y-3 p-4">
                  {aiChanges.map((change) => {
                    const styles = getTypeStyles(change.type);
                    return (
                      <div
                        key={change.id}
                        ref={(el) => {
                          snippetRowRefs.current[change.id] = el;
                        }}
                        data-snippet-row={change.id}
                        className={`scroll-mt-24 ${styles.bg} border ${styles.border} rounded-md px-4 py-3 flex items-start gap-3 transition-shadow duration-300 ${
                          pulseSnippetId === change.id ? 'ring-2 ring-[#2563eb] ring-offset-2' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedChanges.has(change.id)}
                          onChange={() => toggleChange(change.id)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-400 accent-blue-600"
                          aria-label={`Select ${change.title}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[13px] text-[#1a1a1a] mb-1.5">{change.title}</p>
                          <div className="flex items-start gap-2">
                            <span className={`${styles.badge} text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-px`}>
                              {styles.label}
                            </span>
                            <p className="text-[13px] text-[#555] leading-snug">{change.summary}</p>
                          </div>
                          
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => setDetailModal(change)}
                          className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-black/5 rounded transition"
                          title="Open detailed view"
                        >
                          <Maximize2 className="w-4 h-4 text-gray-500 stroke-2" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Footer stats */}
                <div className="bg-[#fafbfc] border-t border-gray-200 px-4 py-3 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#16a34a]" />
                    <span className="text-[12px] text-[#6b7280]">{addedCount} Added</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#2563eb]" />
                    <span className="text-[12px] text-[#6b7280]">{modifiedCount} Modified</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#dc2626]" />
                    <span className="text-[12px] text-[#6b7280]">{removedCount} Removed</span>
                  </div>
                </div>
              </div>

              {/* Preview info row + Reject + Accept */}
              <div className="flex items-start justify-between mt-4 gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {/* Eye toggle — disabled when nothing checked */}
                  <button
                    onClick={handlePreviewToggle}
                    disabled={noneChecked}
                    title={noneChecked ? 'Select at least one responsibility first' : showPreviewMode ? 'Hide preview' : 'Show preview'}
                    className={`flex-shrink-0 mt-0.5 transition ${
                      noneChecked ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showPreviewMode ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <p className="text-sm text-black leading-snug">
                    {showPreviewMode
                      ? 'You are currently seeing the new preview. Click the eye icon to hide. Check or uncheck any change—including removed items—to update the preview.'
                      : 'You are currently seeing an old preview. Select the changes you want in the agreement (added, modified, or removed), then click the eye icon to preview.'}
                  </p>
                </div>

                {/* Reject always visible · Accept always visible */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={handleReject}
                    className="bg-[#dc2626] text-white rounded-full px-7 py-2.5 font-medium text-sm hover:bg-[#b91c1c] transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleAccept}
                    disabled={noneChecked}
                    className="bg-[#2563eb] text-white rounded-full px-7 py-2.5 font-medium text-sm hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Accept
                  </button>
                </div>
              </div>

              <div className="sticky bottom-4 z-20 flex justify-center pointer-events-none">
                <button
                  type="button"
                  onClick={handleBackToPreview}
                  disabled={!canBackToPreview}
                  title={
                    canBackToPreview
                      ? `Scroll to preview for ${contextSnippetTitle ?? 'this change'}`
                      : 'Select this change in the list above (checkbox) to jump to its preview'
                  }
                  className={`pointer-events-auto rounded-full border px-8 py-2.5 text-sm font-medium shadow-lg flex flex-col items-center gap-0.5 transition ${
                    canBackToPreview
                      ? 'border-gray-400 bg-white text-gray-800 hover:bg-gray-50'
                      : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden>↓</span> Back to Preview
                  </span>
                  {canBackToPreview && contextSnippetTitle && (
                    <span className="max-w-[240px] truncate text-[10px] font-normal text-gray-500">
                      {contextSnippetTitle}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        {/* end AI summary ref wrapper */}

        {/* ── Responsibility Preview Section  ──
            This wrapper is `relative` so the sticky button anchors here
            and does NOT start until this section begins. */}
        <div ref={previewSectionRef} className="relative mb-8">

          {/* Tab bar */}
          <div className="bg-[#d9d9d9] rounded-xl p-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {responsibilityTabs.map((tab) => (
              <div key={tab.id} className="relative flex items-center">
                {editingTabId === tab.id ? (
                  <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1">
                    <input
                      type="text"
                      value={editingTabLabel}
                      onChange={(e) => setEditingTabLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveTabEdit();
                        } else if (e.key === 'Escape') {
                          handleCancelTabEdit();
                        }
                      }}
                      className="text-sm font-semibold text-[#dc2626] bg-transparent border-none outline-none min-w-[80px] max-w-[120px]"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveTabEdit}
                      className="w-5 h-5 flex items-center justify-center text-green-600 hover:bg-green-50 rounded"
                      title="Save"
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleCancelTabEdit}
                      className="w-5 h-5 flex items-center justify-center text-red-600 hover:bg-red-50 rounded"
                      title="Cancel"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => !isDeleteMode && setActiveTab(tab.id)}
                    className={`group relative px-6 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-white text-[#dc2626] shadow-sm'
                        : 'text-[#5a5a5a] hover:bg-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{tab.label}</span>
                      
                      {/* Tab indicators - dots showing changes */}
                      {(tabIndicators[tab.id]?.hasModified || tabIndicators[tab.id]?.hasAdded || tabIndicators[tab.id]?.hasRemoved) && (
                        <div className="flex items-center gap-1">
                          {tabIndicators[tab.id]?.hasModified && (
                            <div className="w-2 h-2 bg-[#f59e0b] rounded-full" title="Has modified responsibilities" />
                          )}
                          {tabIndicators[tab.id]?.hasAdded && (
                            <div className="w-2 h-2 bg-[#16a34a] rounded-full" title="Has added responsibilities" />
                          )}
                          {tabIndicators[tab.id]?.hasRemoved && (
                            <div className="w-2 h-2 bg-[#dc2626] rounded-full" title="Has removed responsibilities" />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Edit button - visible on hover when not in delete mode */}
                    {!isDeleteMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditingTab(tab.id, tab.label);
                        }}
                        className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center text-gray-500 hover:text-[#dc2626] transition-all"
                        title="Edit tab name"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                    
                    {/* Delete X - visible only in delete mode */}
                    {isDeleteMode && responsibilityTabs.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTab(tab.id);
                        }}
                        className="w-4 h-4 flex items-center justify-center text-red-600 hover:text-red-800 transition-colors"
                        title="Delete tab"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </button>
                )}
              </div>
              ))}
            </div>
            
            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              {/* Add tab button */}
              <button
                onClick={handleAddTab}
                disabled={isDeleteMode}
                className={`w-8 h-8 border-2 bg-white rounded flex items-center justify-center transition ${
                  isDeleteMode 
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-[#dc2626] text-[#dc2626] hover:bg-red-50'
                }`}
                title="Add new tab"
              >
                <Plus className="w-4 h-4" />
              </button>
              
              {/* Delete mode toggle button */}
              <button
                onClick={toggleDeleteMode}
                className={`w-8 h-8 border-2 rounded flex items-center justify-center transition ${
                  isDeleteMode
                    ? 'border-red-600 bg-red-600 hover:bg-red-700'
                    : 'border-gray-400 bg-white text-gray-600 hover:bg-gray-50'
                }`}
                title={isDeleteMode ? "Exit delete mode" : "Delete tabs"}
              >
                <Trash2 className={`w-4 h-4 ${isDeleteMode ? 'text-white' : ''}`} />
              </button>
            </div>
          </div>

          {/* Responsibility cards */}
          <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm">
            {/* Extra bottom padding so the sticky button doesn't cover the last card */}
            <div className="p-4 pb-16 space-y-3">
              {displayedResponsibilities.map((resp, index) => (
                <div
                  key={resp.id}
                  ref={(el) => {
                    previewCardRefs.current[resp.id] = el;
                  }}
                  data-preview-row={resp.id}
                  onClick={() => setLastClickedPreviewId(resp.id)}
                  className={`relative group scroll-mt-24 cursor-pointer border rounded-md overflow-hidden transition-shadow duration-300 ${
                    showPreviewMode && resp.isRemoved
                      ? 'border-[#fca5a5] bg-[#fef2f2]'
                      : showPreviewMode && resp.isModified
                        ? 'border-[#fbbf24] bg-[#fffbeb]'
                        : showPreviewMode && resp.isAdded
                          ? 'border-[#86efac] bg-[#f0fdf4]'
                          : 'border-[#e5e7eb] bg-white'
                  } ${pulsePreviewId === resp.id ? 'ring-2 ring-[#2563eb] ring-offset-2' : ''}`}
                >
                  <div className="flex items-start gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-[12px] text-[#1a1a1a]">{resp.label}</p>
                        {showPreviewMode && resp.isModified && (
                          <span className="bg-[#f59e0b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Modified</span>
                        )}
                        {showPreviewMode && resp.isAdded && (
                          <span className="bg-[#16a34a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Added</span>
                        )}
                        {showPreviewMode && resp.isRemoved && (
                          <span className="bg-[#dc2626] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Removed</span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#374151] leading-snug">{resp.responsibility}</p>
                      {/* Reasoning only shown when card is expanded in the edit form below */}
                    </div>
                    
                    {/* Right side action buttons */}
                    <div className="flex items-center gap-1">
                      {/* Add responsibility button - appears on hover */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddResponsibilityAt(index);
                        }}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-green-50 hover:text-green-600 rounded transition-all"
                        title="Add new responsibility after this one"
                      >
                        <Plus className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      {/* Delete responsibility button - appears on hover */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteResponsibility(resp.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-red-50 hover:text-red-600 rounded transition-all"
                        title="Delete this responsibility"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      {/* Expand button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLastClickedPreviewId(resp.id);
                          toggleCardExpansion(resp.id);
                        }}
                        className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded transition"
                        title="Expand to edit"
                      >
                        <Maximize2 className="w-4 h-4 text-gray-500 stroke-2" />
                      </button>
                    </div>
                  </div>

                  {expandedCards.has(resp.id) && (
                    <div
                      className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-3 bg-gray-50"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">Responsibility *</label>
                        <textarea
                          value={editDraft[resp.id]?.responsibility ?? resp.responsibility}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              [resp.id]: {
                                responsibility: e.target.value,
                                reasoning: d[resp.id]?.reasoning ?? resp.reasoning,
                              },
                            }))
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2 text-[12px] h-14 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">Reasoning *</label>
                        <textarea
                          value={editDraft[resp.id]?.reasoning ?? resp.reasoning}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              [resp.id]: {
                                responsibility: d[resp.id]?.responsibility ?? resp.responsibility,
                                reasoning: e.target.value,
                              },
                            }))
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2 text-[12px] h-12 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggleCardExpansion(resp.id)}
                          className="px-4 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveResponsibilityCard(resp.id)}
                          className="px-4 py-1.5 text-sm text-white bg-[#2563eb] rounded hover:bg-[#1d4ed8] transition"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Sticky "Back to Snippet" — anchored to THIS relative container only ──
              It sticks at the bottom of the viewport while you scroll through
              the responsibility cards, and naturally leaves when you exit the section. */}
          <div className="sticky bottom-4 z-20 flex justify-center pointer-events-none">
            <button
              type="button"
              onClick={handleBackToSnippet}
              title={
                backToSnippetSubtitle
                  ? `Jump to ${backToSnippetSubtitle} in AI summary`
                  : 'Back to AI summary of changes'
              }
              className="pointer-events-auto flex flex-col items-center gap-0.5 rounded-full border border-gray-400 bg-white px-8 py-2.5 text-sm font-medium shadow-lg transition hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                <span aria-hidden>↑</span> Back to Snippet
              </span>
              {backToSnippetSubtitle && (
                <span className="max-w-[260px] truncate text-center text-[10px] font-normal text-gray-500">
                  {backToSnippetSubtitle}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* end responsibility preview relative wrapper */}

        {/* ── Footer Actions ── */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button className="text-[#2563eb] text-sm font-medium hover:underline">Cancel</button>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition">
              Save as Draft
            </button>
            <button className="px-6 py-2 bg-gray-300 text-gray-600 rounded text-sm font-medium cursor-not-allowed">
              Finish
            </button>
          </div>
        </div>
      </div>

      {/* ── Detail Popup ── */}
      {detailModal && (
        <DetailPopup
          resp={detailModal}
          onClose={() => setDetailModal(null)}
          onAccept={() => { toggleChange(detailModal.id); setDetailModal(null); }}
          isSelected={selectedChanges.has(detailModal.id)}
          expandedComparisons={expandedComparisons}
          onToggleComparison={toggleComparisonView}
        />
      )}

      {showChangesTreeModal && (
        <ChangesTreeModal
          onClose={() => setShowChangesTreeModal(false)}
          grouped={changesGroupedByParty}
          selectedChanges={selectedChanges}
          onToggleChange={toggleChange}
        />
      )}
    </div>
  );
}