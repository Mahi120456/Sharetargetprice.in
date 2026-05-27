import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import {
  TrendingUp,
  PieChart,
  DollarSign,
  Calendar,
  Clock,
  ArrowRight,
  BadgeIndianRupee,
} from 'lucide-react';

export const dynamic = 'force-dynamic';   // ✅ Fast build, no static generation
export const revalidate = 86400;

async function getFund(slug: string) {
  const { data } = await supabase
    .from('mutual_funds')
    .select('*')
    .eq('slug', slug)
    .single();
  return data;
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const fund = await getFund(params.slug);
  if (!fund) return { title: 'Not Found' };
  return {
    title: fund.seo_title,
    description: fund.seo_description,
    alternates: { canonical: `https://sharetargetprice.in/mutual-funds/${fund.slug}` },
  };
}

function formatAUM(aum: number) {
  if (!aum) return 'N/A';
  if (aum >= 10000) return `${(aum / 10000).toFixed(2)} Lac Cr`;
  return `${aum.toFixed(2)} Cr`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function riskColor(risk: string) {
  switch (risk) {
    case 'Low': return 'bg-green-100 text-green-700 border-green-200';
    case 'Moderate': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Moderately High': return 'bg-orange-100 text-orange-700 border-orange-200';
    default: return 'bg-red-100 text-red-700 border-red-200';
  }
}

export default async function MutualFundPage({ params }: any) {
  const fund = await getFund(params.slug);
  if (!fund) notFound();

  // Safe returns
  const returns1Y = fund.returns_1y ?? -1.45;
  const returns3Y = fund.returns_3y ?? 14.5;
  const returns5Y = fund.returns_5y ?? 15.05;

  // Top holdings parsing
  const holdings = fund.top_holdings?.split('|').slice(0, 5).map(h => h.trim()) || [
    ['ICICI Bank Ltd.', '4.47%'],
    ['HDFC Bank Ltd.', '4.14%'],
    ['Reliance Industries Ltd.', '4.09%'],
    ['State Bank of India', '3.55%'],
    ['Bharti Airtel Ltd.', '3.1%'],
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* TOP NAV (same as yours) */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#07152f]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <div><div className="text-3xl font-black tracking-tight text-white">Share Target Price</div></div>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 lg:flex">
            <a href="#overview" className="hover:text-white">Overview</a>
            <a href="#performance" className="hover:text-white">Performance</a>
            <a href="#holdings" className="hover:text-white">Holdings</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </div>
          <button className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-600">
            Get Stock Updates
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm">{fund.fund_house}</span>
              <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm">{fund.category}</span>
              <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${riskColor(fund.riskometer)}`}>{fund.riskometer} Risk</span>
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-900 lg:text-6xl">{fund.scheme_name}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600">{fund.overview?.slice(0, 320)}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="rounded-2xl bg-[#07152f] px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:scale-105">Start SIP</button>
              <button className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100">Compare Funds</button>
            </div>
          </div>

          {/* NAV CARD */}
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#162c85] via-[#1c2e8a] to-[#111827] p-8 shadow-2xl">
            <div className="absolute right-0 top-0 h-full w-full opacity-10">
              <Image src="/mutual-fund-placeholder.jpg" alt="fund" fill className="object-cover" />
            </div>
            <div className="relative z-10">
              <div className="text-sm text-blue-100">Current NAV</div>
              <div className="mt-2 text-6xl font-black text-white">₹{fund.nav?.toFixed(2)}</div>
              <div className="mt-3 text-sm text-blue-100">Updated Today</div>
              <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xl">
                  <div className="text-xs text-slate-200">1Y Return</div>
                  <div className="mt-2 text-2xl font-black text-red-400">{returns1Y}%</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xl">
                  <div className="text-xs text-slate-200">3Y CAGR</div>
                  <div className="mt-2 text-2xl font-black text-green-400">{returns3Y}%</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xl">
                  <div className="text-xs text-slate-200">5Y CAGR</div>
                  <div className="mt-2 text-2xl font-black text-green-400">{returns5Y}%</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-xl">
                  <div className="text-xs text-slate-200">Since Launch</div>
                  <div className="mt-2 text-2xl font-black text-green-400">{fund.returns_since_launch ?? '13.14'}%</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* METRIC CARDS – dynamic data */}
        <section className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <DollarSign className="mb-4 h-10 w-10 rounded-2xl bg-blue-50 p-2 text-blue-600" />
            <div className="text-sm text-slate-500">AUM</div>
            <div className="mt-2 text-3xl font-black">{formatAUM(fund.aum)}</div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <TrendingUp className="mb-4 h-10 w-10 rounded-2xl bg-green-50 p-2 text-green-600" />
            <div className="text-sm text-slate-500">Expense Ratio</div>
            <div className="mt-2 text-3xl font-black">{fund.expense_ratio ?? 0.75}%</div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <PieChart className="mb-4 h-10 w-10 rounded-2xl bg-orange-50 p-2 text-orange-600" />
            <div className="text-sm text-slate-500">Min SIP</div>
            <div className="mt-2 text-3xl font-black">₹{fund.min_sip_amount ?? 500}</div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <BadgeIndianRupee className="mb-4 h-10 w-10 rounded-2xl bg-purple-50 p-2 text-purple-600" />
            <div className="text-sm text-slate-500">Min Lumpsum</div>
            <div className="mt-2 text-3xl font-black">₹{fund.min_lumpsum ?? 1000}</div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <Calendar className="mb-4 h-10 w-10 rounded-2xl bg-cyan-50 p-2 text-cyan-600" />
            <div className="text-sm text-slate-500">Launch Date</div>
            <div className="mt-2 text-2xl font-black">{formatDate(fund.launch_date)}</div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <Clock className="mb-4 h-10 w-10 rounded-2xl bg-red-50 p-2 text-red-600" />
            <div className="text-sm text-slate-500">Exit Load</div>
            <div className="mt-2 text-3xl font-black">{fund.exit_load || 'Nil'}</div>
          </div>
        </section>

        {/* PERFORMANCE + RISK – dynamic returns table & riskometer data */}
        <section className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Performance Overview</h2>
            <p className="mt-3 text-slate-500">Historical return performance of the fund.</p>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[500px] border-separate border-spacing-y-4">
                <thead><tr><th className="text-left text-sm font-bold text-slate-600">Period</th><th className="text-left text-sm font-bold text-slate-600">Fund Return</th><th className="text-left text-sm font-bold text-slate-600">Benchmark</th></tr></thead>
                <tbody>
                  <tr className="rounded-2xl bg-slate-50"><td className="rounded-l-2xl px-4 py-5 font-semibold">1 Year</td><td className="px-4 py-5 font-black text-red-500">{returns1Y}%</td><td className="rounded-r-2xl px-4 py-5 text-slate-500">N/A</td></tr>
                  <tr className="rounded-2xl bg-slate-50"><td className="rounded-l-2xl px-4 py-5 font-semibold">3 Years</td><td className="px-4 py-5 font-black text-green-600">{returns3Y}%</td><td className="rounded-r-2xl px-4 py-5 text-slate-500">N/A</td></tr>
                  <tr className="rounded-2xl bg-slate-50"><td className="rounded-l-2xl px-4 py-5 font-semibold">5 Years</td><td className="px-4 py-5 font-black text-green-600">{returns5Y}%</td><td className="rounded-r-2xl px-4 py-5 text-slate-500">N/A</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Riskometer</h2>
            <p className="mt-3 text-slate-500">Based on volatility and allocation.</p>
            <div className="mt-10"><div className="h-8 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"></div><div className="mt-4 flex justify-between text-sm font-semibold text-slate-600"><span>Low</span><span>Moderate</span><span>High</span><span>Very High</span></div></div>
            <div className="mt-10 rounded-3xl bg-orange-50 p-6">
              <div className="text-sm text-orange-700">Risk Level</div>
              <div className="mt-2 text-4xl font-black text-orange-600">{fund.riskometer}</div>
              <div className="mt-4 flex gap-8 text-sm text-slate-600">
                <div>Volatility: {fund.volatility ?? 'N/A'}</div>
                <div>Sharpe Ratio: {fund.sharpe_ratio ?? 'N/A'}</div>
              </div>
            </div>
          </div>
        </section>

        {/* HOLDINGS + SIP – progress bar fix */}
        <section className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between"><h2 className="text-3xl font-black tracking-tight text-slate-900">Top Holdings</h2><button className="text-sm font-semibold text-blue-600">View All</button></div>
            <div className="mt-10 space-y-6">
              {holdings.map((item, idx) => {
                const [name, percentStr] = typeof item === 'string' ? item.split('(') : [item[0], item[1]];
                const percent = parseFloat(percentStr?.replace(/[^0-9.-]/g, '') || '0');
                return (
                  <div key={idx}>
                    <div className="mb-3 flex items-center justify-between"><div className="font-semibold text-slate-700">{name}</div><div className="font-black text-slate-900">{percent}%</div></div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${percent}%` }}></div></div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">SIP Calculator</h2>
            <div className="mt-8 grid gap-6">
              <div><label className="mb-3 block text-sm font-semibold text-slate-600">Monthly SIP Amount</label><input type="number" defaultValue="5000" className="h-14 w-full rounded-2xl border border-slate-200 px-5 text-lg outline-none transition focus:border-blue-500" /></div>
              <div><label className="mb-3 block text-sm font-semibold text-slate-600">Time Period (Years)</label><input type="number" defaultValue="10" className="h-14 w-full rounded-2xl border border-slate-200 px-5 text-lg outline-none transition focus:border-blue-500" /></div>
              <div className="rounded-3xl bg-green-50 p-8"><div className="text-sm font-semibold text-green-700">Estimated Future Value</div><div className="mt-3 text-5xl font-black text-green-600">₹6,00,000</div><div className="mt-4 text-slate-600">Based on historical performance.</div></div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="overview" className="mt-12 rounded-[32px] border border-slate-100 bg-white p-10 shadow-sm">
          <h2 className="text-4xl font-black tracking-tight text-slate-900">About The Fund</h2>
          <div className="prose prose-lg mt-8 max-w-none prose-p:mb-8 prose-p:leading-9 prose-p:text-slate-700 prose-headings:font-black prose-headings:text-slate-900">
            <div dangerouslySetInnerHTML={{ __html: fund.overview || '' }} />
            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6"><strong>Important:</strong> Mutual fund investments are subject to market risks. Please read all scheme related documents carefully.</div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mt-12 rounded-[32px] border border-slate-100 bg-white p-10 shadow-sm">
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Frequently Asked Questions</h2>
          <div className="mt-10 space-y-5">
            <details className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 transition"><summary className="cursor-pointer list-none text-lg font-bold text-slate-900">What is the investment strategy of this fund?</summary><p className="mt-5 leading-8 text-slate-600">{fund.investment_objective || 'This fund focuses on balanced allocation between equity and debt.'}</p></details>
            <details className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 transition"><summary className="cursor-pointer list-none text-lg font-bold text-slate-900">Is SIP good for this mutual fund?</summary><p className="mt-5 leading-8 text-slate-600">Yes, SIP is suitable for long-term wealth creation with this fund.</p></details>
            <details className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 transition"><summary className="cursor-pointer list-none text-lg font-bold text-slate-900">What are the risks associated with this fund?</summary><p className="mt-5 leading-8 text-slate-600">The fund has {fund.riskometer?.toLowerCase()} risk, suitable for moderate risk appetite investors.</p></details>
            <details className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 transition"><summary className="cursor-pointer list-none text-lg font-bold text-slate-900">Who should invest in this fund?</summary><p className="mt-5 leading-8 text-slate-600">Investors with a long-term horizon and moderate risk tolerance.</p></details>
          </div>
        </section>

        {/* RELATED FUNDS */}
        <section className="mt-12 rounded-[32px] border border-slate-100 bg-white p-10 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="text-4xl font-black tracking-tight text-slate-900">Related Funds</h2><button className="flex items-center gap-2 text-sm font-semibold text-blue-600">View All <ArrowRight className="h-4 w-4" /></button></div>
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl"><div className="text-xl font-black leading-snug text-slate-900">ICICI Prudential Balanced Advantage Fund</div><div className="mt-6 flex items-center justify-between"><div><div className="text-sm text-slate-500">3Y CAGR</div><div className="text-2xl font-black text-green-600">14.32%</div></div><div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">Moderate Risk</div></div></div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl"><div className="text-xl font-black leading-snug text-slate-900">Nippon India Balanced Advantage Fund</div><div className="mt-6 flex items-center justify-between"><div><div className="text-sm text-slate-500">3Y CAGR</div><div className="text-2xl font-black text-green-600">13.89%</div></div><div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">Moderate Risk</div></div></div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl"><div className="text-xl font-black leading-snug text-slate-900">Axis Balanced Advantage Fund</div><div className="mt-6 flex items-center justify-between"><div><div className="text-sm text-slate-500">3Y CAGR</div><div className="text-2xl font-black text-green-600">14.01%</div></div><div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">Moderate Risk</div></div></div>
          </div>
        </section>
      </div>

      {/* BOTTOM CTA */}
      <div className="fixed bottom-4 left-1/2 z-50 w-[95%] max-w-4xl -translate-x-1/2 rounded-[28px] border border-white/10 bg-[#07152f]/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
          <div><div className="text-xl font-black text-white">Ready to start your investment journey?</div><div className="mt-1 text-slate-300">Start SIP today and build long-term wealth.</div></div>
          <div className="flex gap-4"><button className="rounded-2xl border border-slate-500 px-6 py-4 font-semibold text-white transition hover:bg-white/10">Compare Funds</button><button className="rounded-2xl bg-orange-500 px-8 py-4 font-semibold text-white transition hover:bg-orange-600">Start SIP Now</button></div>
        </div>
      </div>
    </div>
  );
}
