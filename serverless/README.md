# Pokeshop - Serverless Implementation
This is a Serverless demo API instrumented with opentelemetry to generate traces.

It uses AWS and the Serverless Framework to generate the required infrastructure to provision, instrument and run the services.
If you want to learn more around the why's and how's about this version you can visit the blog post.

## Requirements

The Serverless Pokemon API has some requirements to be deployed to your cloud:
1. Node v14.17.X
2. A valid AWS account
3. AWS role admin to create the required infrastructure

## Deployment

To deploy the service you can simply run the following npm command from the serverless root folder

```bash
npm run deploy
```
