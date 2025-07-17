# Backend Setup Guide

## MongoDB Setup

This application uses MongoDB for storing team member data. Follow these steps to set up the backend:

### 1. Install MongoDB

**Option A: Local MongoDB**
- Download and install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
- Start MongoDB service

**Option B: MongoDB Atlas (Cloud)**
- Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Create a new cluster
- Get your connection string

### 2. Environment Variables

Create a `.env.local` file in the root directory with:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/time-tracking-app

# For MongoDB Atlas, use format like:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/time-tracking-app?retryWrites=true&w=majority
```

### 3. API Endpoints

The following API endpoints are available for team member management:

#### GET /api/team-members
- Get all team members
- Query parameters: `department`, `role`, `status`, `search`

#### POST /api/team-members
- Create a new team member
- Required fields: `name`, `email`, `department`, `position`

#### GET /api/team-members/[id]
- Get a specific team member by ID

#### PUT /api/team-members/[id]
- Update a team member by ID

#### DELETE /api/team-members/[id]
- Delete a team member by ID

### 4. Team Member Model

The TeamMember model includes the following fields:

- `name` (required): Full name of the team member
- `email` (required, unique): Email address
- `role` (required): 'admin', 'manager', or 'employee'
- `status` (required): 'active', 'inactive', or 'pending'
- `department` (required): Department name
- `position` (required): Job position/title
- `joinDate` (optional): Date when member joined
- `phone` (optional): Phone number
- `location` (optional): Location/office
- `skills` (optional): Array of skills
- `bio` (optional): Short biography
- `avatar` (optional): Profile picture URL

### 5. Testing the API

You can test the API endpoints using tools like Postman or curl:

```bash
# Get all team members
curl http://localhost:3000/api/team-members

# Create a new team member
curl -X POST http://localhost:3000/api/team-members \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "status": "active",
    "department": "Engineering",
    "position": "Software Developer"
  }'
```

### 6. Frontend Integration

Use the utility functions in `lib/api/teamMembers.ts` to interact with the API from your React components:

```typescript
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '../lib/api/teamMembers';

// Get all team members
const teamMembers = await getTeamMembers();

// Create a new team member
const newMember = await createTeamMember({
  name: "Jane Smith",
  email: "jane@example.com",
  role: "manager",
  status: "active",
  department: "Marketing",
  position: "Marketing Manager"
});
``` 