#!/bin/bash

npm i
sls deploy

opensearch_endpoint=`aws cloudformation --region us-east-1 describe-stacks --stack-name pokeshop-api-demo-dev --query "Stacks[0].Outputs[?OutputKey=='OpenSearchDomainEndpoint'].OutputValue" --output text --no-paginate`
database_endpoint=`aws cloudformation --region us-east-1 describe-stacks --stack-name pokeshop-api-demo-dev --query "Stacks[0].Outputs[?OutputKey=='PokeDatabaseEndpoint'].OutputValue" --output text --no-paginate`
ecs_ip=`aws cloudformation --region us-east-1 describe-stacks --stack-name pokeshop-api-demo-dev --query "Stacks[0].Outputs[?OutputKey=='ECSContainerInstanceIP'].OutputValue" --output text --no-paginate`
cluster_name=`aws cloudformation --region us-east-1 describe-stacks --stack-name pokeshop-api-demo-dev --query "Stacks[0].Outputs[?OutputKey=='ECSClusterName'].OutputValue" --output text --no-paginate`
service_name=`aws cloudformation --region us-east-1 describe-stacks --stack-name pokeshop-api-demo-dev --query "Stacks[0].Outputs[?OutputKey=='TracetestServiceName'].OutputValue" --output text --no-paginate`

# replace values
sed -i '' -e 's|{{openSearchDomain}}|'${opensearch_endpoint}'|g' ./config/pipelines.yaml

# delete old config file
ssh -i "pokeshop-api.pem" ec2-user@${ecs_ip} "sudo rm -rf /var/lib/docker/volumes/config/_data/config/data-prepper-config.yaml"
ssh -i "pokeshop-api.pem" ec2-user@${ecs_ip} "sudo rm -rf /var/lib/docker/volumes/config/_data/pipelines/pipelines.yaml"

# create new config file
cat ./config/pipelines.yaml | ssh -i "pokeshop-api.pem" ec2-user@${ecs_ip} "sudo tee -a /var/lib/docker/volumes/config/_data/pipelines/pipelines.yaml"
cat ./config/data-prepper-config.yaml | ssh -i "pokeshop-api.pem" ec2-user@${ecs_ip} "sudo tee -a /var/lib/docker/volumes/config/_data/config/data-prepper-config.yaml"

# replace values
sed -i '' -e 's|{{openSearchDomain}}|'${opensearch_endpoint}'|g' ./config/tracetest-config.yaml
sed -i '' -e 's|{{databaseEndpoint}}|'${database_endpoint}'|g' ./config/tracetest-config.yaml

# delete old config file
ssh -i "pokeshop-api.pem" ec2-user@${ecs_ip} "sudo rm -rf /var/lib/docker/volumes/tracetest-config/_data/config.yaml"

# create new config file
cat ./config/tracetest-config.yaml | ssh -i "pokeshop-api.pem" ec2-user@${ecs_ip} "sudo tee -a /var/lib/docker/volumes/tracetest-config/_data/config.yaml"

ssh -i "pokeshop-api.pem" -N -f -L 5432:${database_endpoint}:5432 ec2-user@${ecs_ip}
npx prisma migrate dev
pkill -f "ssh -i "pokeshop-api.pem" -N -f -L 5432:${database_endpoint}:5432 ec2-user@${ecs_ip}"
sls info
