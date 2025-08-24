# Metamatic API

RESTful API built with AWS SAM, API Gateway, and Lambda functions.

## Structure

```
api/
├── template.yaml         # AWS SAM template
├── samconfig.toml       # SAM configuration
├── api-definition/      # OpenAPI specification
│   └── openapi.yaml
├── lambdas/            # Lambda function handlers
│   ├── auth/
│   ├── users/
│   └── orders/
├── layers/             # Shared Lambda layers
├── tests/              # Unit and integration tests
└── pyproject.toml      # Python dependencies
```

## Development

### Prerequisites
- AWS SAM CLI
- Python 3.11+
- Node.js 18+ (for TypeScript Lambda functions)

### Local Development

```bash
# Install dependencies
uv sync

# Build SAM application
sam build

# Start API Gateway locally
sam local start-api --port 3000

# Test a specific Lambda function
sam local invoke AuthFunction --event events/auth-event.json
```

### API Documentation

The API is defined using OpenAPI 3.0 specification in `api-definition/openapi.yaml`.

View the documentation:
- **Local**: http://localhost:3000/docs (when running locally)
- **Swagger Editor**: Copy the OpenAPI spec to [editor.swagger.io](https://editor.swagger.io/)

### Testing

```bash
# Unit tests (individual Lambda functions)
uv run pytest tests/unit/ -v

# Integration tests (API Gateway + Lambda)
# First, start the local API: sam local start-api --port 3000
uv run pytest tests/integration/ -v
```

### Deployment

```bash
# Deploy to development
sam deploy --config-env dev

# Deploy to staging
sam deploy --config-env staging

# Deploy to production
sam deploy --config-env prod
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth` | User authentication |
| GET | `/users` | Get user information |
| GET | `/orders` | Get order information |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `STAGE` | Deployment stage | `dev` |
| `LOG_LEVEL` | Logging level | `INFO` |

## Lambda Functions

### Python Functions
- **auth**: User authentication and JWT token generation
- **orders**: Order management and retrieval

### TypeScript Functions
- **users**: User management operations

Each Lambda function is independently deployable and has minimal dependencies.

## Shared Resources

### Lambda Layers
- **shared-deps**: Common Python dependencies
- **shared-utils**: Shared utility functions

### API Gateway
- **Request validation**: Automatic validation against OpenAPI schema
- **CORS**: Configured for web application access
- **Authentication**: JWT-based authentication

## Configuration

The SAM configuration supports multiple environments:
- **dev**: Development environment
- **staging**: Staging environment with production-like settings
- **prod**: Production environment

Each environment can have different:
- Stack names
- Parameter values
- Resource configurations
