pipeline {
    agent any

    environment {
        IMAGE_TAG = "build-${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout Source') {
            steps {
                checkout scm
            }
        }

        stage('Verify AWS Credentials') {
            steps {
                withCredentials([
                    [$class: 'AmazonWebServicesCredentialsBinding',
                     credentialsId: 'AWS_Credentials'],
                    string(credentialsId: 'aws-region', variable: 'AWS_REGION')
                ]) {

                    bat """
                    echo Checking AWS identity...
                    aws sts get-caller-identity

                    IF %ERRORLEVEL% NEQ 0 (
                        echo AWS credentials are INVALID or expired
                        exit /b 1
                    )
                    """
                }
            }
        }

        stage('Build & Push Image') {
            steps {
                withCredentials([
                    [$class: 'AmazonWebServicesCredentialsBinding',
                     credentialsId: 'AWS_Credentials'],
                    string(credentialsId: 'aws-region', variable: 'AWS_REGION'),
                    string(credentialsId: 'aws-account-id', variable: 'AWS_ACCOUNT_ID')
                ]) {

                    bat """
                    set ECR_URI=%AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com/web-frontend

                    echo Logging into ECR...

                    aws ecr get-login-password --region %AWS_REGION% > password.txt
                    docker login --username AWS --password-stdin %AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com < password.txt
                    del password.txt

                    IF %ERRORLEVEL% NEQ 0 (
                        echo ECR login failed
                        exit /b 1
                    )

                    echo Building Docker image...
                    docker build -t web-frontend:%IMAGE_TAG% .

                    echo Tagging Docker image...
                    docker tag web-frontend:%IMAGE_TAG% %ECR_URI%:%IMAGE_TAG%

                    echo Pushing Docker image...
                    docker push %ECR_URI%:%IMAGE_TAG%
                    """
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                withCredentials([
                    file(credentialsId: 'eks-kubeconfig', variable: 'KUBECONFIG'),
                    string(credentialsId: 'aws-region', variable: 'AWS_REGION'),
                    string(credentialsId: 'aws-account-id', variable: 'AWS_ACCOUNT_ID')
                ]) {

                    bat """
                    set ECR_URI=%AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com/web-frontend

                    echo Applying Kubernetes manifests...

                    kubectl apply -f web-frontend/k8s/configmap.yaml
                    kubectl apply -f web-frontend/k8s/secrets.yaml
                    kubectl apply -f web-frontend/k8s/deployment.yaml
                    kubectl apply -f web-frontend/k8s/service.yaml

                    echo Updating image in deployment...
                    kubectl set image deployment/web-frontend ^
                      web-frontend=%ECR_URI%:%IMAGE_TAG% ^
                      -n orders-platform

                    echo Deployment complete.
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully"
        }

        failure {
            echo "Pipeline failed - check logs"
        }
    }
}