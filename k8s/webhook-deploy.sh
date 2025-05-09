#!/bin/bash

# This script can be run on a server that has access to your Kubernetes cluster
# It can be triggered by a webhook or run manually

# Set your Docker Hub username
DOCKER_USERNAME="husnain239"

# Pull the latest images
docker pull $DOCKER_USERNAME/todo-backend:latest
docker pull $DOCKER_USERNAME/todo-frontend:latest

# Create a temporary file with the Docker username replaced
sed "s/\${DOCKER_USERNAME}/$DOCKER_USERNAME/g" k8s/all-in-one-deployment.yaml > k8s/temp-deployment.yaml

# Apply the Kubernetes manifests
kubectl apply -f k8s/temp-deployment.yaml

# Remove the temporary file
rm k8s/temp-deployment.yaml

# Restart the deployments to pick up new images
kubectl rollout restart deployment/backend
kubectl rollout restart deployment/frontend

# Wait for deployments to be ready
echo "Waiting for deployments to be ready..."
kubectl rollout status deployment/mongo
kubectl rollout status deployment/backend
kubectl rollout status deployment/frontend

# Get the URL for the frontend service
minikube service frontend --url

echo "Deployment completed successfully!" 