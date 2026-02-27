"use client"
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from 'next/link';

export default function ProductDetailPage() {
    const params = useParams();
    const categoryId = params.categoryId as string;
    const productId = params.productId as string;

    const [preprocessedData, setPreprocessedData] = useState<any>(null);
    const [reviewedData, setReviewedData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Preprocessed Data
                const pRes = await fetch(`/api/pipeline/stage/preprocessed?product=${productId}`);
                const pJson = await pRes.json();
                setPreprocessedData(pJson);

                // Fetch Reviewed Data
                const rRes = await fetch(`/api/pipeline/stage/reviewed?product=${productId}`);
                const rJson = await rRes.json();
                setReviewedData(rJson);

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [productId]);

    const title = productId === 'redhat' ? "Red Hat Enterprise Linux"
        : productId === 'oracle' ? "Oracle Linux"
            : productId === 'ubuntu' ? "Ubuntu Linux"
                : productId;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href={`/category/${categoryId}`} className="p-2 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/10 hover:border-white/20 transition-all">
                    <ArrowLeft className="w-5 h-5 text-white/70" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white/90">{title}</h1>
                    <p className="text-white/50 text-sm mt-1 mb-2">Detailed Patch Review Analysis</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center gap-3 text-emerald-400 p-8 border border-white/5 rounded-xl bg-[#080808]">
                    <Loader2 className="w-5 h-5 animate-spin" /> Fetching pipeline stages...
                </div>
            ) : (
                <Tabs defaultValue="preprocessed" className="w-full">
                    <TabsList className="bg-black border border-white/10 mb-6 p-1 h-auto">
                        <TabsTrigger value="preprocessed" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 px-6 py-2">
                            Preprocessed Patches (Raw JSON)
                        </TabsTrigger>
                        <TabsTrigger value="reviewed" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 px-6 py-2">
                            AI Review Results (Summary)
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="preprocessed" className="mt-0">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-xl">
                            <h3 className="text-xl font-light text-white mb-2">Preprocessed Data Extract</h3>
                            <p className="text-white/40 text-sm mb-4">{preprocessedData?.message || "Filtered raw patches passed to the AI Engine."}</p>
                            <ScrollArea className="h-[60vh] w-full rounded-md border border-white/5 bg-black/60 p-4 font-mono text-sm text-emerald-400">
                                <pre className="whitespace-pre-wrap break-words">
                                    {JSON.stringify(preprocessedData?.data || preprocessedData, null, 2)}
                                </pre>
                            </ScrollArea>
                        </div>
                    </TabsContent>

                    <TabsContent value="reviewed" className="mt-0 space-y-4">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-xl">
                            <h3 className="text-xl font-light text-white mb-2">AI Review Findings</h3>
                            <p className="text-white/40 text-sm mb-8">{reviewedData?.message || "Parsed from patch_review_final_report.csv"}</p>

                            {reviewedData?.data && Array.isArray(reviewedData.data) ? (
                                <div className="space-y-6">
                                    {reviewedData.data.map((patch: any, idx: number) => {
                                        const isCritical = patch.Criticality?.toLowerCase() === 'critical';
                                        return (
                                            <div key={idx} className={`p-6 rounded-xl border flex flex-col gap-3 transition-colors ${isCritical ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_15px_-3px_rgba(239,68,68,0.1)]' : 'bg-white/[0.02] border-white/5'}`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {isCritical ? <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                                                        <h4 className={`text-lg font-medium ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                                                            {patch['Issue ID'] || patch.IssueID || patch.Issue_ID || "Unknown Issue"}
                                                        </h4>
                                                    </div>
                                                    <span className={`text-xs px-3 py-1 font-medium rounded-full ${isCritical ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'}`}>
                                                        {patch.Criticality || "Normal"}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 py-3 border-y border-white/5">
                                                    <div>
                                                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Component</p>
                                                        <p className="text-sm font-light text-white/80">{patch.Component}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Version</p>
                                                        <p className="text-sm font-light text-white/80">{patch.Version}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Vendor ID</p>
                                                        <p className="text-sm font-light text-white/80">{patch.Vendor}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Release Date</p>
                                                        <p className="text-sm font-light text-white/80">{patch.Date}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-2 space-y-4">
                                                    <div>
                                                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Description</p>
                                                        <p className="text-sm text-white/70 font-light leading-relaxed">{patch['Patch Description'] || patch.PatchDescription}</p>
                                                    </div>
                                                    {patch['한글 설명'] && (
                                                        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                                            <p className="text-[10px] text-blue-400/80 font-semibold uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                                                AI Translation Snippet
                                                            </p>
                                                            <p className="text-sm text-blue-100 font-medium leading-relaxed">{patch['한글 설명']}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-white/30 border border-dashed border-white/10 rounded-lg bg-black/50">
                                    No completed AI review data found for this product.
                                    <br /><span className="text-xs mt-2 block">Please run the pipeline or ensure patch_review_final_report.csv exists.</span>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
