import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AnalysisResult, HealthLevel, Ingredient, Language } from '../types';
import { AlertCircle, CheckCircle2, AlertTriangle, ChevronRight, ChevronDown, Activity, Heart, ChevronLeft, ScanLine } from 'lucide-react';

interface ResultsViewProps {
  data: AnalysisResult;
  onReset: () => void;
  isLiked: boolean;
  onToggleLike: () => void;
  language: Language;
}

const ResultsView: React.FC<ResultsViewProps> = ({ data, onReset, isLiked, onToggleLike, language }) => {
  const healthyCount = data.ingredients.filter(i => i.level === HealthLevel.HEALTHY).length;
  const moderateCount = data.ingredients.filter(i => i.level === HealthLevel.MODERATE).length;
  const concernCount = data.ingredients.filter(i => i.level === HealthLevel.CONCERN).length;

  const t = {
    healthy: language === 'zh' ? '健康' : 'Healthy',
    moderate: language === 'zh' ? '適量' : 'Moderate',
    concern: language === 'zh' ? '疑慮' : 'Concern',
    resultsTitle: language === 'zh' ? '分析結果' : 'Analysis Results',
    summary: language === 'zh' ? '分析摘要' : 'Analysis Summary',
    composition: language === 'zh' ? '成份組合' : 'Composition',
    healthConcerns: language === 'zh' ? '健康疑慮' : 'Health Concerns',
    moderateNeutral: language === 'zh' ? '適量 / 中性' : 'Moderate / Neutral',
    healthyIngredients: language === 'zh' ? '健康成份' : 'Healthy Ingredients',
    unknownOther: language === 'zh' ? '未知 / 其他' : 'Unknown / Other',
    scanAnother: language === 'zh' ? '掃描另一個產品' : 'Scan Another Product',
    healthImpact: language === 'zh' ? '健康影響' : 'Health Impact',
  };

  const chartData = [
    { name: t.healthy, value: healthyCount, color: '#74A84A' }, // quality-green
    { name: t.moderate, value: moderateCount, color: '#FBBF24' }, // quality-yellow
    { name: t.concern, value: concernCount, color: '#EF4444' }, // quality-red
  ].filter(d => d.value > 0);

  const categorizedIngredients = {
    [HealthLevel.CONCERN]: data.ingredients.filter(i => i.level === HealthLevel.CONCERN),
    [HealthLevel.MODERATE]: data.ingredients.filter(i => i.level === HealthLevel.MODERATE),
    [HealthLevel.HEALTHY]: data.ingredients.filter(i => i.level === HealthLevel.HEALTHY),
    [HealthLevel.UNKNOWN]: data.ingredients.filter(i => i.level === HealthLevel.UNKNOWN),
  };

  return (
    <div className="min-h-screen bg-earth-50 pb-20 font-sans">
      {/* Header */}
      <div className="bg-earth-50 sticky top-0 z-10 px-4 py-4 flex items-center justify-between">
        <button 
          onClick={onReset} 
          className="text-earth-900 p-2 hover:bg-earth-100 rounded-full transition-colors"
          aria-label="Back to home"
        >
           <ChevronLeft size={28} />
        </button>
        
        <h2 className="font-bold text-xl text-earth-900 truncate mx-2 flex-1 text-center">
          {data.productName || t.resultsTitle}
        </h2>
        
        <button 
          onClick={onToggleLike} 
          className="p-2 hover:bg-earth-100 rounded-full transition-colors"
          aria-label="Like product"
        >
           <Heart 
             size={28} 
             className={`transition-colors duration-200 ${isLiked ? "fill-quality-red text-quality-red" : "text-earth-300"}`} 
           />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Card */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-earth-100/50">
            <h3 className="font-bold text-earth-900 mb-3 flex items-center gap-2 text-lg">
              <Activity size={20} className="text-primary"/>
              {t.summary}
            </h3>
            <p className="text-earth-800 text-sm leading-relaxed opacity-80">{data.summary}</p>
        </div>

        {/* Breakdown Chart */}
        <div className="bg-white rounded-3xl shadow-sm p-6 border border-earth-100/50">
          <h3 className="font-bold text-earth-900 mb-4 text-lg">{t.composition}</h3>
          <div className="h-52 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#fff', color: '#5C5446' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {chartData.map((d) => (
               <div key={d.name} className="flex items-center gap-2 text-xs font-semibold text-earth-800 uppercase tracking-wide">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                  {d.name} ({d.value})
               </div>
            ))}
          </div>
        </div>

        {/* Detailed Lists */}
        <div className="space-y-4">
           {categorizedIngredients[HealthLevel.CONCERN].length > 0 && (
             <CategorySection 
               title={t.healthConcerns}
               icon={<AlertTriangle size={20} className="text-quality-red" />}
               items={categorizedIngredients[HealthLevel.CONCERN]}
               colorClass="bg-red-50/50 border-red-100"
               badgeClass="bg-quality-red text-white"
               healthImpactLabel={t.healthImpact}
             />
           )}
           
           {categorizedIngredients[HealthLevel.MODERATE].length > 0 && (
             <CategorySection 
               title={t.moderateNeutral}
               icon={<AlertCircle size={20} className="text-quality-yellow" />}
               items={categorizedIngredients[HealthLevel.MODERATE]}
               colorClass="bg-yellow-50/50 border-yellow-100"
               badgeClass="bg-quality-yellow text-white"
               healthImpactLabel={t.healthImpact}
             />
           )}

           {categorizedIngredients[HealthLevel.HEALTHY].length > 0 && (
             <CategorySection 
               title={t.healthyIngredients}
               icon={<CheckCircle2 size={20} className="text-quality-green" />}
               items={categorizedIngredients[HealthLevel.HEALTHY]}
               colorClass="bg-green-50/50 border-green-100"
               badgeClass="bg-quality-green text-white"
               healthImpactLabel={t.healthImpact}
             />
           )}

            {categorizedIngredients[HealthLevel.UNKNOWN].length > 0 && (
             <CategorySection 
               title={t.unknownOther}
               icon={<AlertCircle size={20} className="text-earth-300" />}
               items={categorizedIngredients[HealthLevel.UNKNOWN]}
               colorClass="bg-earth-100/50 border-earth-200"
               badgeClass="bg-earth-300 text-white"
               healthImpactLabel={t.healthImpact}
             />
           )}
        </div>

        {/* Bottom Action Button */}
        <div className="pt-6 pb-4">
           <button 
             onClick={onReset}
             className="w-full bg-primary hover:bg-primary-hover active:scale-[0.98] transition-all text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 text-lg"
           >
             <ScanLine size={24} />
             {t.scanAnother}
           </button>
        </div>
      </div>
    </div>
  );
};

interface CategorySectionProps {
  title: string;
  icon: React.ReactNode;
  items: Ingredient[];
  colorClass: string;
  badgeClass: string;
  healthImpactLabel: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({ title, icon, items, colorClass, badgeClass, healthImpactLabel }) => {
   const [expanded, setExpanded] = useState(true);

   return (
     <div className={`rounded-2xl border overflow-hidden ${colorClass} transition-all duration-300`}>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-5"
        >
          <div className="flex items-center gap-3 font-bold text-earth-900 text-lg">
            {icon}
            {title}
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ml-1 ${badgeClass}`}>
              {items.length}
            </span>
          </div>
          <ChevronRight 
            size={24} 
            className={`text-earth-300 transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} 
          />
        </button>
        
        {expanded && (
          <div className="px-5 pb-5 space-y-3">
             {items.map((item, idx) => (
               <IngredientCard key={idx} item={item} healthImpactLabel={healthImpactLabel} />
             ))}
          </div>
        )}
     </div>
   );
}

const IngredientCard: React.FC<{ item: Ingredient; healthImpactLabel: string }> = ({ item, healthImpactLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasRisks = !!item.healthRisks && item.level === HealthLevel.CONCERN;

  if (!hasRisks) {
     return (
       <div className="bg-white/80 p-4 rounded-xl backdrop-blur-sm border border-white shadow-sm">
         <div className="font-bold text-earth-900 text-sm mb-1">{item.name}</div>
         <div className="text-xs text-earth-800/70 leading-relaxed font-medium">{item.reason}</div>
       </div>
     );
  }

  return (
    <div 
      className={`bg-white/80 rounded-xl backdrop-blur-sm transition-all duration-200 overflow-hidden border border-white shadow-sm ${isOpen ? 'ring-2 ring-quality-red/20 bg-white' : 'hover:bg-white cursor-pointer'}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
           <div className="flex-1 pr-3">
              <div className="font-bold text-earth-900 text-sm mb-1.5 flex items-center gap-2">
                {item.name}
                <Activity size={14} className="text-quality-red" />
              </div>
              <div className="text-xs text-earth-800/70 leading-relaxed font-medium">{item.reason}</div>
           </div>
           <ChevronDown size={20} className={`text-earth-300 flex-shrink-0 transition-transform mt-0.5 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      
      {isOpen && (
        <div className="px-4 pb-4 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="bg-red-50 text-red-900 text-xs p-3 rounded-lg border border-red-100 mt-1 flex gap-2 items-start">
             <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-quality-red" />
             <div>
                <span className="font-bold block mb-1 text-quality-red">{healthImpactLabel}:</span>
                <span className="leading-relaxed opacity-90">{item.healthRisks}</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsView;