'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  X,
  ArrowRight,
  Loader2,
  CheckCircle2,
  MoveLeft,
  MoveRight,
  LayoutDashboard,
  Sparkles,
  Wallet,
  GitBranch,
  ImagePlus,
  Star,
  Target,
  Crown,
  Play,
  Hexagon,
  Triangle,
  Command,
  Ghost,
  Gem,
  Cpu,
  Home,
} from 'lucide-react';
import { createProject, PRESETS, getCredits } from '@/lib/ai/pipeline';
import { compressImageDataUrl } from '@/lib/ai/compress-image';
import { RepliqLogo } from '@/components/repliq-logo';
import { AuthUserChip } from '@/components/auth-user-chip';
import { Footerdemo } from '@/components/ui/footer-section';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TRUSTED = [
  { name: 'Next.js', icon: Hexagon },
  { name: 'Tailwind', icon: Triangle },
  { name: 'React', icon: Command },
  { name: 'GitHub', icon: Ghost },
  { name: 'TypeScript', icon: Gem },
  { name: 'Vercel', icon: Cpu },
];

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-1 flex-col items-center justify-center cursor-default transition-transform hover:-translate-y-1">
    <span className="text-xl font-bold text-white sm:text-2xl">{value}</span>
    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:text-xs">{label}</span>
  </div>
);

interface ScreenshotFile {
  id: string;
  name: string;
  url: string;
  size: string;
  dimensions: string;
}

export default function NewReconstructionPage() {
  const router = useRouter();

  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [isValidatingRepo, setIsValidatingRepo] = useState(false);
  const [repoValidationSummary, setRepoValidationSummary] = useState<{
    success: boolean;
    framework: string;
    lang: string;
    files: number;
    components: number;
  } | null>(null);

  const [screenshots, setScreenshots] = useState<ScreenshotFile[]>([]);
  const [credits, setCredits] = useState(100);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setCredits(getCredits());
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleApplyPreset = (key: 'saas' | 'portfolio') => {
    const preset = PRESETS[key];
    setRepoUrl(preset.repositoryUrl);
    setBranch(preset.branch);

    const presetScreenshots = preset.screenshots.map((s, idx) => ({
      id: `preset-${key}-${idx}`,
      name: s.name,
      url: s.url,
      size: s.size,
      dimensions: s.dimensions
    }));
    setScreenshots(presetScreenshots);

    validateRepo(preset.repositoryUrl);
  };

  const validateRepo = (urlStr: string) => {
    if (!urlStr || !urlStr.startsWith('http')) return;
    setIsValidatingRepo(true);
    setRepoValidationSummary(null);

    setTimeout(() => {
      setIsValidatingRepo(false);
      const isPortfolio = urlStr.includes('portfolio') || urlStr.includes('hugo');
      setRepoValidationSummary({
        success: true,
        framework: 'Next.js (App Router)',
        lang: isPortfolio ? 'TypeScript' : 'TypeScript & PostCSS',
        files: isPortfolio ? 84 : 127,
        components: isPortfolio ? 12 : 18
      });
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const raw = event.target?.result as string;
        const compressed = await compressImageDataUrl(raw);
        const newImg: ScreenshotFile = {
          id: `${Date.now()}-${index}`,
          name: file.name,
          url: compressed.url,
          size: `${Math.round((compressed.url.length * 0.75) / 1024)} KB`,
          dimensions: compressed.width
            ? `${compressed.width} × ${compressed.height}`
            : "1440 × 900",
        };
        setScreenshots((prev) => [...prev, newImg].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(s => s.id !== id));
  };

  const handleMoveScreenshot = (idx: number, direction: 'left' | 'right') => {
    const nextIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= screenshots.length) return;

    const list = [...screenshots];
    const temp = list[idx];
    list[idx] = list[nextIdx];
    list[nextIdx] = temp;
    setScreenshots(list);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!repoUrl) return;

    let presetKey: string | undefined;
    if (repoUrl.includes('apex-analytics')) presetKey = 'saas';
    else if (repoUrl.includes('portfolio') || repoUrl.includes('hugo-dev')) presetKey = 'portfolio';

    const p = createProject(
      presetKey === 'saas' ? 'Apex SaaS Analytics' : presetKey === 'portfolio' ? 'Hugo Developer Portfolio' : 'Custom Reconstruction',
      repoUrl,
      branch,
      screenshots.map(s => ({ id: s.id, url: s.url, name: s.name, size: s.size, dimensions: s.dimensions })),
      presetKey
    );

    router.push(`/reconstruct/${p.id}/analyzing`);
  };

  const canStart = Boolean(repoUrl) && screenshots.length > 0;
  const creditPercent = Math.min(100, Math.round((credits / 100) * 100));

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-[#0a0a0a] font-sans text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-[#1c1c1c] via-[#111111] to-black" />
        <div
          className="absolute inset-0 bg-[url(https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=2000&q=80)] bg-cover bg-center opacity-30"
          style={{
            maskImage: 'linear-gradient(180deg, transparent, black 8%, black 72%, transparent)',
            WebkitMaskImage: 'linear-gradient(180deg, transparent, black 8%, black 72%, transparent)',
          }}
        />
        <div className="absolute left-1/2 top-0 h-120 w-180 -translate-x-1/2 rounded-full bg-[#3a3a3a]/35 blur-[120px]" />
        <div className="absolute -left-16 top-1/3 h-72 w-72 rounded-full bg-[#2a2a2a]/40 blur-[100px]" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-[#404040]/20 blur-[110px]" />
      </div>

      <header className={`fixed left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-6xl -translate-x-1/2 transition-all duration-500 ease-[0.16,1,0.3,1] sm:w-[calc(100%-3rem)] ${
        isScrolled ? 'top-3' : 'top-5 sm:top-6'
      }`}>
        <div className="flex h-14 items-center justify-between gap-3 rounded-full border border-white/10 bg-black/40 px-2 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur-2xl sm:h-16 sm:px-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="Repliq home">
              <RepliqLogo size={32} priority className="h-8 w-8" />
              <span className="hidden truncate text-sm font-medium tracking-wide text-white sm:block">
                Repliq
              </span>
            </Link>
          </div>

          <nav className="hidden items-center rounded-full border border-white/10 bg-white/5 p-1 md:flex">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-zinc-950">
              <Sparkles className="h-3.5 w-3.5" />
              Reconstruct
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md sm:inline-flex">
              <Wallet className="h-3.5 w-3.5 text-zinc-300" />
              <span className="hidden text-xs text-zinc-400 lg:inline">Wallet</span>
              <strong className="text-sm font-semibold text-white">{credits}</strong>
            </div>
            <AuthUserChip />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex w-full flex-1 flex-col">
        <section className="flex min-h-dvh w-full items-center px-6 py-24 sm:px-8 lg:px-12">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col justify-center space-y-8 lg:col-span-7">
            <div className="animate-fade-in delay-100">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md transition-colors hover:bg-white/10">
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-300 sm:text-xs">
                  Repliq reconstruction studio
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                </span>
              </div>
            </div>

            <h1
              className="animate-fade-in delay-200 text-5xl font-medium leading-[0.9] tracking-tighter sm:text-6xl lg:text-7xl"
              style={{
                maskImage: 'linear-gradient(180deg, black 0%, black 80%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 80%, transparent 100%)',
              }}
            >
              Reconstruct<br />
              <span className="bg-linear-to-br from-white via-white to-[#ffcd75] bg-clip-text text-transparent">
                Interfaces
              </span><br />
              That Match
            </h1>

            <p className="animate-fade-in delay-300 max-w-xl text-lg leading-relaxed text-zinc-400">
              Pick a starter, connect a GitHub repo, and drop screenshots. Repliq maps the visual system back into live UI.
            </p>

            <div className="animate-fade-in delay-400 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => canStart ? handleSubmit() : scrollTo('connect-repo')}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-zinc-950 transition-all hover:scale-[1.02] hover:bg-zinc-200 active:scale-[0.98]"
              >
                {canStart ? 'Start reconstruction' : 'Connect a repository'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => scrollTo('presets')}
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/10"
              >
                <Play className="h-4 w-4 fill-current" />
                Choose a preset
              </button>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <div className="animate-fade-in delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
              <div className="pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-white">{credits}</div>
                    <div className="text-sm text-zinc-400">Credits available</div>
                  </div>
                </div>

                <div className="mb-8 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Wallet balance</span>
                    <span className="font-medium text-white">{creditPercent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/50">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-white to-zinc-400"
                      style={{ width: `${creditPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mb-6 h-px w-full bg-white/10" />

                <div className="flex items-stretch justify-between gap-2 text-center">
                  <StatItem value="8–36" label="Est. credits" />
                  <div className="w-px bg-white/10" />
                  <StatItem value={`${screenshots.length}/5`} label="Frames" />
                  <div className="w-px bg-white/10" />
                  <StatItem value={repoValidationSummary ? 'OK' : '—'} label="Repo" />
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    ACTIVE
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-300">
                    <Crown className="h-3 w-3 text-yellow-500" />
                    STUDIO
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in delay-500 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 py-8 backdrop-blur-xl">
              <h3 className="mb-6 px-8 text-sm font-medium text-zinc-400">Trusted by Industry Leaders</h3>

              <div
                className="relative flex overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
                }}
              >
                <div className="animate-marquee flex gap-12 whitespace-nowrap px-4">
                  {[...TRUSTED, ...TRUSTED].map((client, i) => (
                    <div
                      key={i}
                      className="flex cursor-default items-center gap-2 opacity-50 grayscale transition-all hover:scale-105 hover:opacity-100 hover:grayscale-0"
                    >
                      <client.icon className="h-6 w-6 fill-current text-white" />
                      <span className="text-lg font-bold tracking-tight text-white">
                        {client.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>

        <div className="w-full px-6 pb-16 sm:px-8 lg:px-12">
        <section id="presets" className="mb-10 scroll-mt-28 space-y-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">01</p>
            <h2 className="text-lg font-medium tracking-tight text-white">Starter presets</h2>
            <p className="mt-1 text-sm text-zinc-500">One click fills the repo, branch, and screenshots.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <button
              onClick={() => handleApplyPreset('saas')}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
            >
              <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
              <div className="relative space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                    <LayoutDashboard className="h-5 w-5 text-white" />
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-950">
                    Select demo
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-medium text-white">SaaS Analytics Dashboard</h3>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    Obsidian-themed dashboard with live metrics, sidebar navigation, responsive layouts, and charts.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Next.js', 'Tailwind v4', '2 screenshots'].map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-zinc-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>

            <button
              onClick={() => handleApplyPreset('portfolio')}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
            >
              <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
              <div className="relative space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-950">
                    Select demo
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-medium text-white">Modern Developer Portfolio</h3>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    Centered grid with project chips, rust/wasm case studies, and interactive contact actions.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['React', 'Tailwind CSS', '1 screenshot'].map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-zinc-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          </div>
        </section>

        <form
          id="connect-repo"
          onSubmit={handleSubmit}
          className="scroll-mt-28 space-y-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8"
        >
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">02</p>
              <label className="block text-lg font-medium tracking-tight text-white">
                Connect GitHub repository
              </label>
              <p className="mt-1 text-sm text-zinc-500">Paste a public repo URL and choose the branch to scan.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <GithubIcon className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => {
                    setRepoUrl(e.target.value);
                    if (e.target.value.endsWith('.git') || e.target.value.length > 20) {
                      validateRepo(e.target.value);
                    }
                  }}
                  onBlur={() => validateRepo(repoUrl)}
                  placeholder="https://github.com/username/project-repository"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pr-3 pl-11 text-sm text-white placeholder-zinc-600 outline-none backdrop-blur-md transition-all focus:border-white/25"
                  required
                />
              </div>

              <div className="relative w-full sm:w-44">
                <GitBranch className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pr-3 pl-11 text-sm text-white outline-none backdrop-blur-md transition-all focus:border-white/25"
                />
              </div>
            </div>

            {isValidatingRepo && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-zinc-300 backdrop-blur-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Reading Git trees and configurations…</span>
              </div>
            )}

            {repoValidationSummary && repoValidationSummary.success && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 backdrop-blur-md">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Repository validated</p>
                  <p className="text-sm text-zinc-300">
                    {repoValidationSummary.framework} · {repoValidationSummary.lang}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {repoValidationSummary.files} files · {repoValidationSummary.components} components detected
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">03</p>
                <label className="block text-lg font-medium tracking-tight text-white">
                  Upload target screenshots
                </label>
                <p className="mt-1 text-sm text-zinc-500">Drop up to five reference frames for the reconstruction.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-zinc-300">
                {screenshots.length} / 5
              </span>
            </div>

            <div className="relative cursor-pointer rounded-3xl border-2 border-dashed border-white/15 bg-black/30 px-6 py-10 text-center backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/5">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                <ImagePlus className="h-6 w-6" />
              </div>
              <p className="mb-1 text-base font-medium text-white">Drag screenshots here</p>
              <p className="text-sm text-zinc-500">PNG, JPG, or WEBP · max 5 images</p>
            </div>

            {screenshots.length > 0 && (
              <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-5">
                {screenshots.map((s, idx) => (
                  <div key={s.id} className="group relative space-y-3 rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-md">
                    <div
                      className="aspect-4/3 w-full rounded-xl border border-white/5 bg-cover bg-center"
                      style={{ backgroundImage: `url(${s.url})` }}
                    />
                    <div className="space-y-0.5">
                      <p className="truncate text-sm font-medium text-white" title={s.name}>{s.name}</p>
                      <p className="text-sm text-zinc-500">{s.dimensions}</p>
                      <p className="text-sm text-zinc-600">{s.size}</p>
                    </div>

                    <div className="absolute top-4 left-4 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveScreenshot(idx, 'left')}
                          className="rounded-lg border border-white/10 bg-black/80 p-1.5 text-zinc-300 hover:text-white"
                        >
                          <MoveLeft className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {idx < screenshots.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveScreenshot(idx, 'right')}
                          className="rounded-lg border border-white/10 bg-black/80 p-1.5 text-zinc-300 hover:text-white"
                        >
                          <MoveRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveScreenshot(s.id)}
                      className="absolute top-4 right-4 rounded-lg border border-white/10 bg-black/80 p-1.5 text-zinc-300 transition-colors hover:border-rose-500/30 hover:bg-rose-500 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
            <div className="space-y-0.5">
              <p className="text-sm text-zinc-300">
                Reconstruction estimate:{' '}
                <strong className="text-base font-semibold text-white">8–36</strong>
                <span className="ml-1 text-sm text-zinc-400">credits from actual tokens</span>
              </p>
              <p className="text-sm text-zinc-500">Balance is deducted when the pipeline starts.</p>
            </div>

            <button
              type="submit"
              disabled={!canStart}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition-all hover:scale-[1.02] hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-zinc-500 disabled:hover:scale-100 sm:w-auto"
            >
              Start reconstruction
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>
        </div>
      </main>

      <Footerdemo />
    </div>
  );
}
