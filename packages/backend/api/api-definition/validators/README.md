# API Gateway Request Validators

This directory contains request and response validators for API Gateway.

## Usage

Validators can be referenced in the OpenAPI specification to validate:
- Request body schemas
- Query parameters
- Path parameters
- Response schemas

## Example Validator

```yaml
# In openapi.yaml
requestValidation:
  $ref: './validators/auth-request-validator.json'
```

Validators help ensure data quality and reduce Lambda function complexity by catching invalid requests at the API Gateway level.
