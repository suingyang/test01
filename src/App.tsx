/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
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
  ChevronDown,
  Upload,
  Link as LinkIcon,
  Plus,
  Wand2,
  X
} from 'lucide-react';

// --- Types ---

type AppStep = 'replicate-flow' | 'storyboard' | 'generating' | 'completed';
type GenerationMode = 'replicate' | 'new';
type VideoType = 'mashup' | 'talking-head' | 'pure-showcase';

interface Clip {
  id: string;
  file: string;
  source: string;
  duration: number;
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

const SUBTITLE_STYLES = [
  { id: 0, name: 'Classic White', preview: 'Text Style' },
  { id: 1, name: 'Shadow Gray', preview: 'Text Style' },
  { id: 2, name: 'Bold Black', preview: 'Text Style' },
  { id: 3, name: 'Golden Glow', preview: 'Text Style' },
  { id: 4, name: 'Soft Pink', preview: 'Text Style' },
  { id: 5, name: 'Sky Blue', preview: 'Text Style' },
  { id: 6, name: 'Neon Yellow', preview: 'Text Style' },
  { id: 7, name: 'Blue Badge', preview: 'Text Style Demo', badge: true, color: 'bg-blue-500' },
  { id: 8, name: 'Black Box', preview: 'Text Style', box: true, color: 'bg-black' },
  { id: 9, name: 'Cyan Border', preview: 'Text Style', border: true, color: 'border-cyan-400' },
  { id: 10, name: 'TikTok Style', preview: 'Text Style', tiktok: true },
  { id: 11, name: 'Green Badge', preview: 'Text Style Demo', badge: true, color: 'bg-green-500' },
  { id: 12, name: 'Retro Brown', preview: 'Text Style', shadow: true, color: 'text-amber-900' },
  { id: 13, name: 'Orange Box', preview: 'Text Style', box: true, color: 'bg-orange-500' },
];

const AIDA_SUB_FUNCTIONS: Record<string, string[]> = {
  "A·注意": ["视觉冲击", "悬念开场", "场景共鸣", "问题抛出", "数据冲击"],
  "I·兴趣": ["痛点展开", "场景代入", "产品初露", "对比铺垫", "故事推进"],
  "D·欲望": ["产品展示", "效果呈现", "用户证言", "权威背书", "细节特写"],
  "A·行动": ["CTA直接", "限时紧迫", "价格利益", "品牌收尾", "情感落点"],
};

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
      { id: 'c1', file: "001_1_00_00_00_00_01_88.mp4", source: "1", duration: 1.88, description: "中景构图，自然明亮色调，大量银灰色液体涂料倾倒至破损的水泥地面上，右下角有口播人物，视觉冲击力强。", sub_function: "视觉冲击" },
      { id: 'c2', file: "002_2_00_01_88_00_03_88.mp4", source: "2", duration: 2.0, description: "俯拍特写，工人持齿痕刮刀将灰色涂料均匀推平，底部叠加外籍男子持桶口播画面，色调明亮且充满施工解压感。", sub_function: "视觉冲击" }
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
      { id: 'c3', file: "003_3_00_03_88_00_08_46.mp4", source: "3", duration: 4.58, description: "固定机位，前景外籍男子手持桶装产品口播，背景工人正在室内地面进行白色地坪漆刮涂施工，室内采光通透，色调明亮。", sub_function: "产品初露" },
      { id: 'c4', file: "004_5_00_09_58_00_11_88.mp4", source: "4", duration: 2.3, description: "特写俯拍展示灰白色仿石漆倾倒流平过程，颗粒质感清晰。右下角叠加施工员手持产品桶的口播抠像。", sub_function: "产品初露" },
      { id: 'c5', file: "005_6_00_11_88_00_13_58.mp4", source: "6", duration: 1.7, description: "特写构图，白色浓稠涂料垂直倾倒在浅色瓷砖上自然流平，右下角叠加男主播口播解说，画面明亮，强调产品参数。", sub_function: "产品初露" },
      { id: 'c6', file: "006_7_00_13_58_00_14_79.mp4", source: "7", duration: 1.21, description: "俯拍特写构图，明亮自然光，灰白色调。展示手持刮刀平铺涂料的过程，右下角悬浮讲解员与产品桶展示。", sub_function: "产品初露" }
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
      { id: 'c7', file: "007_8_00_14_79_00_16_04.mp4", source: "3", duration: 1.25, description: "俯视特写构图，主体展示刮刀抹平灰色涂料的施工细节，画面下方叠加男士手持产品桶的口播讲解画面，光线明亮。", sub_function: "痛点展开" },
      { id: 'c8', file: "008_9_00_16_04_00_17_92.mp4", source: "1", duration: 1.88, description: "俯拍中景构图，工人持刮板在旧地面上平铺浅色涂料，右下角叠加数字人口播讲解，光线明亮，突出施工简便。", sub_function: "痛点展开" },
      { id: 'c9', file: "009_10_00_17_92_00_20_75.mp4", source: "10", duration: 2.83, description: "室内全景构图，自然光照射下灰色地坪呈现极强的镜面反射效果，家具倒影清晰可见，右下角叠加手持产品的口播人物。", sub_function: "痛点展开" }
    ]
  }
];

// --- Components ---

export default function App() {
  const [step, setStep] = useState<'replicate-flow' | 'storyboard' | 'generating' | 'completed'>('replicate-flow');
  const [mode, setMode] = useState<'replicate' | 'generate'>('replicate');
  const [timeline, setTimeline] = useState<Segment[]>(INITIAL_TIMELINE);
  const [selectedClip, setSelectedClip] = useState<{segId: number, clipId: string} | null>(null);
  const [activeSegmentId, setActiveSegmentId] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChangeMaterialOpen, setIsChangeMaterialOpen] = useState(false);
  const [materialTarget, setMaterialTarget] = useState<{segId: number, clipId: string} | null>(null);
  const [progress, setProgress] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<'stage' | 'sub' | null>(null);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [subtitleStyle, setSubtitleStyle] = useState<number>(0);
  const [needsSubtitle, setNeedsSubtitle] = useState(true);
  const [generatingClips, setGeneratingClips] = useState<Record<string, boolean>>({});
  const [isAIGenModalOpen, setIsAIGenModalOpen] = useState(false);
  const [aiGenTarget, setAiGenTarget] = useState<{segId: number, clipId: string} | null>(null);
  const [aiGenPrompt, setAiGenPrompt] = useState('');
  const [aiGenResult, setAiGenResult] = useState<string | null>(null);
  const [isAiGenLoading, setIsAiGenLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Replicate Flow States
  const [replicateSubStep, setReplicateSubStep] = useState(1);
  const [videoUrl, setVideoUrl] = useState('');
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
    }
    else if (step === 'storyboard') {
      setStep('replicate-flow');
      setReplicateSubStep(2); // Go back to the last config step
    }
    else if (step === 'generating') setStep('storyboard');
    else if (step === 'completed') setStep('storyboard');
  };

  const addSegment = () => {
    const newSegId = Math.max(...timeline.map(s => s.seg_id), 0) + 1;
    const newSegment: Segment = {
      seg_id: newSegId,
      voiceover_text: "新片段口播文案...",
      aida_stage: "A·注意",
      sub_function: "视觉冲击",
      target_duration: 5.0,
      description: "新片段描述...",
      clips: [
        {
          id: `c${Math.random().toString(36).substr(2, 9)}`,
          file: "placeholder.mp4",
          source: "user",
          duration: 2.0,
          description: "新分镜画面描述...",
          sub_function: "视觉冲击"
        }
      ]
    };
    setTimeline(prev => [...prev, newSegment]);
    setActiveSegmentId(newSegId);
  };

  const addClip = (segId: number) => {
    const newClip: Clip = {
      id: `c${Math.random().toString(36).substr(2, 9)}`,
      file: "placeholder.mp4",
      source: "00",
      duration: 2.0,
      description: "新分镜画面描述...",
      sub_function: "新增功能"
    };

    setTimeline(prev => prev.map(seg => {
      if (seg.seg_id === segId) {
        return { ...seg, clips: [...seg.clips, newClip] };
      }
      return seg;
    }));
  };

  const reorderClips = (segId: number, newClips: Clip[]) => {
    setTimeline(prev => prev.map(seg => seg.seg_id === segId ? { ...seg, clips: newClips } : seg));
  };

  const updateSegment = (segId: number, field: keyof Segment, value: any) => {
    setTimeline(prev => prev.map(seg => seg.seg_id === segId ? { ...seg, [field]: value } : seg));
  };

  const updateClip = (segId: number, clipId: string, field: keyof Clip, value: any) => {
    setTimeline(prev => prev.map(seg => {
      if (seg.seg_id === segId) {
        return {
          ...seg,
          clips: seg.clips.map(clip => clip.id === clipId ? { ...clip, [field]: value } : clip)
        };
      }
      return seg;
    }));
  };

  const removeClip = (segId: number, clipId: string) => {
    setTimeline(prev => prev.map(seg => {
      if (seg.seg_id === segId) {
        return { ...seg, clips: seg.clips.filter(clip => clip.id !== clipId) };
      }
      return seg;
    }));
  };

  const handleSwapMaterial = (segId: number, clipId: string, newClip: any) => {
    setTimeline(prev => prev.map(seg => {
      if (seg.seg_id === segId) {
        return {
          ...seg,
          clips: seg.clips.map(clip => clip.id === clipId ? { 
            ...clip, 
            id: `c-${Math.random().toString(36).substr(2, 9)}`,
            file: newClip.file,
            duration: newClip.duration,
            description: newClip.description
          } : clip)
        };
      }
      return seg;
    }));
    setIsChangeMaterialOpen(false);
  };

  const handleAIGenerate = (segId: number, clipId: string) => {
    const segment = timeline.find(s => s.seg_id === segId);
    const clip = segment?.clips.find(c => c.id === clipId);
    if (clip) {
      setAiGenTarget({ segId, clipId });
      setAiGenPrompt(clip.description);
      setAiGenResult(null);
      setIsAIGenModalOpen(true);
    }
  };

  const startAIGeneration = () => {
    setIsAiGenLoading(true);
    // Simulate AI generation delay
    setTimeout(() => {
      setAiGenResult(`https://picsum.photos/seed/${Math.random()}/1280/720`);
      setIsAiGenLoading(false);
    }, 2000);
  };

  const confirmAIGenerate = () => {
    if (!aiGenTarget) return;
    const { segId, clipId } = aiGenTarget;
    
    setTimeline(prev => prev.map(seg => {
      if (seg.seg_id === segId) {
        return {
          ...seg,
          clips: seg.clips.map(clip => clip.id === clipId ? { 
            ...clip, 
            id: `c-${Math.random().toString(36).substr(2, 9)}`,
            description: aiGenPrompt,
            duration: Math.min(5, Math.max(1.5, clip.duration + (Math.random() - 0.5)))
          } : clip)
        };
      }
      return seg;
    }));
    setIsAIGenModalOpen(false);
  };

  const currentSegment = timeline.find(s => s.seg_id === activeSegmentId);

  // Mock candidate clips for the modal
  const CANDIDATE_CLIPS = [
    { id: 'can1', file: 'v1.mp4', duration: 2.5, description: '工人正在进行地面打磨，灰尘被吸尘器吸走，展示施工专业性。' },
    { id: 'can2', file: 'v2.mp4', duration: 1.8, description: '特写镜头展示涂料在地面上流动的质感，像镜面一样平滑。' },
    { id: 'can3', file: 'v3.mp4', duration: 3.2, description: '全景展示完工后的仓库地面，反光效果极佳，焕然一新。' },
    { id: 'can4', file: 'v4.mp4', duration: 2.1, description: '延时摄影展示地坪漆干透的过程，颜色逐渐变得饱满。' },
  ];

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
              {['视频分析', '脚本规划', '混剪生成'].map((label, i) => {
                const steps: AppStep[] = ['replicate-flow', 'storyboard', 'generating'];
                const isActive = steps.indexOf(step) >= i;
                return (
                  <div key={label} className="flex items-center">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${isActive ? 'text-orange-400 bg-orange-400/10' : 'text-white/30'}`}>
                      {label}
                    </span>
                    {i < 2 && <ChevronRight className="w-3 h-3 text-white/10 mx-1" />}
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
          {step === 'replicate-flow' && (
            <motion.div 
              key="replicate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                {replicateSubStep > 1 ? (
                  <button onClick={handleBack} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">返回</span>
                  </button>
                ) : (
                  <div /> // Placeholder to keep progress bars on the right
                )}
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
                      <h2 className="text-2xl font-bold mb-2">开始复刻创作</h2>
                      <p className="text-sm text-white/40">上传视频文件或输入视频链接，AI 将自动分析结构</p>
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
                            <p className="text-sm font-bold text-green-400 mb-2">识别成功：{videoType === 'mashup' ? '混剪视频' : '其他类型'}</p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setUploadStatus('idle');
                                setVideoUrl('');
                                setUploadedFile(null);
                              }}
                              className="text-xs text-white/40 hover:text-orange-500 transition-colors underline underline-offset-4"
                            >
                              重新上传或更换链接
                            </button>
                            {videoType !== 'mashup' && <p className="text-xs text-orange-400 mt-4 bg-orange-400/10 py-1 px-3 rounded-full inline-block">口播/纯展示模式还在开发中</p>}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/5"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#16181d] px-4 text-white/20">或者输入视频链接</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <LinkIcon className="w-4 h-4 text-white/20" />
                        </div>
                        <input 
                          type="text"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="粘贴抖音、快手、视频号等视频链接..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                        />
                      </div>
                      <button 
                        onClick={() => videoUrl && setUploadStatus('analyzing')}
                        disabled={!videoUrl || (uploadStatus !== 'idle' && uploadStatus !== 'success')}
                        className="px-8 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 text-white font-bold rounded-xl transition-colors"
                      >
                        解析
                      </button>
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
                        <p className="text-xs text-white/40">输入要推广的商品 SKU，AI 将自动获取卖点</p>
                      </div>

                      <div className="space-y-4">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Plus className="w-4 h-4 text-white/20" />
                          </div>
                          <input 
                            type="text"
                            value={sku} 
                            onChange={(e) => setSku(e.target.value)}
                            placeholder="请输入商品 SKU 编码..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">产品卖点</label>
                          <button className="text-[10px] text-orange-500 hover:text-orange-400 font-bold">自动提取</button>
                        </div>
                        <textarea 
                          rows={3} 
                          value={sellingPoints}
                          onChange={(e) => setSellingPoints(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 resize-none"
                          placeholder="输入或确认产品核心卖点..."
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
              className="max-w-[1400px] mx-auto px-6 py-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                  <h2 className="text-4xl font-bold tracking-tight">脚本规划</h2>
                  <p className="text-sm text-white/40">AI已为您自动规划脚本，您可以点击左侧切换镜头组，在右侧调整素材细节</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={handleBack} className="px-6 py-2.5 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-all">上一步</button>
                  <button onClick={() => setIsConfigModalOpen(true)} className="px-10 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2">
                    确认并生成 <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-10 items-start">
                {/* Left Panel: Script Structure */}
                <div className="col-span-12 lg:col-span-4 space-y-6 sticky top-24">
                  <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest px-2">脚本结构</h3>
                  
                  <div className="space-y-4">
                    <Reorder.Group axis="y" values={timeline} onReorder={setTimeline} className="space-y-4">
                      {timeline.map((segment) => (
                        <Reorder.Item
                          key={segment.seg_id}
                          value={segment}
                          className="relative"
                        >
                          <button
                            onClick={() => setActiveSegmentId(segment.seg_id)}
                            className={`w-full text-left p-5 rounded-[24px] border transition-all relative group ${
                              activeSegmentId === segment.seg_id 
                                ? 'bg-[#1c1e24] border-orange-500/50 ring-1 ring-orange-500/50' 
                                : 'bg-[#16181d] border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                                  activeSegmentId === segment.seg_id ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/60'
                                }`}>
                                  {segment.aida_stage}
                                </span>
                                <span className="text-[11px] font-medium text-white/40">{segment.sub_function}</span>
                                <span className="text-[11px] font-medium text-white/40">{segment.clips.length}个分镜</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-white/20">{segment.target_duration}s</span>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                  <Layers className="w-3 h-3 text-white/20" />
                                </div>
                              </div>
                            </div>
                            <p className={`text-xs leading-relaxed line-clamp-2 ${
                              activeSegmentId === segment.seg_id ? 'text-white/90 font-medium' : 'text-white/40'
                            }`}>
                              {segment.voiceover_text}
                            </p>
                          </button>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>

                  <button 
                    onClick={addSegment}
                    className="w-full py-4 rounded-[24px] border border-dashed border-white/5 text-white/20 hover:text-white/40 hover:border-white/10 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                  >
                    <Plus className="w-4 h-4" /> 添加脚本片段
                  </button>
                </div>

                {/* Right Panel: Segment Details & Shot List */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                  {currentSegment && (
                    <motion.div 
                      key={currentSegment.seg_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      {/* Segment Editor Box */}
                      <div className="bg-[#16181d] border border-white/10 rounded-[32px] p-10 space-y-10">
                        <div className="space-y-6">
                          {/* Cascading Dropdown */}
                          <div className="flex items-center gap-8 relative z-[60]">
                            <label className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] w-20">脚本阶段</label>
                            <div className="relative flex-1 max-w-[480px]">
                              <button 
                                onClick={() => {
                                  setOpenDropdown(openDropdown === 'cascading' ? null : 'cascading');
                                  setHoveredStage(currentSegment.aida_stage);
                                }}
                                className={`flex items-center justify-between w-full px-6 py-4 rounded-2xl bg-[#1c1e24] border transition-all ${
                                  openDropdown === 'cascading' ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-white/5 hover:border-white/10'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-[13px] font-bold text-orange-500">{currentSegment.aida_stage}</span>
                                  <span className="text-[15px] font-bold text-white/90">{currentSegment.sub_function}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-white/20 transition-transform ${openDropdown === 'cascading' ? 'rotate-180' : ''}`} />
                              </button>
                              
                              <AnimatePresence>
                                {openDropdown === 'cascading' && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 mt-3 flex bg-[#1c1e24] border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] min-w-[500px]"
                                  >
                                    {/* Left Panel: Stages */}
                                    <div className="w-[200px] border-r border-white/5 py-4 bg-black/20">
                                      {Object.keys(AIDA_SUB_FUNCTIONS).map(stage => (
                                        <button
                                          key={stage}
                                          onMouseEnter={() => setHoveredStage(stage)}
                                          className={`w-full text-left px-6 py-4 text-[13px] font-bold transition-all flex items-center justify-between group ${
                                            hoveredStage === stage ? 'text-orange-500 bg-orange-500/5' : 'text-white/40 hover:text-white/60'
                                          }`}
                                        >
                                          {stage}
                                          <ChevronRight className={`w-3 h-3 transition-transform ${hoveredStage === stage ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
                                        </button>
                                      ))}
                                    </div>

                                    {/* Right Panel: Sub-functions */}
                                    <div className="flex-1 py-4 bg-[#1c1e24]">
                                      <div className="px-6 py-2 mb-2">
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{hoveredStage} 子功能</span>
                                      </div>
                                      <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                                        {(AIDA_SUB_FUNCTIONS[hoveredStage || ''] || []).map(sub => (
                                          <button
                                            key={sub}
                                            onClick={() => {
                                              updateSegment(currentSegment.seg_id, 'aida_stage', hoveredStage!);
                                              updateSegment(currentSegment.seg_id, 'sub_function', sub);
                                              setOpenDropdown(null);
                                            }}
                                            className={`w-full text-left px-8 py-4 text-[14px] font-bold transition-all hover:bg-white/5 ${
                                              currentSegment.sub_function === sub && currentSegment.aida_stage === hoveredStage 
                                                ? 'text-orange-500 bg-orange-500/5' 
                                                : 'text-white/70 hover:text-white'
                                            }`}
                                          >
                                            {sub}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                          
                          {/* Sub-function label row (empty as it's merged) */}
                          <div className="flex items-center gap-8">
                            <label className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] w-20">子功能</label>
                            <div className="text-[11px] text-white/10 italic">已合并至上方选择器</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                            <label className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em]">口播文案 (VO)</label>
                            <textarea 
                              value={currentSegment.voiceover_text}
                              onChange={(e) => updateSegment(currentSegment.seg_id, 'voiceover_text', e.target.value)}
                              className="w-full bg-black/40 border border-white/5 rounded-[24px] p-6 min-h-[140px] text-base text-white/90 leading-relaxed focus:outline-none focus:border-orange-500/30 transition-all resize-none"
                            />
                          </div>
                          <div className="space-y-4">
                            <label className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em]">片段目标描述</label>
                            <textarea 
                              value={currentSegment.description}
                              onChange={(e) => updateSegment(currentSegment.seg_id, 'description', e.target.value)}
                              className="w-full bg-black/40 border border-white/5 rounded-[24px] p-6 min-h-[140px] text-base text-white/60 leading-relaxed focus:outline-none focus:border-orange-500/30 transition-all resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Shot List Details */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                          <h3 className="text-lg font-bold">镜头组详情 ({currentSegment.clips.length})</h3>
                          <div className="flex items-center gap-6">
                            <span className="text-[11px] text-white/20 font-medium tracking-wide">总时长: {currentSegment.clips.reduce((acc, c) => acc + c.duration, 0).toFixed(1)}s</span>
                            <button 
                              onClick={() => addClip(currentSegment.seg_id)}
                              className="text-[11px] text-orange-500 font-bold hover:text-orange-400 flex items-center gap-1.5 transition-colors"
                            >
                              <Plus className="w-4 h-4" /> 添加分镜
                            </button>
                          </div>
                        </div>

                        <div className="space-y-5">
                          <Reorder.Group axis="y" values={currentSegment.clips} onReorder={(newClips) => reorderClips(currentSegment.seg_id, newClips)} className="space-y-5">
                            {currentSegment.clips.map((clip) => (
                              <Reorder.Item
                                key={clip.id}
                                value={clip}
                                className="relative"
                              >
                                <div className="group bg-[#16181d] border border-white/5 rounded-[28px] overflow-hidden hover:border-white/10 transition-all">
                                  <div className="flex flex-col md:flex-row">
                                    {/* Clip Preview */}
                                    <div 
                                      className="w-full md:w-[320px] aspect-video relative flex-shrink-0 bg-black group/preview cursor-pointer"
                                      onClick={() => {
                                        if (clip.file === 'placeholder.mp4') {
                                          setMaterialTarget({ segId: currentSegment.seg_id, clipId: clip.id });
                                          fileInputRef.current?.click();
                                        }
                                      }}
                                    >
                                      {clip.file === 'placeholder.mp4' ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-white/5 border-2 border-dashed border-white/10 rounded-l-[28px] group-hover/preview:bg-white/10 transition-all">
                                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                            <Upload className="w-5 h-5 text-white/20" />
                                          </div>
                                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">点击上传素材</span>
                                        </div>
                                      ) : (
                                        <>
                                          <img 
                                            src={`https://picsum.photos/seed/${clip.id}/640/360`} 
                                            alt="Clip" 
                                            className="w-full h-full object-cover opacity-80 group-hover/preview:opacity-100 transition-opacity"
                                            referrerPolicy="no-referrer" 
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity">
                                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                              <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                                            </div>
                                          </div>
                                        </>
                                      )}
                                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                        <span className="text-[10px] font-bold bg-black/80 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-md">{clip.duration}s</span>
                                      </div>
                                    </div>

                                    {/* Clip Content */}
                                    <div className="flex-1 p-6 space-y-6 relative">
                                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                        <Layers className="w-4 h-4 text-white/20" />
                                      </div>
                                      <div className="flex items-center justify-end">
                                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                          <Clock className="w-3.5 h-3.5 text-white/20" />
                                          <span className="text-xs font-bold text-orange-400">{clip.duration}</span>
                                          <span className="text-[10px] text-white/20">s</span>
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest">画面描述</label>
                                        <p className="text-sm text-white/60 leading-relaxed">{clip.description}</p>
                                      </div>

                                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                                        <button 
                                          onClick={() => {
                                            setMaterialTarget({ segId: currentSegment.seg_id, clipId: clip.id });
                                            setIsChangeMaterialOpen(true);
                                          }}
                                          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-bold flex items-center gap-2 transition-all"
                                        >
                                          <RefreshCw className="w-3.5 h-3.5" /> 换素材
                                        </button>
                                        <button 
                                          onClick={() => handleAIGenerate(currentSegment.seg_id, clip.id)}
                                          className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-xl text-[11px] font-bold flex items-center gap-2 transition-all"
                                        >
                                          <Wand2 className="w-3.5 h-3.5" /> AI 生成
                                        </button>
                                        <button 
                                          onClick={() => removeClip(currentSegment.seg_id, clip.id)}
                                          className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/20 hover:text-red-500 border border-white/5 transition-colors"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Reorder.Item>
                            ))}
                          </Reorder.Group>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Change Material Modal */}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="video/*" 
                onChange={(e) => {
                  if (e.target.files?.[0] && materialTarget) {
                    handleSwapMaterial(materialTarget.segId, materialTarget.clipId, {
                      file: 'uploaded-video.mp4',
                      duration: 2.0,
                      description: '用户上传的本地视频素材。'
                    });
                  }
                }}
              />
              <AnimatePresence>
                {isChangeMaterialOpen && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsChangeMaterialOpen(false)}
                      className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="relative w-full max-w-4xl bg-[#16181d] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
                    >
                      <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold">更换素材</h3>
                          <p className="text-xs text-white/40 mt-1">为您推荐同槽位的相似镜头，或上传本地素材</p>
                        </div>
                        <button 
                          onClick={() => setIsChangeMaterialOpen(false)}
                          className="p-2 rounded-full hover:bg-white/5 transition-colors"
                        >
                          <Plus className="w-6 h-6 rotate-45 text-white/40" />
                        </button>
                      </div>

                      <div className="p-8 space-y-8">
                        {/* Upload Section */}
                        <div className="flex justify-center">
                          <button 
                            onClick={() => document.getElementById('modal-upload')?.click()}
                            className="w-full max-w-md flex flex-col items-center justify-center gap-3 p-10 rounded-[24px] border-2 border-dashed border-orange-500/20 bg-orange-500/5 hover:border-orange-500/40 hover:bg-orange-500/10 transition-all group"
                          >
                            <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Upload className="w-7 h-7 text-orange-500" />
                            </div>
                            <span className="text-base font-bold text-white group-hover:text-orange-500 transition-colors">上传本地分镜</span>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">支持 MP4, MOV, AVI 等格式</p>
                            <input 
                              type="file" 
                              id="modal-upload" 
                              className="hidden" 
                              accept="video/*" 
                              onChange={(e) => {
                                if (e.target.files?.[0] && materialTarget) {
                                  handleSwapMaterial(materialTarget.segId, materialTarget.clipId, {
                                    file: 'uploaded-video.mp4',
                                    duration: 2.0,
                                    description: '用户上传的本地视频素材。'
                                  });
                                }
                              }}
                            />
                          </button>
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-2">
                            <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest">同槽位相似镜头推荐</h4>
                            <span className="text-[10px] text-white/20">基于画面语义匹配</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            {CANDIDATE_CLIPS.map((candidate) => (
                              <div 
                                key={candidate.id}
                                className="group relative bg-black/40 border border-white/5 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer"
                                onClick={() => materialTarget && handleSwapMaterial(materialTarget.segId, materialTarget.clipId, candidate)}
                              >
                                <div className="aspect-video relative">
                                  <img 
                                    src={`https://picsum.photos/seed/${candidate.id}/400/225`} 
                                    alt="Candidate" 
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl shadow-lg">使用此素材</div>
                                  </div>
                                  <div className="absolute bottom-2 left-2">
                                    <span className="text-[9px] font-bold bg-black/80 px-2 py-0.5 rounded border border-white/10">{candidate.duration}s</span>
                                  </div>
                                </div>
                                <div className="p-3">
                                  <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed">{candidate.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
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
              className="max-w-5xl mx-auto px-6 py-20"
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-4xl font-bold tracking-tight">生成完成！</h2>
                <div className="flex gap-4">
                  <button className="px-10 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2">
                    下载视频 <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="relative aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl border border-white/5 group">
                <img 
                  src="https://picsum.photos/seed/final/1920/1080" 
                  alt="Final Result" 
                  className="w-full h-full object-cover opacity-80" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-20 h-20 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center transition-all group-hover:scale-110">
                    <Play className="w-8 h-8 text-white fill-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Generation Config Modal */}
      <AnimatePresence>
        {isConfigModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfigModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#16181d] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-10 space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">生成配置</h3>
                  <button 
                    onClick={() => setIsConfigModalOpen(false)}
                    className="p-2 rounded-full hover:bg-white/5 text-white/20 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Subtitle Style Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-8">
                      <label className="text-sm font-bold text-white/40 flex items-center gap-2">
                        <span className="text-red-500">*</span> 字幕样式：
                      </label>
                      <div className="flex items-center gap-8">
                        <button 
                          onClick={() => setNeedsSubtitle(true)}
                          className="flex items-center gap-3 group"
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${needsSubtitle ? 'border-orange-500' : 'border-white/20 group-hover:border-white/40'}`}>
                            {needsSubtitle && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                          </div>
                          <span className={`text-sm font-bold transition-colors ${needsSubtitle ? 'text-orange-500' : 'text-white/40'}`}>需要字幕</span>
                        </button>
                        <button 
                          onClick={() => setNeedsSubtitle(false)}
                          className="flex items-center gap-3 group"
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${!needsSubtitle ? 'border-orange-500' : 'border-white/20 group-hover:border-white/40'}`}>
                            {!needsSubtitle && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                          </div>
                          <span className={`text-sm font-bold transition-colors ${!needsSubtitle ? 'text-orange-500' : 'text-white/40'}`}>不需要字幕</span>
                        </button>
                      </div>
                    </div>

                    {needsSubtitle && (
                      <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                        {SUBTITLE_STYLES.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => setSubtitleStyle(style.id)}
                            className={`aspect-[4/3] rounded-xl border-2 flex items-center justify-center p-2 transition-all overflow-hidden ${
                              subtitleStyle === style.id 
                                ? 'border-orange-500 bg-orange-500/5 shadow-[0_0_15px_rgba(249,115,22,0.2)]' 
                                : 'border-white/5 bg-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className={`text-[10px] font-bold text-center leading-tight ${style.box ? `px-2 py-1 rounded ${style.color} text-white` : style.badge ? `px-3 py-2 rounded-lg ${style.color} text-white relative after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-inherit` : style.border ? `px-2 py-1 border-2 ${style.color} text-white` : style.tiktok ? 'text-white drop-shadow-[2px_2px_0_#ff0050] [-webkit-text-stroke:1px_#00f2ea]' : style.shadow ? `${style.color} drop-shadow-md` : 'text-white'}`}>
                              {style.preview}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-10 flex gap-4">
                  <button 
                    onClick={() => setIsConfigModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl border border-white/10 text-sm font-bold hover:bg-white/5 transition-all"
                  >
                    取消
                  </button>
                  <button 
                    onClick={() => {
                      setIsConfigModalOpen(false);
                      handleNext();
                    }}
                    className="flex-[2] py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-500/20 transition-all"
                  >
                    开始混剪视频
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Generation Modal */}
      <AnimatePresence>
        {isAIGenModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAIGenModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#1a1d23] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">AI 画面生成</h3>
                    <p className="text-sm text-white/40 mt-1">基于画面描述生成高品质视频素材</p>
                  </div>
                  <button 
                    onClick={() => setIsAIGenModalOpen(false)}
                    className="p-2 rounded-full hover:bg-white/5 transition-colors"
                  >
                    <X className="w-6 h-6 text-white/20 hover:text-white" />
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest">画面描述 (Prompt)</label>
                  <textarea 
                    value={aiGenPrompt}
                    onChange={(e) => setAiGenPrompt(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-sm focus:outline-none focus:border-orange-500 resize-none h-32 leading-relaxed"
                    placeholder="描述你想要的画面细节..."
                  />
                </div>

                <div className="aspect-video bg-black/60 rounded-3xl border border-white/5 overflow-hidden relative flex items-center justify-center group">
                  {isAiGenLoading ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                      <span className="text-sm font-bold text-orange-500 animate-pulse">AI 正在生成中...</span>
                    </div>
                  ) : aiGenResult ? (
                    <>
                      <img src={aiGenResult} alt="AI Result" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                          <Play className="w-6 h-6 text-white fill-current ml-1" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-white/10">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                        <Sparkles className="w-10 h-10" />
                      </div>
                      <span className="text-sm font-medium">点击下方按钮开始生成</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  {!aiGenResult ? (
                    <button 
                      onClick={startAIGeneration}
                      disabled={isAiGenLoading || !aiGenPrompt}
                      className="flex-1 py-5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-orange-500/20"
                    >
                      <Wand2 className="w-5 h-5" /> 开始生成
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={startAIGeneration}
                        disabled={isAiGenLoading}
                        className="flex-1 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                      >
                        <RefreshCw className={`w-5 h-5 ${isAiGenLoading ? 'animate-spin' : ''}`} /> 重新生成
                      </button>
                      <button 
                        onClick={confirmAIGenerate}
                        className="flex-[2] py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-orange-500/20"
                      >
                        确认并插入分镜
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
