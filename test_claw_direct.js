const { spawnSync } = require('child_process');
const fs = require('fs');

const cmd = '/home/citec/.nvm/versions/node/v22.22.0/bin/openclaw';
const args = [
    'agent',
    '--agent', 'main',
    '--json',
    '-m',
    'Read SKILL.md. Note that Step 1 and Step 2 are completed. Start from Step 3: Impact Analysis, and then proceed to finalize Step 4: Final JSON Generation. CRITICAL INSTRUCTION: You MUST output the final analytical result EXCLUSIVELY to a file named patch_review_ai_report.json (NOT A CSV). The JSON must be an array of objects. Each object MUST strictly contain the exact following string keys: IssueID, Component, Version, Vendor, Date, Criticality, Description, and KoreanDescription. Auto-complete everything without user prompting.'
];

try {
    let output = spawnSync(cmd, args, { cwd: '/home/citec/.openclaw/workspace/skills/patch-review/os/linux-v2' });
    const stdoutStr = output.stdout.toString();
    const stderrStr = output.stderr.toString();

    fs.writeFileSync('/tmp/claw_out.json', stdoutStr);
    fs.writeFileSync('/tmp/claw_err.txt', stderrStr);

    console.log('Saved stdout to /tmp/claw_out.json (length: ' + stdoutStr.length + ')');
    console.log('Saved stderr to /tmp/claw_err.txt (length: ' + stderrStr.length + ')');
} catch (e) {
    console.log(e.toString());
}
