pipeline {
    agent any

    environment {
        IMAGE_NAME = "mogeshailu/web-frontend"
        IMAGE_TAG  = "build-${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout Source') {
            steps {
                checkout scm
            }
        }

        stage('Verify Docker') {
            steps {
                bat """
                docker version

                IF %ERRORLEVEL% NEQ 0 (
                    echo Docker is not running
                    exit /b 1
                )
                """
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

                    $password = $env:DOCKER_PASS
                    $password | docker login -u $env:DOCKER_USER --password-stdin

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

                bat """
                echo Building Docker image...

                docker build -t %IMAGE_NAME%:%IMAGE_TAG% .

                IF %ERRORLEVEL% NEQ 0 (
                    echo Docker build failed
                    exit /b 1
                )
                """
            }
        }

        stage('Push Docker Image') {
            steps {

                bat """
                echo Pushing Docker image...

                docker push %IMAGE_NAME%:%IMAGE_TAG%

                IF %ERRORLEVEL% NEQ 0 (
                    echo Docker push failed
                    exit /b 1
                )

                echo Image pushed successfully:
                echo %IMAGE_NAME%:%IMAGE_TAG%
                """
            }
        }

        stage('Tag Latest Image') {
            steps {

                bat """
                echo Tagging latest image...

                docker tag %IMAGE_NAME%:%IMAGE_TAG% %IMAGE_NAME%:latest

                docker push %IMAGE_NAME%:latest

                IF %ERRORLEVEL% NEQ 0 (
                    echo Latest image push failed
                    exit /b 1
                )
                """
            }
        }
    }

    post {

        success {
            echo "Pipeline completed successfully"

            echo "Docker Image:"
            echo "${IMAGE_NAME}:${IMAGE_TAG}"
        }

        failure {
            echo "Pipeline failed - check logs"
        }

        always {
            bat """
            docker logout
            """
        }
    }
}