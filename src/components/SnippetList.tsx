import React, { useRef, useEffect, useState } from 'react';
import { Check, X, Eye, FileText, RotateCcw } from 'lucide-react';
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

interface PageReference {
  page: number;
  fullText: string;
  highlights?: Highlight[];
}

interface PDFReference {
  page: number;
  segment: string;
  context?: string;
  fullText?: string;
  highlights?: Highlight[];
  pageReferences?: PageReference[]; // Additional pages with references
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

  // Component for individual scrollable snippet with flip card
  const ScrollableSnippet = ({ snippet, index }: { snippet: Snippet; index: number }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const scrollToPageRef = useRef<((page: number) => void) | null>(null);

    const handleEyeHover = () => {
      // Preview snippet (show ghost text) when hovering over eye icon
      if (onPreview) {
        onPreview(snippet);
      }
    };

    const handleCardClick = (e: React.MouseEvent) => {
      // Don't flip if clicking on buttons or interactive elements
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('[role="button"]')) {
        return;
      }
      setIsFlipped(!isFlipped);
    };

    return (
      <div
        key={snippet.id}
        className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 transition-all hover:shadow-lg hover:border-gray-300 cursor-pointer"
        style={{ 
          animationDelay: `${index * 50}ms`,
        }}
        onClick={handleCardClick}
      >
        {/* Card Container with Flip Effect */}
        <div className="relative" style={{ perspective: '1000px', minHeight: '400px' }}>
          <div
            className="relative w-full transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front Side - AI Summary */}
            <div
              className="w-full"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              {/* AI Summary Content */}
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      AI Summary
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">
                      This snippet will fill the following fields:
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(true);
                    }}
                    className="text-xs text-red-600 hover:text-red-700 underline flex-shrink-0 font-medium"
                    title="View PDF reference"
                  >
                    View Reference
                  </button>
                </div>

                {/* Field Mappings Display */}
                <div className="space-y-3">
                  {Object.entries(snippet.fieldMappings).map(([fieldId, value]) => {
                    // Find the matched field name
                    const fieldName = snippet.matchedFields.find(f => 
                      f.toLowerCase().replace(/\s+/g, '') === fieldId.toLowerCase().replace(/\s+/g, '')
                    ) || fieldId;
                    
                    return (
                      <div key={fieldId} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-700 mb-1">
                              {fieldName}
                            </p>
                            <p className="text-sm text-gray-900 leading-relaxed">
                              {value as string}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Click to view reference hint */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                    <FileText className="w-3 h-3 text-red-500" />
                    Click card to view PDF reference
                  </p>
                </div>
              </div>

              {/* Accept and Preview Buttons */}
              <div className="px-4 pb-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                  {/* Preview Button */}
                  <button
                    onMouseEnter={() => {
                      if (onPreview) {
                        onPreview(snippet);
                      }
                    }}
                    onMouseLeave={() => {
                      if (onPreview) {
                        // Clear preview by passing empty ghost values
                        onPreview({ ...snippet, fieldMappings: {} } as any);
                      }
                    }}
                    className="flex-1 px-4 py-2.5 border border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2 text-blue-700"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">Preview</span>
                  </button>
                  
                  {/* Accept Button */}
                  <button
                    onClick={() => onApply(snippet)}
                    className="flex-1 px-4 py-2.5 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors flex items-center justify-center gap-2 text-red-700"
                  >
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Accept</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Back Side - PDF Snippet */}
            <div
              className="absolute inset-0 w-full"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              {/* Header with Back Button and References */}
              <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(false);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-red-50 text-red-700 transition-colors border border-red-300"
                  title="Back to summary"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-xs font-medium">Back to Summary</span>
                </button>
                
                {/* Reference Tags - show if there are multiple pages */}
                {snippet.pdfReference.pageReferences && snippet.pdfReference.pageReferences.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-gray-700">References:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (scrollToPageRef.current) {
                          scrollToPageRef.current(snippet.pdfReference.page);
                        }
                      }}
                      className="px-2.5 py-1 text-xs rounded-md transition-colors font-medium bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                      title={`Go to page ${snippet.pdfReference.page}`}
                    >
                      Page {snippet.pdfReference.page}
                    </button>
                    {snippet.pdfReference.pageReferences.map((pageRef) => (
                      <button
                        key={pageRef.page}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (scrollToPageRef.current) {
                            scrollToPageRef.current(pageRef.page);
                          }
                        }}
                        className="px-2.5 py-1 text-xs rounded-md transition-colors font-medium bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                        title={`Go to page ${pageRef.page}`}
                      >
                        Page {pageRef.page}
                      </button>
                    ))}
                  </div>
                )}
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
                        pageReferences={snippet.pdfReference.pageReferences}
                        onPageClick={(page) => {
                          // Scroll to page is handled internally by PDFSnippetViewer
                        }}
                        onScrollToPageReady={(scrollFn) => {
                          scrollToPageRef.current = scrollFn;
                        }}
                      />
                    ) : (
                      <div className="p-4 bg-white border border-gray-300 rounded">
                        <p>{snippet.pdfReference.context}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Accept and Preview Buttons */}
              <div className="px-4 pb-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                  {/* Preview Button */}
                  <button
                    onMouseEnter={() => {
                      if (onPreview) {
                        onPreview(snippet);
                      }
                    }}
                    onMouseLeave={() => {
                      if (onPreview) {
                        // Clear preview by passing empty ghost values
                        onPreview({ ...snippet, fieldMappings: {} } as any);
                      }
                    }}
                    className="flex-1 px-4 py-2.5 border border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2 text-blue-700"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">Preview</span>
                  </button>
                  
                  {/* Accept Button */}
                  <button
                    onClick={() => onApply(snippet)}
                    className="flex-1 px-4 py-2.5 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors flex items-center justify-center gap-2 text-red-700"
                  >
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Accept</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAnalyzing ? (
            <AIAnalyzingAnimation message="Analyzing documents..." size="sm" />
          ) : (
            <>
              <span className="text-white font-medium">
                {searchQuery ? `Results for "${searchQuery}"` : 'AI Auto Fill'}
              </span>
              <span className="bg-white/20 text-red-600 text-xs px-2 py-1 rounded font-semibold">
                {snippets.length} {snippets.length === 1 ? 'snippet' : 'snippets'} found
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