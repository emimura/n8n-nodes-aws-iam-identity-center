const { IdentitystoreClient, ListUsersCommand, DescribeUserCommand } = require('@aws-sdk/client-identitystore');
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
							description: 'Get user details by User ID or Username',
							action: 'Get user details',
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
							operation: ['getUser'],
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
