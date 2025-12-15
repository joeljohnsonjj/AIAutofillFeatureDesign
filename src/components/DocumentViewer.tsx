import React, { useState } from 'react';
import { FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import type { Document } from './DocumentSelector';

interface DocumentViewerProps {
  document: Document | null;
  highlightedSection?: {
    page: number;
    segment: string;
  } | null;
}

export function DocumentViewer({ document, highlightedSection }: DocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Sample PDF content - in a real app, this would be rendered from actual PDF
  const renderPDFContent = () => {
    if (!document) return null;

    // Generate sample pages based on document totalPages
    const pages = [];
    for (let i = 1; i <= document.totalPages; i++) {
      pages.push(
        <div
          key={i}
          className={`mb-4 bg-white border border-gray-300 shadow-inner rounded overflow-hidden ${
            i === currentPage ? 'ring-2 ring-purple-500' : ''
          }`}
          style={{ display: i === currentPage ? 'block' : 'none' }}
        >
          <div
            className="bg-gray-50 p-6 font-serif text-sm leading-relaxed text-gray-800"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top left',
              width: `${100 / (zoomLevel / 100)}%`,
            }}
          >
            {/* Page number indicator */}
            <div className="flex justify-end mb-4">
              <span className="text-xs text-gray-400">- {i} -</span>
            </div>

            {/* Document content */}
            <div className="whitespace-pre-line">
              {i === highlightedSection?.page && highlightedSection ? (
                <div>
                  <p className="mb-3">
                    This is page {i} of the document "{document.name}".
                  </p>
                  <div className="bg-yellow-200 border-l-4 border-yellow-500 pl-4 py-2 my-4">
                    <p className="font-semibold text-gray-900 mb-1">Highlighted Section:</p>
                    <p className="text-gray-800">"{highlightedSection.segment}"</p>
                  </div>
                  <p className="mb-3">
                    This is a sample document page. In a real implementation, this would show the
                    actual PDF content rendered from the uploaded document file.
                  </p>
                  <p className="mb-3">
                    The document contains {document.totalPages} pages total, covering various
                    sections of the agreement including maintenance responsibilities, billing
                    terms, and legal provisions.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="mb-3">
                    This is page {i} of the document "{document.name}".
                  </p>
                  <p className="mb-3">
                    This is a sample document page. In a real implementation, this would show the
                    actual PDF content rendered from the uploaded document file.
                  </p>
                  <p className="mb-3">
                    The document contains {document.totalPages} pages total, covering various
                    sections of the agreement including maintenance responsibilities, billing
                    terms, and legal provisions.
                  </p>
                  {i === 1 && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-900">
                        <strong>Note:</strong> This is a placeholder view. In production, this would
                        display the actual PDF content using a PDF rendering library like PDF.js or
                        react-pdf.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    return pages;
  };

  const handlePreviousPage = () => {
    if (document && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (document && currentPage < document.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    if (zoomLevel < 200) {
      setZoomLevel(Math.min(zoomLevel + 10, 200));
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 50) {
      setZoomLevel(Math.max(zoomLevel - 10, 50));
    }
  };

  // Jump to highlighted page if available
  React.useEffect(() => {
    if (highlightedSection && document) {
      setCurrentPage(highlightedSection.page);
    }
  }, [highlightedSection, document]);

  if (!document) {
    return (
      <div className="h-full flex flex-col bg-gray-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">PDF Document Viewer</p>
            <p className="text-sm text-gray-500">Select a document to view</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* PDF Viewer Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto">{renderPDFContent()}</div>
      </div>

      {/* PDF Navigation Controls */}
      <div className="bg-white border-t border-gray-300 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {document.totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === document.totalPages}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 50}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ZoomOut className="w-4 h-4" />
            Zoom Out
          </button>
          <span className="text-sm text-gray-600 min-w-[60px] text-center">{zoomLevel}%</span>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 200}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ZoomIn className="w-4 h-4" />
            Zoom In
          </button>
        </div>
      </div>
    </div>
  );
}
