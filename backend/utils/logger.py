"""
Enhanced logging utilities for debugging voice processing
"""

import logging
import json
import os
from datetime import datetime
from typing import Dict, Any
from pathlib import Path

# Import settings for log directory
try:
    from backend.config.settings import LOGS_DIR
except ImportError:
    # Fallback if importing as standalone
    LOGS_DIR = Path(__file__).resolve().parent.parent.parent / "logs"
    LOGS_DIR.mkdir(exist_ok=True)

class VoiceLogger:
    def __init__(self, log_dir=None):
        self.log_dir = log_dir or str(LOGS_DIR)
        os.makedirs(self.log_dir, exist_ok=True)

        # Set up file logging
        self.setup_file_logging()

        # Create logger instance
        self.logger = logging.getLogger(__name__)

    def setup_file_logging(self):
        """Set up detailed file logging"""
        # Create timestamp for log file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Configure file handler
        log_file = os.path.join(self.log_dir, f"voice_agent_{timestamp}.log")
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.DEBUG)

        # Create detailed formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
        )
        file_handler.setFormatter(formatter)

        # Configure root logger
        root_logger = logging.getLogger()
        root_logger.addHandler(file_handler)
        root_logger.setLevel(logging.DEBUG)

        print(f"📝 File logging enabled: {log_file}")

    def log_audio_processing(self, user_id: str, step: str, data: Dict[str, Any]):
        """Log audio processing steps"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id,
            "step": step,
            "data": data
        }

        # Log to file
        self.logger.info(f"AUDIO_PROCESSING: {json.dumps(log_entry)}")

        # Also save as JSON for easy reading
        json_file = os.path.join(self.log_dir, f"audio_processing_{user_id}.json")

        # Read existing logs
        logs = []
        if os.path.exists(json_file):
            try:
                with open(json_file, 'r') as f:
                    logs = json.load(f)
            except:
                logs = []

        # Add new log
        logs.append(log_entry)

        # Keep only last 50 logs
        logs = logs[-50:]

        # Write back
        with open(json_file, 'w') as f:
            json.dump(logs, f, indent=2)

    def log_grok_interaction(self, user_id: str, request: str, response: str, credits_used: bool = True):
        """Log Grok API interactions"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id,
            "request": request,
            "response": response,
            "credits_used": credits_used
        }

        self.logger.info(f"GROK_INTERACTION: {json.dumps(log_entry)}")

        # Save Grok interactions separately
        grok_file = os.path.join(self.log_dir, f"grok_interactions_{user_id}.json")

        logs = []
        if os.path.exists(grok_file):
            try:
                with open(grok_file, 'r') as f:
                    logs = json.load(f)
            except:
                logs = []

        logs.append(log_entry)
        logs = logs[-20:]  # Keep last 20 interactions

        with open(grok_file, 'w') as f:
            json.dump(logs, f, indent=2)

    def log_websocket_message(self, user_id: str, direction: str, message_type: str, data: Dict[str, Any]):
        """Log WebSocket messages"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id,
            "direction": direction,  # "incoming" or "outgoing"
            "message_type": message_type,
            "data_summary": self._summarize_data(data)
        }

        self.logger.info(f"WEBSOCKET_{direction.upper()}: {json.dumps(log_entry)}")

    def _summarize_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a summary of data to avoid huge logs"""
        summary = {}
        for key, value in data.items():
            if isinstance(value, str) and len(value) > 100:
                summary[key] = f"{value[:100]}... (truncated, length: {len(value)})"
            else:
                summary[key] = value
        return summary

# Global logger instance
voice_logger = VoiceLogger()

