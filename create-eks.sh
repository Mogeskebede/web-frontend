#!/bin/bash
eksctl create cluster \
  --name orders-platform-cluster \
  --region us-east-2 \
  --nodegroup-name workers \
  --node-type t3.xlarge \
  --nodes 2 \
  --managed
#run the below commands to create the stack
#chmod +x create-eks-cluster.sh
#./create-eks-cluster.sh  