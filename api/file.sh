#!/bin/bash

# Install Misc
sudo yum install -y jq yum-utils git

# Install Terraform
sudo yum-config-manager -y --add-repo https://rpm.releases.hashicorp.com/AmazonLinux/hashicorp.repo
sudo yum -y install terraform
sudo touch ~/.bashrc
sudo terraform -install-autocomplete

# Install Docker
sudo amazon-linux-extras install docker
sudo service docker start
sudo usermod -a -G docker ec2-user
sudo chkconfig docker on
sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo systemctl enable docker
sudo docker system prune --all --force


# Get OpenSearch URL
TAG_NAME="OpenSearch"
INSTANCE_ID=$(ec2-metadata --instance-id  | cut -d' ' -f2)
REGION=$(ec2-metadata --availability-zone | sed 's/.$//' | cut -d' ' -f2)
RESPONSE=$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --region "$REGION")
OPEN_SEARCH_URL=$(echo "$RESPONSE" | jq '.Reservations[].Instances[].Tags' | jq ".[] | select(.Key == \"$TAG_NAME\").Value" | sed -r 's/^"|"$//g')
echo "$OPEN_SEARCH_URL"

# Build Tracetest
sudo git clone https://github.com/kubeshop/tracetest.git /tmp/tracetest
sudo git -C /tmp/tracetest checkout --track origin/serverless-example

sudo sed -i "s/opensearch:9200/$OPEN_SEARCH_URL/" /tmp/tracetest/examples/tracetest-opensearch-aws/opensearch/opensearch-analytics.yaml
sudo sed -i "s/http/https/" /tmp/tracetest/examples/tracetest-opensearch-aws/opensearch/opensearch-analytics.yaml

sudo sed -i "s/opensearch:9200/$OPEN_SEARCH_URL/" /tmp/tracetest/examples/tracetest-opensearch-aws/tracetest-config.yaml
sudo sed -i "s/http/https/" /tmp/tracetest/examples/tracetest-opensearch-aws/tracetest-config.yaml

sudo /usr/local/bin/docker-compose -f /tmp/tracetest/examples/tracetest-opensearch-aws/docker-compose.yml build
sudo /usr/local/bin/docker-compose -f /tmp/tracetest/examples/tracetest-opensearch-aws/docker-compose.yml up -d