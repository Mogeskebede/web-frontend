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

                        $user = $env:DOCKER_USER
                        $token = $env:DOCKER_PASS

                        # DEBUG (safe)
                        Write-Host "User: $user"
                        Write-Host "Token length: $($token.Length)"

                        # IMPORTANT: correct login method for PAT
                        $token | docker login -u $user --password-stdin

                        if ($LASTEXITCODE -ne 0) {
                            Write-Host "Docker Hub login failed"
                            exit 1
                        }

                        Write-Host "Docker Hub login successful"
                    '''
                }
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