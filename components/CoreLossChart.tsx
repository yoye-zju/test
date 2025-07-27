import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Scatter,
  ComposedChart
} from 'recharts';
import { ChartData } from '../types';

interface CoreLossChartProps {
  data: ChartData[];
}

const COLORS = ['#1e40af', '#166534', '#b45309', '#991b1b', '#581c87', '#164e63'];

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/80 backdrop-blur-sm p-3 border border-slate-300 rounded-md shadow-lg">
          <p className="font-bold text-slate-700">{`B_ac: ${data.bac.toFixed(3)} T`}</p>
          <p className="text-sm text-slate-600">{`Frequency: ${data.fs} kHz`}</p>
          <hr className="my-1"/>
          <p className="text-sm text-blue-600">{`Measured Loss: ${data.coreloss.toFixed(2)} mW/cm³`}</p>
          <p className="text-sm text-green-600">{`Fitted Loss: ${data.predicted_coreloss.toFixed(2)} mW/cm³`}</p>
        </div>
      );
    }
  
    return null;
  };

export const CoreLossChart: React.FC<CoreLossChartProps> = ({ data }) => {
  const groupedData = useMemo(() => {
    return data.reduce((acc, point) => {
      const key = point.fs;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(point);
      // Sort by bac for correct line drawing
      acc[key].sort((a,b) => a.bac - b.bac);
      return acc;
    }, {} as Record<number, ChartData[]>);
  }, [data]);

  const fsValues = useMemo(() => Object.keys(groupedData).map(Number).sort((a, b) => a - b), [groupedData]);

  const xTicks = useMemo(() => {
    const ticks = [];
    // Generates ticks [0.01, 0.02, ..., 0.09] to increase grid density
    for (let i = 1; i <= 9; i++) {
        ticks.push(Number((0.01 * i).toFixed(2)));
    }
    ticks.push(0.1);
    ticks.push(0.2);
    return ticks;
  }, []);

  const yTicks = useMemo(() => {
    // Provide more granular ticks suitable for a log scale
    return [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 1500];
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="bac"
          type="number"
          name="Magnetic Flux Density (Bac)"
          scale="log"
          domain={[0.01, 0.2]}
          ticks={xTicks}
          tickFormatter={(tick) => String(tick)}
          label={{ value: 'Bac (T)', offset: 0, dy: 20 }}
          allowDataOverflow={true}
        />
        <YAxis
          dataKey="coreloss"
          name="Core Loss"
          scale="log"
          domain={[1, 1500]}
          ticks={yTicks}
          tickFormatter={(tick) => tick.toString()}
          label={{ value: 'Core Loss (mW/cm³)', angle: -90, position: 'insideLeft', dx: -20 }}
          allowDataOverflow={true}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" wrapperStyle={{ paddingTop: 20 }} />
        {fsValues.map((fs, index) => {
          const color = COLORS[index % COLORS.length];
          return (
            <React.Fragment key={fs}>
              <Scatter
                name={`Measured Data (${fs} kHz)`}
                data={groupedData[fs]}
                fill={color}
              />
              <Line
                name={`Fitted Curve (${fs} kHz)`}
                data={groupedData[fs]}
                dataKey="predicted_coreloss"
                stroke={color}
                strokeWidth={2}
                dot={false}
                type="monotone"
              />
            </React.Fragment>
          );
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
};