# Pet Rock OS Environment Setup Script
Write-Host "🪨 Setting up Pet Rock OS environment..." -ForegroundColor Green

# Copy .env.example to .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created .env.local from .env.example" -ForegroundColor Green
    Write-Host "📝 Please edit .env.local and add your Google AI Studio API key" -ForegroundColor Yellow
    Write-Host "🔗 Get your API key from: https://aistudio.google.com/app/apikey" -ForegroundColor Cyan
}
else {
    Write-Host "ℹ️  .env.local already exists" -ForegroundColor Blue
}

Write-Host "🚀 To start the development server, run: npm run dev" -ForegroundColor Green
Write-Host "🌐 Then open: http://localhost:3000" -ForegroundColor Cyan
