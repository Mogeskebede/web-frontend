#!/bin/bash

# Stop script on errors
set -e

# CONFIGURATION

CLUSTER_NAME="orders-platform-cluster"
REGION="us-east-2"
ACCOUNT_ID="Your_Account_ID"
VPC_ID="Your_VPC_ID"

echo ""
echo "==============================================="
echo "Installing AWS Load Balancer Controller"
echo "==============================================="
echo ""

# 1. Associate OIDC Provider

echo "Associating OIDC provider..."

eksctl utils associate-iam-oidc-provider \
  --region $REGION \
  --cluster $CLUSTER_NAME \
  --approve

# 2. Download IAM Policy

echo "Downloading IAM policy..."

curl -o iam_policy.json \
https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json

# 3. Create IAM Policy

echo "Creating IAM policy if it does not already exist..."

aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json \
|| echo "IAM policy already exists. Continuing..."

# 4. Create IAM Service Account

echo "Creating IAM service account..."

eksctl create iamserviceaccount \
  --cluster $CLUSTER_NAME \
  --namespace kube-system \
  --name aws-load-balancer-controller \
  --attach-policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/AWSLoadBalancerControllerIAMPolicy \
  --override-existing-serviceaccounts \
  --approve \
  --region $REGION

# 5. Add Helm Repo

echo "Adding Helm repository..."

helm repo add eks https://aws.github.io/eks-charts

helm repo update

# 6. Install ALB Controller

echo "Installing AWS Load Balancer Controller..."

helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=$CLUSTER_NAME \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=$REGION \
  --set vpcId=$VPC_ID

# 7. Verify Deployment

echo ""
echo "Verifying deployment..."
echo ""

kubectl get deployment -n kube-system aws-load-balancer-controller

echo ""
echo "==============================================="
echo "AWS Load Balancer Controller Installed"
echo "==============================================="
echo ""

#Run the following to install ALB
#chmod +x install-alb-controller.sh
#./install-alb-controller.sh