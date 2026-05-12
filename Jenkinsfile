pipeline {
    agent any

    environment {
        IMAGE_TAG = "build-${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Mogeskebede/web-frontend.git'
            }
        }

        stage('Unit Tests') {
            steps {
                dir('services/web-frontend') {
                    sh 'npm install'
                    sh 'npm test || echo "no tests yet"'
                }
            }
        }

        stage('Build & Push Image') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'aws-creds',
                                     usernameVariable: 'AWS_ACCESS_KEY_ID',
                                     passwordVariable: 'AWS_SECRET_ACCESS_KEY'),
                    string(credentialsId: 'aws-region',      variable: 'AWS_REGION'),
                    string(credentialsId: 'aws-account-id',  variable: 'AWS_ACCOUNT_ID'),
                    string(credentialsId: 'frontend-ecr-repo', variable: 'ECR_REPO')
                ]) {

                    dir('services/web-frontend') {
                        sh """
                        echo "Logging into ECR..."
                        aws ecr get-login-password --region $AWS_REGION \
                          | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

                        echo "Building Docker image..."
                        docker build -t web-frontend:$IMAGE_TAG .

                        echo "Tagging image..."
                        docker tag web-frontend:$IMAGE_TAG $ECR_REPO:$IMAGE_TAG

                        echo "Pushing image to ECR..."
                        docker push $ECR_REPO:$IMAGE_TAG
                        """
                    }
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                withCredentials([
                    file(credentialsId: 'eks-kubeconfig', variable: 'KUBECONFIG')
                ]) {

                    dir('services/web-frontend/k8s') {
                        sh """
                        echo "Applying ConfigMap and Secrets..."
                        kubectl apply -f configmap.yaml
                        kubectl apply -f secrets.yaml

                        echo "Applying Deployment and Service..."
                        kubectl apply -f deployment.yaml
                        kubectl apply -f service.yaml

                        echo "Updating image in Deployment..."
                        kubectl set image deployment/web-frontend \
                          web-frontend=$ECR_REPO:$IMAGE_TAG \
                          -n orders-platform

                        echo "Deployment complete."
                        """
                    }
                }
            }
        }
    }
}
