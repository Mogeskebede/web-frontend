pipeline {
    agent any

    environment {
        IMAGE_NAME = "mogeshailu/web-frontend"
        IMAGE_TAG  = "build-${BUILD_NUMBER}"
    }

    stages {


        stage('Verify Docker') {
            steps {
                powershell '''
                    docker version
                    if ($LASTEXITCODE -ne 0) {
                        Write-Host "Docker is not running"
                        exit 1
                    }
                '''
            }
        }

        stage('Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {

                    powershell '''
                        Write-Host "Logging into Docker Hub..."

                        $securePass = $env:DOCKER_PASS

                        $securePass | docker login -u $env:DOCKER_USER --password-stdin

                        if ($LASTEXITCODE -ne 0) {
                            Write-Host "Docker Hub login failed"
                            exit 1
                        }

                        Write-Host "Docker Hub login successful"
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                powershell '''
                    Write-Host "Building Docker image..."

                    docker build -t $env:IMAGE_NAME:$env:IMAGE_TAG .

                    if ($LASTEXITCODE -ne 0) {
                        Write-Host "Docker build failed"
                        exit 1
                    }
                '''
            }
        }

        stage('Push Docker Image') {
            steps {
                powershell '''
                    Write-Host "Pushing Docker image..."

                    docker push $env:IMAGE_NAME:$env:IMAGE_TAG

                    if ($LASTEXITCODE -ne 0) {
                        Write-Host "Docker push failed"
                        exit 1
                    }

                    Write-Host "Image pushed successfully:"
                    Write-Host "$env:IMAGE_NAME:$env:IMAGE_TAG"
                '''
            }
        }

        stage('Tag Latest Image') {
            steps {
                powershell '''
                    Write-Host "Tagging latest image..."

                    docker tag $env:IMAGE_NAME:$env:IMAGE_TAG $env:IMAGE_NAME:latest

                    docker push $env:IMAGE_NAME:latest

                    if ($LASTEXITCODE -ne 0) {
                        Write-Host "Latest image push failed"
                        exit 1
                    }
                '''
            }
        }
    }

    post {

        success {
            echo "Pipeline completed successfully"
            echo "Docker Image: ${env.IMAGE_NAME}:${env.IMAGE_TAG}"
        }

        failure {
            echo "Pipeline failed - check logs"
        }

        always {
            powershell 'docker logout'
        }
    }
}