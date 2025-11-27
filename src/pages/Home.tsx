import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import DashboardLoader from "../components/DashboardLoader";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calculator,
  Divide,
  Gauge,
  PieChart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

// Module-level metric type and defaults to ensure availability before effects run
type Metric = {
  id: number;
  title: string;
  tag: string;
  icon: any;
  value: string;
};

// Local dictionary to translate static UI text without relying on the backend
const UI_DICT: Record<string, Record<string, string>> = {
  hi: {
    title_dashboard: 'डैशबोर्ड पेज',
    goal_progress: 'लक्ष्य प्रगति',
    journey_text: 'अपने राजस्व लक्ष्य की ओर आपकी यात्रा।',
    current_mrr: 'वर्तमान MRR',
    goal_amount: 'लक्ष्य राशि',
    timeframe: 'समय सीमा',
    complete: 'पूर्ण',
    all_metrics: 'सभी डायग्नोज़ मेट्रिक्स',
    diagnose_roadmap: 'डायग्नोज़ रोडमैप',
    roadmap1_title: 'ब्रेक ईवन दक्षता सुधारें',
    roadmap1_desc: 'बिक्री बढ़ाएँ या लागत घटाएँ ताकि BEP कम हो और जल्द लाभ मिले।',
    roadmap2_title: 'वित्तीय स्थिरता मजबूत करें',
    roadmap2_desc: 'रनवे बढ़ाएँ, ऑपरेटिंग कैशफ्लो बढ़ाएँ, और तरलता को स्वस्थ रखें।',
    roadmap3_title: 'सेल्स दक्षता अनुकूलित करें',
    roadmap3_desc: 'प्रति कर्मचारी राजस्व बढ़ाएँ, CAC पेबैक सुधारें, और LTV/CAC मजबूत करें।',
    roadmap4_title: 'ऑपरेशंस संरेखण सुधारें',
    roadmap4_desc: 'डेड स्टॉक कम करें, उत्पादन गति बढ़ाएँ, और टीम लक्ष्यों से संरेखित करें।',
    metric_1: 'BEP (ब्रेक ईवन पॉइंट)',
    metric_2: 'कैशफ्लो बनाम शुद्ध लाभ',
    metric_3: 'कर्मचारी / बिक्री',
    metric_4: 'टीम / BEP',
  },
};
const DASHBOARD_METRICS: Metric[] = [
  { id: 1, title: "BEP (Break Even Point)", tag: "S", icon: Gauge, value: "₹3.2L" },
  { id: 2, title: "Cashflow vs Net Profit", tag: "G", icon: Wallet, value: "1.3x" },
  { id: 3, title: "Emp / Sales", tag: "S", icon: Divide, value: "₹2.1L / emp" },
  { id: 4, title: "Team / BEP", tag: "T · P", icon: Activity, value: "1.4x" },
  { id: 5, title: "Inventory Turnover vs Stock vs Dead Stock", tag: "P", icon: BarChart3, value: "7.2" },
  { id: 6, title: "LTV vs CAC", tag: "S", icon: PieChart, value: "3.8x" },
  { id: 7, title: "Production vs Conversion Speed", tag: "S", icon: TrendingUp, value: "1.2x" },
  { id: 8, title: "Asset / Debt Ratio", tag: "F", icon: Calculator, value: "1.7" },
  { id: 9, title: "Profit vs BEP", tag: "S", icon: TrendingUp, value: "1.4x" },
  { id: 10, title: "Runway", tag: "F", icon: Gauge, value: "14 months" },
  { id: 11, title: "Revenue / Sales Executive", tag: "T", icon: BarChart3, value: "₹3.5L" },
  { id: 12, title: "CAC Payback Period", tag: "S", icon: TrendingDown, value: "9 months" },
  { id: 13, title: "ACID Test", tag: "F · Liquidity", icon: AlertTriangle, value: "1.1" },
  { id: 14, title: "Operating Cashflow Margin", tag: "F", icon: Wallet, value: "22%" },
  { id: 15, title: "Budget vs Variance Ratio", tag: "F", icon: BarChart3, value: "91%" },
  { id: 16, title: "BEP vs 2x (Magical Sales Number)", tag: "E · S", icon: Gauge, value: "2.1x" },
];

export default function DiagnoseDashboardUI() {
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('ui_lang')
      if (saved) return saved
    } catch {}
    // Auto-detect from browser on first load
    try {
      const nav = (navigator && (navigator as any).language) as string | undefined
      const code = (nav || '').toLowerCase().slice(0, 2)
      if (code === 'hi' || code === 'ta' || code === 'te' || code === 'bn') return code
    } catch {}
    return 'en'
  });
  const [t, setT] = useState<Record<string, string>>({});
  const [ready, setReady] = useState<boolean>(false);

  const [metricsState, setMetricsState] = useState<Metric[] | null>(null);
  const [userMeta, setUserMeta] = useState<{ mrr?: number; goal?: number; years?: number } | null>(null);

  // Initial loading animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  async function translateIfNeeded(key: string, text: string): Promise<string> {
    // 1) Local dictionary first for instant UI updates
    const dict = UI_DICT[lang];
    if (dict && dict[key]) return dict[key];
    // 2) If English or no key, return original
    if (!lang || lang === 'en') return text;
    // 3) Try cached UI translations map
    try {
      const cacheStr = localStorage.getItem(`i18n:home:t:${lang}`);
      if (cacheStr) {
        const cache = JSON.parse(cacheStr || '{}') as Record<string, string>;
        if (cache && cache[key]) return cache[key];
      }
    } catch {}
    // 4) Try cached metrics map when key is metric_* (to keep calls minimal)
    try {
      const m = key.match(/^metric_(\d+)$/);
      if (m) {
        const id = Number(m[1]);
        const mStr = localStorage.getItem(`i18n:home:metrics:${lang}`);
        if (mStr) {
          const arr = JSON.parse(mStr || '[]') as Array<{ id: number; title: string }>
          const found = Array.isArray(arr) ? arr.find(x => x.id === id) : undefined;
          if (found?.title) return found.title;
        }
      }
    } catch {}
    // 5) Fallback to backend translate endpoint (accepts code or name)
    try {
      const { data } = await api.post('/translate', { text, target: lang, source: 'English' });
      const out = String((data?.translated ?? '').trim() || text);
      return out;
    } catch {
      // 6) Network failure → return original text
      return text;
    }
  }

  useEffect(() => {
    let cancelled = false;
    // Reset readiness when language changes; block UI until fresh translations apply
    setReady(false);
    setT({});
    setMetricsState(null);
    // Clear any stale caches for this language so we fetch fresh translations
    try { localStorage.removeItem(`i18n:home:t:${lang}`) } catch {}
    try { localStorage.removeItem(`i18n:home:metrics:${lang}`) } catch {}
    (async () => {
      const items: Array<[string, string]> = [
        ['title_dashboard', 'Dashboard Page'],
        ['goal_progress', 'Goal Progress'],
        ['journey_text', 'Your journey toward your revenue target.'],
        ['current_mrr', 'Current MRR'],
        ['goal_amount', 'Goal Amount'],
        ['timeframe', 'Timeframe'],
        ['complete', 'Complete'],
        ['all_metrics', 'All Diagnose Metrics'],
        ['diagnose_roadmap', 'Diagnose Roadmap'],
        ['roadmap1_title', 'Improve Break Even Efficiency'],
        ['roadmap1_desc', 'Increase sales or reduce costs to lower BEP and reach profitability earlier.'],
        ['roadmap2_title', 'Strengthen Finance Stability'],
        ['roadmap2_desc', 'Improve runway, increase operating cashflow, and maintain a healthy liquidity ratio.'],
        ['roadmap3_title', 'Optimize Sales Efficiency'],
        ['roadmap3_desc', 'Increase revenue per employee, improve CAC payback, and strengthen LTV/CAC ratio.'],
        ['roadmap4_title', 'Improve Operational Alignment'],
        ['roadmap4_desc', 'Reduce dead stock, increase production speed, and align teams with financial and sales targets.'],
      ];
      const out: Record<string, string> = {};
      for (const [k, v] of items) {
        out[k] = await translateIfNeeded(k, v);
      }
      if (!cancelled) {
        setT(out);
        try { localStorage.setItem(`i18n:home:t:${lang}` , JSON.stringify(out)); } catch {}
      }

      // translate metric titles
      const mt = await Promise.all(DASHBOARD_METRICS.map(async (m) => ({
        ...m,
        title: await translateIfNeeded('metric_'+m.id, m.title),
      })));
      if (!cancelled) {
        setMetricsState(mt);
        try { localStorage.setItem(`i18n:home:metrics:${lang}` , JSON.stringify(mt)); } catch {}
      }
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true };
  }, [lang]);

  // Load user meta to auto-fill dashboard headline cards
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data } = await api.get('/me')
        const mrr = Number(data?.monthly_revenue ?? NaN)
        const goal = Number(data?.goal_amount ?? NaN)
        const years = Number(data?.goal_years ?? NaN)
        if (!alive) return
        setUserMeta({
          mrr: isFinite(mrr) ? mrr : undefined,
          goal: isFinite(goal) ? goal : undefined,
          years: isFinite(years) ? years : undefined,
        })
      } catch {
        if (!alive) return
        setUserMeta(null)
      }
    })()
    return () => { alive = false }
  }, [])

  // Persist chosen language, and react to external changes (chat reply-driven)
  useEffect(() => {
    try { localStorage.setItem('ui_lang', lang) } catch {}
  }, [lang]);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'ui_lang') setLang(e.newValue || 'en');
    };
    const onCustom = (e: Event) => {
      const d = (e as CustomEvent).detail as any; if (d?.lang) setLang(d.lang);
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('ui_lang_changed', onCustom as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('ui_lang_changed', onCustom as EventListener);
    };
  }, []);

  // Show loading animation on initial load
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-950">
        <DashboardLoader />
      </div>
    );
  }

  // Block rendering until translations are ready
  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-neutral-700 border-t-indigo-500 animate-spin" />
          <span className="text-sm">Applying language…</span>
        </div>
      </div>
    );
  }
  const getColorClass = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ""));

    if (value.includes("%")) {
      if (num >= 75) return "text-emerald-600";
      if (num >= 50) return "text-yellow-500";
      return "text-red-500";
    }

    if (!isNaN(num)) {
      if (num >= 2) return "text-emerald-600";
      if (num >= 1) return "text-yellow-500";
      return "text-red-500";
    }

    return "text-slate-900 dark:text-slate-200";
  };

  const topKpiIds = [1, 6, 10, 14];
  const baseMetrics = metricsState ?? DASHBOARD_METRICS;
  const topKpis = baseMetrics.filter((m) => topKpiIds.includes(m.id));
  const gridMetrics = baseMetrics.filter((m) => !topKpiIds.includes(m.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-950">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* Header */}
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-neutral-100 tracking-tight">
              {t.title_dashboard || 'Dashboard Page'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-neutral-400">Language</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="text-sm rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="bn">বাংলা (Bengali)</option>
            </select>
          </div>
        </header>

        {/* Goal Progress */}
        <section className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-neutral-800 dark:to-neutral-900 p-8 rounded-3xl shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2">
                {t.goal_progress || 'Goal Progress'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold dark:bg-indigo-900/50 dark:text-indigo-400">Live</span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-neutral-300 mt-1">{t.journey_text || 'Your journey toward your revenue target.'}</p>
            </div>

            <div className="relative w-32 h-32 mt-6 md:mt-0">
              <svg className="w-full h-full rotate-90">
                <circle cx="64" cy="64" r="50" className="stroke-slate-200 dark:stroke-neutral-700" strokeWidth="10" fill="none" />
                <circle cx="64" cy="64" r="50" className="stroke-indigo-500" strokeWidth="10" fill="none" strokeDasharray="314" strokeDashoffset="282" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-neutral-100">10%</span>
                <span className="text-xs text-slate-500 dark:text-neutral-300 mt-1">{t.complete || 'Complete'}</span>
              </div>
            </div>
          </div>

          <div className="w-full h-3 bg-slate-200 dark:bg-neutral-700 rounded-full relative mb-10">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: "10%" }} />
            <div className="absolute -top-6 left-[10%] transform -translate-x-1/2 text-xs font-semibold bg-indigo-600 text-white dark:bg-indigo-500 px-2 py-0.5 rounded-md">
              10%
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.current_mrr || 'Current MRR'}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {userMeta?.mrr != null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(userMeta.mrr) : '₹10,000'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.goal_amount || 'Goal Amount'}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {userMeta?.goal != null ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(userMeta.goal) : '₹1,00,000'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.timeframe || 'Timeframe'}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{userMeta?.years != null ? `${userMeta.years} ${userMeta.years === 1 ? 'year' : 'years'}` : '3 years'}</p>
            </div>
          </div>
        </section>

        {/* Top KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {topKpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.id} className="rounded-3xl border-none shadow-xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur">
                <CardContent className="py-6 px-6 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.title}</span>

                    {/* Tag Badge (kept as per your request) */}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-neutral-700 dark:text-neutral-300 uppercase">
                      {kpi.tag}
                    </span>
                  </div>

                  <div className={`text-3xl font-bold ${getColorClass(kpi.value)}`}>{kpi.value}</div>
                  <Icon className="w-4 h-4 text-slate-300 dark:text-neutral-600 mt-1" />
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* All Diagnose Metrics */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t.all_metrics || 'All Diagnose Metrics'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gridMetrics.map((m) => {
              const Icon = m.icon;
              return (
                <Card
                  key={m.id}
                  className="rounded-2xl border border-slate-100 dark:border-neutral-700 bg-white/90 dark:bg-neutral-800/90 shadow-sm hover:shadow-md transition"
                >
                  <CardHeader className="flex flex-row items-center gap-3 pb-1 px-4 pt-4">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/50">
                      <Icon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    </div>

                    <div className="flex flex-col">
                      <CardTitle className="text-[13px] font-medium text-slate-700 dark:text-slate-300 leading-snug">
                        {m.title}
                      </CardTitle>

                      {/* TAG REMOVED HERE */}
                    </div>
                  </CardHeader>

                  <CardContent className="px-4 pb-4">
                    <div className={`mt-2 text-2xl font-semibold ${getColorClass(m.value)}`}>{m.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Diagnose Roadmap */}
        <section className="mt-10 bg-white dark:bg-neutral-800 rounded-3xl shadow-md p-6 border border-slate-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{t.diagnose_roadmap || 'Diagnose Roadmap'}</h3>

          <div className="space-y-6">

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 font-bold">1</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">{t.roadmap1_title || 'Improve Break Even Efficiency'}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t.roadmap1_desc || 'Increase sales or reduce costs to lower BEP and reach profitability earlier.'}</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 font-bold">2</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">{t.roadmap2_title || 'Strengthen Finance Stability'}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t.roadmap2_desc || 'Improve runway, increase operating cashflow, and maintain a healthy liquidity ratio.'}</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 font-bold">3</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">{t.roadmap3_title || 'Optimize Sales Efficiency'}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t.roadmap3_desc || 'Increase revenue per employee, improve CAC payback, and strengthen LTV/CAC ratio.'}</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 font-bold">4</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">{t.roadmap4_title || 'Improve Operational Alignment'}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t.roadmap4_desc || 'Reduce dead stock, increase production speed, and align teams with financial and sales targets.'}</p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}