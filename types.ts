
export interface DataPoint {
  coreloss: number;
  bac: number;
  fs: number;
}

export interface FitResult {
  k: number;
  a: number;
  b: number;
  rSquared: number;
  adjustedRSquared: number;
  rmse: number;
  mae: number;
}

export interface ChartData extends DataPoint {
  predicted_coreloss: number;
}
