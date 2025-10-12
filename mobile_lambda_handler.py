"""
Lambda Handler for Mobile API
Wraps FastAPI mobile_api_service for AWS Lambda deployment
"""

from mangum import Mangum
from mobile_api_service import app

# Mangum wraps FastAPI for AWS Lambda compatibility
handler = Mangum(app, lifespan="off")

def lambda_handler(event, context):
    """
    AWS Lambda entry point
    Routes all API Gateway requests to FastAPI
    """
    return handler(event, context)

