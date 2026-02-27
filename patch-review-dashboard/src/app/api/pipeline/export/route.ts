import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId');
        const productId = searchParams.get('productId');

        if (!categoryId || !productId) {
            return new NextResponse('Missing categoryId or productId', { status: 400 });
        }

        const workspacePath = process.env.OPENCLAW_WORKSPACE || path.join(require('os').homedir(), '.openclaw/workspace');
        // Currently, pipelines are shared under os/linux
        const basePath = path.join(workspacePath, 'skills/patch-review', categoryId, 'linux');
        const csvPath = path.join(basePath, `final_approved_patches_${productId}.csv`);

        let csvContent = "";
        try {
            csvContent = await fs.readFile(csvPath, 'utf8');
        } catch (e) {
            // Check for the old un-suffixed version just in case
            try {
                const fallbackPath = path.join(basePath, 'final_approved_patches.csv');
                csvContent = await fs.readFile(fallbackPath, 'utf8');
            } catch {
                return new NextResponse('Final CSV not found. Ensure the review has been marked as complete.', { status: 404 });
            }
        }

        // Return the file as a downloadable response
        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="Final_Approved_Patches_${categoryId}_${productId}.csv"`
            }
        });

    } catch (e: any) {
        console.error("Export error:", e);
        return new NextResponse(`Internal server error: ${e.message}`, { status: 500 });
    }
}
