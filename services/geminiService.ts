import { GoogleGenAI } from "@google/genai";
import { FitResult, DataPoint } from '../types';

const generatePrompt = (result: FitResult, data: DataPoint[]): string => {
    const { k, a, b, rSquared, adjustedRSquared, rmse } = result;

    const bacValues = data.map(p => p.bac);
    const fsValues = data.map(p => p.fs);

    const minBac = Math.min(...bacValues);
    const maxBac = Math.max(...bacValues);
    const minFs = Math.min(...fsValues);
    const maxFs = Math.max(...fsValues);

    return `
You are an expert in power electronics and magnetic materials.
A user has fitted their core loss measurement data to the Steinmetz equation: coreloss = k * bac^a * fs^b.

Here are the results of the fit:
- Steinmetz constant (k): ${k.toExponential(4)}
- Flux density exponent (a): ${a.toFixed(4)}
- Frequency exponent (b): ${b.toFixed(4)}
- R-squared: ${rSquared.toFixed(5)}
- Adjusted R-squared: ${adjustedRSquared.toFixed(5)}
- RMSE (on log scale): ${rmse.toFixed(5)}

The analysis was based on ${data.length} data points, with:
- Flux density (Bac) ranging from ${minBac.toFixed(3)} to ${maxBac.toFixed(3)} T.
- Frequency (fs) ranging from ${minFs} to ${maxFs} kHz.

Please provide a concise and insightful analysis for a practicing engineer. Structure your response in markdown with the following sections using bold headers (e.g., **Fit Quality:**):
1.  **Fit Quality:** Comment on how well the model fits the data using R² and other metrics. Is this a good fit?
2.  **Parameter Interpretation:** Explain the physical meaning of the calculated parameters k, a, and b. Comment on whether 'a' and 'b' are within their typical ranges for ferrite materials (usually between 1.1 and 3.9). What might it mean if they are outside this range?
3.  **Practical Implications & Recommendations:** What can the user do with these results? Are there any warnings or next steps you would recommend based on the data? For example, if R² is low, suggest potential reasons.
`;
};

export const getAIAnalysis = async (result: FitResult, data: DataPoint[], apiKey: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("Gemini API key is not provided. Please enter your key.");
    }
    if (!result || !data || data.length === 0) {
        throw new Error("Invalid data provided for AI analysis.");
    }
    
    let ai: GoogleGenAI;
    try {
        ai = new GoogleGenAI({ apiKey });
    } catch (error) {
        console.error("Failed to initialize GoogleGenAI:", error);
        throw new Error("Failed to initialize the AI client. The API key might be malformed.");
    }

    const prompt = generatePrompt(result, data);

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            // Check for more specific error messages from the Gemini API
            if (error.message.includes('API key not valid') || error.message.includes('permission denied')) {
                throw new Error('The provided API Key is not valid. Please check your key and permissions.');
            }
            if (error.message.includes('quota')) {
                throw new Error('You have exceeded your API quota. Please check your billing status or try again later.');
            }
        }
        throw new Error('An unexpected error occurred while communicating with the AI.');
    }
};