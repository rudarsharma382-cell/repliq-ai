'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  SandpackProvider, SandpackLayout, SandpackPreview 
} from '@codesandbox/sandpack-react';
import { 
  ArrowLeft, Download, RotateCw, Monitor, Tablet, Smartphone, 
  ExternalLink, Layers, FileCode, CheckCircle2, ChevronRight, Send, 
  Loader2, Info, Eye, Image as ImageIcon, Terminal, Sliders 
} from 'lucide-react';
import { getProject, updateProject, getCredits, deductCredits, Project, PRESETS } from '@/lib/ai/pipeline';
import { sandboxDocument, sandboxExternalResources } from '@/lib/ai/sandbox-html';
import { sanitizeGeneratedTsx } from '@/lib/ai/sanitize-tsx';
import { RepliqLogo } from '@/components/repliq-logo';

export default function WorkspacePage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  // Project state
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'screenshots' | 'tokens' | 'logs'>('files');
  const [activeFile, setActiveFile] = useState('/App.tsx');
  
  // Viewport and mode settings
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [comparisonMode, setComparisonMode] = useState<'preview' | 'split' | 'overlay'>('preview');
  const [overlayOpacity, setOverlayOpacity] = useState(50);

  // Command bar states
  const [promptInput, setPromptInput] = useState('');
  const [isApplyingPrompt, setIsApplyingPrompt] = useState(false);
  const [promptMessage, setPromptMessage] = useState('');

  // Refresh sandbox counter
  const [refreshKey, setRefreshKey] = useState(0);

  // Local credits store
  const [credits, setCredits] = useState(100);

  // Load project on mount
  useEffect(() => {
    if (!id) return;
    const p = getProject(id);
    if (!p) {
      router.push('/dashboard');
      return;
    }
    // Self-heal any legacy projects with obsolete lucide imports
    if (p.files && p.files['/App.tsx'] && p.files['/App.tsx'].includes('import { ArrowUpRight, Github')) {
      p.files['/App.tsx'] = PRESETS.portfolio.files['/App.tsx'];
      const updated = updateProject(p.id, { files: p.files });
      setProject(updated);
    } else {
      setProject(p);
    }
    setCredits(getCredits());
  }, [id, router]);

  if (!project) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-xs font-mono text-[#8A8A8F]">
        <Loader2 className="w-4 h-4 animate-spin text-[#8B5CF6] mr-2" />
        LOADING WORKSPACE...
      </div>
    );
  }

  // Handle prompt edits through OpenRouter
  const handleSendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setIsApplyingPrompt(true);
    setPromptMessage('Repliq AI is mapping workspace dependencies...');

    try {
      setPromptMessage('Sending instruction to Qwen3 Coder...');
      const res = await fetch('/api/reconstruct/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptInput,
          files: project.files,
          activeFile: project.activeFile || '/App.tsx',
        }),
      });
      const data = (await res.json()) as {
        files?: Record<string, string>;
        error?: string;
        credits?: number;
        usage?: { total_tokens?: number };
      };

      if (!res.ok || !data.files) {
        throw new Error(data.error || 'Edit failed');
      }

      const charged = data.credits || 4;
      const remaining = deductCredits(charged);

      const newLogs = [
        ...project.logs,
        {
          timestamp: new Date().toLocaleTimeString(),
          message: `AI Command received: "${promptInput}"`,
          type: 'info' as const,
        },
        {
          timestamp: new Date().toLocaleTimeString(),
          message: `Patched workspace · ${data.usage?.total_tokens || 0} tokens · ${charged} credits.`,
          type: 'success' as const,
        },
      ];

      const updated = updateProject(project.id, {
        files: data.files,
        logs: newLogs,
        creditsUsed: (project.creditsUsed || 0) + charged,
      });

      setCredits(remaining);

      setProject(updated);
      setPromptInput('');
      setPromptMessage('');
    } catch (error) {
      setPromptMessage(error instanceof Error ? error.message : 'Edit failed');
    } finally {
      setIsApplyingPrompt(false);
    }
  };

  // ZIP export trigger simulation
  const handleExportZip = () => {
    alert('Project Export Initiated!\nDownloading zip package with Next.js structures, components, and Tailwind config files.');
  };

  // Viewport sizes
  const getViewportWidthClass = () => {
    if (viewport === 'tablet') return 'w-[768px] max-w-full';
    if (viewport === 'mobile') return 'w-[375px] max-w-full';
    return 'w-full max-w-full';
  };

  // Build the sandpack mount key to force compile refresh
  const sandpackKey = `${project.id}-${Object.values(project.files).join('').length}-${comparisonMode}-${refreshKey}`;

  const previewStyles = `* {
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
  background-color: #050505;
  color: #F5F5F5;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}`;

  const previewIndex = `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}`;

  return (
    <div className="h-screen bg-[#050505] text-[#F5F5F5] font-sans flex flex-col justify-between overflow-hidden">
      
      {/* Workspace Header */}
      <header className="h-14 border-b border-white/8 bg-[#0B0B0D] px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-1 text-[#8A8A8F] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="flex items-center gap-2.5">
            <RepliqLogo size={22} className="h-6 w-6" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider">{project.name}</span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              READY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-[11px] font-mono text-[#8A8A8F]">
            Wallet: <strong className="text-white">{credits} Credits</strong>
          </span>
          <button 
            onClick={handleExportZip}
            className="px-3.5 py-1.5 border border-white/8 hover:border-[#8B5CF6]/30 bg-[#101012] hover:bg-[#8B5CF6]/5 transition-all text-[11px] font-semibold rounded-lg text-white flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export ZIP
          </button>
        </div>
      </header>

      {/* Main Split Panels Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Left Sidebar navigation and inspector */}
        <aside className="w-80 border-r border-white/8 bg-[#0B0B0D] flex flex-col shrink-0 min-h-0">
          <div className="grid grid-cols-4 h-11 border-b border-white/8 text-[10px] font-sans font-medium uppercase tracking-tighter text-[#8A8A8F]">
            <button 
              onClick={() => setActiveTab('files')}
              className={`border-r border-white/8 transition-colors ${activeTab === 'files' ? 'bg-[#101012] text-[#E1E0CC] font-semibold' : 'text-[#8A8A8F] hover:bg-white/3'}`}
            >
              FILES
            </button>
            <button 
              onClick={() => setActiveTab('screenshots')}
              className={`border-r border-white/8 transition-colors ${activeTab === 'screenshots' ? 'bg-[#101012] text-[#E1E0CC] font-semibold' : 'text-[#8A8A8F] hover:bg-white/3'}`}
            >
              IMGS
            </button>
            <button 
              onClick={() => setActiveTab('tokens')}
              className={`border-r border-white/8 transition-colors ${activeTab === 'tokens' ? 'bg-[#101012] text-[#E1E0CC] font-semibold' : 'text-[#8A8A8F] hover:bg-white/3'}`}
            >
              TOKENS
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`transition-colors ${activeTab === 'logs' ? 'bg-[#101012] text-[#E1E0CC] font-semibold' : 'text-[#8A8A8F] hover:bg-white/3'}`}
            >
              LOGS
            </button>
          </div>

          {/* Active Tab Inspect Panel content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'files' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] text-[#8A8A8F] font-mono tracking-wider uppercase border-b border-white/5 pb-2">
                  <span>Workspace Directory</span>
                  <span>FILES</span>
                </div>
                <div className="space-y-1">
                  {Object.keys(project.files).map((filepath) => (
                    <button
                      key={filepath}
                      onClick={() => setActiveFile(filepath)}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-mono transition-colors flex items-center gap-2 ${
                        activeFile === filepath ? 'bg-[#8B5CF6]/10 text-white border border-[#8B5CF6]/30' : 'text-[#8A8A8F] hover:bg-white/4'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{filepath.replace('/', '')}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'screenshots' && (
              <div className="space-y-4">
                <div className="text-[10px] text-[#8A8A8F] font-mono tracking-wider uppercase border-b border-white/5 pb-2">
                  <span>Reference Screenshots</span>
                </div>
                <div className="space-y-4">
                  {project.screenshots.map((s) => (
                    <div key={s.id} className="border border-white/8 bg-[#101012] rounded-lg p-2 space-y-2">
                      <img src={s.url} alt={s.name} className="w-full aspect-[1.5/1] rounded bg-cover border border-white/5 object-cover" />
                      <div className="text-[9px] font-mono leading-normal text-[#8A8A8F]">
                        <p className="text-white font-semibold truncate">{s.name}</p>
                        <p>{s.dimensions} · {s.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tokens' && (
              <div className="space-y-4">
                <div className="text-[10px] text-[#8A8A8F] font-mono tracking-wider uppercase border-b border-white/5 pb-2">
                  <span>Detected Layout Tokens</span>
                </div>
                {project.detectedTokens ? (
                  <pre className="p-3 bg-[#050505] border border-white/8 rounded-lg text-[9px] font-mono text-[#8A8A8F] leading-normal overflow-x-auto">
                    {JSON.stringify(project.detectedTokens, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center py-6 text-xs text-[#8A8A8F]">
                    No tokens parsed.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-4">
                <div className="text-[10px] text-[#8A8A8F] font-mono tracking-wider uppercase border-b border-white/5 pb-2">
                  <span>Compilation Logs</span>
                </div>
                <div className="space-y-2 font-mono text-[9px] text-[#8A8A8F]">
                  {project.logs.map((log, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <span className="text-white/20">{log.timestamp}</span>
                      <span className={log.type === 'success' ? 'text-emerald-400' : log.type === 'warn' ? 'text-amber-400' : 'text-[#8A8A8F]'}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Live Preview Pane & Suite */}
        <main className="flex-1 bg-[#050505] flex flex-col overflow-hidden min-h-0">
          
          {/* Comparison Suite controls */}
          <div className="h-12 border-b border-white/8 bg-[#0B0B0D] px-6 flex items-center justify-between shrink-0">
            <div className="flex gap-1.5 p-0.5 bg-[#101012] border border-white/8 rounded-lg text-[10px] font-mono font-semibold">
              <button 
                onClick={() => setComparisonMode('preview')}
                className={`px-3 py-1 rounded-md transition-colors ${comparisonMode === 'preview' ? 'bg-[#E1E0CC] text-black' : 'text-[#8A8A8F] hover:text-white'}`}
              >
                LIVE SITE
              </button>
              <button 
                onClick={() => setComparisonMode('split')}
                className={`px-3 py-1 rounded-md transition-colors ${comparisonMode === 'split' ? 'bg-[#E1E0CC] text-black' : 'text-[#8A8A8F] hover:text-white'}`}
              >
                SPLIT VIEW
              </button>
              <button 
                onClick={() => setComparisonMode('overlay')}
                className={`px-3 py-1 rounded-md transition-colors ${comparisonMode === 'overlay' ? 'bg-[#E1E0CC] text-black' : 'text-[#8A8A8F] hover:text-white'}`}
              >
                OVERLAY SLIDER
              </button>
            </div>

            {/* Overlay opacity settings */}
            {comparisonMode === 'overlay' && (
              <div className="flex items-center gap-3 text-xs font-mono text-[#8A8A8F]">
                <span>SLIDER POSITION:</span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseInt(e.target.value))}
                  className="w-32 accent-[#8B5CF6] bg-white/10 h-1 rounded-lg cursor-pointer"
                />
                <span className="text-[#E1E0CC] font-bold">{overlayOpacity}%</span>
              </div>
            )}

            {/* Viewports and refresh options */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-[#101012] border border-white/8 rounded-lg p-0.5">
                <button 
                  onClick={() => setViewport('desktop')}
                  className={`p-1 rounded transition-colors ${viewport === 'desktop' ? 'bg-white/8 text-white' : 'text-[#8A8A8F] hover:text-white'}`}
                  title="Desktop Viewport"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setViewport('tablet')}
                  className={`p-1 rounded transition-colors ${viewport === 'tablet' ? 'bg-white/8 text-white' : 'text-[#8A8A8F] hover:text-white'}`}
                  title="Tablet Viewport"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setViewport('mobile')}
                  className={`p-1 rounded transition-colors ${viewport === 'mobile' ? 'bg-white/8 text-white' : 'text-[#8A8A8F] hover:text-white'}`}
                  title="Mobile Viewport"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="h-4 w-px bg-white/10"></div>

              <button 
                onClick={() => setRefreshKey(prev => prev + 1)} 
                className="p-1.5 text-[#8A8A8F] hover:text-white transition-colors hover:bg-white/4 rounded"
                title="Refresh Frame"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Browser frame wrapper */}
          <div className="flex-1 p-3 md:p-5 flex justify-center items-stretch overflow-hidden min-h-0">
            <div className={`${getViewportWidthClass()} bg-[#0B0B0D] border border-white/8 rounded-xl overflow-hidden flex flex-col h-full transition-all duration-300 shadow-2xl min-h-0`}>
              
              {/* Browser chrome shell top */}
              <div className="h-9 px-4 bg-[#101012] border-b border-white/8 flex items-center justify-between shrink-0 select-none">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></span>
                </div>
                <div className="bg-[#050505] border border-white/5 rounded-md px-12 py-0.5 text-[9px] font-mono text-[#8A8A8F] truncate flex items-center gap-1.5">
                  <span>repliq-preview.local</span>
                </div>
                <ExternalLink className="w-3 h-3 text-[#8A8A8F]" />
              </div>

              {/* Viewport wrapper box for content modes */}
              <div className="flex-1 relative overflow-hidden bg-[#050505] min-h-0 h-full w-full">
                
                {/* Sandpack Provider and sandboxed renderer */}
                <SandpackProvider
                  key={sandpackKey}
                  template="react"
                  theme={String(project.detectedTokens?.theme || "").toLowerCase().includes("light") ? "light" : "dark"}
                  className="!h-full !w-full flex flex-col flex-1 min-h-0"
                  style={{ height: '100%', width: '100%' }}
                  files={{
                    ...project.files,
                    "/App.tsx": sanitizeGeneratedTsx(project.files["/App.tsx"] || ""),
                    "/public/index.html": sandboxDocument(project.detectedTokens),
                    "/index.html": sandboxDocument(project.detectedTokens),
                    "/styles.css": previewStyles,
                    "/index.tsx": previewIndex,
                    "/index.js": previewIndex,
                  }}
                  customSetup={{
                    dependencies: {
                      "lucide-react": "^0.344.0"
                    }
                  }}
                  options={{
                    activeFile: project.activeFile || "/App.tsx",
                    visibleFiles: Object.keys(project.files),
                    autorun: true,
                    autoReload: true,
                    recompileMode: "delayed",
                    recompileDelay: 150,
                    externalResources: sandboxExternalResources(project.detectedTokens),
                  }}
                >
                  {comparisonMode === 'preview' && (
                    <SandpackPreview 
                      showNavigator={false} 
                      showOpenInCodeSandbox={false}
                      showRefreshButton={false}
                      showRestartButton={false}
                      className="!w-full !h-full !border-none flex-1 min-h-0"
                      style={{ height: '100%', width: '100%' }}
                    />
                  )}

                  {comparisonMode === 'split' && (
                    <div className="w-full h-full grid grid-cols-2 min-h-0 overflow-hidden">
                      {/* Left: Original reference */}
                      <div className="border-r border-white/8 relative bg-[#0B0B0D] overflow-hidden select-none flex items-center justify-center min-h-0">
                        <div className="absolute top-2 left-2 bg-[#050505]/80 px-2 py-0.5 border border-white/5 rounded text-[8px] font-mono text-[#8A8A8F] z-10">
                          ORIGINAL REFERENCE
                        </div>
                        {project.screenshots[0]?.url ? (
                          <img 
                            src={project.screenshots[0].url} 
                            alt="reference" 
                            className="w-full h-full object-contain bg-[#050505]" 
                          />
                        ) : (
                          <div className="text-xs text-[#8A8A8F] font-mono">No reference image</div>
                        )}
                      </div>
                      
                      {/* Right: Compiled code output */}
                      <div className="h-full w-full flex flex-col min-h-0 overflow-hidden">
                        <SandpackPreview 
                          showNavigator={false} 
                          showOpenInCodeSandbox={false}
                          showRefreshButton={false}
                          showRestartButton={false}
                          className="!w-full !h-full !border-none flex-1 min-h-0"
                          style={{ height: '100%', width: '100%' }}
                        />
                      </div>
                    </div>
                  )}

                  {comparisonMode === 'overlay' && (
                    <div className="w-full h-full relative min-h-0 overflow-hidden">
                      {/* Sandpack Live compiler underneath */}
                      <div className="w-full h-full absolute inset-0 z-0 overflow-hidden">
                        <SandpackPreview 
                          showNavigator={false} 
                          showOpenInCodeSandbox={false}
                          showRefreshButton={false}
                          showRestartButton={false}
                          className="!w-full !h-full !border-none flex-1 min-h-0"
                          style={{ height: '100%', width: '100%' }}
                        />
                      </div>

                      {/* Reference Screenshot (on top, clipped by overlayOpacity percentage) */}
                      <div 
                        className="absolute inset-y-0 left-0 overflow-hidden bg-[#050505] z-10 pointer-events-none border-r border-[#E1E0CC]"
                        style={{ width: `${overlayOpacity}%` }}
                      >
                        {project.screenshots[0]?.url ? (
                          <img 
                            src={project.screenshots[0].url} 
                            alt="Overlay reference" 
                            className="absolute inset-y-0 left-0 h-full w-full max-w-none object-cover border-none"
                          />
                        ) : null}
                      </div>

                      {/* Minimalist slider divider handler */}
                      <div 
                        className="absolute inset-y-0 w-[2px] bg-[#E1E0CC] flex items-center justify-center z-20 pointer-events-none"
                        style={{ left: `${overlayOpacity}%` }}
                      >
                        <div className="w-5 h-5 border border-[#E1E0CC] bg-[#050505] text-[#E1E0CC] flex items-center justify-center text-[8px] font-mono select-none">
                          ◀▶
                        </div>
                      </div>
                    </div>
                  )}
                </SandpackProvider>

              </div>
            </div>
          </div>

          {/* AI Command Input Bar */}
          <footer className="h-16 border-t border-white/8 bg-[#0B0B0D] px-6 flex items-center gap-3 shrink-0 relative">
            <form onSubmit={handleSendCommand} className="w-full flex gap-3">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  disabled={isApplyingPrompt}
                  placeholder="Ask Repliq to change layout spacing, colors, titles, buttons..."
                  className="w-full bg-[#101012] border border-white/8 rounded-lg pl-3 pr-10 py-2.5 text-xs text-[#F5F5F5] placeholder-[#8A8A8F] focus:outline-none focus:border-[#8B5CF6] transition-all disabled:opacity-50"
                />
                
                <button 
                  type="submit" 
                  disabled={!promptInput.trim() || isApplyingPrompt}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#8B5CF6] disabled:bg-white/5 text-white disabled:text-[#8A8A8F] rounded-md transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Simulated generation popup status */}
            {isApplyingPrompt && (
              <div className="absolute inset-0 bg-[#0B0B0D]/95 px-6 flex items-center gap-3 z-20">
                <Loader2 className="w-4.5 h-4.5 animate-spin text-[#8B5CF6] shrink-0" />
                <span className="text-xs font-mono text-[#8B5CF6] uppercase tracking-wider animate-pulse">
                  {promptMessage}
                </span>
              </div>
            )}
          </footer>

        </main>

      </div>
    </div>
  );
}
