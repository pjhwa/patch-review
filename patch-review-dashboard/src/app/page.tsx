import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
// Mock taxonomy data
const CATEGORIES: { id: string, name: string, count: string | number, active: boolean, customDesc?: string }[] = [
  { id: 'os', name: 'Operating Systems', count: 124, active: true, customDesc: 'Products Reviewed' },
  { id: 'middleware', name: 'Middleware', count: 0, active: false },
  { id: 'database', name: 'Databases', count: 0, active: false },
  { id: 'network', name: 'Network Devices', count: 0, active: false },
  { id: 'storage', name: 'Storage', count: 0, active: false },
  { id: 'virtualization', name: 'Virtualization', count: 0, active: false },
];

import { headers } from 'next/headers';

export default async function Home() {
  const port = process.env.PORT || 3000;
  const baseUrl = `http://localhost:${port}`;

  let pipeline: any = null;
  let osReviewCountSum: string | number = 0; // Default fallback
  let osCustomDesc = '';
  try {
    const res = await fetch(`${baseUrl}/api/pipeline`, { cache: 'no-store' });
    if (res.ok) {
      pipeline = await res.json();
    }

    const prodRes = await fetch(`${baseUrl}/api/products?category=os`, { cache: 'no-store' });
    if (prodRes.ok) {
      const prodData = await prodRes.json();
      const products = prodData.products || [];

      const activeProducts = products.filter((p: any) => p.active);
      const completedProducts = activeProducts.filter((p: any) => p.isReviewCompleted);

      let totalReviewedPatches = 0;
      let totalApprovedPatches = 0;
      products.forEach((p: any) => {
        if (p.stages) {
          totalReviewedPatches += p.stages.reviewed || 0;
          totalApprovedPatches += p.stages.approved || 0;
        }
      });

      osReviewCountSum = `${completedProducts.length} / ${products.length}`; // Changed from activeProducts.length to products.length as requested

      const patchRatioStr = totalApprovedPatches > 0 ? ` | ${totalApprovedPatches} Patches Reviewed` : '';

      osCustomDesc = `Products Reviewed${patchRatioStr}`;
    }
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  }

  // Inject dynamic os sum and customDesc
  const dynamicCategories = CATEGORIES.map(cat =>
    cat.id === 'os' ? { ...cat, count: osReviewCountSum, customDesc: osCustomDesc || cat.customDesc } : cat
  );

  return (
    <div className="min-h-screen bg-[#050505] p-6 lg:p-12 font-sans selection:bg-white/20">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white/90">Patch Review Board</h1>
            <p className="text-white/50 text-sm md:text-base mt-2">Central Command for IT Infrastructure Patch Review Pipeline</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-emerald-500/80 uppercase tracking-widest">Pipeline Active</span>
            </span>
            <Badge variant="outline" className="border-white/10 text-white/50 hover:bg-white/5">
              {pipeline?.quarter || "Q1 2026"}
            </Badge>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {dynamicCategories.map((cat) => (
            <Link href={`/category/${cat.id}`} key={cat.id}>
              <PremiumCard
                title={cat.name}
                value={cat.count.toString()}
                desc={cat.customDesc || (cat.active ? "Click to view products (Linux, Windows...)" : "Pipeline inactive for this target.")}
                active={cat.active}
              />
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

function PremiumCard({ title, value, desc, active }: { title: string, value: string, desc: string, active: boolean }) {
  return (
    <Card className={`relative overflow-hidden cursor-pointer border-white/[0.06] bg-white/[0.02] backdrop-blur-xl transition-all duration-300 ${active ? 'hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.05)]' : 'opacity-50 grayscale hover:opacity-70'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-white/70 uppercase tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-light tracking-tighter text-white">{value}</div>
        <p className="text-xs text-white/40 mt-1">{desc}</p>
      </CardContent>
    </Card>
  );
}
