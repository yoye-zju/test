
import { DataPoint, FitResult } from '../types';

declare const numeric: any;

export const fitCoreLossData = (data: DataPoint[]): FitResult | null => {
  if (!data || data.length < 3) {
    console.error("Fitting requires at least 3 data points.");
    return null;
  }

  try {
    // Transform data to linear form: log(coreloss) = log(k) + a*log(bac) + b*log(fs)
    // This is a multiple linear regression problem: Y = C + a*X1 + b*X2
    const y = data.map(p => Math.log(p.coreloss));
    const A = data.map(p => [1, Math.log(p.bac), Math.log(p.fs)]);

    // Check for singularity before attempting inverse
    if (numeric.det(numeric.dot(numeric.transpose(A), A)) === 0) {
        console.error("Singular matrix detected. The data might be collinear, which prevents a unique solution.");
        return null;
    }

    // Solve for coefficients x = [log(k), a, b] using the normal equation: x = (A^T * A)^-1 * A^T * y
    const AT = numeric.transpose(A);
    const ATA = numeric.dot(AT, A);
    const ATA_inv = numeric.inv(ATA);
    const ATy = numeric.dot(AT, y);
    const x = numeric.dot(ATA_inv, ATy);

    const logK = x[0];
    const a = x[1];
    const b = x[2];
    const k = Math.exp(logK);

    // --- Calculate goodness-of-fit metrics ---
    const n = data.length;
    const p = 2; // Number of predictors: log(bac), log(fs)
    
    const predicted_log_coreloss = numeric.dot(A, x);

    // Total Sum of Squares (SS_total)
    const y_mean = numeric.sum(y) / y.length;
    const ss_total = numeric.sum(y.map(val => Math.pow(val - y_mean, 2)));
    
    // Residual Sum of Squares (SS_residual)
    const residuals = y.map((val, i) => val - predicted_log_coreloss[i]);
    const ss_residual = numeric.sum(residuals.map(res => Math.pow(res, 2)));
    
    // R-squared
    const rSquared = 1 - (ss_residual / ss_total);

    // Adjusted R-squared
    const adjustedRSquared = 1 - (1 - rSquared) * (n - 1) / (n - p - 1);
    
    // Root Mean Squared Error (RMSE)
    const rmse = Math.sqrt(ss_residual / n);

    // Mean Absolute Error (MAE)
    const mae = numeric.sum(residuals.map(res => Math.abs(res))) / n;

    return { k, a, b, rSquared, adjustedRSquared, rmse, mae };

  } catch (error) {
    console.error("Matrix calculation failed during fitting:", error);
    return null;
  }
};
