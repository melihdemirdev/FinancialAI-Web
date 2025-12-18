'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#10B981', '#EF4444']; // Yeşil (Varlık) - Kırmızı (Borç)

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; 

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={14} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function FinancialCharts() {
  const { getTotalAssets, getTotalLiabilities } = useFinanceStore();

  const data = useMemo(() => {
    const assets = getTotalAssets();
    const liabilities = getTotalLiabilities();
    
    // Eğer ikisi de 0 ise grafik gösterme
    if (assets === 0 && liabilities === 0) return [];

    return [
      { name: 'Varlıklar', value: assets },
      { name: 'Borçlar', value: liabilities },
    ];
  }, []);

  if (data.length === 0) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-8"
    >
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Genel Finansal Dengesi</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
          Varlıklarınız ve Borçlarınızın oransal dağılımı
        </p>
        
        <div className="h-72 w-full max-w-md">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    strokeWidth={2} 
                    stroke="#fff" 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  padding: '12px'
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}