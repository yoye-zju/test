
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
        <text x="10" y="22" className="header">coreloss (mW/cm³)</text>
        <text x="170" y="22" className="header">bac (T)</text>
        <text x="265" y="22" className="header">fs (kHz)</text>

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
                    应用概述
                </h2>
                <p>
                    本工具旨在帮助工程师和研究人员分析磁性材料的磁芯损耗特性。它将经验测量数据拟合到磁学中使用的标准模型——<strong>斯坦梅茨方程</strong>。
                </p>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-800 border-b pb-2 mb-4">
                    使用方法
                </h2>
                <ol className="list-decimal list-inside space-y-3">
                    <li>
                        <strong>准备数据：</strong> 确保您的测量数据是CSV文件，并按照以下要求格式化。请密切注意所需的单位。
                    </li>
                    <li>
                        <strong>上传CSV文件：</strong> 点击“上传CSV”按钮并选择您的文件。应用程序将验证标题和数据类型。
                    </li>
                    <li>
                        <strong>计算拟合：</strong> 数据成功加载后，点击“计算拟合”按钮执行曲线拟合。
                    </li>
                    <li>
                        <strong>分析结果：</strong> 查看计算出的斯坦梅茨参数（k、a、b）、拟合优度指标以及比较您的数据与拟合模型的交互式图表。
                    </li>
                </ol>
            </div>

            <div className="p-6 bg-slate-200/60 rounded-lg border border-slate-300">
                 <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-300 pb-2 mb-4">
                    数据格式要求
                </h2>
                <div className="grid md:grid-cols-1 gap-8">
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-semibold text-lg mb-2 text-slate-800">CSV 示例结构</h3>
                            <CsvExampleSvg />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2 text-slate-800">CSV 文件规则</h3>
                            <ul className="list-disc list-inside space-y-2">
                                <li>文件必须包含标题行。</li>
                                <li>列名必须<strong>以</strong> 'coreloss'、'bac' 和 'fs' 开头（不区分大小写）。</li>
                                <li>所有数据值必须是正数。</li>
                                <li>数据应当是25度时的损耗数据</li>
                                <li>计算至少需要<strong>9行数据，包括不同的Bac,fs</strong>。</li>
                            </ul>
                            
                            <h3 className="font-semibold text-lg mt-6 mb-3 text-slate-800">所需单位（关键）</h3>
                            <p className="mb-3">结果的准确性完全取决于使用正确的输入单位：</p>
                            <ul className="list-none space-y-2 bg-white p-3 rounded-md border border-slate-300">
                                <li className="flex items-center"><span className="font-mono bg-slate-200 px-2 py-1 rounded w-28 text-center mr-3">coreloss</span> <span>单位</span> <strong className="ml-2">mW/cm³</strong></li>
                                <li className="flex items-center"><span className="font-mono bg-slate-200 px-2 py-1 rounded w-28 text-center mr-3">bac</span> <span>单位</span> <strong className="ml-2">T (特斯拉)</strong></li>
                                <li className="flex items-center"><span className="font-mono bg-slate-200 px-2 py-1 rounded w-28 text-center mr-3">fs</span> <span>单位</span> <strong className="ml-2">kHz (千赫兹)</strong></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-800 border-b pb-2 mb-4">
                    理解输出
                </h2>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>参数 (k, a, b)：</strong> 这些是从您的数据中得出的斯坦梅茨方程的系数。如果 'a' 或 'b' 超出其典型的物理范围，面板会显示警告。</li>
                    <li><strong>拟合优度：</strong> R² 和 RMSE 等指标表明模型与您的数据匹配的程度。R² 越高，RMSE 越低越好。</li>
                    <li><strong>交互式图表：</strong> 这将您的原始数据点与每个频率的计算曲线进行可视化，以便轻松直观地评估拟合质量。</li>
                    <li><strong>工具提示：</strong> 将鼠标悬停在每个结果旁边的 <InfoIcon className="w-4 h-4 inline-block -mt-1"/> 图标上，可查看详细说明。</li>
                </ul>
            </div>
        </div>
    );
};
