import React, { useState, useEffect } from 'react';
import { ScanLine, Info, Activity, Heart, Clock, ChevronRight, Leaf } from 'lucide-react';
import CameraCapture from './components/CameraCapture';
import ResultsView from './components/ResultsView';
import { analyzeIngredients } from './services/geminiService';
import { AnalysisResult, AppState, Language } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  
  // History and Favorites State
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [favorites, setFavorites] = useState<AnalysisResult[]>([]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const t = {
    scanProduct: language === 'zh' ? '掃描成份列表' : 'Scan Ingredients List',
    checkIngredients: language === 'zh' ? '拍攝包裝上的成份文字' : 'Take a photo of the package text',
    recentScans: language === 'zh' ? '最近掃描' : 'Recent Scans',
    savedProducts: language === 'zh' ? '已儲存產品' : 'Saved Products',
    emptyFavorites: language === 'zh' ? '您喜歡的產品將顯示在此處' : 'Products you like will appear here',
    unknownProduct: language === 'zh' ? '未知產品' : 'Unknown Product',
    analyzing: language === 'zh' ? '分析中...' : 'Analyzing...',
    analyzingDesc: language === 'zh' ? '正在識別成份並檢查健康數據...' : 'Identifying ingredients and checking health data.',
    scanFailed: language === 'zh' ? '掃描失敗' : 'Scan Failed',
    tryAgain: language === 'zh' ? '重試' : 'Try Again',
    backToHome: language === 'zh' ? '返回首頁' : 'Back to Home',
  };

  const handleCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setAppState(AppState.ANALYZING);
    
    try {
      const result = await analyzeIngredients(imageData, language);
      
      // Enrich result with metadata
      const fullResult: AnalysisResult = {
        ...result,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        imageUrl: imageData
      };

      setAnalysisResult(fullResult);
      setHistory(prev => [fullResult, ...prev]);
      setAppState(AppState.RESULTS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || (language === 'zh' ? "分析失敗，請重試。" : "Failed to analyze. Please try again."));
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.HOME);
    setCapturedImage(null);
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  const handleRetry = () => {
    setAppState(AppState.HOME);
    setErrorMsg(null);
  };

  const toggleLike = (item: AnalysisResult) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === item.id);
      if (exists) {
        return prev.filter(f => f.id !== item.id);
      } else {
        return [item, ...prev];
      }
    });
  };

  const openResult = (item: AnalysisResult) => {
    setAnalysisResult(item);
    setCapturedImage(item.imageUrl || null);
    setAppState(AppState.RESULTS);
  };

  const isCurrentLiked = analysisResult ? favorites.some(f => f.id === analysisResult.id) : false;

  return (
    <div className="min-h-screen flex justify-center bg-earth-200 font-sans selection:bg-primary selection:text-white">
      {/* App Container - simulates mobile view on desktop */}
      <div className="w-full max-w-md bg-earth-50 min-h-screen relative shadow-2xl overflow-hidden">
        
        {/* State: HOME */}
        {appState === AppState.HOME && (
          <div className="flex flex-col h-screen">
            {/* Top Bar with Simple Logo */}
            <div className="bg-earth-50 px-6 py-6 flex items-center justify-between z-10 sticky top-0">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <Leaf size={22} fill="currentColor" strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-2xl tracking-tight text-earth-900">Nutri<span className="text-primary">Scan</span></span>
               </div>
               
               <button 
                onClick={toggleLanguage}
                className="w-10 h-10 rounded-full border border-earth-200 bg-white text-earth-900 font-bold text-sm shadow-sm hover:bg-earth-50 transition-colors flex items-center justify-center"
               >
                 {language === 'en' ? '中' : 'EN'}
               </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {/* Hero / Main Scan Action */}
              <div className="p-6 pb-4">
                 <button 
                    onClick={() => setAppState(AppState.CAMERA)}
                    className="w-full bg-primary text-white rounded-[2rem] py-14 px-6 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.99] transition-all flex flex-col items-center justify-center gap-5 text-center group relative overflow-hidden"
                 >
                    {/* Decorative blurred circles for aesthetic */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors border border-white/10 shadow-inner">
                       <ScanLine size={36} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-1 tracking-tight">{t.scanProduct}</h2>
                      <p className="text-white/80 font-medium text-base">{t.checkIngredients}</p>
                    </div>
                 </button>
              </div>

              {/* Recent Scans Section */}
              {history.length > 0 && (
                <div className="mt-4">
                  <div className="px-6 flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-earth-800/60 flex items-center gap-2">
                      {t.recentScans}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3 px-6 pb-6">
                    {history.slice(0, 5).map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => openResult(item)}
                        className="w-full bg-white p-5 rounded-2xl shadow-sm border border-earth-100 hover:shadow-md hover:border-earth-200 transition-all cursor-pointer flex justify-between items-center group"
                      >
                        <h4 className="font-bold text-earth-900 text-base truncate flex-1 pr-4 group-hover:text-primary transition-colors">
                            {item.productName || t.unknownProduct}
                        </h4>
                        <span className="text-xs text-earth-800/40 font-semibold uppercase tracking-wide whitespace-nowrap">
                            {new Date(item.timestamp || 0).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorites Section */}
              <div className="px-6 mt-2 pb-24">
                <h3 className="font-bold text-xl text-earth-900 mb-5 flex items-center gap-2">
                  <Heart size={20} className="text-earth-300" />
                  {t.savedProducts}
                </h3>
                
                {favorites.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-earth-200">
                    <Heart size={40} className="mx-auto text-earth-200 mb-4" />
                    <p className="text-earth-800/50 font-medium">{t.emptyFavorites}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favorites.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => openResult(item)}
                        className="bg-white p-4 pr-6 rounded-3xl shadow-sm border border-earth-100 flex items-center gap-5 hover:shadow-md transition-all cursor-pointer group"
                      >
                         <div className="w-20 h-20 bg-earth-100 rounded-2xl overflow-hidden flex-shrink-0 relative">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                            ) : (
                              <ScanLine className="w-full h-full p-5 text-earth-300" />
                            )}
                         </div>
                         <div className="flex-1 min-w-0 py-1">
                            <h4 className="font-bold text-earth-900 text-lg truncate mb-1">{item.productName || t.unknownProduct}</h4>
                            <p className="text-xs text-earth-800/70 line-clamp-2 font-medium leading-relaxed">{item.summary}</p>
                         </div>
                         <div className="w-10 h-10 rounded-full bg-earth-50 flex items-center justify-center text-earth-300 group-hover:bg-primary group-hover:text-white transition-all">
                            <ChevronRight size={20} />
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* State: CAMERA */}
        {appState === AppState.CAMERA && (
          <CameraCapture 
            onCapture={handleCapture} 
            onCancel={() => setAppState(AppState.HOME)}
            language={language}
          />
        )}

        {/* State: ANALYZING */}
        {appState === AppState.ANALYZING && (
          <div className="absolute inset-0 bg-earth-50 z-50 flex flex-col items-center justify-center p-8">
            <div className="relative mb-10">
               <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20"></div>
               <div className="relative w-32 h-32 bg-white border-8 border-earth-100 rounded-full flex items-center justify-center overflow-hidden shadow-2xl">
                  {capturedImage && (
                    <img src={capturedImage} alt="Analyzing" className="w-full h-full object-cover opacity-60" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                     <ScanLine className="text-primary animate-pulse" size={40} strokeWidth={2.5} />
                  </div>
               </div>
            </div>
            <h3 className="text-2xl font-bold text-earth-900 mb-3">{t.analyzing}</h3>
            <p className="text-earth-800/60 text-center max-w-xs font-medium animate-pulse">
              {t.analyzingDesc}
            </p>
          </div>
        )}

        {/* State: RESULTS */}
        {appState === AppState.RESULTS && analysisResult && (
          <ResultsView 
             data={analysisResult} 
             onReset={handleReset} 
             isLiked={isCurrentLiked}
             onToggleLike={() => toggleLike(analysisResult)}
             language={language}
          />
        )}

        {/* State: ERROR */}
        {appState === AppState.ERROR && (
          <div className="absolute inset-0 bg-earth-50 z-50 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8 text-quality-red shadow-lg shadow-red-100">
              <Info size={48} strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-bold text-earth-900 mb-3">{t.scanFailed}</h3>
            <p className="text-earth-800/70 mb-10 max-w-xs font-medium leading-relaxed">{errorMsg}</p>
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <button 
                onClick={() => setAppState(AppState.CAMERA)}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-primary/20 transition-all"
              >
                {t.tryAgain}
              </button>
              <button 
                onClick={handleRetry}
                className="w-full bg-white text-earth-800 hover:bg-earth-100 font-bold py-4 px-6 rounded-2xl border border-earth-200 transition-all"
              >
                {t.backToHome}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;