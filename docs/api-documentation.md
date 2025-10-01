# API Documentation

## Base URL
```
http://localhost:4000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow this format:
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "errors": []
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "reputation_score": 0,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "reputation_score": 45,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Get Current User
```http
GET /auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "reputation_score": 45,
  "created_at": "2024-01-01T00:00:00Z"
}
```

## Posts Endpoints

### Get Posts (Public Feed)
```http
GET /posts
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 50)
- `search` (string): Search term for content
- `author` (uuid): Filter by author ID

**Response:**
```json
{
  "posts": [
    {
      "id": "uuid",
      "content": "Post content here",
      "media_url": "/uploads/image.jpg",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "author": {
        "id": "uuid",
        "name": "John Doe",
        "role": "user"
      },
      "_count": {
        "flags": 0
      }
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 42
}
```

### Get Single Post
```http
GET /posts/:id
```

**Response:**
```json
{
  "id": "uuid",
  "content": "Post content here",
  "media_url": "/uploads/image.jpg",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "author": {
    "id": "uuid",
    "name": "John Doe",
    "role": "user"
  },
  "flags": [
    {
      "id": "uuid",
      "reason_category": "spam",
      "reason_text": "This looks like spam",
      "created_at": "2024-01-01T00:00:00Z",
      "flagged_by": {
        "id": "uuid",
        "name": "Jane Doe"
      }
    }
  ],
  "ai_analysis": {
    "labels": ["spam", "promotional"],
    "scores": {
      "spam": 0.85,
      "toxicity": 0.1
    },
    "overall_risk": 0.85
  }
}
```

### Create Post
```http
POST /posts
```

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `content` (string, required): Post content (max 2000 chars)
- `media` (file, optional): Image file (max 5MB, jpg/png/gif)

**Response:**
```json
{
  "id": "uuid",
  "content": "New post content",
  "media_url": "/uploads/image.jpg",
  "status": "active",
  "author_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "author": {
    "id": "uuid",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Update Post
```http
PATCH /posts/:id
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Updated post content"
}
```

**Response:** Same as Create Post

### Delete Post
```http
DELETE /posts/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Post deleted successfully"
}
```

## Flags Endpoints

### Create Flag
```http
POST /flags
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "post_id": "uuid",
  "reason_category": "spam",
  "reason_text": "This looks like spam content"
}
```

**Reason Categories:**
- `spam`
- `harassment`
- `hate-speech`
- `violence`
- `nudity`
- `misinformation`
- `copyright`
- `other`

**Response:**
```json
{
  "message": "Post flagged successfully",
  "flag": {
    "id": "uuid",
    "post_id": "uuid",
    "flagged_by": "uuid",
    "reason_category": "spam",
    "reason_text": "This looks like spam content",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Get User's Flags
```http
GET /flags/my-flags
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "uuid",
    "reason_category": "spam",
    "reason_text": "This looks like spam",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z",
    "post": {
      "id": "uuid",
      "content": "Flagged post content",
      "author": {
        "id": "uuid",
        "name": "Author Name"
      }
    }
  }
]
```

## Moderation Endpoints

**Note:** All moderation endpoints require `moderator` or `admin` role.

### Get Moderation Queue
```http
GET /moderation/queue
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `status` (string): Filter by status (`pending`, `approved`, `removed`, `escalated`, `all`)
- `sort` (string): Sort order (`created_at`, `risk_score`, `priority`)

**Response:**
```json
{
  "flags": [
    {
      "id": "uuid",
      "reason_category": "spam",
      "reason_text": "This looks like spam",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z",
      "post": {
        "id": "uuid",
        "content": "Flagged post content",
        "media_url": "/uploads/image.jpg",
        "author": {
          "id": "uuid",
          "name": "Author Name"
        }
      },
      "flagged_by": {
        "id": "uuid",
        "name": "Flagger Name"
      },
      "ai_analysis": {
        "labels": ["spam"],
        "scores": {
          "spam": 0.85
        },
        "overall_risk": 0.85
      }
    }
  ],
  "totalPages": 3,
  "currentPage": 1,
  "total": 25,
  "pending": 8
}
```

### Get Flag Details
```http
GET /moderation/:flagId
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "reason_category": "spam",
  "reason_text": "Detailed reason",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00Z",
  "post": {
    "id": "uuid",
    "content": "Full post content",
    "media_url": "/uploads/image.jpg",
    "author": {
      "id": "uuid",
      "name": "Author Name"
    }
  },
  "flagged_by": {
    "id": "uuid",
    "name": "Flagger Name"
  },
  "moderation_logs": [
    {
      "id": "uuid",
      "action": "escalate",
      "notes": "Needs senior review",
      "created_at": "2024-01-01T00:00:00Z",
      "moderator": {
        "id": "uuid",
        "name": "Moderator Name"
      }
    }
  ],
  "ai_analysis": {
    "labels": ["spam", "promotional"],
    "scores": {
      "spam": 0.85,
      "toxicity": 0.1
    },
    "overall_risk": 0.85,
    "raw_response": {}
  }
}
```

### Take Moderation Action
```http
POST /moderation/:flagId/action
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "action": "approve",
  "reason": "Content is appropriate after review"
}
```

**Actions:**
- `approve`: Mark content as appropriate
- `remove`: Remove content for policy violation
- `escalate`: Send to senior moderators

**Response:**
```json
{
  "message": "Flag approved successfully",
  "flag": {
    "id": "uuid",
    "status": "approved",
    "post": {
      "id": "uuid",
      "status": "active"
    }
  }
}
```

### Get Moderation Logs
```http
GET /moderation/logs
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "action": "approve",
      "notes": "Content is appropriate",
      "created_at": "2024-01-01T00:00:00Z",
      "moderator": {
        "id": "uuid",
        "name": "Moderator Name"
      },
      "flag": {
        "id": "uuid",
        "reason_category": "spam",
        "post": {
          "id": "uuid",
          "content": "Post content snippet...",
          "author": {
            "id": "uuid",
            "name": "Author Name"
          }
        }
      }
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 48
}
```

## AI Analysis Endpoints

**Note:** Requires `moderator` or `admin` role.

### Analyze Text
```http
POST /ai/analyze-text
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "text": "Text content to analyze",
  "postId": "uuid",
  "context": "Additional context"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "labels": ["spam", "promotional"],
    "scores": {
      "spam": 0.85,
      "toxicity": 0.1,
      "harassment": 0.05
    },
    "overall_risk": 0.85,
    "raw_response": {}
  },
  "recommendations": {
    "shouldAutoRemove": false,
    "shouldFlag": true
  }
}
```

### Analyze Image
```http
POST /ai/analyze-image
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "postId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "labels": ["safe_content"],
    "scores": {
      "nudity": 0.05,
      "violence": 0.02,
      "inappropriate": 0.03
    },
    "overall_risk": 0.05,
    "raw_response": {}
  },
  "recommendations": {
    "shouldAutoRemove": false,
    "shouldFlag": false
  }
}
```

### Get AI Configuration
```http
GET /ai/config
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "thresholds": {
    "auto_remove": 0.9,
    "flag_review": 0.6
  },
  "providers": {
    "text": "OpenAI GPT-4",
    "image": "OpenAI GPT-4V"
  }
}
```

## Analytics Endpoints

**Note:** Requires `moderator` or `admin` role.

### Get Moderation Metrics
```http
GET /analytics/moderation-metrics
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `range` (string): Time range (`24h`, `7d`, `30d`, `90d`)

**Response:**
```json
{
  "totalFlags": 123,
  "pendingFlags": 8,
  "approvedFlags": 87,
  "removedFlags": 28,
  "averageResponseTime": 2.3,
  "accuracy": 92.5,
  "falsePositiveRate": 7.5,
  "timeRange": "7d"
}
```

### Get Community Stats
```http
GET /analytics/community-stats
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `range` (string): Time range

**Response:**
```json
{
  "posts": {
    "total": 1250,
    "active": 1180,
    "removed": 70,
    "removalRate": 5.6
  },
  "users": {
    "total": 450,
    "new": 23
  },
  "ai": {
    "totalAnalyses": 1100
  },
  "flagCategories": {
    "spam": 45,
    "harassment": 12,
    "hate-speech": 8,
    "other": 15
  },
  "timeRange": "7d"
}
```

### Get Trend Data
```http
GET /analytics/trends
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `range` (string): Time range
- `type` (string): Data type (`flags`, `posts`)

**Response:**
```json
{
  "trends": [
    {
      "period": "2024-01-01T00:00:00Z",
      "total": 25,
      "approved": 18,
      "removed": 7
    },
    {
      "period": "2024-01-02T00:00:00Z",
      "total": 32,
      "approved": 24,
      "removed": 8
    }
  ],
  "timeRange": "7d",
  "type": "flags",
  "groupBy": "day"
}
```

## User Management Endpoints

### Get User Profile
```http
GET /users/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "reputation_score": 45,
  "created_at": "2024-01-01T00:00:00Z",
  "stats": {
    "posts": 12,
    "flags": 3
  }
}
```

### Update User Profile
```http
PATCH /users/:id
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

**Response:** Same as Get User Profile

### List Users (Admin Only)
```http
GET /users
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search by name or email
- `role` (string): Filter by role

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "reputation_score": 45,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "totalPages": 10,
  "currentPage": 1,
  "total": 95
}
```

### Update User Role (Admin Only)
```http
PATCH /users/:id/role
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "role": "moderator"
}
```

**Roles:**
- `user`
- `moderator`
- `admin`

**Response:**
```json
{
  "message": "User role updated successfully",
  "user": {
    "id": "uuid",
    "role": "moderator"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limits

- General endpoints: 100 requests per 15 minutes
- Authentication endpoints: 10 requests per 15 minutes
- Flag creation: 10 requests per 15 minutes
- File uploads: 5 requests per 15 minutes

## WebSocket Events

### Client to Server

```javascript
// Join moderation room (moderators only)
socket.emit('join-moderation');

// Subscribe to user notifications
socket.emit('subscribe-notifications', { userId: 'uuid' });
```

### Server to Client

```javascript
// New flag for moderation
socket.on('moderation:new-flag', (data) => {
  // data: { flagId, postId, reason, riskScore, priority }
});

// Moderation action taken
socket.on('moderation:action', (data) => {
  // data: { action, postId, reason, moderator }
});

// General notification
socket.on('notification', (data) => {
  // data: { type, message, data }
});
```

This API documentation provides comprehensive coverage of all available endpoints, request/response formats, and usage examples for the Community Moderator platform.