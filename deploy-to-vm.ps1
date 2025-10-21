# deploy-to-vm.ps1
# Automated script to deploy Electron Shopping App to VM

# Configuration
$VM_IP = "192.168.0.48"
$VM_USER = "vboxuser"
$SSH_KEY = "C:\Users\damie\.ssh\vm_test-key"
$APP_SOURCE = "C:\Users\damie\Documents\CyberSmartCucumber\shopping-electron"
$APP_NAME = "shopping-electron"
$ZIP_NAME = "shopping-electron.zip"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying $APP_NAME to VM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if app source exists
Write-Host "[1/6] Checking app source folder..." -ForegroundColor Yellow
if (-Not (Test-Path $APP_SOURCE))
{
    Write-Host "ERROR: App source folder not found at: $APP_SOURCE" -ForegroundColor Red
    Write-Host "Please edit the script and set the correct APP_SOURCE path" -ForegroundColor Red
    exit 1
}
Write-Host "OK App source found" -ForegroundColor Green
Write-Host ""

# Step 2: Create zip file (excluding node_modules, .vs, etc.)
Write-Host "[2/6] Creating zip file (excluding node_modules and .vs)..." -ForegroundColor Yellow
$ZIP_PATH = "$HOME\$ZIP_NAME"

# Remove old zip if exists
if (Test-Path $ZIP_PATH)
{
    Remove-Item $ZIP_PATH -Force
}

# Create temporary directory for clean files
$TEMP_DIR = "$HOME\temp-deploy"
if (Test-Path $TEMP_DIR)
{
    Remove-Item $TEMP_DIR -Recurse -Force
}
New-Item -ItemType Directory -Path $TEMP_DIR | Out-Null

Write-Host "Copying files (excluding node_modules, .vs, .git)..." -ForegroundColor Gray

# Copy files excluding certain directories
$excludeDirs = @("node_modules", ".vs", ".git", "dist", "build", ".vscode")
Get-ChildItem -Path $APP_SOURCE -Recurse | Where-Object {
    $item = $_
    $exclude = $false
    foreach ($dir in $excludeDirs)
    {
        if ($item.FullName -like "*\$dir\*" -or $item.Name -eq $dir)
        {
            $exclude = $true
            break
        }
    }
    -not $exclude
} | ForEach-Object {
    $dest = $_.FullName.Replace($APP_SOURCE, $TEMP_DIR)
    if ($_.PSIsContainer)
    {
        if (-not (Test-Path $dest))
        {
            New-Item -ItemType Directory -Path $dest -Force | Out-Null
        }
    }
    else
    {
        $destDir = Split-Path -Parent $dest
        if (-not (Test-Path $destDir))
        {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item $_.FullName -Destination $dest -Force
    }
}

Write-Host "Creating zip archive..." -ForegroundColor Gray
Compress-Archive -Path "$TEMP_DIR\*" -DestinationPath $ZIP_PATH -Force

# Clean up temp directory
Remove-Item $TEMP_DIR -Recurse -Force

$zipSize = (Get-Item $ZIP_PATH).Length / 1MB
Write-Host "OK Zip created: $ZIP_PATH ($([math]::Round($zipSize, 2)) MB)" -ForegroundColor Green
Write-Host ""

# Step 3: Check VM connectivity
Write-Host "[3/6] Checking VM connectivity..." -ForegroundColor Yellow
$pingResult = Test-Connection -ComputerName $VM_IP -Count 1 -Quiet
if (-not $pingResult)
{
    Write-Host "ERROR: Cannot reach VM at $VM_IP" -ForegroundColor Red
    Write-Host "Please make sure the VM is running" -ForegroundColor Red
    exit 1
}
Write-Host "OK VM is reachable" -ForegroundColor Green
Write-Host ""

# Step 4: Copy zip to VM
Write-Host "[4/6] Copying zip file to VM..." -ForegroundColor Yellow
Write-Host "Running: scp to VM..." -ForegroundColor Gray

scp -i $SSH_KEY $ZIP_PATH ${VM_USER}@${VM_IP}:~/

if ($LASTEXITCODE -eq 0)
{
    Write-Host "OK File copied to VM" -ForegroundColor Green
}
else
{
    Write-Host "ERROR: Failed to copy file to VM" -ForegroundColor Red
    Write-Host "Make sure SSH key is set up correctly" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Unzip and setup on VM
Write-Host "[5/6] Unzipping and setting up on VM..." -ForegroundColor Yellow
Write-Host "Running setup commands on VM..." -ForegroundColor Gray

ssh -i $SSH_KEY ${VM_USER}@${VM_IP} "echo 'Cleaning up old installation...'; rm -rf ~/shopping-app ~/.npm; echo 'Installing required packages...'; sudo apt install -y unzip xvfb > /dev/null 2>&1; echo 'Creating app directory...'; mkdir -p ~/shopping-app; echo 'Unzipping application...'; unzip -o ~/$ZIP_NAME -d ~/shopping-app; echo 'Removing zip file...'; rm ~/$ZIP_NAME; echo 'Fixing permissions...'; chmod -R 755 ~/shopping-app; echo 'Installing dependencies...'; cd ~/shopping-app; npm cache clean --force 2>/dev/null; npm install --unsafe-perm --no-optional; echo 'Fixing Electron chrome-sandbox...'; sudo chown root:root node_modules/electron/dist/chrome-sandbox 2>/dev/null; sudo chmod 4755 node_modules/electron/dist/chrome-sandbox 2>/dev/null; echo 'Setup complete!';"

if ($LASTEXITCODE -eq 0)
{
    Write-Host "OK App unzipped and dependencies installed" -ForegroundColor Green
}
else
{
    Write-Host "WARNING: Setup completed with some warnings" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Verify installation
Write-Host "[6/6] Verifying installation..." -ForegroundColor Yellow

ssh -i $SSH_KEY ${VM_USER}@${VM_IP} "cd ~/shopping-app; echo 'Files in shopping-app:'; ls -la | head -20; echo ''; echo 'App path: ~/shopping-app'; echo 'Server.js exists:'; ls -la server.js 2>/dev/null || echo 'server.js not found - you may need to create it';"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "OK Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your app is now installed at: ~/shopping-app" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the app, run:" -ForegroundColor Cyan
Write-Host "  ssh -i $SSH_KEY ${VM_USER}@${VM_IP}" -ForegroundColor White
Write-Host "  cd ~/shopping-app" -ForegroundColor White
Write-Host "  xvfb-run npm start" -ForegroundColor White
Write-Host ""
Write-Host "Or start it remotely:" -ForegroundColor Cyan
Write-Host "  ssh -i $SSH_KEY ${VM_USER}@${VM_IP} 'cd ~/shopping-app; xvfb-run npm start &'" -ForegroundColor White
Write-Host ""

# Clean up local zip
Remove-Item $ZIP_PATH -Force
Write-Host "Local zip file cleaned up" -ForegroundColor Gray