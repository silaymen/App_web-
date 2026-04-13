Write-Host "--- Docker Hub Deployment Tool ---" -ForegroundColor Cyan

# Configuration
$IMAGE_NAME = "web-certification-service:latest"
$HUB_TAG = "louaylouay/demo:v1.0"

Write-Host "[1/3] Tagging image..." -ForegroundColor Yellow
docker tag $IMAGE_NAME $HUB_TAG

Write-Host "[2/3] Authenticating..." -ForegroundColor Yellow
Write-Host "Please follow the prompt for credentials if not already logged in." -ForegroundColor White
docker login

Write-Host "[3/3] Pushing to Docker Hub..." -ForegroundColor Yellow
docker push $HUB_TAG

Write-Host "Successfully pushed $HUB_TAG to Docker Hub!" -ForegroundColor Green
Write-Host "You can now test it on KillerCoda using:" -ForegroundColor Cyan
Write-Host "docker pull $HUB_TAG"
Write-Host "docker run -d -p 8082:8080 --name demo-container $HUB_TAG"
