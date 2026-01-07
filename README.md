# n8n-nodes-aws-iam-identity-center

AWS IAM Identity Center node for n8n workflow automation platform.

## Features

- **List Users**: Get all users from Identity Store
- **Get User**: Find user by User ID or Username

## Installation

### From npm

```bash
npm install n8n-nodes-aws-iam-identity-center
```

### For Testing Locally

1. Clone this repository
2. Install dependencies: `npm install`
3. Link locally: `npm link`
4. In your n8n installation: `npm link n8n-nodes-aws-iam-identity-center`

## Configuration

You'll need:
- AWS Access Key ID
- AWS Secret Access Key  
- AWS Region (e.g., us-east-1)
- Identity Store ID (from IAM Identity Center console)

## Usage

1. Add credentials in n8n
2. Use the node in your workflows
3. Select the operation you want to perform
4. Configure the parameters

## Operations

### List Users
- Lists all users in the Identity Store
- Optional filtering and pagination
- Returns array of user objects

### Get User
- Search by **User ID** or **Username**
- Returns detailed user information
- User ID: Direct lookup by unique identifier
- Username: Search by username in Identity Store

## Important Limitations

⚠️ **Note**: AWS IAM Identity Center API only supports **read operations**. User modification operations (update, disable, enable) are not supported via API and must be done through the AWS console.

## Example Usage

```javascript
// List all users
const users = await node.execute('listUsers');

// Get user by username
const user = await node.execute('getUser', { 
  searchBy: 'username', 
  username: 'john.doe' 
});

// Get user by ID
const user = await node.execute('getUser', { 
  searchBy: 'userId', 
  userId: 'a1b2c3d4-5678-90ab-cdef-EXAMPLE11111' 
});
```

## License

MIT

## Author

Everton Mimura <emimura@gmail.com>
