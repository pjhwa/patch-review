import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execAsync = util.promisify(exec);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { category, productId, isRetry } = body;

        if (category !== 'os') {
            return NextResponse.json({ error: 'Only OS category is supported for execution right now' }, { status: 400 });
        }

        // Map specific products to their underlying shared collection script platforms.
        // E.g., Red Hat, Oracle, Ubuntu all belong to the shared 'linux' execution pipeline.
        const linuxProducts = ['redhat', 'oracle', 'ubuntu'];
        let platformFolder = '';

        if (linuxProducts.includes(productId)) {
            platformFolder = 'linux';
        } else {
            return NextResponse.json({ error: `Automated execution is not yet configured for ${productId}` }, { status: 400 });
        }

        const linuxSkillDir = path.join(process.env.HOME || '/home/citec', '.openclaw/workspace/skills/patch-review/os/linux');
        const statusFile = path.join(linuxSkillDir, 'pipeline_status.json');
        const { spawn } = require('child_process');
        const fs = require('fs');

        if (fs.existsSync(statusFile)) {
            try {
                const status = JSON.parse(fs.readFileSync(statusFile, 'utf-8'));
                if (status.isRunning) {
                    return NextResponse.json({ error: 'Pipeline is already running.' }, { status: 409 });
                }
            } catch (e) { }
        }

        fs.writeFileSync(statusFile, JSON.stringify({ isRunning: true, message: isRetry ? "Starting Retry Data Collection..." : "Starting Data Collection..." }));

        // Archive previous batch data and logs so UI counts reset to 0 cleanly
        if (!isRetry) {
            try {
                const batchDataDir = path.join(linuxSkillDir, 'batch_data');
                const debugLogFile = path.join(linuxSkillDir, 'debug_collector.log');
                const preprocessedFile = path.join(linuxSkillDir, 'patches_for_llm_review.json');
                const finalReportFile = path.join(linuxSkillDir, 'patch_review_final_report.csv');

                const approvedFiles = ['redhat', 'oracle', 'ubuntu'].map(prod =>
                    path.join(linuxSkillDir, `final_approved_patches_${prod}.csv`)
                );

                const shouldArchive = fs.existsSync(batchDataDir) ||
                    fs.existsSync(preprocessedFile) ||
                    fs.existsSync(finalReportFile) ||
                    approvedFiles.some(f => fs.existsSync(f));

                if (shouldArchive) {
                    // Create archive dir based on current timestamp
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const archiveDir = path.join(linuxSkillDir, 'archive', timestamp);
                    fs.mkdirSync(archiveDir, { recursive: true });

                    if (fs.existsSync(batchDataDir)) {
                        fs.renameSync(batchDataDir, path.join(archiveDir, 'batch_data'));
                    }
                    if (fs.existsSync(debugLogFile)) {
                        fs.renameSync(debugLogFile, path.join(archiveDir, 'debug_collector.log'));
                    }
                    if (fs.existsSync(preprocessedFile)) {
                        fs.renameSync(preprocessedFile, path.join(archiveDir, 'patches_for_llm_review.json'));
                    }
                    if (fs.existsSync(finalReportFile)) {
                        fs.renameSync(finalReportFile, path.join(archiveDir, 'patch_review_final_report.csv'));
                    }
                    ['redhat', 'oracle', 'ubuntu'].forEach(prod => {
                        const approvedFile = path.join(linuxSkillDir, `final_approved_patches_${prod}.csv`);
                        if (fs.existsSync(approvedFile)) {
                            fs.renameSync(approvedFile, path.join(archiveDir, `final_approved_patches_${prod}.csv`));
                        }
                    });
                }
            } catch (e) {
                console.error("Warning: Failed to archive old data", e);
            }
        }

        const runBackgroundPipeline = () => {
            const runStep = (cmd: string, args: string[], stepName: string, options: any = { cwd: linuxSkillDir }) => {
                return new Promise((resolve, reject) => {
                    console.log(`[Pipeline] Starting ${stepName}...`);
                    fs.writeFileSync(statusFile, JSON.stringify({ isRunning: true, message: `Running: ${stepName}...` }));

                    const logStream = fs.createWriteStream(path.join(linuxSkillDir, 'debug_collector.log'), { flags: 'a' });
                    const p = spawn(cmd, args, options);

                    p.stdout.pipe(logStream);
                    p.stderr.pipe(logStream);

                    p.on('close', (code: number) => {
                        logStream.end();
                        code === 0 ? resolve(true) : reject(new Error(`${stepName} failed with code ${code}`));
                    });
                    p.on('error', (err: any) => {
                        logStream.end();
                        reject(err);
                    });
                });
            };
            (async () => {
                try {
                    const nodePath = path.join(process.env.HOME || '/home/citec', '.nvm/versions/node/v22.22.0/bin/node');
                    const scraperArgs = isRetry ? ['batch_collector.js', '--retry-failures'] : ['batch_collector.js'];

                    await runStep(nodePath, scraperArgs, isRetry ? 'Retry Data Collection' : 'Data Collection', { cwd: linuxSkillDir });
                    await runStep('/usr/bin/python3', ['patch_preprocessing.py'], 'Preprocessing', { cwd: linuxSkillDir });

                    const openClawPath = '/home/citec/.nvm/versions/node/v22.22.0/bin/node';
                    const openClawScript = '/home/citec/.nvm/versions/node/v22.22.0/bin/openclaw';
                    let aiPrompt = "Read SKILL.md. Note that Step 1 and Step 2 are perfectly complete, and patches_for_llm_review.json is generated. Therefore, you must start from Step 3: Impact Analysis, and then proceed to finalize Step 4: Final Report Generation, saving the exact patch_review_final_report.csv format. I have provided a few-shot best practice example at best_practice_report.csv in this directory. Please read it to deeply understand the expected CSV output format and analytical quality. Ensure you do not skip Step 4. Auto-complete everything.";

                    const feedbackFile = path.join(linuxSkillDir, 'user_exclusion_feedback.json');
                    if (fs.existsSync(feedbackFile)) {
                        try {
                            const feedbackList = JSON.parse(fs.readFileSync(feedbackFile, 'utf-8'));
                            if (Array.isArray(feedbackList) && feedbackList.length > 0) {
                                const exclusionRules = feedbackList.map((f: any) => `- Issue: ${f.issueId}, Description: ${f.description}, Reason for exclusion: ${f.reason}`).join('\n');
                                aiPrompt += `\n\nCRITICAL INSTRUCTION: Reviewers have manually marked the following historical patches to be explicitly EXCLUDED from final recommendations for the provided reasons:\n${exclusionRules}\n\nIf you encounter any patches in patches_for_llm_review.json that are highly similar or identical to these excluded patch descriptions/reasons, you MUST filter them out and NOT include them in the final patch_review_final_report.csv.`;
                                console.log("[Pipeline] Injected User Exclusion Feedback into AI Prompt.");
                            }
                        } catch (e) {
                            console.error("Failed to read user exclusion feedback:", e);
                        }
                    }

                    await runStep(openClawPath, [openClawScript, 'agent', '--agent', 'main', '--message', aiPrompt], 'AI Analysis', { cwd: linuxSkillDir });

                    const completedAt = new Date().toISOString();
                    fs.writeFileSync(statusFile, JSON.stringify({ isRunning: false, message: "Pipeline completed successfully.", lastCompletedAt: completedAt }));
                } catch (e: any) {
                    console.error("[Pipeline Error]", e);
                    fs.writeFileSync(statusFile, JSON.stringify({ isRunning: false, message: `Failed: ${e.message}` }));
                }
            })();
        };

        runBackgroundPipeline();

        return NextResponse.json({
            success: true,
            message: `Started ${isRetry ? 'retry ' : ''}pipeline execution for Linux servers (redhat, oracle, ubuntu)`,
            jobId: `job-${Date.now()}`
        });

    } catch (error: any) {
        console.error("Pipeline execution failed:", error);
        return NextResponse.json({ error: error.message || 'Execution failed' }, { status: 500 });
    }
}
