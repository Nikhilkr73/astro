#!/bin/bash

# 🤖 Chat Model Switcher for AstroVoice
# Switch between different OpenAI Chat models easily

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Available models
MODELS=(
    "gpt-4o-mini"
    "gpt-4o"
    "gpt-4.1-mini"
    "gpt-5"
    "gpt-4-turbo"
)

# Model descriptions
declare -A MODEL_DESC
MODEL_DESC["gpt-4o-mini"]="⚡ Cost-effective, good balance (DEFAULT)"
MODEL_DESC["gpt-4o"]="💎 Premium - best emotional intelligence & Hinglish"
MODEL_DESC["gpt-4.1-mini"]="⚡ Faster, slightly better than 4o-mini"
MODEL_DESC["gpt-5"]="🚀 Next-gen (when available) - maximum realism"
MODEL_DESC["gpt-4-turbo"]="🏎️  Fast and powerful"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🤖 Chat Model Configuration Tool      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create .env file from env_example.txt"
    exit 1
fi

# Function to get current model
get_current_model() {
    if grep -q "OPENAI_CHAT_MODEL=" .env; then
        grep "OPENAI_CHAT_MODEL=" .env | cut -d'=' -f2
    else
        echo "gpt-4o-mini"
    fi
}

# Function to show current configuration
show_current() {
    current=$(get_current_model)
    echo -e "${GREEN}Current Chat Model:${NC} ${YELLOW}$current${NC}"
    if [ -n "${MODEL_DESC[$current]}" ]; then
        echo -e "Description: ${MODEL_DESC[$current]}"
    fi
    echo ""
}

# If no argument, show current and exit
if [ $# -eq 0 ]; then
    show_current
    echo -e "${BLUE}Available models:${NC}"
    echo ""
    for model in "${MODELS[@]}"; do
        current=$(get_current_model)
        if [ "$model" == "$current" ]; then
            echo -e "  ${GREEN}▶${NC} $model - ${MODEL_DESC[$model]}"
        else
        echo -e "    $model - ${MODEL_DESC[$model]}"
        fi
    done
    echo ""
    echo -e "${YELLOW}Usage:${NC} ./switch_chat_model.sh [model-name]"
    echo -e "${YELLOW}Example:${NC} ./switch_chat_model.sh gpt-4o"
    echo ""
    exit 0
fi

# Get requested model
NEW_MODEL=$1

# Validate model
valid=false
for model in "${MODELS[@]}"; do
    if [ "$model" == "$NEW_MODEL" ]; then
        valid=true
        break
    fi
done

if [ "$valid" = false ]; then
    echo -e "${RED}❌ Invalid model: $NEW_MODEL${NC}"
    echo ""
    echo "Available models:"
    for model in "${MODELS[@]}"; do
        echo "  - $model"
    done
    exit 1
fi

# Show what we're doing
echo -e "${BLUE}Switching chat model to:${NC} ${GREEN}$NEW_MODEL${NC}"
echo -e "Description: ${MODEL_DESC[$NEW_MODEL]}"
echo ""

# Remove existing OPENAI_CHAT_MODEL line if present
grep -v "OPENAI_CHAT_MODEL=" .env > .env.tmp || true
mv .env.tmp .env

# Add new model configuration
echo "OPENAI_CHAT_MODEL=$NEW_MODEL" >> .env

echo -e "${GREEN}✅ Model configuration updated!${NC}"
echo ""

# Show cost implications
echo -e "${YELLOW}💰 Cost Implications:${NC}"
case $NEW_MODEL in
    "gpt-4o-mini")
        echo "  • Input:  ~\$0.15 per 1M tokens"
        echo "  • Output: ~\$0.60 per 1M tokens"
        echo "  • Best for: Production at scale"
        ;;
    "gpt-4o")
        echo "  • Input:  ~\$2.50 per 1M tokens"
        echo "  • Output: ~\$10.00 per 1M tokens"
        echo "  • Best for: Quality over cost"
        ;;
    "gpt-4.1-mini")
        echo "  • Similar to gpt-4o-mini"
        echo "  • Best for: Slightly better quality"
        ;;
    "gpt-5")
        echo "  • Pricing TBD (when available)"
        echo "  • Best for: Maximum realism"
        ;;
    "gpt-4-turbo")
        echo "  • Input:  ~\$10.00 per 1M tokens"
        echo "  • Output: ~\$30.00 per 1M tokens"
        echo "  • Best for: Complex reasoning"
        ;;
esac
echo ""

# Restart instructions
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1. Restart your chat backend:"
echo -e "   ${BLUE}lsof -ti:8000 | xargs kill -9${NC}"
echo -e "   ${BLUE}python3 main_openai_realtime.py${NC}"
echo ""
echo "2. Or restart specific handler:"
echo -e "   ${BLUE}python3 openai_chat_handler.py${NC}"
echo ""
echo "3. Verify the model in logs:"
echo -e "   Look for: ${GREEN}🤖 Using chat model: $NEW_MODEL${NC}"
echo ""

# Warning for gpt-5
if [ "$NEW_MODEL" == "gpt-5" ]; then
    echo -e "${YELLOW}⚠️  NOTE:${NC} GPT-5 may not be available yet."
    echo "   The system will show an error if unavailable."
    echo "   Fallback to gpt-4o-mini if needed."
    echo ""
fi

echo -e "${GREEN}Happy testing! 🚀${NC}"

