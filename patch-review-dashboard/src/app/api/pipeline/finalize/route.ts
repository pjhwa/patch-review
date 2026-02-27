import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { productId, categoryId, approvedIssueIds } = body;

        if (!productId || !approvedIssueIds || !Array.isArray(approvedIssueIds)) {
            return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
        }

        const workspacePath = process.env.OPENCLAW_WORKSPACE || path.join(require('os').homedir(), '.openclaw/workspace');
        // Define pathways for source data and output destination
        const basePath = path.join(workspacePath, 'skills/patch-review', categoryId || 'os', 'linux');
        const sourceCsvPath = path.join(basePath, 'patch_review_final_report.csv');
        const outputCsvPath = path.join(basePath, `final_approved_patches_${productId}.csv`);

        // Verify AI reviewed data exists
        try {
            await fs.access(sourceCsvPath);
        } catch {
            return NextResponse.json({ error: 'AI Review CSV missing. Cannot finalize.' }, { status: 404 });
        }

        // Read the AI generated CSV
        const rawContent = await fs.readFile(sourceCsvPath, 'utf8');
        const parsedCsv = Papa.parse(rawContent, { header: true, skipEmptyLines: true });

        let allPatches = parsedCsv.data as any[];

        // Filter the preprocessed data to ONLY include patches that match approvedIssueIds
        const approvedPatches = allPatches.filter((patch: any) => {
            const pid = patch['Issue ID'] || patch.IssueID || patch.Issue_ID || patch.id;
            return pid && approvedIssueIds.includes(pid);
        });

        if (approvedPatches.length === 0) {
            // Write empty CSV with headers
            const emptyCsv = Papa.unparse([], { columns: parsedCsv.meta.fields });
            await fs.writeFile(outputCsvPath, emptyCsv, 'utf8');
            return NextResponse.json({ message: 'Finalized. No patches were approved.', count: 0 });
        }

        // Generate final CSV content retaining all rich AI fields (한글 설명, Criticality etc.)
        const finalCsvContent = Papa.unparse(approvedPatches);

        // Save the CSV to the shared linux folder
        await fs.writeFile(outputCsvPath, finalCsvContent, 'utf8');

        // Update pipeline_status.json
        const statusPath = path.join(basePath, 'pipeline_status.json');
        try {
            const statusContent = await fs.readFile(statusPath, 'utf8');
            let statusObj = JSON.parse(statusContent);
            statusObj.finalized = true;
            statusObj.finalizedAt = new Date().toISOString();
            statusObj.finalApprovedCount = approvedPatches.length;
            await fs.writeFile(statusPath, JSON.stringify(statusObj, null, 2), 'utf8');
        } catch (e) {
            console.log("Could not update pipeline_status.json on finalization. Non-fatal.", e);
        }

        return NextResponse.json({
            success: true,
            message: 'Finalized CSV generated successfully.',
            count: approvedPatches.length
        });

    } catch (e: any) {
        console.error("Finalize error:", e);
        return NextResponse.json({ error: 'Internal server error', details: e.message }, { status: 500 });
    }
}
