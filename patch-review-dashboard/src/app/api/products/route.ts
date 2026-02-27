import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (category !== 'os') {
        return NextResponse.json({ products: [] });
    }

    // Base paths on tom26 where OpenClaw skills are located
    const linuxSkillDir = path.join(process.env.HOME || '/home/citec', '.openclaw/workspace/skills/patch-review/os/linux');
    const batchDataDir = path.join(linuxSkillDir, 'batch_data');
    const preprocessedFile = path.join(linuxSkillDir, 'patches_for_llm_review.json');
    const finalReportFile = path.join(linuxSkillDir, 'patch_review_final_report.csv');

    // Default counts
    const counts = {
        redhat: { collected: 0, preprocessed: 0, reviewed: 0 },
        oracle: { collected: 0, preprocessed: 0, reviewed: 0 },
        ubuntu: { collected: 0, preprocessed: 0, reviewed: 0 }
    };

    // 1. Count Collected (from batch_data/*.json)
    try {
        if (fs.existsSync(batchDataDir)) {
            const files = fs.readdirSync(batchDataDir).filter(f => f.endsWith('.json') && f !== 'collection_failures.json');
            for (const file of files) {
                try {
                    const data = JSON.parse(fs.readFileSync(path.join(batchDataDir, file), 'utf-8'));
                    if (data.vendor === 'Red Hat') counts.redhat.collected++;
                    else if (data.vendor === 'Oracle') counts.oracle.collected++;
                    else if (data.vendor === 'Ubuntu') counts.ubuntu.collected++;
                } catch (e) { }
            }
        }
    } catch (e) { console.error("Error reading collected:", e); }

    // 2. Count Preprocessed (from patches_for_llm_review.json)
    try {
        if (fs.existsSync(preprocessedFile)) {
            const data = JSON.parse(fs.readFileSync(preprocessedFile, 'utf-8'));
            for (const item of data) {
                if (item.vendor === 'Red Hat') counts.redhat.preprocessed++;
                else if (item.vendor === 'Oracle') counts.oracle.preprocessed++;
                else if (item.vendor === 'Ubuntu') counts.ubuntu.preprocessed++;
            }
        }
    } catch (e) { console.error("Error reading preprocessed:", e); }

    // 3. Count Reviewed (from patch_review_final_report.csv)
    try {
        if (fs.existsSync(finalReportFile)) {
            const csvData = fs.readFileSync(finalReportFile, 'utf-8');
            const lines = csvData.split('\n');
            // Simplified hit search for CSV representation
            for (const line of lines) {
                if (line.includes('Red Hat')) counts.redhat.reviewed++;
                else if (line.includes('Oracle')) counts.oracle.reviewed++;
                else if (line.includes('Ubuntu')) counts.ubuntu.reviewed++;
            }
        }
    } catch (e) { console.error("Error reading reviewed:", e); }

    const checkFinalized = (prodId: string) => {
        const filePath = path.join(linuxSkillDir, `final_approved_patches_${prodId}.csv`);
        if (fs.existsSync(filePath)) {
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const lines = content.split('\n').filter(l => l.trim().length > 0);
                const approvedCount = Math.max(0, lines.length - 1); // Subtract header
                return { isCompleted: true, approvedCount };
            } catch (e) {
                return { isCompleted: true, approvedCount: 0 };
            }
        }
        return { isCompleted: false, approvedCount: 0 };
    };

    const osProducts = [
        { id: 'redhat', name: 'Red Hat Enterprise Linux', stages: { ...counts.redhat, approved: checkFinalized('redhat').approvedCount }, active: true, isReviewCompleted: checkFinalized('redhat').isCompleted },
        { id: 'oracle', name: 'Oracle Linux', stages: { ...counts.oracle, approved: checkFinalized('oracle').approvedCount }, active: true, isReviewCompleted: checkFinalized('oracle').isCompleted },
        { id: 'ubuntu', name: 'Ubuntu Linux', stages: { ...counts.ubuntu, approved: checkFinalized('ubuntu').approvedCount }, active: true, isReviewCompleted: checkFinalized('ubuntu').isCompleted },
        { id: 'windows', name: 'Windows Server', stages: null, active: false, isReviewCompleted: false },
        { id: 'hpux', name: 'HP-UX', stages: null, active: false, isReviewCompleted: false },
        { id: 'aix', name: 'IBM AIX', stages: null, active: false, isReviewCompleted: false },
        { id: 'solaris', name: 'Oracle Solaris', stages: null, active: false, isReviewCompleted: false },
    ];

    return NextResponse.json({ products: osProducts });
}
