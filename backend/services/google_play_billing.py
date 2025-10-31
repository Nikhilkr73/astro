"""
Google Play In-App Purchase Verification Service

This service handles server-side verification of Google Play purchases
using the Google Play Developer API v3.

Usage:
    from backend.services.google_play_billing import GooglePlayBillingService
    
    billing_service = GooglePlayBillingService()
    verification = await billing_service.verify_purchase(product_id, purchase_token)
    if verification['valid']:
        # Process purchase
        await billing_service.acknowledge_purchase(product_id, purchase_token)
"""

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from typing import Dict, Optional
import os
import json

class GooglePlayBillingService:
    """
    Service class for Google Play In-App Billing verification.
    
    Handles:
    - Purchase verification with Google Play API
    - Purchase acknowledgment to prevent automatic refunds
    - Validation of purchase state and acknowledgment status
    """
    
    def __init__(self):
        """
        Initialize the Google Play Billing service.
        
        Requires environment variables:
        - GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: Path to service account JSON file
        - GOOGLE_PLAY_PACKAGE_NAME: Android app package name
        """
        self.package_name = os.getenv('GOOGLE_PLAY_PACKAGE_NAME', 'com.astrovoice.kundli')
        credentials_path = os.getenv('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON')
        
        if not credentials_path or not os.path.exists(credentials_path):
            print(f"⚠️ Google Play credentials not found at: {credentials_path}")
            print(f"   Google Play billing verification will be disabled")
            self.service = None
            return
        
        try:
            # Load service account credentials
            credentials = service_account.Credentials.from_service_account_file(
                credentials_path,
                scopes=['https://www.googleapis.com/auth/androidpublisher']
            )
            
            # Build the androidpublisher service
            self.service = build('androidpublisher', 'v3', credentials=credentials)
            print(f"✅ Google Play Billing service initialized for package: {self.package_name}")
            
        except Exception as e:
            print(f"❌ Failed to initialize Google Play Billing service: {e}")
            self.service = None
    
    async def verify_purchase(self, product_id: str, purchase_token: str) -> Dict:
        """
        Verify a purchase with Google Play API.
        
        Args:
            product_id: The product ID (SKU) purchased
            purchase_token: The unique token from Google Play purchase
            
        Returns:
            Dict with verification results:
            {
                'valid': bool,
                'order_id': str (if valid),
                'purchase_time': int (timestamp in milliseconds),
                'acknowledged': bool,
                'error': str (if invalid)
            }
        """
        if not self.service:
            return {
                'valid': False,
                'error': 'Google Play Billing service not initialized'
            }
        
        try:
            # Call Google Play API to get purchase details
            result = self.service.purchases().products().get(
                packageName=self.package_name,
                productId=product_id,
                token=purchase_token
            ).execute()
            
            print(f"📦 Google Play purchase verification response:")
            print(f"   Product: {product_id}")
            print(f"   Purchase State: {result.get('purchaseState')}")
            print(f"   Consumption State: {result.get('consumptionState')}")
            print(f"   Acknowledgement State: {result.get('acknowledgementState')}")
            
            # Purchase states:
            # 0 = Purchased
            # 1 = Canceled
            # 2 = Pending
            purchase_state = result.get('purchaseState', -1)
            
            if purchase_state == 0:  # Purchased
                return {
                    'valid': True,
                    'order_id': result.get('orderId'),
                    'purchase_time': result.get('purchaseTimeMillis'),
                    'purchase_time_str': result.get('purchaseTimeMillis', ''),
                    'acknowledged': result.get('acknowledgementState') == 1,
                    'consumption_state': result.get('consumptionState'),
                    'purchase_state': purchase_state
                }
            elif purchase_state == 1:
                return {
                    'valid': False,
                    'reason': 'Purchase was canceled or refunded',
                    'purchase_state': purchase_state
                }
            elif purchase_state == 2:
                return {
                    'valid': False,
                    'reason': 'Purchase is pending',
                    'purchase_state': purchase_state
                }
            else:
                return {
                    'valid': False,
                    'reason': f'Unknown purchase state: {purchase_state}',
                    'purchase_state': purchase_state
                }
            
        except HttpError as e:
            error_content = json.loads(e.content.decode('utf-8'))
            error_message = error_content.get('error', {}).get('message', str(e))
            
            print(f"❌ Google Play API error: {error_message}")
            print(f"   Status: {e.resp.status}")
            print(f"   Product ID: {product_id}")
            
            return {
                'valid': False,
                'error': f'Google Play API error: {error_message}',
                'status_code': e.resp.status
            }
            
        except Exception as e:
            print(f"❌ Purchase verification failed: {e}")
            return {
                'valid': False,
                'error': str(e)
            }
    
    async def acknowledge_purchase(self, product_id: str, purchase_token: str) -> bool:
        """
        Acknowledge a purchase to prevent automatic refund.
        
        Google Play requires purchases to be acknowledged within 3 days,
        otherwise they are automatically refunded.
        
        Args:
            product_id: The product ID (SKU) purchased
            purchase_token: The unique token from Google Play purchase
            
        Returns:
            bool: True if acknowledged successfully, False otherwise
        """
        if not self.service:
            print(f"⚠️ Cannot acknowledge purchase: Google Play service not initialized")
            return False
        
        try:
            self.service.purchases().products().acknowledge(
                packageName=self.package_name,
                productId=product_id,
                token=purchase_token
            ).execute()
            
            print(f"✅ Purchase acknowledged successfully")
            print(f"   Product: {product_id}")
            return True
            
        except HttpError as e:
            # If already acknowledged, this will fail but that's okay
            error_content = json.loads(e.content.decode('utf-8'))
            error_message = error_content.get('error', {}).get('message', '')
            
            if 'already acknowledged' in error_message.lower():
                print(f"ℹ️ Purchase already acknowledged (this is okay)")
                return True
            
            print(f"❌ Failed to acknowledge purchase: {error_message}")
            return False
            
        except Exception as e:
            print(f"❌ Failed to acknowledge purchase: {e}")
            return False
    
    def is_available(self) -> bool:
        """
        Check if the Google Play Billing service is available.
        
        Returns:
            bool: True if service is initialized and ready to use
        """
        return self.service is not None


# Singleton instance
_billing_service_instance = None

def get_billing_service() -> GooglePlayBillingService:
    """
    Get or create the singleton GooglePlayBillingService instance.
    
    Returns:
        GooglePlayBillingService: The billing service instance
    """
    global _billing_service_instance
    if _billing_service_instance is None:
        _billing_service_instance = GooglePlayBillingService()
    return _billing_service_instance


