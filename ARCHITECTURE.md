# Metamatic - Monorepo Architecture

## Project Structure

```
metamatic/
├── .gitignore
├── .vscode/
├── README.md
├── ARCHITECTURE.md
├── docker-compose.yml              # For local development
├── packages/
│   ├── backend/
│   │   ├── pyproject.toml          # Root Python workspace config
│   │   ├── uv.lock                 # UV lockfile for shared dependencies
│   │   ├── .venv/                  # Single virtual environment for backend
│   │   ├── shared/                 # Shared Python utilities
│   │   │   ├── pyproject.toml
│   │   │   └── src/
│   │   │       └── shared/
│   │   │           ├── __init__.py
│   │   │           ├── config.py
│   │   │           ├── utils.py
│   │   │           └── types.py
│   │   ├── agents/                 # AI agent services
│   │   │   ├── shared/             # Agent-specific shared utilities
│   │   │   │   ├── pyproject.toml
│   │   │   │   └── src/
│   │   │   └── metamatic/          # Metamatic customer support agent
│   │   │       ├── pyproject.toml
│   │   │       ├── Dockerfile
│   │   │       └── src/
│   │   │           └── agent.py
│   │   └── api/                    # API Gateway and Lambda functions
│   │       ├── pyproject.toml
│   │       ├── template.yaml       # AWS SAM template
│   │       ├── samconfig.toml      # SAM configuration
│   │       ├── api-definition/     # OpenAPI specification
│   │       │   ├── openapi.yaml
│   │       │   └── validators/
│   │       ├── lambdas/
│   │       │   ├── auth/           # Python Lambda
│   │       │   │   ├── pyproject.toml
│   │       │   │   └── handler.py
│   │       │   ├── users/          # TypeScript Lambda
│   │       │   │   ├── package.json
│   │       │   │   └── handler.ts
│   │       │   └── orders/         # Python Lambda
│   │       │       ├── pyproject.toml
│   │       │       └── handler.py
│   │       ├── layers/             # Shared Lambda layers
│   │       ├── tests/              # API tests
│   │       │   ├── unit/
│   │       │   └── integration/
│   │       └── shared/
│   │           └── src/
│   │               └── api_shared/
│   └── frontend/
│       ├── package.json
│       ├── next.config.ts
│       └── src/
└── tools/
    ├── scripts/
    │   ├── build.sh
    │   ├── deploy.sh
    │   ├── test.sh
    │   └── migrate.sh
    └── docker/
        └── python/
            └── Dockerfile.base
```

## Key Architectural Decisions

### 1. Python Virtual Environment Strategy

**Single Virtual Environment Approach**: Use one `.venv` at `packages/backend/.venv` for all Python services.

**Benefits**:
- Simplified dependency management
- Faster development setup
- Easier sharing of common dependencies
- Consistent Python version across services
- Reduced disk space usage

**Trade-offs**:
- All Python services share the same dependency versions
- Potential for dependency conflicts (mitigated by good dependency management)

### 2. UV Workspace Configuration

Use UV's workspace feature with a root `pyproject.toml` at `packages/backend/` to manage all Python projects as a workspace.

### 3. Hybrid Package Structure (Option 3)

- **Domain Grouping**: Related services grouped together (`agents/`, `api_services/`)
- **Shared Packages**: General utilities (`shared/`) and domain-specific utilities (`agents/shared/`, `api_services/shared/`)
- **Independent Services**: Each agent and service can be deployed independently
- **Team Boundaries**: Clear ownership boundaries align with directory structure

### 4. Agent Architecture

- **Independent Agents**: Each agent in `agents/` is a separate deployable service
- **Shared Agent Utilities**: Common agent patterns in `agents/shared/`
- **Docker Deployment**: Each agent has its own Dockerfile for AWS Bedrock AgentCore

### 5. API Services Structure

- **AWS SAM Architecture**: Infrastructure-as-code with SAM templates
- **OpenAPI-First Design**: API specification drives development and documentation
- **Lambda Functions**: Individual functions with minimal dependencies
- **Mixed Languages**: Support for Python and TypeScript Lambda functions
- **API Gateway Integration**: Automatic request validation and CORS configuration
- **Local Development**: Full API testing with `sam local start-api`
- **Multi-Environment**: Support for dev/staging/prod deployments

### 6. Deployment Considerations

- **Agent Services**: Docker containers for AWS Bedrock AgentCore
- **API Services**: SAM-managed Lambda functions with API Gateway
- **Infrastructure**: SAM templates define all AWS resources
- **Multi-Environment**: Separate stacks for dev/staging/prod
- **Shared Code**: Published as internal packages or included via workspace dependencies

## Development Workflow

1. **Setup**: Run `uv sync` from `packages/backend/` to install all dependencies
2. **Development**: All Python services use the shared virtual environment
3. **Testing**: Run tests for all services from the backend root
4. **Building**: Individual services can be packaged for deployment
5. **Deployment**: Services deployed independently with their specific requirements

## Agent Development Workflow

1. **New Agent**: Create new directory under `agents/` (e.g., `agents/analytics/`)
2. **Agent Code**: Place agent logic in `src/` directory
3. **Dependencies**: Define in agent-specific `pyproject.toml`
4. **Docker**: Create Dockerfile for AWS Bedrock deployment
5. **Shared Code**: Use `agents/shared/` for common agent patterns

## API Services Development Workflow

1. **API Design**: Define endpoints in `api/api-definition/openapi.yaml`
2. **Local Development**: Use `sam local start-api` for testing
3. **Lambda Implementation**: Create handler functions in `api/lambdas/`
4. **Testing**: Unit tests for Lambda functions, integration tests for API
5. **Deployment**: Use SAM CLI with environment-specific configurations

### SAM Commands

```bash
# Build the application
sam build

# Start API locally
sam local start-api --port 3000

# Test specific Lambda function
sam local invoke AuthFunction --event events/auth-event.json

# Deploy to environment
sam deploy --config-env dev
```

## Dependency Management Rules

1. **Shared dependencies** go in the root `packages/backend/pyproject.toml`
2. **Service-specific dependencies** go in individual service `pyproject.toml` files
3. **Lambda-specific dependencies** are minimal and isolated per function
4. **Version pinning** is done at the workspace level for consistency
