import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export function AIFillHelp() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors"
        title="How to use AI Fill Mode"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 w-96 max-h-[80vh] overflow-y-auto">
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-4 flex items-center justify-between rounded-t-xl">
        <h3 className="text-white">How to Use AI Fill Mode</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 rounded p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 py-4 space-y-6">
        {/* Flow 1 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              1
            </div>
            <h4 className="text-sm font-medium text-gray-900">Search → AI Summary → Apply</h4>
          </div>
          <ol className="text-sm text-gray-600 space-y-1 ml-8 list-decimal">
            <li>Type keywords in the global search bar</li>
            <li>AI Summary cards appear showing field-by-field information</li>
            <li>Click on any card to flip and view PDF reference</li>
            <li>Click "APPLY TO X FIELDS" to fill form</li>
          </ol>
        </div>

        {/* Flow 2 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <h4 className="text-sm font-medium text-gray-900">Ghost Text Preview</h4>
          </div>
          <ol className="text-sm text-gray-600 space-y-1 ml-8 list-decimal">
            <li>After applying, fields show 👻 ghost text</li>
            <li>Hover over ghost text to see source</li>
            <li>Source tooltip shows PDF page and snippet</li>
            <li>Type to replace ghost text with your own</li>
          </ol>
        </div>

        {/* Flow 3 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              3
            </div>
            <h4 className="text-sm font-medium text-gray-900">Toggle AI Mode On/Off</h4>
          </div>
          <ol className="text-sm text-gray-600 space-y-1 ml-8 list-decimal">
            <li>Use "AI Fill" toggle in header</li>
            <li>ON: Split-pane with document viewer</li>
            <li>OFF: Original single-pane form</li>
            <li>Use "Clear All" to reset ghost values</li>
          </ol>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-900 font-medium mb-1">💡 Pro Tip</p>
          <p className="text-xs text-blue-700">
            The AI Summary shows field-by-field information first. Click on any card to flip and view the PDF reference with highlighted evidence.
          </p>
        </div>
      </div>
    </div>
  );
}
