#!/bin/bash
# Quick script to switch between OpenAI models (both Realtime and Chat)

MODE=$1
MODEL=$2

# Function to show current configuration
show_config() {
    echo "🤖 Current OpenAI Model Configuration"
    echo "========================================"
    echo ""
    
    if [ -f .env ]; then
        REALTIME_MODEL=$(grep "OPENAI_REALTIME_MODEL=" .env | cut -d'=' -f2)
        CHAT_MODEL=$(grep "OPENAI_CHAT_MODEL=" .env | cut -d'=' -f2)
        
        echo "🎤 Realtime (Voice): ${REALTIME_MODEL:-gpt-4o-mini-realtime-preview (default)}"
        echo "💬 Chat (Text):      ${CHAT_MODEL:-gpt-4o-mini (default)}"
    else
        echo "⚠️  No .env file found"
        echo "🎤 Realtime (Voice): gpt-4o-mini-realtime-preview (default)"
        echo "💬 Chat (Text):      gpt-4o-mini (default)"
    fi
    echo ""
}

# Function to show usage
show_usage() {
    echo "Usage: ./switch_model.sh [mode] [model-name]"
    echo ""
    echo "Modes:"
    echo "  realtime  - Switch realtime/voice model"
    echo "  chat      - Switch text chat model"
    echo "  both      - View current configuration"
    echo ""
    echo "Available Realtime Models (for voice):"
    echo "  • gpt-4o-mini-realtime-preview  (default, stable)"
    echo "  • gpt-realtime-mini             (new, exploring)"
    echo "  • gpt-4o-realtime-preview       (premium, highest quality)"
    echo ""
    echo "Available Chat Models (for text):"
    echo "  • gpt-4o-mini        (default, cost-effective)"
    echo "  • gpt-4o             (premium, highest quality)"
    echo "  • gpt-3.5-turbo      (legacy, cheapest)"
    echo ""
    echo "Examples:"
    echo "  ./switch_model.sh                              # Show current config"
    echo "  ./switch_model.sh realtime gpt-realtime-mini   # Switch voice model"
    echo "  ./switch_model.sh chat gpt-4o                  # Switch chat model"
}

# If no arguments, show current configuration
if [ -z "$MODE" ]; then
    show_config
    echo ""
    show_usage
    exit 0
fi

# If only one argument and it's 'both', show config
if [ "$MODE" = "both" ] && [ -z "$MODEL" ]; then
    show_config
    exit 0
fi

# Validate mode
if [ "$MODE" != "realtime" ] && [ "$MODE" != "chat" ]; then
    echo "❌ Invalid mode: $MODE"
    echo "   Must be 'realtime' or 'chat'"
    echo ""
    show_usage
    exit 1
fi

# Validate model is provided
if [ -z "$MODEL" ]; then
    echo "❌ Model name required"
    echo ""
    show_usage
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from env_example.txt..."
    cp env_example.txt .env
fi

# Update the appropriate model
if [ "$MODE" = "realtime" ]; then
    ENV_VAR="OPENAI_REALTIME_MODEL"
    EMOJI="🎤"
    MODE_NAME="Realtime (Voice)"
else
    ENV_VAR="OPENAI_CHAT_MODEL"
    EMOJI="💬"
    MODE_NAME="Chat (Text)"
fi

# Check if model line exists
if grep -q "$ENV_VAR=" .env; then
    # Update existing line
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/$ENV_VAR=.*/$ENV_VAR=$MODEL/" .env
    else
        # Linux
        sed -i "s/$ENV_VAR=.*/$ENV_VAR=$MODEL/" .env
    fi
    echo "✅ Updated $MODE_NAME model to: $MODEL"
else
    # Add new line
    echo "$ENV_VAR=$MODEL" >> .env
    echo "✅ Added $MODE_NAME model: $MODEL"
fi

echo ""
echo "🔄 To apply changes, restart your backend:"
echo "   lsof -ti:8000 | xargs kill -9"
echo "   python3 main_openai_realtime.py"
echo ""
echo "Current configuration:"
show_config
