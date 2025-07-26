import React from 'react';
import { FitResult } from '../types';
import { WarningIcon, InfoIcon, SparklesIcon } from './Icons';

interface ResultsPanelProps {
    result: FitResult;
    onAnalyze: () => void;
    isAiLoading: boolean;
}

const tooltips = {
    k: "The proportionality constant in the Steinmetz equation. Dependent on material properties. Its value is derived assuming coreloss in mW/cm³, bac in T, and fs in kHz.",
    a: "The exponent for magnetic flux density (Bac). Typically between 1.1 and 3.9 for most ferrite materials.",
    b: "The exponent for frequency (fs). Typically between 1.1 and 3.9 for most ferrite materials.",
    rSquared: "R² (Coefficient of Determination): Indicates the proportion of variance in the data that is predictable from the model. Ranges from 0 to 1. A value of 1.0 indicates a perfect fit.",
    adjustedRSquared: "Adjusted R²: A modified version of R² adjusted for the number of predictors. It's more reliable for comparing models. A value of 1.0 indicates a perfect fit.",
    rmse: "RMSE (Root Mean Square Error): The standard deviation of the prediction errors (on the log-transformed scale). It measures the average magnitude of the error. A value of 0 indicates a perfect fit.",
    mae: "MAE (Mean Absolute Error): The average of the absolute prediction errors (on the log-transformed scale). Less sensitive to large outliers than RMSE. A value of 0 indicates a perfect fit."
};

/**
 * Formats a number to a specific number of significant digits, avoiding scientific notation.
 * @param num The number to format.
 * @param sig The number of significant digits.
 * @returns A string representing the formatted number.
 */
const formatToSignificantDigits = (num: number, sig: number): string => {
    if (num === 0) return '0';

    const d = Math.ceil(Math.log10(num < 0 ? -num : num));
    const power = sig - d;

    const magnitude = Math.pow(10, power);
    const shifted = Math.round(num * magnitude);
    const result = shifted / magnitude;

    // Use toFixed for numbers where precision is in the fractional part.
    // For large integers, it will correctly handle trailing zeros.
    if (power >= 0) {
        return result.toFixed(power);
    } else {
        // For large numbers, toString is sufficient as rounding has already happened.
        return result.toString();
    }
};

const ResultItem: React.FC<{ label: string; value: string; tooltip: string; isWarning?: boolean; bgClassName?: string; }> = ({ label, value, tooltip, isWarning = false, bgClassName = 'bg-slate-100' }) => (
    <div className={`flex justify-between items-center p-2 rounded-md ${isWarning ? 'bg-amber-100' : bgClassName}`}>
        <span className="font-semibold text-slate-600 flex items-center">
            {label}
            <span className="relative group ml-1.5">
                <InfoIcon className="w-4 h-4 text-slate-500 cursor-pointer" />
                <span className="absolute bottom-full mb-2 w-72 p-2 bg-slate-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 -translate-x-1/2 left-1/2 pointer-events-none">
                    {tooltip}
                </span>
            </span>
        </span>
        <span className={`font-mono text-lg ${isWarning ? 'text-amber-700 font-bold' : 'text-slate-800'}`}>{value}</span>
    </div>
);

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, onAnalyze, isAiLoading }) => {
    const { k, a, b, rSquared, adjustedRSquared, rmse, mae } = result;

    const isAOutOfRange = a < 1.1 || a > 3.9;
    const isBOutOfRange = b < 1.1 || b > 3.9;

    return (
        <div className="space-y-4 pt-4 border-t">
            <h3 className="text-xl font-semibold text-slate-700">Fitting Results</h3>
            
            <div>
                <h4 className="text-md font-semibold text-slate-600 pb-1 pt-2">Model Parameters</h4>
                <div className="space-y-2">
                    <ResultItem label="k" value={formatToSignificantDigits(k, 5)} tooltip={tooltips.k} />
                    <ResultItem label="a" value={a.toFixed(4)} tooltip={tooltips.a} isWarning={isAOutOfRange} />
                    <ResultItem label="b" value={b.toFixed(4)} tooltip={tooltips.b} isWarning={isBOutOfRange} />
                </div>
            </div>

            <div>
                <h4 className="text-md font-semibold text-slate-600 pb-1 pt-3">Goodness of Fit</h4>
                <div className="space-y-2">
                    <ResultItem label="R²" value={rSquared.toFixed(5)} tooltip={tooltips.rSquared} bgClassName="bg-slate-50" />
                    <ResultItem label="Adjusted R²" value={adjustedRSquared.toFixed(5)} tooltip={tooltips.adjustedRSquared} bgClassName="bg-slate-50" />
                    <ResultItem label="RMSE" value={rmse.toFixed(5)} tooltip={tooltips.rmse} bgClassName="bg-slate-50" />
                    <ResultItem label="MAE" value={mae.toFixed(5)} tooltip={tooltips.mae} bgClassName="bg-slate-50" />
                </div>
            </div>

            {(isAOutOfRange || isBOutOfRange) && (
                <div className="flex items-start p-3 bg-amber-100 border-l-4 border-amber-500 text-amber-800 rounded mt-4">
                    <WarningIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-bold">Coefficient Warning</p>
                        <p className="text-sm">
                            Parameters 'a' and/or 'b' are outside the typical range of 1.1 to 3.9. The fit may be inaccurate or the data may not follow the Steinmetz model well.
                        </p>
                    </div>
                </div>
            )}
             <div className="pt-2">
                <button
                    onClick={onAnalyze}
                    disabled={isAiLoading}
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md shadow-sm font-semibold transition-all duration-200 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    {isAiLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            Analyze with AI
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};