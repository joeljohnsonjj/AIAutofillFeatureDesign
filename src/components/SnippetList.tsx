import React, { useRef, useEffect, useState } from 'react';
import { Check, X, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
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
  onApply: (snippet: Snippet, keepSnippetsVisible?: boolean) => void;
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
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset to first snippet when snippets change
  useEffect(() => {
    setCurrentIndex(0);
  }, [snippets]);

  // Automatically preview the current snippet when it changes
  useEffect(() => {
    if (currentSnippet && onPreview) {
      onPreview(currentSnippet);
    }
    
    // Cleanup: clear preview when component unmounts or snippet changes
    return () => {
      if (onPreview && currentSnippet) {
        onPreview({ ...currentSnippet, fieldMappings: {} } as any);
      }
    };
  }, [currentIndex, snippets]);

  if (snippets.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % snippets.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + snippets.length) % snippets.length);
  };

  const currentSnippet = snippets[currentIndex];

  // Function to render text with highlights

  // Component for individual scrollable snippet with flip card
  const ScrollableSnippet = ({ snippet, index }: { snippet: Snippet; index: number }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const scrollToPageRef = useRef<((page: number) => void) | null>(null);


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
        <div className="relative" style={{ perspective: '1000px', height: '400px' }}>
          <div
            className="relative w-full h-full transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front Side - AI Summary */}
            <div
              className="w-full h-full"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              {/* AI Summary Content */}
              <div className="flex flex-col h-full">
                {/* Header - Fixed */}
                <div className="p-4 pb-2 flex-shrink-0">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        AI Summary
                      </h4>
                      <p className="text-xs text-gray-500">
                        This snippet will fill the following fields:
                      </p>
                    </div>
                  </div>
                </div>

                {/* Field Mappings Display - Scrollable */}
                <div className="flex-1 overflow-y-auto px-4" style={{ maxHeight: '250px' }}>
                  <div className="space-y-3 py-2">
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
                </div>

                {/* Click to view reference hint - Fixed */}
                <div className="px-4 pt-3 pb-2 border-t border-gray-200 flex-shrink-0">
                  <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                    <FileText className="w-3 h-3 text-red-500" />
                    Click card to view PDF reference
                  </p>
                </div>

                {/* Accept Button - Fixed */}
                <div className="px-4 py-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => onApply(snippet, false)}
                      className="px-6 py-2.5 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors flex items-center justify-center gap-2 text-red-700"
                    >
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Accept</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Side - PDF Snippet */}
            <div
              className="absolute inset-0 w-full h-full flex flex-col"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              {/* Header with References - Fixed */}
              <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-3 flex-shrink-0">
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
              <div className="flex-1 overflow-y-auto px-4">
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
                        onPageClick={() => {
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

              {/* Accept Button - Fixed */}
              <div className="px-4 py-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => onApply(snippet, false)}
                    className="px-6 py-2.5 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors flex items-center justify-center gap-2 text-red-700"
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
        <div className="flex items-center gap-3 flex-1">
          {isAnalyzing ? (
            <AIAnalyzingAnimation message="Analyzing documents..." size="sm" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-black font-medium">
                  {searchQuery ? `Results for "${searchQuery}"` : 'AI Auto Fill'}
                </span>
                <span className="bg-white/20 text-red-600 text-xs px-2 py-1 rounded font-semibold">
                  {snippets.length} {snippets.length === 1 ? 'snippet' : 'snippets'} fetched
                </span>
              </div>
              
              {/* Navigation Controls */}
              {snippets.length > 1 && (
                <div className="flex items-center ml-auto gap-2 mr-2">
                  <button
                    onClick={handlePrevious}
                    className="text-black hover:bg-white/20 rounded p-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous snippet"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-black text-sm font-medium px-2">
                    {currentIndex + 1} / {snippets.length}
                  </span>
                  <button
                    onClick={handleNext}
                    className="text-black hover:bg-white/20 rounded p-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next snippet"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
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

      {/* Snippet Carousel - Shows one snippet at a time */}
      <div 
        ref={snippetsContainerRef}
        className="flex-1 overflow-y-auto p-3" 
        style={{ maxHeight: 'calc(100vh - 250px)' }}
      >
        {currentSnippet && (
          <ScrollableSnippet key={currentSnippet.id} snippet={currentSnippet} index={0} />
        )}
      </div>
    </div>
  );
}