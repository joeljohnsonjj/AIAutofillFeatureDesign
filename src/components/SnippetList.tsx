import React, { useRef, useEffect } from 'react';
import { Check, X, Eye } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { PDFSnippetViewer } from './PDFSnippetViewer';
import { AIAnalyzingAnimation } from './AIAnalyzingAnimation';

interface Highlight {
  text: string;
  field: string;
  color: string;
}

interface PDFReference {
  page: number;
  segment: string;
  context?: string;
  fullText?: string;
  highlights?: Highlight[];
}

interface Snippet {
  id: string;
  title: string;
  pdfReference: PDFReference;
  fieldMappings: Record<string, string>;
  matchedFields: string[];
  confidenceScore?: number;
}

interface SnippetListProps {
  snippets: Snippet[];
  onApply: (snippet: Snippet) => void;
  onPreview?: (snippet: Snippet) => void;
  onClose: () => void;
  searchQuery?: string;
  isAnalyzing?: boolean;
}

export function SnippetList({
  snippets,
  onApply,
  onPreview,
  onClose,
  searchQuery,
  isAnalyzing = false,
}: SnippetListProps) {
  const snippetsContainerRef = useRef<HTMLDivElement>(null);

  // Keep container scrolled to top when snippets are loaded or changed
  useEffect(() => {
    if (snippetsContainerRef.current) {
      // Reset scroll position to top immediately when snippets are set/changed
      // Use multiple attempts to ensure it sticks
      const resetScroll = () => {
        if (snippetsContainerRef.current) {
          snippetsContainerRef.current.scrollTop = 0;
        }
      };
      
      // Immediate reset
      resetScroll();
      
      // Reset after a short delay to catch any delayed scrolls
      setTimeout(resetScroll, 0);
      setTimeout(resetScroll, 50);
      setTimeout(resetScroll, 100);
      setTimeout(resetScroll, 200);
    }
  }, [snippets]);

  // Also prevent any scroll behavior on mount
  useEffect(() => {
    if (snippetsContainerRef.current) {
      snippetsContainerRef.current.scrollTop = 0;
    }
  }, []);

  if (snippets.length === 0) return null;

  // Function to render text with highlights
  const renderHighlightedText = (text: string, highlights?: Highlight[], firstHighlightRef?: React.RefObject<HTMLSpanElement>) => {
    if (!highlights || highlights.length === 0) {
      return <span>{text}</span>;
    }

    let lastIndex = 0;
    const parts: React.ReactElement[] = [];
    let isFirstHighlight = true;

    // Sort highlights by their position in the text
    const sortedHighlights = [...highlights].sort((a, b) => {
      return text.indexOf(a.text) - text.indexOf(b.text);
    });

    sortedHighlights.forEach((highlight, idx) => {
      const highlightIndex = text.indexOf(highlight.text, lastIndex);
      
      if (highlightIndex === -1) return;

      // Add text before highlight
      if (highlightIndex > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>
            {text.substring(lastIndex, highlightIndex)}
          </span>
        );
      }

      // Add highlighted text with tooltip
      // Attach ref to first highlight for auto-scrolling
      const highlightElement = (
        <TooltipProvider key={`highlight-${idx}`}>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <mark 
                ref={isFirstHighlight && firstHighlightRef ? firstHighlightRef : undefined}
                className={`${highlight.color} px-0.5 cursor-help transition-all hover:ring-2 hover:ring-purple-400 hover:ring-offset-1 rounded-sm`}
              >
                {highlight.text}
              </mark>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-gray-900 text-white px-3 py-2">
              <p className="text-xs">Maps to: <span className="font-semibold">{highlight.field}</span></p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      
      parts.push(highlightElement);
      if (isFirstHighlight) isFirstHighlight = false;

      lastIndex = highlightIndex + highlight.text.length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">{text.substring(lastIndex)}</span>
      );
    }

    return <>{parts}</>;
  };

  // Component for individual scrollable snippet
  const ScrollableSnippet = ({ snippet, index }: { snippet: Snippet; index: number }) => {
    // Auto-scroll to first highlight on mount - Keep this enabled
    // Note: The actual scrolling happens in PDFSnippetViewer component

    const handleEyeHover = () => {
      // Preview snippet (show ghost text) when hovering over eye icon
      if (onPreview) {
        onPreview(snippet);
      }
    };

    return (
      <div
        key={snippet.id}
        className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 transition-all hover:shadow-lg hover:border-gray-300"
        style={{ 
          animationDelay: `${index * 50}ms`,
        }}
      >
        {/* Snippet Header */}
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">
              Page {snippet.pdfReference.page} • {snippet.title}
            </span>
            <div className="flex items-center gap-2">
              {/* Eye Icon for Preview */}
              <div
                className="relative group"
                onMouseEnter={handleEyeHover}
              >
                <button
                  className="p-1.5 rounded-md hover:bg-purple-100 text-gray-600 hover:text-purple-600 transition-colors"
                  title="Hover to preview in form fields"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              {snippet.confidenceScore !== undefined && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-600">Confidence:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          snippet.confidenceScore >= 80 ? 'bg-green-500' :
                          snippet.confidenceScore >= 60 ? 'bg-yellow-500' :
                          'bg-orange-500'
                        }`}
                        style={{ width: `${snippet.confidenceScore}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${
                      snippet.confidenceScore >= 80 ? 'text-green-700' :
                      snippet.confidenceScore >= 60 ? 'text-yellow-700' :
                      'text-orange-700'
                    }`}>
                      {snippet.confidenceScore}%
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1">
                {snippet.matchedFields.map((field) => (
                  <span
                    key={field}
                    className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PDF-like Content - Scrollable */}
        <div className="p-4">
          <div className="bg-white border border-gray-300 shadow-inner rounded overflow-hidden">
            {/* Scrollable PDF container - full document view */}
            <div className="bg-gray-100 p-2">
              {snippet.pdfReference.fullText ? (
                <PDFSnippetViewer
                  fullText={snippet.pdfReference.fullText}
                  highlights={snippet.pdfReference.highlights}
                  pageNumber={snippet.pdfReference.page}
                  title={snippet.title}
                />
              ) : (
                <div className="p-4 bg-white border border-gray-300 rounded">
                  <p>{snippet.pdfReference.context}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="px-4 pb-4" onMouseEnter={(e) => e.stopPropagation()} onMouseLeave={(e) => e.stopPropagation()}>
          <button
            onClick={() => onApply(snippet)}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            APPLY TO {snippet.matchedFields.length} FIELD{snippet.matchedFields.length !== 1 ? 'S' : ''}
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Hover 👁️ icon to preview • Click button to apply
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAnalyzing ? (
            <AIAnalyzingAnimation message="Analyzing documents..." size="sm" />
          ) : (
            <>
              <span className="text-white font-medium">
                {searchQuery ? `Results for "${searchQuery}"` : 'Evidence Snippets'}
              </span>
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded">
                {snippets.length} found
              </span>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Snippet List - Scrollable, shows 2 at a time */}
      <div 
        ref={snippetsContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4" 
        style={{ maxHeight: 'calc(100vh - 250px)' }}
      >
        {snippets.map((snippet, index) => (
          <ScrollableSnippet key={snippet.id} snippet={snippet} index={index} />
        ))}
      </div>
    </div>
  );
}