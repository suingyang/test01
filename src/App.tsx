/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  PlusCircle, 
  ArrowRight, 
  ArrowLeft, 
  ArrowUp,
  Play, 
  Edit3, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Clock,
  Type,
  Image as ImageIcon,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

// --- Types ---

type AppStep = 'mode-selection' | 'replicate-flow' | 'input-details' | 'storyboard' | 'generating' | 'completed';
type GenerationMode = 'replicate' | 'new';
type VideoType = 'mashup' | 'talking-head' | 'pure-showcase';

interface Clip {
  id: string;
  file: string;
  source: string;
  duration: number;
  match_level: string;
  tags: string;
  description: string; // Visual description
  sub_function: string;
}

interface Segment {
  seg_id: number;
  voiceover_text: string;
  aida_stage: string;
  sub_function: string;
  target_duration: number;
  description: string; // Summary
  clips: Clip[];
}

// --- Mock Data ---

const VOICES = [
  { id: 'v1', name: '阳光男声', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', preview: '#' },
  { id: 'v2', name: '知性女声', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', preview: '#' },
  { id: 'v3', name: '磁性大叔', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=George', preview: '#' },
  { id: 'v4', name: '甜美少女', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily', preview: '#' },
];

const INITIAL_TIMELINE: Segment[] = [
  {
    seg_id: 1,
    voiceover_text: "Do you all know. This coating... That's because he used epoxy resin marble floor",
    aida_stage: "A·注意",
    sub_function: "视觉冲击",
    target_duration: 3.0,
    description: "涂料倾倒破损地面，冲击力强；工人刮涂料，男人口播，丝滑感",
    clips: [
      { id: 'c1', file: "001_1_00_00_00_00_01_88.mp4", source: "1", duration: 1.88, match_level: "P1", tags: "涂料|倾倒|破损地面|口播人物", description: "中景构图，自然明亮色调，大量银灰色液体涂料倾倒至破损的水泥地面上，右下角有口播人物，视觉冲击力强。", sub_function: "钩子" },
      { id: 'c2', file: "002_2_00_01_88_00_03_88.mp4", source: "2", duration: 2.0, match_level: "P1", tags: "地坪漆|刮刀施工|画中画|特写镜头", description: "俯拍特写，工人持齿痕刮刀将灰色涂料均匀推平，底部叠加外籍男子持桶口播画面，色调明亮且充满施工解压感。", sub_function: "钩子" }
    ]
  },
  {
    seg_id: 2,
    voiceover_text: "Why is this floor paint popular all over the internet? Three reasons to tell you... 18 kilograms can cover 60 square meters.",
    aida_stage: "I·兴趣",
    sub_function: "产品初露",
    target_duration: 11.0,
    description: "外籍男口播，两人施工，明亮真实；漆料倾倒，人物口播讲解，专业",
    clips: [
      { id: 'c3', file: "003_3_00_03_88_00_08_46.mp4", source: "3", duration: 4.58, match_level: "P1", tags: "外籍讲解|刮板施工|涂料桶|地坪漆", description: "固定机位，前景外籍男子手持桶装产品口播，背景工人正在室内地面进行白色地坪漆刮涂施工，室内采光通透，色调明亮。", sub_function: "口播说明" },
      { id: 'c4', file: "004_5_00_09_58_00_11_88.mp4", source: "4", duration: 2.3, match_level: "P1", tags: "仿石漆|倾倒|人物抠像|产品桶|大理石质感", description: "特写俯拍展示灰白色仿石漆倾倒流平过程，颗粒质感清晰。右下角叠加施工员手持产品桶的口播抠像。", sub_function: "口播说明" },
      { id: 'c5', file: "005_6_00_11_88_00_13_58.mp4", source: "6", duration: 1.7, match_level: "P1", tags: "涂料倾倒|男主播|口播|瓷砖地面", description: "特写构图，白色浓稠涂料垂直倾倒在浅色瓷砖上自然流平，右下角叠加男主播口播解说，画面明亮，强调产品参数。", sub_function: "口播说明" },
      { id: 'c6', file: "006_7_00_13_58_00_14_79.mp4", source: "7", duration: 1.21, match_level: "P1", tags: "刮刀|地坪施工|涂料特写|讲解员|产品包装", description: "俯拍特写构图，明亮自然光，灰白色调。展示手持刮刀平铺涂料的过程，右下角悬浮讲解员与产品桶展示。", sub_function: "产品展示" }
    ]
  },
  {
    seg_id: 3,
    voiceover_text: "You don't need to demolish the original floor, simply brush it onto... or old ceramic tiles",
    aida_stage: "I·兴趣",
    sub_function: "痛点展开",
    target_duration: 9.0,
    description: "刮刀抹涂料，男士口播，直观高效；工人刮涂料，口播讲解，直观",
    clips: [
      { id: 'c7', file: "007_8_00_14_79_00_16_04.mp4", source: "3", duration: 1.25, match_level: "P1", tags: "刮刀|涂料施工|口播解说|产品展示", description: "俯视特写构图，主体展示刮刀抹平灰色涂料的施工细节，画面下方叠加男士手持产品桶的口播讲解画面，光线明亮。", sub_function: "痛点" },
      { id: 'c8', file: "008_9_00_16_04_00_17_92.mp4", source: "1", duration: 1.88, match_level: "P1", tags: "施工|刮刀|地坪漆|数字人|涂刷", description: "俯拍中景构图，工人持刮板在旧地面上平铺浅色涂料，右下角叠加数字人口播讲解，光线明亮，突出施工简便。", sub_function: "口播说明" },
      { id: 'c9', file: "009_10_00_17_92_00_20_75.mp4", source: "10", duration: 2.83, match_level: "P1", tags: "镜面地坪|室内实景|反光效果|口播人物", description: "室内全景构图，自然光照射下灰色地坪呈现极强的镜面反射效果，家具倒影清晰可见，右下角叠加手持产品的口播人物。", sub_function: "使用后" }
    ]
  }
];

// --- Components ---

export default function App() {
  const [step, setStep] = useState<AppStep>('mode-selection');
  const [mode, setMode] = useState<GenerationMode | null>(null);
  const [timeline, setTimeline] = useState<Segment[]>(INITIAL_TIMELINE);
  const [selectedClip, setSelectedClip] = useState<{segId: number, clipId: string} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Replicate Flow States
  const [replicateSubStep, setReplicateSubStep] = useState(1);
  const [videoType, setVideoType] = useState<VideoType | null>(null);
  const [productSource, setProductSource] = useState<'current' | 'new'>('current');
  const [sku, setSku] = useState('');
  const [voSource, setVoSource] = useState<'original' | 'upload'>('original');
  const [voiceSource, setVoiceSource] = useState<'clone' | 'new'>('clone');
  const [selectedVoiceId, setSelectedVoiceId] = useState('v1');
  const [sellingPoints, setSellingPoints] = useState('1. 环保无味\n2. 耐磨防滑\n3. 施工简单，一刷即新');

  // Simulate generation progress
  useEffect(() => {
    if (step === 'generating') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep('completed');
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step]);

  const [uploadStatus, setUploadStatus] = useState<'idle' | 'dragging' | 'uploading' | 'analyzing' | 'success'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ name: string, size: string } | null>(null);

  const handleFileDrop = (e: any) => {
    e.preventDefault();
    setUploadStatus('idle');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      startUpload(file);
    }
  };

  const handleFileSelect = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      startUpload(file);
    }
  };

  const startUpload = (file: File) => {
    setUploadedFile({ 
      name: file.name, 
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB' 
    });
    setUploadStatus('uploading');
    setUploadProgress(0);
  };

  useEffect(() => {
    if (uploadStatus === 'uploading') {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploadStatus('analyzing');
            return 100;
          }
          return prev + 5;
        });
      }, 50);
      return () => clearInterval(interval);
    }
    if (uploadStatus === 'analyzing') {
      const timeout = setTimeout(() => {
        setUploadStatus('success');
        // Simulate auto-detection
        setVideoType('mashup');
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [uploadStatus]);

  const handleNext = () => {
    if (step === 'mode-selection') {
      if (mode === 'replicate') {
        setStep('replicate-flow');
        setReplicateSubStep(1);
      } else {
        setStep('input-details');
      }
    }
    else if (step === 'replicate-flow') {
      if (replicateSubStep < 2) setReplicateSubStep(prev => prev + 1);
      else setStep('storyboard');
    }
    else if (step === 'input-details') setStep('storyboard');
    else if (step === 'storyboard') setStep('generating');
  };

  const handleBack = () => {
    if (step === 'replicate-flow') {
      if (replicateSubStep > 1) setReplicateSubStep(prev => prev - 1);
      else setStep('mode-selection');
    }
    else if (step === 'input-details') setStep('mode-selection');
    else if (step === 'storyboard') {
      if (mode === 'replicate') setStep('replicate-flow');
      else setStep('input-details');
    }
    else if (step === 'generating') setStep('storyboard');
    else if (step === 'completed') setStep('storyboard');
  };

  const addClip = (segId: number) => {
    const newClip: Clip = {
      id: `c${Math.random().toString(36).substr(2, 9)}`,
      file: "new_clip.mp4",
      source: "00",
      duration: 2.0,
      match_level: "P1",
      tags: "新标签",
      description: "新分镜画面描述...",
      sub_function: "新增功能"
    };

    setTimeline(prev => prev.map(seg => {
      if (seg.seg_id === segId) {
        return { ...seg, clips: [...seg.clips, newClip] };
      }
      return seg;
    }));
    
    setSelectedClip({ segId, clipId: newClip.id });
  };

  const currentClip = selectedClip 
    ? timeline.find(s => s.seg_id === selectedClip.segId)?.clips.find(c => c.id === selectedClip.clipId)
    : null;

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-100 font-sans selection:bg-orange-500/30">
      {/* Header */}
      <header className="border-bottom border-white/5 bg-[#16181d]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">AI Ad Remix <span className="text-white/40 font-normal ml-2">v1.0</span></h1>
          </div>
          
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-1">
              {['模式选择', '需求输入', '脚本规划', '混剪生成'].map((label, i) => {
                const steps: AppStep[] = ['mode-selection', 'input-details', 'storyboard', 'generating'];
                const isActive = steps.indexOf(step) >= i;
                return (
                  <div key={label} className="flex items-center">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${isActive ? 'text-orange-400 bg-orange-400/10' : 'text-white/30'}`}>
                      {label}
                    </span>
                    {i < 3 && <ChevronRight className="w-3 h-3 text-white/10 mx-1" />}
                  </div>
                );
              })}
            </nav>
            <button className="bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium px-4 py-2 rounded-full border border-white/10 transition-all">
              我的项目
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 'mode-selection' && (
            <motion.div 
              key="mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto mt-12"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">开始你的广告创作</h2>
                <p className="text-white/50">选择一种创作模式，AI 将协助你完成从脚本到成片的全部流程</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <button 
                  onClick={() => { setMode('replicate'); handleNext(); }}
                  className={`group relative p-8 rounded-3xl border-2 transition-all text-left overflow-hidden ${mode === 'replicate' ? 'border-orange-500 bg-orange-500/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                >
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Video className="w-7 h-7 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">视频复刻 (Remix)</h3>
                    <p className="text-sm text-white/50 leading-relaxed">上传一个现有的爆款视频，AI 将分析其结构、节奏和口播，并为你生成全新的复刻版本。</p>
                  </div>
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-6 h-6 text-orange-500" />
                  </div>
                </button>

                <button 
                  onClick={() => { setMode('new'); handleNext(); }}
                  className={`group relative p-8 rounded-3xl border-2 transition-all text-left overflow-hidden ${mode === 'new' ? 'border-orange-500 bg-orange-500/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                >
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <PlusCircle className="w-7 h-7 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">全新生成 (Fresh)</h3>
                    <p className="text-sm text-white/50 leading-relaxed">只需输入产品信息和营销目标，AI 将基于 AIDA 逻辑从零开始规划镜头、撰写脚本并生成视频。</p>
                  </div>
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-6 h-6 text-orange-500" />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'replicate-flow' && (
            <motion.div 
              key="replicate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <button onClick={handleBack} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">返回</span>
                </button>
                <div className="flex gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`w-12 h-1.5 rounded-full transition-colors ${replicateSubStep >= i ? 'bg-orange-500' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>

              <div className="bg-[#16181d] border border-white/10 rounded-3xl p-8 shadow-2xl">
                {replicateSubStep === 1 && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">上传复刻营销视频</h2>
                      <p className="text-sm text-white/40">AI 将自动识别视频类型并分析结构</p>
                    </div>

                    <div 
                      onDragOver={(e) => { e.preventDefault(); setUploadStatus('dragging'); }}
                      onDragLeave={() => setUploadStatus('idle')}
                      onDrop={handleFileDrop}
                      className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer overflow-hidden
                        ${uploadStatus === 'dragging' ? 'border-orange-500 bg-orange-500/10 scale-[1.02]' : 'border-white/10 bg-white/5 hover:border-orange-500/30'}
                      `}
                      onClick={() => document.getElementById('fileInput')?.click()}
                    >
                      <input type="file" id="fileInput" className="hidden" accept="video/*" onChange={handleFileSelect} />
                      <AnimatePresence mode="wait">
                        {uploadStatus === 'idle' || uploadStatus === 'dragging' ? (
                          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Video className={`w-12 h-12 mx-auto mb-4 transition-colors ${uploadStatus === 'dragging' ? 'text-orange-500' : 'text-white/20'}`} />
                            <p className="text-sm text-white/60 mb-2">{uploadStatus === 'dragging' ? '松开鼠标开始上传' : '点击或拖拽视频文件到这里'}</p>
                            <p className="text-xs text-white/30">支持 MP4, MOV (最大 500MB)</p>
                          </motion.div>
                        ) : uploadStatus === 'uploading' ? (
                          <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce"><ArrowUp className="w-6 h-6 text-orange-500" /></div>
                            <div>
                              <p className="text-sm font-bold mb-1">正在上传视频...</p>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden"><motion.div className="h-full bg-orange-500" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} /></div>
                            </div>
                          </motion.div>
                        ) : uploadStatus === 'analyzing' ? (
                          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="relative w-16 h-16 mx-auto">
                              <RefreshCw className="w-16 h-16 text-orange-500/20 animate-spin" />
                              <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-6 h-6 text-orange-500 animate-pulse" /></div>
                            </div>
                            <p className="text-sm font-bold">AI 正在分析视频类型...</p>
                          </motion.div>
                        ) : (
                          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8 text-green-500" /></div>
                            <p className="text-sm font-bold text-green-400">识别成功：{videoType === 'mashup' ? '混剪视频' : '其他类型'}</p>
                            {videoType !== 'mashup' && <p className="text-xs text-orange-400 mt-2 bg-orange-400/10 py-1 px-3 rounded-full inline-block">口播/纯展示模式还在开发中</p>}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button 
                      disabled={uploadStatus !== 'success' || videoType !== 'mashup'}
                      onClick={handleNext}
                      className="w-full bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      下一步：配置产品信息 <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {replicateSubStep === 2 && (
                  <div className="space-y-10">
                    {/* Product Config Section */}
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold mb-1">配置产品信息</h2>
                        <p className="text-xs text-white/40">选择基于当前产品还是新产品</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setProductSource('current')}
                          className={`p-4 rounded-2xl border-2 transition-all text-left ${productSource === 'current' ? 'border-orange-500 bg-orange-500/5' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                        >
                          <h4 className="font-bold mb-1">当前产品</h4>
                          <p className="text-[10px] text-white/40">自动带出当前产品卖点</p>
                        </button>
                        <button 
                          onClick={() => setProductSource('new')}
                          className={`p-4 rounded-2xl border-2 transition-all text-left ${productSource === 'new' ? 'border-orange-500 bg-orange-500/5' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                        >
                          <h4 className="font-bold mb-1">新产品</h4>
                          <p className="text-[10px] text-white/40">选择 SKU 并带出卖点</p>
                        </button>
                      </div>

                      {productSource === 'new' && (
                        <div className="space-y-4">
                          <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">选择 SKU</label>
                          <select 
                            value={sku} 
                            onChange={(e) => setSku(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 appearance-none"
                          >
                            <option value="">请选择 SKU...</option>
                            <option value="sku-001">SKU-001: 强力地坪漆 (灰色)</option>
                            <option value="sku-002">SKU-002: 艺术水泥漆 (米色)</option>
                          </select>
                        </div>
                      )}

                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">产品卖点</label>
                        <textarea 
                          rows={3} 
                          value={sellingPoints}
                          onChange={(e) => setSellingPoints(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 resize-none"
                        />
                      </div>
                    </div>

                    <div className="w-full border-t border-white/5" />

                    {/* Audio Config Section */}
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-bold mb-1">配置音频选项</h2>
                        <p className="text-xs text-white/40">选择口播内容及配音音色</p>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">口播内容来源</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => setVoSource('original')} className={`p-4 rounded-xl border-2 transition-all text-sm font-medium ${voSource === 'original' ? 'border-orange-500 bg-orange-500/5' : 'border-white/5 bg-white/5'}`}>直接用原视频口播</button>
                          <button onClick={() => document.getElementById('voInput')?.click()} className={`p-4 rounded-xl border-2 transition-all text-sm font-medium ${voSource === 'upload' ? 'border-orange-500 bg-orange-500/5' : 'border-white/5 bg-white/5'}`}>
                            上传新口播
                            <input type="file" id="voInput" className="hidden" accept="audio/*" onChange={() => setVoSource('upload')} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">配音音色</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => setVoiceSource('clone')} className={`p-4 rounded-xl border-2 transition-all text-sm font-medium ${voiceSource === 'clone' ? 'border-orange-500 bg-orange-500/5' : 'border-white/5 bg-white/5'}`}>复刻原视频声音</button>
                          <button onClick={() => setVoiceSource('new')} className={`p-4 rounded-xl border-2 transition-all text-sm font-medium ${voiceSource === 'new' ? 'border-orange-500 bg-orange-500/5' : 'border-white/5 bg-white/5'}`}>选择新声音</button>
                        </div>
                      </div>

                      {voiceSource === 'new' && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {VOICES.map((voice) => (
                            <div 
                              key={voice.id}
                              onClick={() => setSelectedVoiceId(voice.id)}
                              className={`relative p-3 rounded-xl border transition-all flex flex-col items-center gap-2 cursor-pointer ${selectedVoiceId === voice.id ? 'border-orange-500 bg-orange-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                            >
                              <img src={voice.avatar} alt={voice.name} className="w-10 h-10 rounded-full bg-white/10" referrerPolicy="no-referrer" />
                              <span className="text-[10px] font-bold">{voice.name}</span>
                              <div className="absolute top-1 right-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Play preview logic
                                  }}
                                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                  <Play className="w-2 h-2 text-white fill-current" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button onClick={handleNext} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                      开始脚本规划 <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 'input-details' && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <button onClick={handleBack} className="flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">返回模式选择</span>
              </button>

              <div className="bg-[#16181d] border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6">输入创作需求</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">产品名称</label>
                    <input type="text" placeholder="例如：智能感应洗碗机" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">核心卖点 (USP)</label>
                    <textarea rows={3} placeholder="描述产品的独特优势..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">目标受众</label>
                    <input type="text" placeholder="例如：25-45岁家庭主妇" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors" />
                  </div>
                </div>

                <button 
                  onClick={handleNext}
                  className="w-full mt-8 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  开始规划脚本
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'storyboard' && (
            <motion.div 
              key="storyboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-2xl font-bold">脚本规划 & 镜头召回</h2>
                  <p className="text-sm text-white/40">基于 AIDA 逻辑与召回素材匹配的结果，直接在下方修改细节</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleBack} className="px-4 py-2 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors">上一步</button>
                  <button onClick={handleNext} className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-500/20 transition-all">确认并生成</button>
                </div>
              </div>

              <div className="space-y-16 relative">
                {/* Vertical Line Connector */}
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-orange-500/50 via-white/5 to-transparent" />

                {timeline.map((segment) => (
                  <div key={segment.seg_id} className="relative pl-12">
                    {/* Segment Marker */}
                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-[#16181d] border border-white/10 flex items-center justify-center z-10">
                      <span className="text-[10px] font-bold text-orange-500">{segment.seg_id}</span>
                    </div>

                    {/* Segment Header Info */}
                    <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded">{segment.aida_stage}</span>
                        <span className="text-xs font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded border border-orange-400/20">{segment.sub_function}</span>
                        <div className="flex items-center gap-1.5 text-xs text-white/40 ml-auto">
                          <Clock className="w-3 h-3" /> 目标时长: {segment.target_duration}s
                          <span className="mx-2 text-white/10">|</span>
                          <Layers className="w-3 h-3" /> 分镜数: {segment.clips.length}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">镜头组目标</label>
                          <p className="text-sm text-white/80 leading-relaxed">{segment.description}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">口播内容</label>
                          <p className="text-sm text-white/90 font-medium italic leading-relaxed">"{segment.voiceover_text}"</p>
                        </div>
                      </div>
                    </div>

                    {/* Clips within Segment */}
                    <div className="space-y-4">
                      {segment.clips.map((clip) => (
                        <div 
                          key={clip.id}
                          className="group relative bg-[#16181d] border border-white/5 rounded-xl overflow-hidden transition-all hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5"
                        >
                          <div className="flex flex-col md:flex-row">
                            {/* Clip Preview & Actions */}
                            <div className="w-full md:w-52 aspect-video relative flex-shrink-0 bg-black group/preview">
                              <img src={`https://picsum.photos/seed/${clip.id}/320/180`} alt="Clip" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                                <Play className="w-8 h-8 text-white fill-current" />
                              </div>
                              <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                                <span className="text-[9px] font-bold bg-black/80 px-1.5 py-0.5 rounded border border-white/10">{clip.duration}s</span>
                                <span className="text-[9px] font-bold bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">{clip.match_level}</span>
                              </div>
                              <div className="absolute top-1.5 right-1.5 flex gap-1">
                                <span className="text-[7px] font-bold bg-white/10 backdrop-blur-md px-1 py-0.5 rounded text-white/40">SRC: {clip.source}</span>
                                <button className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Integrated Editor Content */}
                            <div className="flex-1 p-4 space-y-3">
                              <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-7 space-y-1">
                                  <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1">
                                    <Edit3 className="w-2.5 h-2.5" /> 功能描述
                                  </label>
                                  <input 
                                    type="text" 
                                    defaultValue={clip.sub_function} 
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white/80 focus:outline-none focus:border-orange-500/50 transition-colors"
                                  />
                                </div>
                                <div className="col-span-5 space-y-1">
                                  <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" /> 时长 (s)
                                  </label>
                                  <input 
                                    type="number" 
                                    defaultValue={clip.duration} 
                                    step={0.1}
                                    className="w-full bg-white/5 border border-white/5 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white/80 focus:outline-none focus:border-orange-500/50 transition-colors"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1">
                                  <ImageIcon className="w-2.5 h-2.5" /> 画面描述
                                </label>
                                <textarea 
                                  rows={1} 
                                  defaultValue={clip.description} 
                                  className="w-full bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5 text-[11px] text-white/60 leading-relaxed focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                                />
                              </div>

                              <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/5">
                                <div className="flex-1 flex items-center gap-2">
                                  <label className="text-[8px] font-bold text-white/20 uppercase tracking-widest shrink-0">标签:</label>
                                  <input 
                                    type="text" 
                                    defaultValue={clip.tags} 
                                    className="flex-1 bg-transparent border-none p-0 text-[10px] text-orange-400/60 focus:outline-none focus:ring-0"
                                    placeholder="用 | 分隔"
                                  />
                                </div>
                                <div className="flex gap-1.5">
                                  <button className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[9px] font-bold flex items-center gap-1 transition-all">
                                    <RefreshCw className="w-2.5 h-2.5" /> 换素材
                                  </button>
                                  <button className="px-2 py-1 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-md text-[9px] font-bold flex items-center gap-1 transition-all">
                                    <Sparkles className="w-2.5 h-2.5" /> AI 润色
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <button 
                        onClick={() => addClip(segment.seg_id)}
                        className="w-full py-4 rounded-2xl border border-dashed border-white/10 text-white/20 hover:text-white/40 hover:border-white/20 transition-all flex items-center justify-center gap-2 group"
                      >
                        <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-widest">在当前镜头组中添加分镜</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div 
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto text-center py-20"
            >
              <div className="relative w-32 h-32 mx-auto mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="60" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={377}
                    strokeDashoffset={377 - (377 * progress) / 100}
                    className="text-orange-500 transition-all duration-300 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{progress}%</span>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-4">正在混剪你的广告视频</h2>
              <p className="text-white/50 mb-8">正在合成素材、生成配音并添加特效，请稍候...</p>
              
              <div className="space-y-3 max-w-xs mx-auto">
                {[
                  { label: '分析脚本结构', done: progress > 20 },
                  { label: '匹配视觉素材', done: progress > 45 },
                  { label: '生成 AI 配音', done: progress > 70 },
                  { label: '渲染最终视频', done: progress > 90 },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 text-sm transition-colors ${item.done ? 'text-white' : 'text-white/20'}`}>
                    {item.done ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border border-white/20 animate-pulse" />}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'completed' && (
            <motion.div 
              key="completed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">生成完成！</h2>
                <div className="flex gap-3">
                  <button onClick={handleBack} className="px-6 py-3 rounded-xl border border-white/10 text-sm font-bold hover:bg-white/5 transition-colors flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" /> 重新调整
                  </button>
                  <button className="px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2">
                    下载 4K 视频 <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group">
                <img src="https://picsum.photos/seed/final/1280/720" alt="Final Result" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 fill-current ml-1" />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">视频时长</h4>
                  <p className="text-xl font-bold">15.5 秒</p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">分辨率</h4>
                  <p className="text-xl font-bold">1080 x 1920 (9:16)</p>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">预估点击率 (CTR)</h4>
                  <p className="text-xl font-bold text-green-400">3.2% - 4.8%</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#0f1115]/80 backdrop-blur-md border-t border-white/5 py-3 px-6 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] font-medium text-white/30 uppercase tracking-widest">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> 系统状态: 正常</span>
            <span>当前模式: {mode === 'replicate' ? '视频复刻' : mode === 'new' ? '全新生成' : '未选择'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>© 2026 AI AD REMIX ENGINE</span>
            <span className="text-white/10">|</span>
            <a href="#" className="hover:text-white transition-colors">帮助文档</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Helper Icons ---
function ArrowDown(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
