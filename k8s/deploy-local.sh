#!/bin/bash

# This script is for local testing with Minikube without actual Docker Hub images
# It will apply the Kubernetes manifests with placeholder images for demonstration

# Set environment for Docker to use Minikube's Docker daemon
eval $(minikube docker-env)

# Build the images directly in Minikube's Docker environment
echo "Building backend Docker image..."
docker build -t todo-app-backend:latest ./backend

echo "Building frontend Docker image..."
docker build -t todo-app-frontend:latest ./frontend

# Create a version of the manifest with local images
cat k8s/all-in-one-deployment.yaml | \
  sed "s|\${DOCKER_USERNAME}/todo-app-backend:latest|todo-app-backend:latest|g" | \
  sed "s|\${DOCKER_USERNAME}/todo-app-frontend:latest|todo-app-frontend:latest|g" > k8s/local-deployment.yaml

# Update the image pull policy to Never since we're using local images
sed -i '' 's|image: todo-app-backend:latest|image: todo-app-backend:latest\n        imagePullPolicy: Never|g' k8s/local-deployment.yaml
sed -i '' 's|image: todo-app-frontend:latest|image: todo-app-frontend:latest\n        imagePullPolicy: Never|g' k8s/local-deployment.yaml

# Apply the Kubernetes manifests
kubectl apply -f k8s/local-deployment.yaml

# Wait for deployments to be ready
echo "Waiting for deployments to be ready..."
kubectl rollout status deployment/mongo
kubectl rollout status deployment/backend
kubectl rollout status deployment/frontend

# Get the URL for the frontend service
minikube service frontend --url

# Cleanup
echo "Local deployment file created at k8s/local-deployment.yaml" 