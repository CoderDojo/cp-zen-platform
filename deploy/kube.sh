#!/usr/bin/env bash

set -e

if [ "$CIRCLE_BRANCH" = "master" ]; then
  DEP_VER=latest
  HOST=$PROD_HOST
  CA_CERT=$PROD_CA_CERT
  ADMIN_CERT=$PROD_ADMIN_CERT
  ADMIN_KEY=$PROD_ADMIN_CERT
elif [ "$CIRCLE_BRANCH" = "staging" ]; then
  DEP_VER=staging
  HOST=$STAGING_HOST
  CA_CERT=$STAGING_CA_CERT
  ADMIN_CERT=$STAGING_ADMIN_CERT
  ADMIN_KEY=$STAGING_ADMIN_CERT
else
  exit 0
fi
sudo apt-get update
sudo apt-get install --only-upgrade docker -y
docker build --rm=false --build-arg DEP_VERSION=$DEP_VER -t coderdojo/cp-zen-platform:"$CIRCLE_SHA1" .
docker login -u "$DOCKER_USER" -p "$DOCKER_PASS"
docker push coderdojo/cp-zen-platform:"$CIRCLE_SHA1"
sudo chown -R ubuntu:ubuntu /home/ubuntu/.kube
kubectl config set-cluster default-cluster --server=https://"${HOST}" --certificate-authority="${CA_CERT}"
kubectl config set-credentials default-admin --certificate-authority="${CA_CERT}" --client-key="${ADMIN_KEY}" --client-certificate="${ADMIN_CERT}"
kubectl config set-context default-system --cluster=default-cluster --user=default-admin
kubectl config use-context default-system
kubectl patch deployment zen -p '{"spec":{"template":{"spec":{"containers":[{"name":"zen","image":"coderdojo/cp-zen-platform:'"$CIRCLE_BUILD_SHA1"'"}]}}}}'
