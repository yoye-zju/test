
import React from 'react';
import { InfoIcon } from './Icons';

// A self-contained SVG to visually represent the CSV data structure
const CsvExampleSvg = () => (
    <svg width="350" height="150" viewBox="0 0 350 150" xmlns="http://www.w3.org/2000/svg" className="rounded-lg bg-white shadow-md overflow-hidden mx-auto border border-slate-300">
        <defs>
            <style>
                {`.header { font: bold 13px sans-serif; fill: #334155; }
                .cell { font: 12px sans-serif; fill: #475569; }
                .grid-line { stroke: #e2e8f0; stroke-width: 1; }`}
            </style>
        </defs>

        {/* Background and Grid */}
        <rect width="100%" height="100%" fill="#f8fafc" />
        <line x1="160" y1="0" x2="160" y2="150" className="grid-line" />
        <line x1="255" y1="0" x2="255" y2="150" className="grid-line" />
        <line x1="0" y1="35" x2="350" y2="35" className="grid-line" />
        <line x1="0" y1="70" x2="350" y2="70" className="grid-line" />
        <line x1="0" y1="105" x2="350" y2="105" className="grid-line" />
        
        {/* Headers */}
        <text x="10" y="22" className="header">coreloss</text>
        <text x="170" y="22" className="header">bac</text>
        <text x="265" y="22" className="header">fs</text>

        {/* Row 1 */}
        <text x="10" y="57" className="cell">5</text>
        <text x="170" y="57" className="cell">0.02</text>
        <text x="265" y="57" className="cell">500</text>

        {/* Row 2 */}
        <text x="10" y="92" className="cell">18</text>
        <text x="170" y="92" className="cell">0.03</text>
        <text x="265" y="92" className="cell">500</text>
        
        {/* Row 3 */}
        <text x="10" y="127" className="cell">45</text>
        <text x="170" y="127" className="cell">0.04</text>
        <text x="265" y="127" className="cell">500</text>
    </svg>
);


export const AppRequirements: React.FC = () => {
    return (
        <div className="text-left max-w-3xl mx-auto text-slate-700 space-y-8 px-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 border-b pb-2 mb-4">
                    Application Overview
                </h2>
                <p>
                    This tool is designed to help engineers and researchers analyze the core loss characteristics of magnetic materials. It takes empirical measurement data and fits it to the <strong>Steinmetz Equation</strong>, a standard model used in magnetics.
                </p>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-800 border-b pb-2 mb-4">
                    How to Use
                </h2>
                <ol className="list-decimal list-inside space-y-3">
                    <li>
                        <strong>Prepare Your Data:</strong> Ensure your measurement data is in a CSV file and formatted according to the requirements below. Pay close attention to the required units.
                    </li>
                    <li>
                        <strong>Upload CSV File:</strong> Click the "Upload CSV" button and select your file. The app will validate the headers and data types.
                    </li>
                    <li>
                        <strong>Calculate Fit:</strong> Once the data is loaded successfully, click the "Calculate Fit" button to perform the curve fitting.
                    </li>
                    <li>
                        <strong>Analyze Results:</strong> Review the calculated Steinmetz parameters (k, a, b), goodness-of-fit metrics, and the interactive chart comparing your data to the fitted model.
                    </li>
                </ol>
            </div>

            <div className="p-6 bg-slate-200/60 rounded-lg border border-slate-300">
                 <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-300 pb-2 mb-4">
                    Data Format Requirements
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold text-lg mb-2 text-slate-800">CSV File Rules</h3>
                         <ul className="list-disc list-inside space-y-2">
                            <li>The file must contain a header row.</li>
                            <li>Column names must <strong>start with</strong> 'coreloss', 'bac', and 'fs' (case-insensitive).</li>
                            <li>All data values must be positive numbers.</li>
                            <li>A minimum of <strong>3 data rows</strong> is required for calculation.</li>
                        </ul>
                        
                        <h3 className="font-semibold text-lg mt-6 mb-3 text-slate-800">Required Units (Crucial)</h3>
                        <p className="mb-3">The accuracy of the results depends entirely on using the correct input units:</p>
                        <ul className="list-none space-y-2 bg-white p-3 rounded-md border border-slate-300">
                            <li className="flex items-center"><span className="font-mono bg-slate-200 px-2 py-1 rounded w-28 text-center mr-3">coreloss</span> <span>in</span> <strong className="ml-2">mW/cm³</strong></li>
                            <li className="flex items-center"><span className="font-mono bg-slate-200 px-2 py-1 rounded w-28 text-center mr-3">bac</span> <span>in</span> <strong className="ml-2">T (Tesla)</strong></li>
                            <li className="flex items-center"><span className="font-mono bg-slate-200 px-2 py-1 rounded w-28 text-center mr-3">fs</span> <span>in</span> <strong className="ml-2">kHz (kilohertz)</strong></li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg mb-2 text-slate-800">Example CSV Structure</h3>
                        <CsvExampleSvg />
                         <p className="text-xs text-slate-500 mt-2 text-center">Note: The units shown in the example header are for illustration only.</p>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-800 border-b pb-2 mb-4">
                    Understanding the Output
                </h2>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>Parameters (k, a, b):</strong> These are the coefficients of the Steinmetz equation derived from your data. The panel includes warnings if 'a' or 'b' fall outside their typical physical range.</li>
                    <li><strong>Goodness of Fit:</strong> Metrics like R² and RMSE tell you how well the model matches your data. Higher R² and lower RMSE are better.</li>
                    <li><strong>Interactive Chart:</strong> This visualizes your original data points against the calculated curves for each frequency, allowing for an easy visual assessment of the fit quality.</li>
                    <li><strong>Tooltips:</strong> Hover over the <InfoIcon className="w-4 h-4 inline-block -mt-1"/> icon next to each result for a detailed explanation.</li>
                </ul>
            </div>
        </div>
    );
};
