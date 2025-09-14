# Activity Tracking API

## WebSocket Endpoints

### 1. Students Activity Stream
**URL:** `ws://your-domain.com/ws/students`

**Success Response (every 10 seconds):**
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
    }
  ],
  "timestamp": "2025-09-01T10:30:50.789123",
  "total_users": 150,
  "online_users": 75
}
```

**Error Response:**
```json
Connection closed with code 1008: "Connection limit reached"
```

### 2. Teachers Activity Stream  
**URL:** `ws://your-domain.com/ws/teachers`

**Success Response (every 10 seconds):**
```json
{
  "type": "teacher_activity_update",
  "data": [
    {
      "user_id": 456,
      "phone": "+998987654321",
      "last_active": "2025-09-01T10:29:15.654321",
      "is_online": false,
      "role": "teacher",
      "full_name": "Jane Smith"
    }
  ],
  "timestamp": "2025-09-01T10:30:50.789123",
  "total_users": 25,
  "online_users": 12
}
```

**Error Response:**
```json
Connection closed with code 1008: "Connection limit reached"
```

### 3. Parents Activity Stream
**URL:** `ws://your-domain.com/ws/parents`

**Success Response (every 10 seconds):**
```json
{
  "type": "parent_activity_update",
  "data": [
    {
      "user_id": 789,
      "phone": "+998123456789",
      "last_active": "2025-09-01T10:31:20.987654",
      "is_online": true,
      "role": "parent",
      "full_name": "Ahmad Ali"
    }
  ],
  "timestamp": "2025-09-01T10:31:30.123456",
  "total_users": 200,
  "online_users": 45
}
```

**Error Response:**
```json
Connection closed with code 1008: "Connection limit reached"
```

## REST API Endpoint

### Get Activity Status
**URL:** `GET /activity/status`  
**Auth:** Required (Bearer token)

**Success Response:**
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

**Error Response (401 Unauthorized):**
```json
{
  "detail": "Invalid token"
}
```

**Error Response (403 Forbidden):**
```json
{
  "detail": "Permission denied"
}
```