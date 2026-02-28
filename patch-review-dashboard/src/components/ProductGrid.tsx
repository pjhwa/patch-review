"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PremiumCard } from "@/components/PremiumCard";

export function ProductGrid({ categoryId, products, dict }: { categoryId: string, products: any[], dict: any }) {
    const [isRunning, setIsRunning] = useState(false);
    const [resultMsg, setResultMsg] = useState("");
    const [logTail, setLogTail] = useState("");
    const [lastCompletedAt, setLastCompletedAt] = useState<string | null>(null);
    const [failureCount, setFailureCount] = useState<number>(0);
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, productId: string | null, isRetry: boolean }>({ isOpen: false, productId: null, isRetry: false });
    const [isDownloading, setIsDownloading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/pipeline/status');
                if (res.ok) {
                    const data = await res.json();
                    setIsRunning(data.isRunning);
                    if (data.message && data.message !== "Idle") {
                        setResultMsg(data.message);
                    }
                    if (data.logTail) {
                        setLogTail(data.logTail);
                    } else if (!data.isRunning) {
                        setLogTail("");
                    }
                    if (data.lastCompletedAt) {
                        setLastCompletedAt(data.lastCompletedAt);
                    }
                    if (data.failureCount !== undefined) {
                        setFailureCount(data.failureCount);
                    }
                    if (data.isRunning) {
                        router.refresh(); // Refresh counts from server
                    }
                }
            } catch (e) { }
        };

        const interval = setInterval(checkStatus, 3000);
        checkStatus();
        return () => clearInterval(interval);
    }, [router]);

    const requestRunPipeline = (productId: string, isRetry: boolean = false) => {
        setConfirmDialog({ isOpen: true, productId, isRetry });
    };

    const confirmRun = () => {
        if (confirmDialog.productId) {
            handleRunSharedPipeline(confirmDialog.productId, confirmDialog.isRetry);
        }
        setConfirmDialog({ isOpen: false, productId: null, isRetry: false });
    };

    const handleRunSharedPipeline = async (productId: string, isRetry: boolean = false) => {
        setIsRunning(true);
        setResultMsg(isRetry ? dict.dashboard.productGrid.initiatingRetry : dict.dashboard.productGrid.initiatingPipeline);

        try {
            const res = await fetch('/api/pipeline/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: categoryId, productId: productId, isRetry })
            });

            const data = await res.json();
            if (!res.ok) {
                setResultMsg(data.error || "Execution failed.");
                setIsRunning(false);
            }
        } catch (error) {
            setResultMsg("Failed to connect to execution API.");
            setIsRunning(false);
        }
    };

    const handleDownloadCSV = async () => {
        setIsDownloading(true);
        try {
            // Fetch without productId to merge all finalized CSVs for the category
            const res = await fetch(`/api/pipeline/export?categoryId=${categoryId}`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `Final_Approved_Patches_${categoryId}_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                alert("No finalized CSV available to download yet. Please ensure the review is marked as complete."); // Kept as alert for simplicity, though could also be translated
            }
        } catch (e) {
            console.error("Failed to download CSV", e);
            alert("Error downloading CSV.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {products.map((prod: any) => (
                    <PremiumCard
                        key={prod.id}
                        title={prod.name}
                        stages={prod.stages}
                        desc={dict.dashboard.productGrid.pendingPatches}
                        active={prod.active}
                        href={`/category/${categoryId}/${prod.id}`}
                        categoryId={categoryId}
                        productId={prod.id}
                        isRunning={isRunning && prod.active}
                        isReviewCompleted={prod.isReviewCompleted}
                        onRunPipeline={() => requestRunPipeline(prod.id, false)}
                    />
                ))}
            </div>
            {(resultMsg || failureCount > 0) && (
                <div className="p-4 border border-emerald-500/20 bg-emerald-500/10 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div className="flex-col">
                            <p className="text-sm text-emerald-400 font-medium">{resultMsg || dict.dashboard.productGrid.idlePipeline}</p>
                            {!isRunning && lastCompletedAt && (
                                <p className="text-xs text-emerald-500/80 mt-1">{dict.dashboard.productGrid.lastRun}{new Date(lastCompletedAt).toLocaleString()}</p>
                            )}
                        </div>
                        {!isRunning && failureCount > 0 && (
                            <button
                                onClick={() => requestRunPipeline('ubuntu', true)}
                                className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/40 text-emerald-100 text-xs rounded transition-colors"
                            >
                                {dict.dashboard.productGrid.retryFailed} ({failureCount})
                            </button>
                        )}
                        {!isRunning && lastCompletedAt && (
                            <button
                                onClick={handleDownloadCSV}
                                disabled={isDownloading}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors ml-4 shadow-[0_0_15px_rgba(59,130,246,0.5)] disabled:opacity-50 flex items-center gap-2 border border-blue-500"
                            >
                                {isDownloading ? dict.dashboard.productGrid.generating : dict.dashboard.productGrid.downloadCsvBtn}
                            </button>
                        )}
                    </div>
                    {logTail && (
                        <div className="mt-2 p-3 bg-black/40 rounded border border-white/5 font-mono text-xs text-white/60 whitespace-pre-wrap leading-tight overflow-x-auto">
                            {logTail}
                        </div>
                    )}
                </div>
            )}

            {confirmDialog.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#111] border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <h3 className="text-lg font-medium text-white mb-4">
                            {confirmDialog.isRetry ? dict.dashboard.productGrid.retryTitle : dict.dashboard.productGrid.startCollectionTitle}
                        </h3>

                        <div className="text-sm text-white/60 space-y-4 mb-6">
                            {!confirmDialog.isRetry && lastCompletedAt && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400">
                                    <strong className="block mb-1">{dict.dashboard.productGrid.recentExecutionDetected}</strong>
                                    {dict.dashboard.productGrid.recentExecutionDesc}{new Date(lastCompletedAt).toLocaleString()}. {dict.dashboard.productGrid.recentExecutionAsk}
                                </div>
                            )}

                            {!confirmDialog.isRetry ? (
                                <p>{dict.dashboard.productGrid.freshStartDesc}</p>
                            ) : (
                                <p>{dict.dashboard.productGrid.retryDesc}</p>
                            )}
                            <p className="font-medium text-white/80">{dict.dashboard.productGrid.proceedAsk}</p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDialog({ isOpen: false, productId: null, isRetry: false })}
                                className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-white transition-colors text-sm"
                            >
                                {dict.dashboard.productGrid.cancelBtn}
                            </button>
                            <button
                                onClick={confirmRun}
                                className="px-4 py-2 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors text-sm font-medium"
                            >
                                {confirmDialog.isRetry ? dict.dashboard.productGrid.yesRetryBtn : dict.dashboard.productGrid.yesStartFreshBtn}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
