#!/bin/bash
# Quick script to switch between OpenAI Realtime models

MODEL=$1

if [ -z "$MODEL" ]; then
    echo "🤖 Current OpenAI Realtime Model Configuration"
    echo "=============================================="
    echo ""
    if [ -f .env ]; then
        CURRENT_MODEL=$(grep "OPENAI_REALTIME_MODEL=" .env | cut -d'=' -f2)
        if [ -z "$CURRENT_MODEL" ]; then
            echo "📝 No model configured, using default: gpt-4o-mini-realtime-preview"
        else
            echo "📝 Current model: $CURRENT_MODEL"
        fi
    else
        echo "⚠️  No .env file found, using default: gpt-4o-mini-realtime-preview"
    fi
    echo ""
    echo "Usage: ./switch_model.sh [model-name]"
    echo ""
    echo "Available models:"
    echo "  1. gpt-4o-mini-realtime-preview  (default, stable)"
    echo "  2. gpt-realtime-mini             (new model for exploration)"
    echo "  3. gpt-4o-realtime-preview       (full GPT-4o realtime)"
    echo ""
    echo "Example: ./switch_model.sh gpt-realtime-mini"
    exit 0
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from env_example.txt..."
    cp env_example.txt .env
fi

# Check if model line exists
if grep -q "OPENAI_REALTIME_MODEL=" .env; then
    # Update existing line
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/OPENAI_REALTIME_MODEL=.*/OPENAI_REALTIME_MODEL=$MODEL/" .env
    else
        # Linux
        sed -i "s/OPENAI_REALTIME_MODEL=.*/OPENAI_REALTIME_MODEL=$MODEL/" .env
    fi
    echo "✅ Updated model to: $MODEL"
else
    # Add new line
    echo "OPENAI_REALTIME_MODEL=$MODEL" >> .env
    echo "✅ Added model configuration: $MODEL"
fi

echo ""
echo "🔄 To apply changes, restart your backend:"
echo "   lsof -ti:8000 | xargs kill -9"
echo "   python3 main_openai_realtime.py"
