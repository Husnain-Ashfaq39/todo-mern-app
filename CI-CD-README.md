# CI/CD Setup for Todo App

This document explains how to set up Continuous Integration and Continuous Deployment for the Todo MERN application.

## GitHub Actions Setup

### Required Secrets

Add the following secrets to your GitHub repository (Settings > Secrets and variables > Actions):

1. `DOCKER_USERNAME`: Your Docker Hub username (husnain239)
2. `DOCKER_PASSWORD`: Your Docker Hub password or access token
3. `REPO_ACCESS_TOKEN`: A GitHub Personal Access Token with `repo` scope to trigger the deployment workflow

### Workflow Overview

The CI/CD pipeline consists of two main workflows:

1. **Build and Push Docker Images** (.github/workflows/docker-build-push.yml)
   - Triggered on push to main/master branch
   - Builds Docker images for frontend and backend
   - Pushes images to Docker Hub with the tag "latest"

2. **Deploy to Kubernetes** (.github/workflows/k8s-deploy.yml)
   - Triggered after successful image build
   - Sends a repository dispatch event to trigger local deployment

## Local Deployment Setup

For the local deployment trigger to work, you need to set up a webhook listener. Here are two options:

### Option 1: Manual Deployment

After images are pushed to Docker Hub, manually run:

```bash
./k8s/webhook-deploy.sh
```

### Option 2: Automated Webhook Listener

Set up a simple webhook server using a tool like [webhook](https://github.com/adnanh/webhook) or a custom Node.js/Python server that listens for GitHub repository dispatch events and executes the deployment script.

Example for a basic webhook server:

1. Install webhook: `brew install webhook`
2. Create a hooks configuration file: `webhook-config.json`
3. Configure it to execute `k8s/webhook-deploy.sh` when triggered
4. Start the webhook server and expose it to the internet (you can use ngrok for testing)
5. Add the webhook URL to your GitHub repository settings

## Manual Deployment

If you prefer to deploy manually:

1. Start Minikube: `minikube start`
2. Pull the latest images: 
   ```bash
   docker pull husnain239/todo-backend:latest
   docker pull husnain239/todo-frontend:latest
   ```
3. Run the deployment script: `./k8s/deploy-all.sh`

## Checking Deployment

```bash
# Get all resources
kubectl get all

# Check pods status
kubectl get pods

# Check services (and get frontend URL)
minikube service frontend --url
``` 