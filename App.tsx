import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DataPoint, FitResult, ChartData } from './types';
import { fitCoreLossData } from './services/fittingService';
import { getAIAnalysis } from './services/geminiService';
import { FileUploadIcon, ResetIcon, CalculatorIcon } from './components/Icons';
import { ResultsPanel } from './components/ResultsPanel';
import { CoreLossChart } from './components/CoreLossChart';
import { AppRequirements } from './components/AppRequirements';
import { AIAnalysisPanel } from './components/AIAnalysisPanel';
import { ApiKeyPanel } from './components/ApiKeyPanel';
import toast from 'react-hot-toast';

// @ts-ignore
import Papa from 'papaparse';

const App: React.FC = () => {
    const [originalData, setOriginalData] = useState<DataPoint[] | null>(null);
    const [chartData, setChartData] = useState<ChartData[] | null>(null);
    const [fitResult, setFitResult] = useState<FitResult | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState<string>('');

    // New states for AI analysis
    const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);

    useEffect(() => {
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
            setApiKey(savedKey);
        }
    }, []);

    const handleApiKeySave = (newKey: string) => {
        const trimmedKey = newKey.trim();
        setApiKey(trimmedKey);
        localStorage.setItem('gemini_api_key', trimmedKey);
        toast.success('API Key saved successfully!');
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        handleReset();
        setFileName(file.name);
        setIsLoading(true);
        setError(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    console.error("Parsing errors:", results.errors);
                    setError(`Error parsing CSV: ${results.errors[0].message}`);
                    toast.error('Failed to parse CSV file.');
                    setIsLoading(false);
                    return;
                }
                
                const headers = results.meta.fields;
                const requiredFields = ['coreloss', 'bac', 'fs'];
                const headerMapping: { [key: string]: string } = {};
                const missingFields: string[] = [];

                if (!headers) {
                    setError('CSV parsing failed to detect headers.');
                    toast.error('Could not read CSV headers.');
                    setIsLoading(false);
                    return;
                }
                
                requiredFields.forEach(field => {
                    const foundHeader = headers.find(h => h.toLowerCase().trim().startsWith(field));
                    if (foundHeader) {
                        headerMapping[field] = foundHeader;
                    } else {
                        missingFields.push(field);
                    }
                });

                if (missingFields.length > 0) {
                    setError(`CSV must contain columns starting with: ${missingFields.join(', ')}.`);
                    toast.error('Invalid CSV headers.');
                    setIsLoading(false);
                    return;
                }

                const parsedData = (results.data as any[])
                    .map((row, index) => {
                        const coreloss = parseFloat(row[headerMapping['coreloss']]);
                        const bac = parseFloat(row[headerMapping['bac']]);
                        const fs = parseFloat(row[headerMapping['fs']]);

                        if (isNaN(coreloss) || isNaN(bac) || isNaN(fs) || coreloss <= 0 || bac <= 0 || fs <= 0) {
                            toast.error(`Skipping invalid data on row ${index + 2}. Values must be positive numbers.`);
                            return null;
                        }
                        return { coreloss, bac, fs };
                    })
                    .filter((p): p is DataPoint => p !== null);

                if (parsedData.length < 3) {
                    setError('Not enough valid data points in the CSV. Need at least 3 rows with positive numeric values.');
                    toast.error('Insufficient valid data in file.');
                    setOriginalData(null);
                } else {
                    setOriginalData(parsedData);
                    toast.success(`${parsedData.length} data points loaded successfully.`);
                }
                setIsLoading(false);
            },
            error: (err) => {
                setError(`File read error: ${err.message}`);
                toast.error('Could not read the file.');
                setIsLoading(false);
            }
        });
        event.target.value = ''; // Reset file input
    };

    const handleCalculate = useCallback(() => {
        if (!originalData) {
            toast.error('Please upload data first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAiAnalysis(null);
        setAiError(null);

        setTimeout(() => { // Simulate processing time for better UX
            const result = fitCoreLossData(originalData);
            if (result) {
                setFitResult(result);
                const newChartData = originalData.map(p => ({
                    ...p,
                    predicted_coreloss: result.k * Math.pow(p.bac, result.a) * Math.pow(p.fs, result.b)
                }));
                setChartData(newChartData);
                toast.success('Fitting complete!');
            } else {
                setError('Calculation failed. The data may be unsuitable for this fitting model (e.g., all points are collinear).');
                toast.error('Fitting calculation failed.');
                setFitResult(null);
                setChartData(null);
            }
            setIsLoading(false);
        }, 500);
    }, [originalData]);

    const handleReset = useCallback(() => {
        setOriginalData(null);
        setChartData(null);
        setFitResult(null);
        setFileName('');
        setError(null);
        setIsLoading(false);
        // Reset AI states as well
        setAiAnalysis(null);
        setAiError(null);
        setIsAiLoading(false);
    }, []);

    const handleAiAnalysis = useCallback(async () => {
        if (!apiKey) {
            toast.error("Please enter and save your Gemini API Key to use this feature.");
            return;
        }
        if (!fitResult || !originalData) {
            toast.error("Cannot perform analysis without valid fit results.");
            return;
        }

        setIsAiLoading(true);
        setAiAnalysis(null);
        setAiError(null);
        toast('Sending data for AI analysis...', { icon: '🤖' });

        try {
            const analysis = await getAIAnalysis(fitResult, originalData, apiKey);
            setAiAnalysis(analysis);
            toast.success("AI analysis complete!");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setAiError(errorMessage);
            toast.error(`Analysis failed: ${errorMessage}`);
        } finally {
            setIsAiLoading(false);
        }
    }, [fitResult, originalData, apiKey]);
    
    const hasData = useMemo(() => originalData !== null && originalData.length > 0, [originalData]);

    return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-5xl font-bold text-slate-800 text-center">Core Loss Curve Fitter</h1>
                    <p className="text-center text-slate-600 mt-4">
                        Fit your magnetic material data to the Steinmetz equation: <span className="font-mono bg-slate-200 px-2 py-1 rounded">coreloss = k * bac<sup>a</sup> * fs<sup>b</sup></span>
                    </p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <aside className="lg:col-span-2 xl:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-lg space-y-6 sticky top-8">
                            <ApiKeyPanel apiKey={apiKey} onApiKeySave={handleApiKeySave} />

                            <h2 className="text-2xl font-semibold text-slate-700 border-b pb-2">Controls</h2>
                            <div>
                                <label htmlFor="file-upload" className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md shadow-sm cursor-pointer hover:bg-blue-700 transition-colors duration-200 font-semibold">
                                    <FileUploadIcon className="w-5 h-5 mr-2" />
                                    <span>Upload CSV</span>
                                </label>
                                <input id="file-upload" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                                {fileName && <p className="text-sm text-slate-500 mt-2 truncate">File: {fileName}</p>}
                            </div>

                            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                                <p className="font-bold">Error</p>
                                <p>{error}</p>
                            </div>}
                            
                            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                                <button
                                    onClick={handleCalculate}
                                    disabled={!hasData || isLoading}
                                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md shadow-sm font-semibold transition-all duration-200 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Calculating...
                                        </>
                                    ) : (
                                        <>
                                            <CalculatorIcon className="w-5 h-5 mr-2" />
                                            Calculate Fit
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-slate-500 text-white rounded-md shadow-sm font-semibold transition-colors duration-200 hover:bg-slate-600"
                                >
                                    <ResetIcon className="w-5 h-5 mr-2" />
                                    Reset
                                </button>
                            </div>

                            {fitResult && (
                                <>
                                    <ResultsPanel 
                                        result={fitResult} 
                                        onAnalyze={handleAiAnalysis}
                                        isAiLoading={isAiLoading}
                                    />
                                    <AIAnalysisPanel 
                                        analysis={aiAnalysis}
                                        isLoading={isAiLoading}
                                        error={aiError}
                                    />
                                </>
                            )}

                        </div>
                    </aside>

                    <section className="lg:col-span-3 xl:col-span-3 bg-white p-6 rounded-xl shadow-lg min-h-[60vh] flex flex-col justify-center items-center">
                       {chartData && fitResult ? (
                            <CoreLossChart data={chartData} />
                       ) : (
                            <div className="w-full py-8">
                                <AppRequirements className="mb-12" />
                            </div>
                       )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default App;