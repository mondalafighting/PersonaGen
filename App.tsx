import React, { useState, useEffect } from 'react';
import { MBTI_DATA, ART_STYLES } from './constants';
import { MBTIType, ArtStyle, GeneratedImageState, MBTIGroup, ImageSize, HistoryItem } from './types';
import { MBTICard } from './components/MBTICard';
import { StyleSelector } from './components/StyleSelector';
import { generateCharacterImage } from './services/geminiService';
import { Sparkles, Download, RefreshCw, User, Info, BrainCircuit, Key, X, History as HistoryIcon } from 'lucide-react';

// Define the shape of the aistudio object for local usage
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

const MBTI_GROUPS: MBTIGroup[] = ['Analysts', 'Diplomats', 'Sentinels', 'Explorers'];

function App() {
  // Auth State
  const [hasApiKey, setHasApiKey] = useState(false);

  // App State
  const [selectedType, setSelectedType] = useState<MBTIType>(MBTI_DATA[0]);
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>(ART_STYLES[0]);
  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female' | 'Non-binary'>('Female');
  const [selectedSize, setSelectedSize] = useState<ImageSize>('1K');
  const [showInfo, setShowInfo] = useState(false);
  
  const [generatedImage, setGeneratedImage] = useState<GeneratedImageState>({
    data: null,
    loading: false,
    error: null,
  });

  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Check for API Key on mount
  useEffect(() => {
    const checkKey = async () => {
      const aistudio = (window as any).aistudio as AIStudio | undefined;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // Fallback for dev environments without the extension hook
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio as AIStudio | undefined;
    if (aistudio) {
      await aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleGenerate = async () => {
    setGeneratedImage({ data: null, loading: true, error: null });
    try {
      const base64Image = await generateCharacterImage(selectedType, selectedStyle, selectedGender, selectedSize);
      
      setGeneratedImage({ data: base64Image, loading: false, error: null });

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        data: base64Image,
        mbtiCode: selectedType.code,
        styleId: selectedStyle.id,
        gender: selectedGender,
        size: selectedSize,
        timestamp: Date.now()
      };
      setHistory(prev => [newHistoryItem, ...prev]);

    } catch (error) {
      setGeneratedImage({ 
        data: null, 
        loading: false, 
        error: "Failed to generate image. Please try again. " + (error as Error).message 
      });
    }
  };

  const restoreHistoryItem = (item: HistoryItem) => {
    setGeneratedImage({ data: item.data, loading: false, error: null });
    
    // Restore context
    const type = MBTI_DATA.find(t => t.code === item.mbtiCode);
    if (type) setSelectedType(type);
    
    const style = ART_STYLES.find(s => s.id === item.styleId);
    if (style) setSelectedStyle(style);
    
    setSelectedGender(item.gender);
    setSelectedSize(item.size);

    // If on mobile, scroll to top of preview area
    const previewArea = document.getElementById('preview-container');
    if (previewArea && window.innerWidth < 768) {
       previewArea.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDownload = () => {
    if (generatedImage.data) {
      const link = document.createElement('a');
      link.href = generatedImage.data;
      link.download = `persona-gen-${selectedType.code}-${selectedStyle.id}-${selectedSize}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Scroll to top on type selection on mobile
  const handleTypeSelect = (type: MBTIType) => {
    setSelectedType(type);
    setShowInfo(false); // Reset info visibility when changing types
    if (window.innerWidth < 768) {
       window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <Key size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">API Key Required</h1>
            <p className="text-slate-500 mt-2">
              To use the high-quality Gemini 3 Pro image generation features, please select a paid API key from your Google Cloud project.
            </p>
          </div>
          
          <button
            onClick={handleSelectKey}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            Select API Key
          </button>
          
          <p className="text-xs text-slate-400">
            Learn more about billing at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-indigo-600">ai.google.dev</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      
      {/* Sidebar / Left Panel (Selection) */}
      <div className="w-full md:w-1/2 lg:w-5/12 p-6 md:h-screen md:overflow-y-auto custom-scrollbar border-r border-slate-200 bg-white/50 backdrop-blur-sm">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2 text-indigo-600">
            <BrainCircuit size={32} />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">PersonaGen</h1>
          </div>
          <p className="text-slate-500">
            Visualize the 16 personality types with AI-generated avatars.
          </p>
        </header>

        <div className="space-y-8">
          {MBTI_GROUPS.map((group) => (
            <div key={group}>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 sticky top-0 bg-white/95 py-2 z-10 backdrop-blur">
                {group}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MBTI_DATA.filter((t) => t.group === group).map((type) => (
                  <MBTICard
                    key={type.code}
                    type={type}
                    isSelected={selectedType.code === type.code}
                    onClick={handleTypeSelect}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content / Right Panel (Preview) */}
      <div id="preview-container" className="w-full md:w-1/2 lg:w-7/12 p-6 md:p-12 flex flex-col items-center justify-start md:justify-center bg-slate-50 md:h-screen md:overflow-y-auto custom-scrollbar">
        
        <div className="w-full max-w-xl space-y-8 my-auto">
          
          {/* Controls */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                   <div className="flex items-center gap-2">
                     <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      {selectedType.code} <span className="text-slate-400 font-light">|</span> {selectedType.name}
                     </h2>
                     <button 
                      onClick={() => setShowInfo(!showInfo)}
                      className={`p-1.5 rounded-full transition-colors ${showInfo ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                      title="View Details"
                     >
                       <Info size={18} />
                     </button>
                   </div>
                   
                   {!showInfo && (
                      <p className="text-sm text-slate-500 mt-1">Configure your generation</p>
                   )}
                </div>
                
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${selectedType.bgGradient} flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 ml-4`}>
                  {selectedType.code[0]}
                </div>
              </div>

              {/* Detailed Info Section */}
              {showInfo && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-700 text-sm">About {selectedType.name}s</h3>
                    <button onClick={() => setShowInfo(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">
                    {selectedType.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedType.keywords.map((k) => (
                      <span key={k} className="text-xs px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 font-medium">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Gender</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    {(['Female', 'Male', 'NB'] as const).map((g) => (
                      <button
                          key={g}
                          onClick={() => setSelectedGender(g === 'NB' ? 'Non-binary' : g)}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                            (g === 'NB' && selectedGender === 'Non-binary') || selectedGender === g 
                            ? 'bg-white shadow text-slate-900' 
                            : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Resolution</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    {(['1K', '2K', '4K'] as const).map((size) => (
                      <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                            selectedSize === size ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Art Style</label>
                 <StyleSelector selectedStyle={selectedStyle} onSelect={setSelectedStyle} />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generatedImage.loading}
              className={`
                w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-200
                flex items-center justify-center gap-2 transition-all duration-200
                ${generatedImage.loading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]'
                }
              `}
            >
              {generatedImage.loading ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  Creating {selectedType.code}...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Character ({selectedSize})
                </>
              )}
            </button>
          </div>

          {/* Result Area */}
          <div className={`
             relative rounded-2xl overflow-hidden aspect-square w-full shadow-2xl border-4 border-white
             bg-gradient-to-br ${selectedType.bgGradient}
             flex items-center justify-center transition-all duration-500
             ${generatedImage.data ? 'ring-4 ring-indigo-50' : 'opacity-90'}
          `}>
            
            {!generatedImage.data && !generatedImage.loading && !generatedImage.error && (
               <div className="text-white text-center p-8">
                 <div className="bg-white/20 backdrop-blur-md rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <User size={40} />
                 </div>
                 <h3 className="text-2xl font-bold mb-2">Ready to Imagine</h3>
                 <p className="text-white/80 max-w-xs mx-auto">
                   Select a personality type and style to visualize an MBTI archetype.
                 </p>
               </div>
            )}

            {generatedImage.loading && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                <p className="font-medium animate-pulse">Dreaming up a {selectedType.name}...</p>
                <p className="text-xs mt-2 opacity-75">Generating {selectedSize} Image</p>
              </div>
            )}

            {generatedImage.error && (
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white p-8 text-center">
                 <div className="bg-red-500/20 p-4 rounded-full mb-4 text-red-200">
                   <Info size={32} />
                 </div>
                 <p>{generatedImage.error}</p>
                 <button 
                    onClick={() => setGeneratedImage(prev => ({ ...prev, error: null }))}
                    className="mt-4 text-sm underline hover:text-slate-300"
                 >
                   Dismiss
                 </button>
              </div>
            )}

            {generatedImage.data && (
              <img 
                src={generatedImage.data} 
                alt={`${selectedType.code} Character`} 
                className="w-full h-full object-cover animate-in fade-in zoom-in duration-700"
              />
            )}
            
            {generatedImage.data && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                 <button 
                  onClick={handleDownload}
                  className="bg-white/90 hover:bg-white text-slate-900 p-3 rounded-full shadow-lg backdrop-blur-sm transition-transform hover:scale-110 active:scale-90"
                  title="Download Image"
                 >
                   <Download size={20} />
                 </button>
              </div>
            )}
          </div>

          {generatedImage.data && (
             <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-600 text-center shadow-sm">
                Generated with Gemini 3 Pro • {selectedStyle.name} Style • {selectedSize}
             </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="w-full pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-3 text-slate-400">
                <HistoryIcon size={16} />
                <h3 className="text-xs font-bold uppercase tracking-widest">Recent Generations</h3>
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar pl-1">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => restoreHistoryItem(item)}
                    className={`
                      group relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all shadow-sm
                      ${generatedImage.data === item.data 
                        ? 'border-indigo-600 ring-2 ring-indigo-200 ring-offset-1 scale-105' 
                        : 'border-slate-200 hover:border-indigo-400 hover:shadow-md hover:scale-105'
                      }
                    `}
                  >
                    <img src={item.data} alt="History" className="w-full h-full object-cover" />
                    
                    {/* Dark overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    
                    {/* Badge */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-1 text-[10px] font-bold text-center text-slate-700 truncate border-t border-white/50">
                      {item.mbtiCode}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;