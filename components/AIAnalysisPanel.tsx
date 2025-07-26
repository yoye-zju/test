import React from 'react';
import { SparklesIcon, WarningIcon } from './Icons';

interface AIAnalysisPanelProps {
    analysis: string | null;
    isLoading: boolean;
    error: string | null;
}

const SimpleMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    return (
        <div className="prose prose-sm prose-slate max-w-none text-slate-700 space-y-3 text-left w-full">
            {text.split('\n').map((line, index) => {
                if (line.trim() === '') return <div key={index} className="h-2"></div>;

                // Headers (e.g., **Fit Quality:**)
                if (line.match(/\*\*(.*?):\*\*/)) {
                    return <h4 key={index} className="font-semibold text-slate-800" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '$1') }}></h4>;
                }

                // Bullet points
                if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                    return <p key={index} className="flex"><span className="mr-2 mt-1.5 text-slate-500">•</span><span>{line.substring(2)}</span></p>;
                }
                
                 if (line.match(/^\d+\.\s/)) {
                     return <p key={index} className="flex"><span className="mr-2 mt-1.5 text-slate-500">{line.match(/^\d+\./)![0]}</span><span>{line.substring(line.indexOf(' ')+1)}</span></p>;
                }

                return <p key={index}>{line}</p>;
            })}
        </div>
    );
}


export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ analysis, isLoading, error }) => {
    if (!analysis && !isLoading && !error) {
        return null; // Don't render anything if there's no activity
    }

    return (
        <div className="space-y-4 pt-4 border-t">
            <h3 className="text-xl font-semibold text-slate-700 flex items-center">
                <SparklesIcon className="w-6 h-6 mr-2 text-blue-600" />
                AI Analysis
            </h3>
            <div className="p-4 bg-slate-50 rounded-lg min-h-[100px] flex items-center justify-center">
                {isLoading && (
                    <div className="text-center text-slate-600">
                        <svg className="animate-spin mx-auto h-6 w-6 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="font-semibold">AI is analyzing the results...</p>
                        <p className="text-sm">This may take a few seconds.</p>
                    </div>
                )}
                {error && (
                     <div className="flex items-start text-red-700">
                        <WarningIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-bold">Analysis Failed</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}
                {analysis && !isLoading && !error && (
                    <SimpleMarkdownRenderer text={analysis} />
                )}
            </div>
        </div>
    );
};
