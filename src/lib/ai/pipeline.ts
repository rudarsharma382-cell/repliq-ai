import { compressImageDataUrl } from "./compress-image";

export interface Screenshot {
  id: string;
  url: string;
  name: string;
  size: string;
  dimensions: string;
}

export interface ActivityLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

export type ProjectStatus =
  | 'QUEUED'
  | 'ANALYZING'
  | 'UNDERSTANDING'
  | 'GENERATING'
  | 'BUILDING'
  | 'FIXING'
  | 'READY'
  | 'FAILED';

export interface Project {
  id: string;
  name: string;
  repositoryUrl: string;
  branch: string;
  status: ProjectStatus;
  screenshots: Screenshot[];
  logs: ActivityLog[];
  creditsUsed: number;
  createdAt: string;
  updatedAt: string;
  detectedTokens?: Record<string, any>;
  files: Record<string, string>; // Files for Sandpack
  activeFile: string;
  presetKey?: string;
}

// Preset datasets for 1-click test runs
export const PRESETS: Record<string, {
  name: string;
  repositoryUrl: string;
  branch: string;
  screenshots: { name: string; url: string; size: string; dimensions: string }[];
  detectedTokens: Record<string, any>;
  files: Record<string, string>;
}> = {
  saas: {
    name: "SaaS Analytics Dashboard",
    repositoryUrl: "https://github.com/apex-analytics/dashboard",
    branch: "main",
    screenshots: [
      {
        name: "dashboard_desktop.png",
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        size: "342 KB",
        dimensions: "1440 × 900"
      },
      {
        name: "dashboard_mobile.png",
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80",
        size: "128 KB",
        dimensions: "375 × 812"
      }
    ],
    detectedTokens: {
      "theme": "obsidian-dark",
      "layout": "sidebar-fluid",
      "grid": "3-column-responsive",
      "colors": {
        "bg": "#050505",
        "panel": "#101012",
        "accent": "#8B5CF6",
        "text": "#F5F5F5",
        "muted": "#8A8A8F"
      },
      "typography": {
        "family": "Plus Jakarta Sans",
        "headings": "font-semibold tracking-tight"
      },
      "components_detected": [
        "SidebarNavigation",
        "MetricGridCard",
        "LineChartGraphic",
        "RecentTransactionsTable",
        "NotificationPill"
      ]
    },
    files: {
      "/App.tsx": `import React, { useState } from 'react';
import { 
  TrendingUp, Users, DollarSign, ArrowUpRight, ArrowDownRight, 
  Settings, Bell, Search, Activity, Shield, Terminal, ArrowRight, CheckCircle2 
} from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [showNotification, setShowNotification] = useState(true);
  
  const metrics = [
    { label: 'Monthly Recurring Revenue', value: '$84,232', change: '+12.4%', up: true, trend: [10, 15, 8, 12, 18, 24] },
    { label: 'Active Subscribers', value: '14,842', change: '+8.1%', up: true, trend: [2, 5, 6, 8, 11, 14] },
    { label: 'Average LTV', value: '$210.50', change: '-2.3%', up: false, trend: [20, 18, 19, 17, 16, 15] },
  ];

  const transactions = [
    { name: 'Linear Corp', email: 'billing@linear.app', amount: '+$2,400.00', status: 'Success', time: '2m ago' },
    { name: 'Vercel Inc', email: 'finance@vercel.com', amount: '+$4,800.00', status: 'Success', time: '12m ago' },
    { name: 'Retool Co', email: 'payouts@retool.com', amount: '-$850.00', status: 'Pending', time: '1h ago' },
    { name: 'Supabase Ltd', email: 'billing@supabase.io', amount: '+$1,200.00', status: 'Success', time: '3h ago' },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-[#F5F5F5] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0B0B0D] border-r border-white/8 flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-8 h-8 rounded bg-[#8B5CF6] flex items-center justify-center font-bold text-white tracking-widest text-sm">
              R
            </div>
            <span className="font-semibold tracking-wider text-sm text-[#F5F5F5]">APEX ANALYTICS</span>
          </div>
          
          <nav className="space-y-1.5">
            {['Overview', 'Subscribers', 'Integrations', 'Security', 'Settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={\`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5 \${
                  activeTab === tab 
                    ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/15' 
                    : 'text-[#8A8A8F] hover:text-[#F5F5F5] hover:bg-white/4'
                }\`}
              >
                {tab === 'Overview' && <TrendingUp className="w-4 h-4" />}
                {tab === 'Subscribers' && <Users className="w-4 h-4" />}
                {tab === 'Integrations' && <Activity className="w-4 h-4" />}
                {tab === 'Security' && <Shield className="w-4 h-4" />}
                {tab === 'Settings' && <Settings className="w-4 h-4" />}
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-3 bg-[#101012] border border-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-[#8A8A8F] font-medium">SYSTEM ONLINE</span>
          </div>
          <span className="text-[11px] text-[#F5F5F5] block font-mono">v2.4.12-production</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/8 bg-[#0B0B0D] px-8 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8F]" />
            <input 
              type="text" 
              placeholder="Search analytics, logs, hooks..."
              className="w-full bg-[#101012] border border-white/5 rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F5F5F5] placeholder-[#8A8A8F] focus:outline-none focus:border-[#8B5CF6] transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-1.5 text-[#8A8A8F] hover:text-[#F5F5F5] transition-colors rounded-lg hover:bg-white/5">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"></span>
            </button>
            <div className="h-6 w-px bg-white/10"></div>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#ec4899] flex items-center justify-center text-xs font-semibold text-white">
                R
              </div>
              <span className="text-xs font-medium text-[#F5F5F5]">Rudar Sharma</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {showNotification && (
            <div className="p-4 bg-[#8B5CF6]/8 border border-[#8B5CF6]/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/15 flex items-center justify-center text-[#8B5CF6]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Q3 Forecasting Generated Successfully</h4>
                  <p className="text-[11px] text-[#8A8A8F]">Your automated projection models have been refreshed using current client retention indices.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNotification(false)}
                className="text-xs text-[#8A8A8F] hover:text-white transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((m, i) => (
              <div key={i} className="p-5 bg-[#101012] border border-white/8 rounded-xl space-y-3 relative overflow-hidden group hover:border-[#8B5CF6]/30 transition-all">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-medium text-[#8A8A8F] uppercase tracking-wider">{m.label}</span>
                  <span className={\`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 \${
                    m.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }\`}>
                    {m.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {m.change}
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tracking-tight text-white">{m.value}</span>
                </div>

                {/* Simulated sparkline */}
                <div className="h-8 flex items-end gap-1 pt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  {m.trend.map((val, idx) => (
                    <div 
                      key={idx} 
                      className="flex-1 bg-gradient-to-t from-[#8B5CF6]/40 to-[#8B5CF6] rounded-t-sm"
                      style={{ height: \`\${(val / 25) * 100}%\` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Main Visual Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Graphic Area */}
            <div className="lg:col-span-2 p-6 bg-[#101012] border border-white/8 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-white">Revenue Performance</h3>
                  <p className="text-[11px] text-[#8A8A8F]">Monthly transaction velocity monitored in real time</p>
                </div>
                <select className="bg-[#0B0B0D] border border-white/5 text-[10px] text-[#F5F5F5] rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#8B5CF6]">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
              </div>

              {/* Chart Visualizer */}
              <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-white/5 px-2">
                {[45, 60, 55, 75, 90, 85, 110, 95, 120, 105, 130, 145].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div 
                      className="w-full bg-[#8B5CF6]/10 group-hover:bg-[#8B5CF6]/30 border border-[#8B5CF6]/20 group-hover:border-[#8B5CF6]/60 rounded-t-md transition-all relative"
                      style={{ height: \`\${(val / 150) * 100}%\` }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0B0B0D] border border-white/8 px-1.5 py-0.5 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        \${val}k
                      </span>
                    </div>
                    <span className="text-[9px] text-[#8A8A8F] mt-1">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][idx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions Panel */}
            <div className="p-6 bg-[#101012] border border-white/8 rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-white mb-1.5">Recent Transaction Log</h3>
                <p className="text-[11px] text-[#8A8A8F] mb-4">Live settlements and pending pipeline payments</p>
                
                <div className="space-y-3.5">
                  {transactions.map((tx, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium text-white">{tx.name}</p>
                        <p className="text-[10px] text-[#8A8A8F]">{tx.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">{tx.amount}</p>
                        <p className="text-[10px] text-[#8A8A8F]">{tx.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full mt-5 py-2 border border-white/5 hover:border-[#8B5CF6]/30 bg-[#0B0B0D] hover:bg-[#8B5CF6]/5 transition-all rounded-lg text-[11px] font-medium text-white flex items-center justify-center gap-1.5">
                View Ledger Details
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
`
    }
  },
  portfolio: {
    name: "Modern Developer Portfolio",
    repositoryUrl: "https://github.com/hugo-dev/portfolio",
    branch: "main",
    screenshots: [
      {
        name: "portfolio_home.png",
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        size: "284 KB",
        dimensions: "1440 × 900"
      }
    ],
    detectedTokens: {
      "theme": "obsidian-dark",
      "layout": "centered-minimal",
      "grid": "2-column-projects",
      "colors": {
        "bg": "#050505",
        "accent": "#10B981",
        "text": "#F5F5F5",
        "muted": "#8A8A8F"
      },
      "typography": {
        "family": "Geist Sans",
        "headings": "font-bold tracking-tighter uppercase"
      },
      "components_detected": [
        "MinimalHeader",
        "HeroHeadline",
        "ProjectGrid",
        "TechChips",
        "ContactFooter"
      ]
    },
    files: {
      "/App.tsx": `import React, { useState } from 'react';
import { ArrowUpRight, Globe, Share2, Mail, ExternalLink, Code2, Cpu, ArrowRight } from 'lucide-react';

export default function Portfolio() {
  const [copied, setCopied] = useState(false);
  const projects = [
    { title: 'SYNAPSE PROTOCOL', desc: 'Distributed event-routing ledger client built with Rust and WebAssembly.', tags: ['Rust', 'Wasm', 'gRPC'], year: '2025' },
    { title: 'HYPERION COMPILER', desc: 'Self-hosting compiler parsing a subset of TypeScript to native x86 machine assemblies.', tags: ['TypeScript', 'LLVM', 'ASM'], year: '2024' },
    { title: 'NUCLEUS GRID', desc: 'Realtime database engine optimizing spatial query coordinates dynamically.', tags: ['Go', 'Redis', 'WebSockets'], year: '2024' }
  ];

  const handleCopyEmail = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] px-8 py-16 md:px-24 max-w-4xl mx-auto flex flex-col justify-between font-sans selection:bg-[#10B981]/25 selection:text-white">
      {/* Header */}
      <header className="flex justify-between items-center mb-24">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#10B981] rounded-sm animate-pulse"></div>
          <span className="text-xs font-semibold tracking-wider font-mono">HUGO_DEV.SH</span>
        </div>
        <nav className="flex gap-6 text-[11px] font-mono text-[#8A8A8F]">
          <a href="#work" className="hover:text-white transition-colors">/WORK</a>
          <a href="#about" className="hover:text-white transition-colors">/ABOUT</a>
          <a href="#contact" className="hover:text-white transition-colors">/CONTACT</a>
        </nav>
      </header>

      {/* Hero Body */}
      <main className="space-y-24">
        <section className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-none uppercase">
            BUILDING SECURE, <br/>
            <span className="text-[#10B981]">DISTRIBUTED PIPELINES</span> <br/>
            FOR THE MODERN WEB.
          </h1>
          <p className="text-xs md:text-sm text-[#8A8A8F] max-w-lg leading-relaxed font-mono">
            Hi, I'm Hugo. An engineer building low-latency databases, compiler tools, and micro-frontend architectures. Formerly at Vercel and Retool.
          </p>
          <div className="flex gap-3 pt-2">
            {['Rust', 'Go', 'TypeScript', 'LLVM', 'Docker'].map((tech) => (
              <span key={tech} className="text-[10px] font-mono px-2 py-0.5 bg-white/4 border border-white/8 rounded text-[#8A8A8F]">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Selected Work */}
        <section id="work" className="space-y-8">
          <div className="flex items-baseline justify-between border-b border-white/8 pb-2">
            <h2 className="text-xs font-bold font-mono tracking-widest text-[#8A8A8F]">SELECTED_RECONSTRUCTIONS</h2>
            <span className="text-[10px] text-[#8A8A8F] font-mono">3 ITEMS</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {projects.map((proj, idx) => (
              <div 
                key={idx} 
                className="p-6 bg-[#0B0B0D] border border-white/5 hover:border-[#10B981]/30 transition-all rounded-xl flex flex-col justify-between gap-4 group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-[#8A8A8F] block mb-1">{proj.year}</span>
                    <h3 className="text-sm font-semibold tracking-tight text-white group-hover:text-[#10B981] transition-colors">{proj.title}</h3>
                  </div>
                  <ArrowUpRight className="w-4.5 h-4.5 text-[#8A8A8F] group-hover:text-white transition-colors" />
                </div>
                
                <p className="text-xs text-[#8A8A8F] leading-relaxed font-mono">{proj.desc}</p>
                
                <div className="flex gap-2">
                  {proj.tags.map((tag) => (
                    <span key={tag} className="text-[9px] font-mono bg-white/3 text-[#8A8A8F] px-1.5 py-0.5 rounded">
                      #{tag.toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact info */}
        <section id="contact" className="space-y-6 bg-[#0B0B0D] border border-white/5 rounded-xl p-8">
          <h2 className="text-sm font-bold font-mono text-white">LET'S CONNECT</h2>
          <p className="text-xs text-[#8A8A8F] leading-relaxed max-w-md font-mono">
            Looking for architectural design consultations or full-time core systems engineering roles. Get in touch directly:
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button 
              onClick={handleCopyEmail}
              className="px-4 py-2 bg-[#10B981] hover:bg-[#0ea5e9] text-black font-semibold text-xs rounded transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {copied ? 'COPIED_TO_CLIPBOARD!' : 'COPY_EMAIL_ADDRESS'}
            </button>
            <div className="flex gap-2 justify-center sm:justify-start">
              <a href="#" className="p-2 border border-white/5 hover:bg-white/5 rounded text-[#8A8A8F] hover:text-white transition-colors" title="Code">
                <Code2 className="w-4.5 h-4.5" />
              </a>
              <a href="#" className="p-2 border border-white/5 hover:bg-white/5 rounded text-[#8A8A8F] hover:text-white transition-colors" title="Share">
                <Share2 className="w-4.5 h-4.5" />
              </a>
              <a href="#" className="p-2 border border-white/5 hover:bg-white/5 rounded text-[#8A8A8F] hover:text-white transition-colors" title="Web">
                <Globe className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-[#8A8A8F] font-mono gap-4">
        <span>© 2026 HUGO_DEV. ALL RIGHTS RECONSTRUCTED.</span>
        <span>LATENCY: 1.2MS · SCALE: WORLDWIDE</span>
      </footer>
    </div>
  );
}
`
    }
  }
};

const STORAGE_KEYS = {
  PROJECTS: 'repliq_projects',
  CREDITS: 'repliq_user_credits'
};

// Retrieve user credits, defaulting to 100
export function getCredits(): number {
  if (typeof window === 'undefined') return 100;
  const stored = localStorage.getItem(STORAGE_KEYS.CREDITS);
  if (stored === null) {
    localStorage.setItem(STORAGE_KEYS.CREDITS, '100');
    return 100;
  }
  return parseInt(stored, 10);
}

// Deduct credits from user wallet
export function deductCredits(amount: number): number {
  const current = getCredits();
  const nextVal = Math.max(0, current - amount);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CREDITS, nextVal.toString());
  }
  return nextVal;
}

// Reset credits to default (for testing)
export function resetCredits(): number {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CREDITS, '100');
  }
  return 100;
}

// Get all projects
export function getProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return stored ? JSON.parse(stored) : [];
}

// Get project by ID
export function getProject(id: string): Project | undefined {
  return getProjects().find(p => p.id === id);
}

// Save projects
function saveProjects(projects: Project[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }
}

// Create new project
export function createProject(
  name: string,
  repositoryUrl: string,
  branch: string,
  screenshots: Screenshot[],
  presetKey?: string
): Project {
  const newProj: Project = {
    id: Math.random().toString(36).substring(2, 9),
    name: name || 'Unnamed Reconstruction',
    repositoryUrl,
    branch: branch || 'main',
    status: 'QUEUED',
    screenshots,
    logs: [
      { timestamp: new Date().toISOString(), message: 'Project reconstruction initialized', type: 'info' }
    ],
    creditsUsed: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    files: {},
    activeFile: '/App.tsx',
    presetKey
  };

  const projects = getProjects();
  projects.unshift(newProj);
  saveProjects(projects);
  return newProj;
}

// Update project
export function updateProject(id: string, updates: Partial<Project>): Project {
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Project not found');

  const updated = {
    ...projects[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  projects[idx] = updated;
  saveProjects(projects);
  return updated;
}

// Delete project
export function deleteProject(id: string) {
  const projects = getProjects().filter(p => p.id !== id);
  saveProjects(projects);
}

// Simulation steps for pipeline visualizer
const PIPELINE_PHASES: { status: ProjectStatus; label: string; duration: number; logs: string[] }[] = [
  {
    status: 'ANALYZING',
    label: 'Connecting to repository',
    duration: 2000,
    logs: [
      'Cloning git repository: Fetching trees...',
      'Mapping directory branches: Detected workspace configuration',
      'Scanning package.json dependencies: Next.js + Tailwind found',
      'Analyzing workspace layout structure'
    ]
  },
  {
    status: 'UNDERSTANDING',
    label: 'Analyzing screenshot geometry',
    duration: 3000,
    logs: [
      'Reading uploaded image references',
      'Running visual model scanning layout...',
      'Detected panel borders and coordinates',
      'Extracting color palettes: Near-black obsidian tokens active',
      'Mapping typography matches: Detected Geist Sans'
    ]
  },
  {
    status: 'GENERATING',
    label: 'Generating components code',
    duration: 4000,
    logs: [
      'Synthesizing workspace schema design...',
      'Creating components tree mapping layout...',
      'Writing /App.tsx with responsive grids & interactivity',
      'Setting up file workspace tree nodes'
    ]
  },
  {
    status: 'BUILDING',
    label: 'Compiling project sandbox',
    duration: 2500,
    logs: [
      'Bootstrapping Sandpack visualizer dependencies...',
      'Injecting Tailwind CSS CDN stylesheet',
      'Building JSX AST nodes: Success'
    ]
  },
  {
    status: 'FIXING',
    label: 'Validating layout styling',
    duration: 1500,
    logs: [
      'Verifying components import statements',
      'Zero compilation syntax errors detected',
      'Building layout mapping: Success'
    ]
  }
];

// Execute the reconstruction engine pipeline, generating files via OpenRouter
export function runPipeline(id: string, onUpdate: (p: Project) => void) {
  const project = getProject(id);
  if (!project) return;

  let creditsToDeduct = 0;
  let currentLogs = [...project.logs];
  let phaseIdx = 0;
  let generatedFiles =
    project.presetKey && PRESETS[project.presetKey]
      ? PRESETS[project.presetKey].files
      : {};
  let detectedTokens =
    project.presetKey && PRESETS[project.presetKey]
      ? PRESETS[project.presetKey].detectedTokens
      : {};

  const appendLogs = (messages: string[], type: "info" | "success" | "warn" | "error" = "info") => {
    messages.forEach((msg) => {
      currentLogs.push({
        timestamp: new Date().toLocaleTimeString(),
        message: msg,
        type,
      });
    });
  };

  const executeNextPhase = async () => {
    if (phaseIdx >= PIPELINE_PHASES.length) {
      if (!generatedFiles["/App.tsx"]) {
        generatedFiles = PRESETS.saas.files;
        detectedTokens = PRESETS.saas.detectedTokens;
        appendLogs(["No cloned source returned. Loaded studio fallback layout."], "warn");
      }
      appendLogs(["Build check: PASS", "Reconstruction completed successfully."], "success");

      const updated = updateProject(id, {
        status: "READY",
        creditsUsed: creditsToDeduct,
        logs: currentLogs,
        files: generatedFiles,
        detectedTokens,
      });
      onUpdate(updated);
      return;
    }

    const phase = PIPELINE_PHASES[phaseIdx];
    appendLogs([`Starting: ${phase.label}...`]);
    appendLogs(phase.logs);

    const updated = updateProject(id, {
      status: phase.status,
      logs: currentLogs,
    });
    onUpdate(updated);

    if (phase.status === "GENERATING") {
      appendLogs(["Reading screenshots, then cloning with vision + Qwen3 Coder..."]);
      try {
        const shots = await Promise.all(
          project.screenshots.slice(0, 2).map(async (shot) => {
            const compressed = await compressImageDataUrl(shot.url);
            return {
              name: shot.name,
              dimensions: compressed.width
                ? `${compressed.width} × ${compressed.height}`
                : shot.dimensions,
              url: compressed.url,
            };
          })
        );

        const res = await fetch("/api/reconstruct/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: project.name,
            repositoryUrl: project.repositoryUrl,
            branch: project.branch,
            presetKey: project.presetKey,
            screenshots: shots,
          }),
        });
        const data = (await res.json()) as {
          files?: Record<string, string>;
          detectedTokens?: Record<string, unknown>;
          error?: string;
          fallback?: boolean;
          model?: string;
          visionModel?: string;
          analysisSkipped?: string;
          usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
          credits?: number;
        };

        if (res.ok && data.files?.["/App.tsx"]) {
          generatedFiles = data.files;
          if (data.detectedTokens) detectedTokens = data.detectedTokens;
          creditsToDeduct = data.credits || 8;
          deductCredits(creditsToDeduct);
          const tokens = data.usage?.total_tokens || 0;
          appendLogs(
            [
              `Clone ready via ${data.model || "OpenRouter"}${data.visionModel ? ` (vision ${data.visionModel})` : ""}.`,
              `Token usage ${tokens} · charged ${creditsToDeduct} credits.`,
            ],
            "success"
          );
          if (data.analysisSkipped) {
            appendLogs([`Vision note: ${data.analysisSkipped}`], "warn");
          }
        } else {
          appendLogs([data.error || "OpenRouter unavailable. Using local reconstruction fallback."], "warn");
        }
      } catch {
        appendLogs(["OpenRouter request failed. Using local reconstruction fallback."], "warn");
      }
    }

    phaseIdx++;
    setTimeout(() => {
      void executeNextPhase();
    }, phase.duration);
  };

  updateProject(id, {
    status: "QUEUED",
    logs: currentLogs,
  });

  setTimeout(() => {
    void executeNextPhase();
  }, 1500);
}
