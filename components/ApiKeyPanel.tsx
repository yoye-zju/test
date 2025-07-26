import React, { useState, useEffect } from 'react';
import { KeyIcon, SaveIcon } from './Icons';

interface ApiKeyPanelProps {
  apiKey: string;
  onApiKeySave: (key: string) => void;
}

export const ApiKeyPanel: React.FC<ApiKeyPanelProps> = ({ apiKey, onApiKeySave }) => {
  const [localKey, setLocalKey] = useState(apiKey);

  useEffect(() => {
    setLocalKey(apiKey);
  }, [apiKey]);

  const handleSaveClick = () => {
    onApiKeySave(localKey);
  };

  return (
    <div className="space-y-4 pb-4 border-b">
      <h2 className="text-xl font-semibold text-slate-700 flex items-center">
        <KeyIcon className="w-5 h-5 mr-2 text-slate-500" />
        Gemini API Key
      </h2>
      <p className="text-xs text-slate-500">
        To use the AI Analysis feature, you need a Google Gemini API key. 
        <a 
          href="https://ai.google.dev/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:underline ml-1"
        >
          Get a key here.
        </a>
      </p>
      <div className="flex items-center gap-2">
        <input
          type="password"
          value={localKey}
          onChange={(e) => setLocalKey(e.target.value)}
          placeholder="Enter your API key..."
          className="flex-grow w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Gemini API Key"
        />
        <button
          onClick={handleSaveClick}
          className="inline-flex items-center justify-center px-3 py-2 bg-slate-600 text-white rounded-md shadow-sm font-semibold text-sm transition-colors duration-200 hover:bg-slate-700 disabled:bg-slate-300"
          aria-label="Save API Key"
          title="Save API Key"
        >
          <SaveIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
