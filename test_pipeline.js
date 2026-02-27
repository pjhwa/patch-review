const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const linuxSkillDir = path.join(process.env.HOME || '/home/citec', '.openclaw/workspace/skills/patch-review/os/linux');
const statusFile = path.join(linuxSkillDir, 'pipeline_status.json');

console.log("Writing initial status to: " + statusFile);
fs.writeFileSync(statusFile, JSON.stringify({ isRunning: true, message: "Testing standalone trigger" }));

const runStep = (cmd, args, stepName) => {
    return new Promise((resolve, reject) => {
        console.log(`[Pipeline] Starting ${stepName}...`);
        fs.writeFileSync(statusFile, JSON.stringify({ isRunning: true, message: `Running: ${stepName}...` }));

        const p = spawn(cmd, args, { cwd: linuxSkillDir, stdio: 'inherit' });
        p.on('close', (code) => {
            if (code === 0) resolve(true);
            else reject(new Error(`${stepName} failed with code ${code}`));
        });
        p.on('error', (err) => reject(err));
    });
};

(async () => {
    try {
        await runStep('node', ['batch_collector.js', '--days', '1'], 'Data Collection');
        await runStep('python3', ['patch_preprocessing.py'], 'Preprocessing');
        await runStep('python3', ['perform_actual_review.py'], 'AI Analysis');

        fs.writeFileSync(statusFile, JSON.stringify({ isRunning: false, message: "Pipeline completed successfully." }));
        console.log("Done.");
    } catch (e) {
        console.error("Pipeline Error:", e);
        fs.writeFileSync(statusFile, JSON.stringify({ isRunning: false, message: `Failed: ${e.message}` }));
    }
})();
