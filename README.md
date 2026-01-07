# n8n-nodes-aws-iam-identity-center

AWS IAM Identity Center node for n8n workflow automation platform.

## Features

- **List Users**: Get all users from Identity Store
- **Get User**: Find user by ID, username, or email
- **Update User**: Modify user information
- **Disable User**: Deactivate user account
- **Enable User**: Activate user account

## Installation

### For Testing Locally

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the package: `npm run build`
4. Link locally: `npm link`
5. In your n8n installation: `npm link n8n-nodes-aws-iam-identity-center`

### From npm (when published)

```bash
npm install n8n-nodes-aws-iam-identity-center
```

## Configuration

You'll need:
- AWS Access Key ID
- AWS Secret Access Key  
- AWS Region
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

### Get User
- Search by User ID, Username, or Email
- Returns detailed user information

### Update User
- Modify user attributes like display name, given name, family name, email

### Disable/Enable User
- Change user active status

## License

MIT

## Author

Everton Mimura <emimura@gmail.com>
