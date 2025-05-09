#!/bin/bash

# Set your Docker Hub username
DOCKER_USERNAME="your-docker-username"

# Update image names in the deployment files
sed -i '' "s/\${DOCKER_USERNAME}/$DOCKER_USERNAME/g" k8s/backend-deployment.yaml
sed -i '' "s/\${DOCKER_USERNAME}/$DOCKER_USERNAME/g" k8s/frontend-deployment.yaml

# Apply the Kubernetes manifests
kubectl apply -f k8s/mongo-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Wait for deployments to be ready
echo "Waiting for deployments to be ready..."
kubectl rollout status deployment/mongo
kubectl rollout status deployment/backend
kubectl rollout status deployment/frontend

# Get the URL for the frontend service
minikube service frontend --url 