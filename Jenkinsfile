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

        stage('Build & Pubat Image') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'AWS_Credentials',
                                     usernameVariable: 'AWS_ACCESS_KEY_ID',
                                     passwordVariable: 'AWS_SECRET_ACCESS_KEY'),
                    string(credentialsId: 'aws-region',      variable: 'AWS_REGION'),
                    string(credentialsId: 'aws-account-id',  variable: 'AWS_ACCOUNT_ID'),
                    string(credentialsId: 'web-frontend', variable: 'ECR_REPO')
                ]) {

                    dir('web-frontend') {
                        bat """
                        echo "Logging into ECR..."
                        aws ecr get-login-password --region $AWS_REGION \
                          | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

                        echo "Building Docker image..."
                        docker build -t web-frontend:$IMAGE_TAG .

                        echo "Tagging image..."
                        docker tag web-frontend:$IMAGE_TAG $ECR_REPO:$IMAGE_TAG

                        echo "Pubating image to ECR..."
                        docker pubat $ECR_REPO:$IMAGE_TAG
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

                    dir('web-frontend/k8s') {
                        bat """
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
