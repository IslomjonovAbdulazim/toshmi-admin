# Activity Tracking System

## Overview

Real-time WebSocket system that tracks user activity across the school management platform. Automatically updates user activity on every API request and broadcasts live data through role-specific WebSocket channels using persistent database storage.

## Features

- **Real-time Activity Tracking**: Updates `user_activity` table on every authenticated API request
- **Online/Offline Status**: Users marked as online if active within 30 seconds
- **Role-based Channels**: Separate WebSocket streams for students, teachers, and parents
- **High Capacity**: Supports up to 3000 concurrent connections per channel (9000 total)
- **Auto-broadcast**: Sends activity updates every 10 seconds
- **Persistent Storage**: Activity data survives server restarts via dedicated database table
- **Safe Deployment**: No existing data affected during setup

## Database Schema

### UserActivity Table
```sql
CREATE TABLE user_activity (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id),
    phone VARCHAR,
    last_active TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_activity_last_active ON user_activity(last_active);
CREATE INDEX idx_activity_phone ON user_activity(phone);
CREATE INDEX idx_activity_user_id ON user_activity(user_id);
```

## WebSocket Endpoints

### 1. Students Channel
- **URL**: `ws://your-domain.com/ws/students`
- **Purpose**: Broadcasts all student activity data
- **Data**: All users with `role="student"`
- **Connection Limit**: 3000 concurrent connections

### 2. Teachers Channel  
- **URL**: `ws://your-domain.com/ws/teachers`
- **Purpose**: Broadcasts all teacher activity data
- **Data**: All users with `role="teacher"`
- **Connection Limit**: 3000 concurrent connections

### 3. Parents Channel
- **URL**: `ws://your-domain.com/ws/parents` 
- **Purpose**: Broadcasts all parent activity data
- **Data**: All users with `role="parent"`
- **Connection Limit**: 3000 concurrent connections

## WebSocket Response Format

Each channel sends data every 10 seconds in this format:

```json
{
  "type": "student_activity_update",
  "data": [
    {
      "user_id": 123,
      "phone": "+998901234567",
      "last_active": "2025-09-01T10:30:45.123456",
      "is_online": true,
      "role": "student",
      "full_name": "John Doe"
    },
    {
      "user_id": 124,
      "phone": "+998987654321", 
      "last_active": "2025-09-01T10:29:15.654321",
      "is_online": false,
      "role": "student",
      "full_name": "Jane Smith"
    }
  ],
  "timestamp": "2025-09-01T10:30:50.789123",
  "total_users": 150,
  "online_users": 75
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Message type (`student_activity_update`, `teacher_activity_update`, `parent_activity_update`) |
| `data` | array | Array of user activity objects |
| `timestamp` | string | ISO timestamp when message was sent |
| `total_users` | number | Total users of this role |
| `online_users` | number | Users online (active ≤30 seconds) |

### User Activity Object

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | number | Unique user identifier |
| `phone` | string | User's phone number |
| `last_active` | string/null | ISO timestamp of last API request |
| `is_online` | boolean | `true` if active ≤30 seconds, `false` otherwise |
| `role` | string | User role (`student`, `teacher`, `parent`) |
| `full_name` | string | User's full name |

## REST API Endpoint

### Get Activity Status
- **URL**: `GET /activity/status`
- **Auth**: Required (Bearer token)
- **Purpose**: Get current activity statistics

**Response:**
```json
{
  "student_connections": 45,
  "teacher_connections": 12,
  "parent_connections": 23,
  "recent_activity": [
    {
      "user_id": 123,
      "phone": "+998901234567",
      "full_name": "John Doe",
      "role": "student", 
      "last_active": "2025-09-01T10:30:45.123456"
    }
  ],
  "max_connections": 3000
}
```

## Data Flow

```
1. User makes API request
   ↓
2. Activity Middleware intercepts request
   ↓
3. Updates/creates record in user_activity table
   ↓
4. WebSocket Manager (every 10s)
   ↓
5. Queries users with activity data by role
   ↓
6. Calculates is_online (≤30 seconds)
   ↓
7. Broadcasts to role-specific WebSocket channel
   ↓
8. Connected clients receive real-time data
```

## Implementation Details

### Database Table
- **New table**: `user_activity` with `user_id`, `phone`, `last_active`
- **Persistent storage**: Survives server restarts
- **Indexed**: For fast queries on `last_active` and `user_id`
- **Safe creation**: Use `test.py` script to create table without data loss

### Middleware
- **File**: `app/middleware/activity_tracker.py`
- Intercepts all API requests
- Extracts user ID from JWT token
- Updates/creates `user_activity` record

### WebSocket Manager  
- **File**: `app/services/websocket_manager.py`
- 3 separate managers for each role
- Max 3000 connections per manager
- Broadcasts every 10 seconds
- Queries from `user_activity` table with JOIN to `users`
- Auto-cleanup of disconnected clients

### Connection Limits
- **Per Channel**: 3000 connections
- **Total System**: 9000 connections (3 × 3000)
- **Auto-rejection**: When limit reached

## Usage Examples

### JavaScript Client
```javascript
// Connect to students channel
const socket = new WebSocket('ws://localhost:8000/ws/students');

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Students activity:', data.data);
    console.log('Online students:', data.online_users);
};
```

### Python Client
```python
import websockets
import json
import asyncio

async def listen_students():
    uri = "ws://localhost:8000/ws/students"
    async with websockets.connect(uri) as websocket:
        async for message in websocket:
            data = json.loads(message)
            print(f"Online students: {data['online_users']}")
```

## Deployment

### Safe Deployment Steps (No Data Loss)

1. **Install dependencies**: `pip install -r requirements.txt`
2. **Create activity table**: `python test.py` (safely adds user_activity table)
3. **Deploy application code**: Upload all files to your server
4. **Start server**: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
5. **Test WebSocket**: Use `test_websocket.html` to verify connections

### Important Notes
- **NO existing data will be lost** during deployment
- **Dangerous endpoints removed**: `/init-db` and `/reset-db` no longer exist
- **Safe table creation**: `test.py` only creates `user_activity` table
- **Backward compatible**: All existing API endpoints continue working

### Files Added/Modified
- ✅ `app/models/models.py` - Added UserActivity model
- ✅ `app/middleware/activity_tracker.py` - Activity tracking middleware
- ✅ `app/services/websocket_manager.py` - WebSocket management
- ✅ `app/main.py` - Added 3 WebSocket endpoints
- ✅ `requirements.txt` - Added websockets dependency
- ✅ `test.py` - Safe table creation script
- ✅ `test_websocket.html` - Testing interface

## Security Notes

- **WebSocket connections**: No authentication required (broadcasts public activity data)
- **Activity data**: Includes phone numbers and user IDs
- **Rate limiting**: Connection limits (3000 per channel)
- **Data privacy**: Only shows activity timestamps, not sensitive user data
- **Safe deployment**: No destructive database operations included