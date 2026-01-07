const {
	ICredentialType,
	INodeProperties,
} = require('n8n-workflow');

class AwsIamIdentityCenterApi {
	constructor() {
		this.name = 'awsIamIdentityCenterApi';
		this.displayName = 'AWS IAM Identity Center API';
		this.documentationUrl = 'https://docs.aws.amazon.com/singlesignon/';
		this.properties = [
			{
				displayName: 'Access Key ID',
				name: 'accessKeyId',
				type: 'string',
				default: '',
				required: true,
				description: 'AWS Access Key ID',
			},
			{
				displayName: 'Secret Access Key',
				name: 'secretAccessKey',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				required: true,
				description: 'AWS Secret Access Key',
			},
			{
				displayName: 'Region',
				name: 'region',
				type: 'string',
				default: 'us-east-1',
				required: true,
				description: 'AWS Region',
			},
			{
				displayName: 'Identity Store ID',
				name: 'identityStoreId',
				type: 'string',
				default: '',
				required: true,
				description: 'Identity Store ID from AWS IAM Identity Center',
			},
		];
	}
}

module.exports = {
	AwsIamIdentityCenterApi,
};
