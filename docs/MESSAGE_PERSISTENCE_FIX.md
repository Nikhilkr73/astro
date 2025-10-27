# Message Persistence Fix

**Date:** 2025-01-27  
**Issue:** Messages not persisting to database in chat sessions  
**Status:** ✅ Fixed

## Problem

Messages sent during chat sessions were not being saved to the database, causing them to disappear when:
- User clicked back button
- User paused and resumed the session
- App was restarted

## Root Causes

### 1. Frontend Issue (`ChatSessionScreen.tsx`)
- When creating a real conversation ID from a temporary `unified_` ID, the state update (`setConversationId`) was async
- The `getAIResponse` call was using the old `conversationId` instead of the new one
- Messages were being saved to temporary IDs that don't exist in the database

### 2. Backend Issue (`mobile_endpoints.py`)
- The `send_ai_chat_message` handler was calling `chat_handler.send_message()` directly
- It never set the `conversation_id` in the handler's `user_states` dictionary
- The handler's database save logic reads from `user_states[user_id]['conversation_id']`
- Since this was never set, messages weren't saved

## Fixes Applied

### Frontend Fix (`mobile/src/screens/ChatSessionScreen.tsx` lines 1002-1036)

```typescript
// Track actual conversation ID to use
let actualConversationId = conversationId;

// If we have a temporary ID, create a real one
if (conversationId && conversationId.startsWith('unified_') && unifiedAstrologerId) {
  // ... create session with real ID ...
  if (sessionResponse.success) {
    actualConversationId = sessionResponse.conversation_id;
    setConversationId(actualConversationId);
    // ... update context and storage ...
  }
}

// Use actualConversationId for API call
const aiResponse = await apiService.getAIResponse(actualConversationId, messageText, backendAstrologerId);
```

### Backend Fix (`backend/api/mobile_endpoints.py` lines 1445-1449)

```python
# Create chat handler
chat_handler = OpenAIChatHandler(astrologer_id=chat_request.astrologer_id)

# CRITICAL: Set conversation_id in handler's user_states BEFORE sending message
avy_handler.user_states:
    chat_handler.user_states[chat_request.user_id] = {}
chat_handler.user_states[chat_request.user_id]['conversation_id'] = chat_request.conversation_id
print(f"💾 Set conversation_id in handler: {chat_request.conversation_id}")

# Now send message - handler can read conversation_id and save to DB
response = await chat_handler.send_message(
    user_id=chat_request.user_id,
    message=message_with_context
)
```

## How It Works Now

1. **Frontend sends message** → Uses `actualConversationId` (real ID, not temporary)
2. **Backend receives message** → Sets `conversation_id` in handler's user_states
3. **Handler processes message** → Reads `conversation_id` from user_states
4. **Handler saves messages** → Uses the real conversation_id to save to database
5. **Messages persist** → Available on resume, back/forward navigation, app restart

## Testing

✅ Messages now persist across session pause/resume  
✅ Messages persist when navigating away and back  
✅ Unified chat history loads all past conversations  
✅ No more foreign key constraint errors  
✅ No more duplicate message warnings

## Files Modified

- `mobile/src/screens/ChatSessionScreen.tsx`
- `backend/api/mobile_endpoints.py`

## Related Issues

- Fixed duplicate React key warnings
- Fixed "Cannot read property 'id' of undefined" errors
- Fixed recharge banner showing incorrectly
- Fixed 404 errors on unified conversation IDs
