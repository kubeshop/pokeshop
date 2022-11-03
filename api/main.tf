terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2"
}

provider "aws" {
  region = "us-east-2"
}
resource "aws_security_group" "main" {
  egress = [
    {
      cidr_blocks      = ["0.0.0.0/0",]
      description      = ""
      from_port        = 0
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "-1"
      security_groups  = []
      self             = false
      to_port          = 0
    }
  ]
  ingress = [
    {
      cidr_blocks      = ["0.0.0.0/0",]
      description      = ""
      from_port        = 22
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "tcp"
      security_groups  = []
      self             = false
      to_port          = 60000
    }
  ]
}

resource "aws_iam_policy" "policy" {
  name        = "test_policy"
  path        = "/"
  description = "My test policy"
  policy      = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Action = [
          "ec2:Describe*",
        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_role" "aws_ec2_iam_role" {
  name               = "aws_ec2_iam_role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        "Action" : "sts:AssumeRole",
        "Principal" : {
          "Service" : "ec2.amazonaws.com"
        },
        "Effect" : "Allow",
        "Sid" : ""
      }
    ]
  })
}
resource "aws_iam_policy_attachment" "test-attach" {
  name       = "test-attachment"
  roles      = [aws_iam_role.aws_ec2_iam_role.name]
  policy_arn = aws_iam_policy.policy.arn
}

resource "aws_iam_instance_profile" "test_profile" {
  name = "test_profile"
  role = aws_iam_role.aws_ec2_iam_role.name
}


variable "domain" {
  default = "serverless-open-search"
}

data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

resource "aws_opensearch_domain" "open_search" {
  domain_name    = var.domain
  engine_version = "Elasticsearch_7.10"

  ebs_options {
    ebs_enabled = true
    volume_size = 10
  }

  cluster_config {
    instance_type = "m4.large.search"

  }

  tags = {
    Domain = "TestDomain"
  }

  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }

  advanced_security_options {
    enabled                        = true
    internal_user_database_enabled = true
    master_user_options {
      master_user_name     = "example"
      master_user_password = "Example1#"
    }
  }

  encrypt_at_rest {
    enabled = true
  }


  node_to_node_encryption {
    enabled = true
  }


  access_policies = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": "es:*",
      "Resource": "arn:aws:es:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:domain/${var.domain}/*"
    }
  ]
}
POLICY
}


# Ec2
resource "aws_instance" "shared_infra" {
  ami                    = "ami-089a545a9ed9893b6"
  instance_type          = "t2.large"
  key_name               = "pokemon-infra"
  vpc_security_group_ids = [aws_security_group.main.id]
  user_data              = file("./file.sh")
  iam_instance_profile   = aws_iam_instance_profile.test_profile.name
  tags                   = {
    Name       = "PokemonInfraStructure"
    OpenSearch = aws_opensearch_domain.open_search.endpoint
  }
  root_block_device {
    volume_size = 20
  }
  depends_on = [aws_opensearch_domain.open_search]
}
## parameters.tf
resource "aws_ssm_parameter" "endpoint" {
  name        = "/ec2/public_ip"
  description = "Ec2 instance public IP"
  type        = "String"
  value       = aws_instance.shared_infra.public_ip
}

data "archive_file" "my_function_archive" {
  type        = "zip"
  output_path = "${path.module}/my_function.zip"
  source_dir  = "${path.module}/my_function/dist"
}

# code from iam.tf
resource "aws_iam_role" "example_role" {
  name               = "LambdaRole"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Resource": "*",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_lambda_function" "my_function_lambda" {
  filename         = data.archive_file.my_function_archive.output_path
  function_name    = "get"
  handler          = ".webpack/handler.get"
  source_code_hash = data.archive_file.my_function_archive.output_base64sha256
  role             = aws_iam_role.example_role.arn
  runtime          = "nodejs14.x"
  environment {
    variables = {
      Hello : "kdfd"
    }
  }
}
