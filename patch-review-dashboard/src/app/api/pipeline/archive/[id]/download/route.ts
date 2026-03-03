import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        // Path should match the directory structure of the linuxSkillDir
        const linuxSkillDir = path.join(process.env.HOME || '/home/citec', '.openclaw/workspace/skills/patch-review/os/linux');
        const archiveFilePath = path.join(linuxSkillDir, 'archive', id, 'patch_review_final_report.csv');

        // Check if file exists
        if (!fs.existsSync(archiveFilePath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        const fileContent = fs.readFileSync(archiveFilePath, 'utf-8');

        if (!productId) {
            // Return raw CSV if no product filter is provided
            const response = new NextResponse(fileContent);
            response.headers.set('Content-Type', 'text/csv');
            response.headers.set('Content-Disposition', `attachment; filename="archive_${id}_patches.csv"`);
            return response;
        }

        // Filter based on product
        const targetVendorMapping: { [key: string]: string } = {
            'redhat': 'Red Hat',
            'oracle': 'Oracle',
            'ubuntu': 'Ubuntu'
        };
        const targetVendor = targetVendorMapping[productId];

        if (!targetVendor) {
            return new NextResponse('Invalid product ID for filtering', { status: 400 });
        }

        const parsed = Papa.parse(fileContent, { header: true, skipEmptyLines: true });

        let filteredData: any[] = [];
        if (parsed.data && Array.isArray(parsed.data)) {
            filteredData = parsed.data.filter((row: any) => {
                const vendor = row['Vendor'] || row['Vendor ID'] || row['vendor'];
                return vendor && String(vendor).toLowerCase().includes(targetVendor.toLowerCase());
            });
        }

        const filteredCsv = Papa.unparse(filteredData);

        const response = new NextResponse(filteredCsv);
        response.headers.set('Content-Type', 'text/csv');
        response.headers.set('Content-Disposition', `attachment; filename="archive_${productId}_${id}_patches.csv"`);
        return response;

    } catch (error) {
        console.error("Archive download failed:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
