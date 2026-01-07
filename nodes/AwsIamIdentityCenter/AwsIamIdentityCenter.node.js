const { IdentitystoreClient, ListUsersCommand, DescribeUserCommand, UpdateUserCommand } = require('@aws-sdk/client-identitystore');
const { SSOAdminClient, ListAccountsForProvisionedPermissionSetCommand } = require('@aws-sdk/client-sso-admin');

class AwsIamIdentityCenter {
	constructor() {
		this.description = {
			displayName: 'AWS IAM Identity Center',
			name: 'awsIamIdentityCenter',
			icon: 'file:aws.svg',
			group: ['transform'],
			version: 1,
			subtitle: '={{$parameter["operation"]}}',
			description: 'Interact with AWS IAM Identity Center',
			defaults: {
				name: 'AWS IAM Identity Center',
			},
			inputs: ['main'],
			outputs: ['main'],
			credentials: [
				{
					name: 'awsIamIdentityCenterApi',
					required: true,
				},
			],
			properties: [
				{
					displayName: 'Operation',
					name: 'operation',
					type: 'options',
					noDataExpression: true,
					options: [
						{
							name: 'List Users',
							value: 'listUsers',
							description: 'List all users in Identity Store',
							action: 'List users',
						},
						{
							name: 'Get User',
							value: 'getUser',
							description: 'Get user details by ID or username',
							action: 'Get user details',
						},
						{
							name: 'Update User',
							value: 'updateUser',
							description: 'Update user information',
							action: 'Update user',
						},
						{
							name: 'Disable User',
							value: 'disableUser',
							description: 'Disable a user account',
							action: 'Disable user',
						},
						{
							name: 'Enable User',
							value: 'enableUser',
							description: 'Enable a user account',
							action: 'Enable user',
						},
					],
					default: 'listUsers',
				},
				// List Users options
				{
					displayName: 'Limit',
					name: 'limit',
					type: 'number',
					displayOptions: {
						show: {
							operation: ['listUsers'],
						},
					},
					default: 50,
					description: 'Maximum number of users to return',
				},
				{
					displayName: 'Filter',
					name: 'filter',
					type: 'string',
					displayOptions: {
						show: {
							operation: ['listUsers'],
						},
					},
					default: '',
					placeholder: 'UserName eq "john.doe"',
					description: 'Filter expression for users (optional)',
				},
				// Get User options
				{
					displayName: 'Search By',
					name: 'searchBy',
					type: 'options',
					displayOptions: {
						show: {
							operation: ['getUser'],
						},
					},
					options: [
						{
							name: 'User ID',
							value: 'userId',
						},
						{
							name: 'Username',
							value: 'username',
						},
						{
							name: 'Email',
							value: 'email',
						},
					],
					default: 'username',
				},
				{
					displayName: 'User ID',
					name: 'userId',
					type: 'string',
					displayOptions: {
						show: {
							operation: ['getUser', 'updateUser', 'disableUser', 'enableUser'],
							searchBy: ['userId'],
						},
					},
					default: '',
					description: 'The unique identifier for the user',
				},
				{
					displayName: 'Username',
					name: 'username',
					type: 'string',
					displayOptions: {
						show: {
							operation: ['getUser'],
							searchBy: ['username'],
						},
					},
					default: '',
					description: 'The username to search for',
				},
				{
					displayName: 'Email',
					name: 'email',
					type: 'string',
					displayOptions: {
						show: {
							operation: ['getUser'],
							searchBy: ['email'],
						},
					},
					default: '',
					description: 'The email to search for',
				},
				// Update User options
				{
					displayName: 'User ID',
					name: 'userIdUpdate',
					type: 'string',
					displayOptions: {
						show: {
							operation: ['updateUser', 'disableUser', 'enableUser'],
						},
					},
					default: '',
					required: true,
					description: 'The unique identifier for the user to update',
				},
				{
					displayName: 'Update Fields',
					name: 'updateFields',
					type: 'collection',
					placeholder: 'Add Field',
					displayOptions: {
						show: {
							operation: ['updateUser'],
						},
					},
					default: {},
					options: [
						{
							displayName: 'Display Name',
							name: 'displayName',
							type: 'string',
							default: '',
							description: 'The display name of the user',
						},
						{
							displayName: 'Given Name',
							name: 'givenName',
							type: 'string',
							default: '',
							description: 'The given name of the user',
						},
						{
							displayName: 'Family Name',
							name: 'familyName',
							type: 'string',
							default: '',
							description: 'The family name of the user',
						},
						{
							displayName: 'Email',
							name: 'email',
							type: 'string',
							default: '',
							description: 'The email address of the user',
						},
					],
				},
			],
		};
	}

	async execute() {
		const items = this.getInputData();
		const returnData = [];
		const credentials = await this.getCredentials('awsIamIdentityCenterApi');
		
		const config = {
			region: credentials.region,
			credentials: {
				accessKeyId: credentials.accessKeyId,
				secretAccessKey: credentials.secretAccessKey,
			},
		};

		const identityStoreClient = new IdentitystoreClient(config);
		const identityStoreId = credentials.identityStoreId;

		for (let i = 0; i < items.length; i++) {
			const operation = this.getNodeParameter('operation', i);

			try {
				let responseData;

				if (operation === 'listUsers') {
					const limit = this.getNodeParameter('limit', i);
					const filter = this.getNodeParameter('filter', i);

					const params = {
						IdentityStoreId: identityStoreId,
						MaxResults: limit,
					};

					if (filter) {
						params.Filters = [
							{
								AttributePath: 'UserName',
								AttributeValue: filter,
							},
						];
					}

					const command = new ListUsersCommand(params);
					responseData = await identityStoreClient.send(command);

				} else if (operation === 'getUser') {
					const searchBy = this.getNodeParameter('searchBy', i);
					
					if (searchBy === 'userId') {
						const userId = this.getNodeParameter('userId', i);
						const command = new DescribeUserCommand({
							IdentityStoreId: identityStoreId,
							UserId: userId,
						});
						responseData = await identityStoreClient.send(command);
					} else {
						// Search by username or email
						const searchValue = searchBy === 'username' 
							? this.getNodeParameter('username', i)
							: this.getNodeParameter('email', i);
						
						const attributePath = searchBy === 'username' ? 'UserName' : 'Emails.Value';
						
						const listCommand = new ListUsersCommand({
							IdentityStoreId: identityStoreId,
							Filters: [
								{
									AttributePath: attributePath,
									AttributeValue: searchValue,
								},
							],
						});
						
						const listResult = await identityStoreClient.send(listCommand);
						responseData = listResult.Users && listResult.Users.length > 0 
							? listResult.Users[0] 
							: null;
					}

				} else if (operation === 'updateUser') {
					const userId = this.getNodeParameter('userIdUpdate', i);
					const updateFields = this.getNodeParameter('updateFields', i);

					const operations = [];
					
					if (updateFields.displayName) {
						operations.push({
							AttributePath: 'DisplayName',
							AttributeValue: updateFields.displayName,
						});
					}
					
					if (updateFields.givenName) {
						operations.push({
							AttributePath: 'Name.GivenName',
							AttributeValue: updateFields.givenName,
						});
					}
					
					if (updateFields.familyName) {
						operations.push({
							AttributePath: 'Name.FamilyName',
							AttributeValue: updateFields.familyName,
						});
					}
					
					if (updateFields.email) {
						operations.push({
							AttributePath: 'Emails.Value',
							AttributeValue: updateFields.email,
						});
					}

					const command = new UpdateUserCommand({
						IdentityStoreId: identityStoreId,
						UserId: userId,
						Operations: operations.map(op => ({
							AttributePath: op.AttributePath,
							AttributeValue: op.AttributeValue,
						})),
					});

					responseData = await identityStoreClient.send(command);

				} else if (operation === 'disableUser') {
					const userId = this.getNodeParameter('userIdUpdate', i);
					
					const command = new UpdateUserCommand({
						IdentityStoreId: identityStoreId,
						UserId: userId,
						Operations: [
							{
								AttributePath: 'Active',
								AttributeValue: 'false',
							},
						],
					});

					responseData = await identityStoreClient.send(command);
					responseData.message = 'User disabled successfully';

				} else if (operation === 'enableUser') {
					const userId = this.getNodeParameter('userIdUpdate', i);
					
					const command = new UpdateUserCommand({
						IdentityStoreId: identityStoreId,
						UserId: userId,
						Operations: [
							{
								AttributePath: 'Active',
								AttributeValue: 'true',
							},
						],
					});

					responseData = await identityStoreClient.send(command);
					responseData.message = 'User enabled successfully';
				}

				returnData.push({
					json: responseData,
					pairedItem: { item: i },
				});

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}
}

module.exports = {
	AwsIamIdentityCenter,
};
