# Lambda Layers

This directory contains shared Lambda layers that can be used across multiple Lambda functions.

## Benefits of Lambda Layers

1. **Code Reuse**: Share common dependencies across multiple functions
2. **Deployment Size**: Reduce individual function package size
3. **Faster Deployment**: Layer changes deploy independently from function code
4. **Version Management**: Layer versioning for dependency management

## Structure

```
layers/
├── shared-deps/          # Common Python dependencies
│   ├── requirements.txt
│   └── python/          # Layer content (created during build)
└── shared-utils/        # Shared utility functions
    ├── requirements.txt
    └── python/
        └── shared/      # Importable as 'from shared import ...'
```

## Usage in SAM Template

```yaml
Resources:
  SharedDepsLayer:
    Type: AWS::Serverless::LayerVersion
    Properties:
      ContentUri: layers/shared-deps/
      CompatibleRuntimes:
        - python3.11
```

## Build Process

SAM automatically packages layer dependencies during `sam build`.
