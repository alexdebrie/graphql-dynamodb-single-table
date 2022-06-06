import { Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { AuthorizationType, FieldLogLevel, GraphqlApi, MappingTemplate, Schema } from "@aws-cdk/aws-appsync-alpha";
import { CfnApiKey } from 'aws-cdk-lib/aws-appsync';
import { CfnOutput } from 'aws-cdk-lib';

export class SingleTableCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const dynamodbTable = new Table(this, 'DynamoDBTable', {
      partitionKey: { name: 'PK', type: AttributeType.STRING},
      sortKey: { name: 'SK', type: AttributeType.STRING},
      billingMode: BillingMode.PAY_PER_REQUEST
    })


    const api = new GraphqlApi(this, 'Api', {
      name: 'DynamoDBSingleTable',
      schema: Schema.fromAsset('lib/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY
        }
      },
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL
      },
      xrayEnabled: true
    })

    const tableDatasource = api.addDynamoDbDataSource('DynamoDBTable', dynamodbTable)

    tableDatasource.createResolver({
      typeName: 'Mutation',
      fieldName: 'createSite',
      requestMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Mutation.createSite.request.vtl'),
      responseMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Mutation.createSite.response.vtl'),
    })

    tableDatasource.createResolver({
      typeName: 'Query',
      fieldName: 'getSite',
      requestMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Query.getSite.request.vtl'),
      responseMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Query.getSite.response.vtl'),
    })

    tableDatasource.createResolver({
      typeName: 'Mutation',
      fieldName: 'createPost',
      requestMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Mutation.createPost.request.vtl'),
      responseMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Mutation.createPost.response.vtl'),
    })

    tableDatasource.createResolver({
      typeName: 'Query',
      fieldName: 'getPostsForSite',
      requestMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Query.getPostsForSite.request.vtl'),
      responseMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Query.getPostsForSite.response.vtl'),
    })

    tableDatasource.createResolver({
      typeName: 'Mutation',
      fieldName: 'createComment',
      requestMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Mutation.createComment.request.vtl'),
      responseMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Mutation.createComment.response.vtl'),
    })

    tableDatasource.createResolver({
      typeName: 'Post',
      fieldName: 'comments',
      requestMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Post.comments.request.vtl'),
      responseMappingTemplate: MappingTemplate.fromFile('lib/mapping-templates/Post.comments.response.vtl'),
    })

    const apiKey = new CfnApiKey(this, 'GraphQLApiKey', {
      apiId: api.apiId
    })

    new CfnOutput(this, 'GraphQLURLOutput', {
      value: api.graphqlUrl,
      exportName: 'GraphQLURL'
    })

    new CfnOutput(this, 'GraphQLApiKeyOutput', {
      value: apiKey.attrApiKey,
      exportName: 'GraphQLApiKey'
    })
  }
}
