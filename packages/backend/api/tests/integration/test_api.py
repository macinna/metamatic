"""
Integration tests for the API Gateway + Lambda integration.

Run with: pytest tests/integration/
"""

import pytest


@pytest.fixture
def api_base_url():
    """Base URL for the API Gateway (when running locally with SAM)."""
    return "http://localhost:3000"  # SAM local default port


def test_api_health_check(api_base_url):
    """Test that the API Gateway is responding."""
    # TODO: Add a health check endpoint and test it
    pass


def test_auth_endpoint_integration(api_base_url):
    """Test the auth endpoint with real API Gateway."""
    # TODO: Implement integration test
    pass


# Example integration test:
# def test_auth_endpoint_integration(api_base_url):
#     auth_data = {
#         "username": "test@example.com",
#         "password": "password123"
#     }
#
#     response = requests.post(f"{api_base_url}/auth", json=auth_data)
#
#     assert response.status_code == 200
#     data = response.json()
#     assert data["success"] is True
#     assert "token" in data["data"]
