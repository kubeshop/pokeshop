# Pokeshop - Serverless Implementation

This is a Serverless demo API instrumented with opentelemetry to generate traces.

It uses AWS and the Serverless Framework to generate the required infrastructure to provision, instrument and run the services.
If you want to learn more around the why's and how's about this version you can visit the blog post.

## Requirements

The Serverless Pokemon API has some requirements to be deployed to your cloud:

1. Node v14.17.X
2. A valid AWS account
3. AWS role admin to create the required infrastructure
4. Import EC2 keypair named `pokeshop-api`

And use the following pub key:

```text
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmqENc03Z61inNwB7b+/W
Hffm0qo+eHLlGeFyDTWsDWm7OdB8QgZagbE0RHcBdM0/IBEHyTfCSKqzlnXKuEYX
e7lN7+kVFJrLmUVzrjjeMPkLA5a2OzidkUQ+h4MS25JhQ7+dNaG6/ILKpN0hn1s5
tAFJr/zmVsk6MEu5lhIBnEwinzpdZqPFM4xQ+qlIZbRAhlQH1zVGVcGoOeKYFzpR
Z17fAuCfxFTSItCfvL7Uv2mmcFfHQbudRW/zA7Og8xIp6ua0zjw2xYl3VQqeK+E6
snJgfCRuMeLgAsNr9RFkk/JQOCImqvQ6gknJec6eGtr3XzpzRV7fqIU65Gv9I/mY
LwIDAQAB
```

## Deployment

To deploy the service you can simply run the following npm command from the serverless root folder

```bash
npm run deploy
```
