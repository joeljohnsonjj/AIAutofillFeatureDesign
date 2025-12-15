import React from 'react';

interface GhostFormFieldProps {
  id: string;
  label: string;
  value: string;
  ghostValue?: string;
  placeholder: string;
  isTextarea?: boolean;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onHover?: (hovering: boolean) => void;
  onAcceptGhost?: (fieldId: string) => void;
  onFieldSearch?: (fieldId: string, value: string) => void;
  hasAISuggestion?: boolean;
  sourceInfo?: {
    page: number;
    snippet: string;
  };
}

export function GhostFormField({
  id,
  label,
  value,
  ghostValue,
  placeholder,
  isTextarea = false,
  onChange,
  onFocus,
  onBlur,
  onHover,
  onAcceptGhost,
  onFieldSearch,
  hasAISuggestion = false,
  sourceInfo,
}: GhostFormFieldProps) {
  // Always show ghost value when it exists (even if field has text)
  // This allows preview to show even when fields have existing content
  const displayValue = ghostValue || value || '';
  const isGhosted = !!ghostValue;

  // Simplified - no hover tooltips or accept buttons needed
  // Ghost text is shown automatically when hovering over snippets

  const handleChange = (newValue: string) => {
    onChange(newValue);
    // Trigger reverse search when typing (even if less than 2 chars, to handle clearing fields)
    // This ensures we show all snippets when fields are cleared
    onFieldSearch?.(id, newValue);
  };

  const handleFocus = () => {
    onFocus?.();
    // When field is focused, trigger search to show all snippets if no fields have values
    // This ensures snippets are visible when user clicks on an empty field
    if (!value && !ghostValue) {
      onFieldSearch?.(id, '');
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm text-gray-700 mb-2 flex items-center gap-2">
        {label} <span className="text-red-500">*</span>
        {isGhosted && (
          <span className="text-xs text-purple-600 flex items-center gap-1">
            👻 Preview
          </span>
        )}
      </label>
      
      <div className="relative">
        {isTextarea ? (
          <textarea
            id={id}
            placeholder={placeholder}
            value={displayValue}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={onBlur}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all ${
              isGhosted
                ? 'border-purple-300 bg-purple-50 text-purple-700 italic'
                : 'border-gray-300 bg-white'
            }`}
          />
        ) : (
          <input
            id={id}
            type="text"
            placeholder={placeholder}
            value={displayValue}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={onBlur}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              isGhosted
                ? 'border-purple-300 bg-purple-50 text-purple-700 italic'
                : 'border-gray-300 bg-white'
            }`}
          />
        )}
      </div>
    </div>
  );
}