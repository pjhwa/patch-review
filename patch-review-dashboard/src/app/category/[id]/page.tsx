import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { headers } from 'next/headers';
import { ProductGrid } from "@/components/ProductGrid";
import { StageJSONViewer } from "@/components/StageJSONViewer";

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // For SSR fetching local API routes, default to localhost to avoid tunnel host resolution issues
    const port = process.env.PORT || 3000;
    const baseUrl = `http://localhost:${port}`;

    let products = [];
    try {
        const res = await fetch(`${baseUrl}/api/products?category=${id}`, { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            products = data.products || [];
        }
    } catch (error) {
        console.error("Failed to fetch products:", error);
    }

    const isLinux = products.length > 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white/90">
                    {id === 'os' ? 'OS Category' : <span className="capitalize">{id} Category</span>}
                </h1>
                <p className="text-white/50 text-sm md:text-base mt-2">
                    {id === 'os' ? "Select a specific OS product to begin or view the patch review pipeline." : "Pipeline execution is currently disabled or unavailable for this category."}
                </p>
            </div>

            {isLinux ? (
                <ProductGrid categoryId={id} products={products} />
            ) : (
                <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                    <p className="text-white/40">No active products configured for this category.</p>
                </div>
            )}
        </div>
    );
}
