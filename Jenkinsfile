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

        stage('Build & Push Image') {
            steps {
                withCredentials([
                    [$class: 'AmazonWebServicesCredentialsBinding',
                     credentialsId: 'AWS_Credentials'],
                    string(credentialsId: 'aws-region', variable: 'AWS_REGION'),
                    string(credentialsId: 'aws-account-id', variable: 'AWS_ACCOUNT_ID'),
                    string(credentialsId: 'web-frontend', variable: 'ECR_REPO')
                ]) {

                    dir('web-frontend') {
                        bat """
                        echo Logging into ECR...

                        aws ecr get-login-password --region %AWS_REGION% ^
                        | docker login --username AWS --password-stdin %AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com

                        echo Building Docker image...
                        docker build -t web-frontend:%IMAGE_TAG% .

                        echo Tagging Docker image...
                        docker tag web-frontend:%IMAGE_TAG% %ECR_REPO%:%IMAGE_TAG%

                        echo Pushing Docker image...
                        docker push %ECR_REPO%:%IMAGE_TAG%
                        """
                    }
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                withCredentials([
                    file(credentialsId: 'eks-kubeconfig', variable: 'KUBECONFIG'),
                    string(credentialsId: 'web-frontend', variable: 'ECR_REPO')
                ]) {

                    dir('web-frontend/k8s') {
                        bat """
                        echo Applying Kubernetes manifests...

                        kubectl apply -f configmap.yaml
                        kubectl apply -f secrets.yaml
                        kubectl apply -f deployment.yaml
                        kubectl apply -f service.yaml

                        echo Updating image in deployment...
                        kubectl set image deployment/web-frontend ^
                          web-frontend=%ECR_REPO%:%IMAGE_TAG% ^
                          -n orders-platform

                        echo Deployment complete.
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully'
        }

        failure {
            echo 'Pipeline failed Check logs'
        }
    }
}