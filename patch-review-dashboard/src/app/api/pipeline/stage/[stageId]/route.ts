import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export async function GET(request: Request, { params }: { params: Promise<{ stageId: string }> }) {
    const { stageId } = await params;
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product');

    if (stageId !== 'preprocessed' && stageId !== 'reviewed') {
        return NextResponse.json({ error: "Only preprocessed and reviewed stages are supported for now." }, { status: 400 });
    }

    const linuxSkillDir = path.join(process.env.HOME || '/home/citec', '.openclaw/workspace/skills/patch-review/os/linux');

    try {
        let patches: any[] = [];
        let message = "";

        if (stageId === 'preprocessed') {
            const filePath = path.join(linuxSkillDir, 'patches_for_llm_review.json');
            if (!fs.existsSync(filePath)) {
                return NextResponse.json({ error: "No preprocessed data available yet." }, { status: 404 });
            }
            patches = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            message = "These are the pre-processed (filtered) patches before AI Review.";
        } else if (stageId === 'reviewed') {
            const filePath = path.join(linuxSkillDir, 'patch_review_final_report.csv');
            if (!fs.existsSync(filePath)) {
                return NextResponse.json({ error: "No reviewed data available yet." }, { status: 404 });
            }
            const csvData = fs.readFileSync(filePath, 'utf-8');
            const result = Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
            });
            patches = result.data;
            message = "These are the final patches reviewed by the AI.";
        }

        // Filter by Vendor if a specific productId is passed
        let targetVendor: string | null = null;
        if (productId === 'redhat') targetVendor = 'Red Hat';
        else if (productId === 'oracle') targetVendor = 'Oracle';
        else if (productId === 'ubuntu') targetVendor = 'Ubuntu';

        let filteredPatches = patches;
        if (targetVendor) {
            filteredPatches = patches.filter((p: any) => p.vendor === targetVendor || p.Vendor === targetVendor); // support both lower/upper case vendor key depending on CSV/JSON definitions
        }

        return NextResponse.json({
            stage: stageId,
            product: productId || 'all',
            count: filteredPatches.length,
            message,
            data: filteredPatches
        });
    } catch (e: any) {
        return NextResponse.json({ error: `Failed to read data: ${e.message}` }, { status: 500 });
    }
}
