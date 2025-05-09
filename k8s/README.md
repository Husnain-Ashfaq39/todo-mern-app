# Kubernetes Deployment for Todo MERN App

This directory contains Kubernetes manifests to deploy the Todo MERN application to Minikube.

## Prerequisites

- Minikube installed (`brew install minikube`)
- kubectl installed (`brew install kubectl`)
- Docker Hub account for storing your Docker images

## Files

- `mongo-deployment.yaml`: Deployment, service, and PVC for MongoDB
- `backend-deployment.yaml`: Deployment and service for the backend
- `frontend-deployment.yaml`: Deployment and service for the frontend
- `all-in-one-deployment.yaml`: Combined version of all resources
- `deploy.sh`: Script to deploy the individual manifest files
- `deploy-all.sh`: Script to deploy the all-in-one manifest file

## Deployment Steps

1. Start Minikube:
   ```
   minikube start
   ```

2. Build and push your Docker images to Docker Hub:
   ```
   # Build images
   docker build -t yourusername/todo-app-backend:latest ./backend
   docker build -t yourusername/todo-app-frontend:latest ./frontend
   
   # Push images to Docker Hub
   docker push yourusername/todo-app-backend:latest
   docker push yourusername/todo-app-frontend:latest
   ```

3. Edit the deploy script to add your Docker Hub username:
   ```
   # In deploy.sh or deploy-all.sh
   DOCKER_USERNAME="yourusername"
   ```

4. Deploy to Minikube:
   ```
   # Using separate manifests
   ./k8s/deploy.sh
   
   # OR using all-in-one manifest
   ./k8s/deploy-all.sh
   ```

5. Access your application:
   ```
   minikube service frontend --url
   ```

## Cleanup

To delete all resources:
```
kubectl delete -f k8s/all-in-one-deployment.yaml
```

Or delete each resource individually:
```
kubectl delete -f k8s/frontend-deployment.yaml
kubectl delete -f k8s/backend-deployment.yaml
kubectl delete -f k8s/mongo-deployment.yaml
``` 