#!/bin/bash
# Startup script for AstroVoice Backend (New Structure)

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set PYTHONPATH to include project root
export PYTHONPATH="${SCRIPT_DIR}:${PYTHONPATH}"

# Print startup banner
echo "🌟 Starting AstroVoice Backend Server"
echo "📁 Project Root: ${SCRIPT_DIR}"
echo "🐍 PYTHONPATH: ${PYTHONPATH}"
echo ""

# Check if .env file exists
if [ ! -f "${SCRIPT_DIR}/.env" ]; then
    echo "⚠️  WARNING: .env file not found!"
    echo "   Copy env_example.txt to .env and add your API keys"
    echo ""
fi

# Start the backend
cd "${SCRIPT_DIR}"
python3 -m backend.main "$@"

