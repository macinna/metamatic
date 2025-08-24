"""Authentication Lambda handler."""

import json
from typing import Dict, Any

from shared.types import BaseResponse, ErrorResponse
from shared.utils import setup_logging, safe_json_dumps

# Setup logging
setup_logging()


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda handler for authentication requests.

    Args:
        event: Lambda event data
        context: Lambda context object

    Returns:
        API Gateway response
    """
    try:
        # Parse the request
        body = json.loads(event.get("body", "{}"))

        # TODO: Implement authentication logic
        # For now, we'll just acknowledge that we received the request
        username = body.get("username", "")
        if not username:
            username = "anonymous"

        response = BaseResponse(
            success=True,
            message="Authentication successful",
            data={"token": "mock-jwt-token"},
        )

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": safe_json_dumps(response.dict()),
        }

    except Exception as e:
        error_response = ErrorResponse(
            message="Authentication failed",
            error_code="AUTH_ERROR",
            error_details={"error": str(e)},
        )

        return {
            "statusCode": 400,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": safe_json_dumps(error_response.dict()),
        }
