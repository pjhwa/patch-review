import paramiko
import sys

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('172.16.10.237', username='citec')
    sftp = ssh.open_sftp()
    base_remote = '/home/citec/.openclaw/workspace/skills/patch-review/patch-review-dashboard-v2/src/app/category'
    sftp.put(r'patch-review-dashboard-v2\src\app\category\[categoryId]\[productId]\ClientPage.tsx', f'{base_remote}/[categoryId]/[productId]/ClientPage.tsx')
    sftp.put(r'patch-review-dashboard-v2\src\app\category\[id]\[productId]\page.tsx', f'{base_remote}/[id]/[productId]/page.tsx')
    sftp.close()
    
    print("Files uploaded successfully", flush=True)
    
    stdin, stdout, stderr = ssh.exec_command('source ~/.nvm/nvm.sh && cd /home/citec/.openclaw/workspace/skills/patch-review/patch-review-dashboard-v2 && npm run build && pm2 restart patch-review-dashboard')
    print("Build STDOUT:", stdout.read().decode())
    print("Build STDERR:", stderr.read().decode())
    ssh.close()
    print("Build and restart complete")
except Exception as e:
    print('SFTP Error:', e)
    sys.exit(1)
