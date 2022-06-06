## GraphQL + DynamoDB -- Single-table example

This repository includes an example of building a GraphQL with DynamoDB using a single DynamoDB table. It is intended to pair with [this guide on using DynamoDB in a GraphQL API](TODO).

### Table of Contents

- [Usage](#usage)
- [Application background](#application-background)
- [Takeaways](#takeaways)

## Usage

This application uses the [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/home.html) to deploy a GraphQL API to [AWS AppSync](https://aws.amazon.com/appsync/). Be sure to [install and bootstrap the CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install) before use.

To deploy, clone this repository and run the following commands:

```
npm i
cdk deploy
```

This will deploy an AppSync API and return the GraphQL root URL and an API key to access the API.

You can query the API in the AWS console, or you can open the [`index.html`](./index.html) file to use a local GraphQL explorer. Before opening the file, be sure to replace `GRAPHQL_ROOT` and `API_KEY` with the received values from your deploy.

## Application background

This sample application builds a portion of a SaaS blog hosting platform. Users create a Site on the platform and are able to create Posts on the site. Other users can view the Posts and attach a Comment to a Post.

The simplified ERD is below. This application includes the general CDK code and AppSync resolvers to demonstrate the key differences between single-table and multi-table design with GraphQL + DynamoDB.

![AppSync - ERD](https://user-images.githubusercontent.com/6509926/172209448-98350f3f-7fcf-4a7e-aa64-123dd59ab4e9.svg)

## Takeaways

- **The DynamoDB data modeling uses common single-table design principles.** The DynamoDB table has a composite primary key using the generic `PK` and `SK` for the attribute names. Further, each item written to the table includes a `_TYPE` attribute to help distinguish the particular type.

- **Single-table design optimizes for latency over simplicity.** In using a single-table design, you can fetch multiple types of entities in a single request, as shown in the getSite Query request and response templates.

  Notice the request template does a lookahead to see if the incoming query is asking for the `posts` property on the `site` entity and adjusts its DynamoDB Query accordingly. Further, the response template needs to prepare a response from the result set containing both Site and Post items.

- **The single-table model adds some constraints.** In this single-table model, both Site and Post items use the Site's `domain` as the partition key. This enables us to fetch both in a single request.

  In our example repository showing the same application with a multi-table design, the Post items use a `siteId` as the partition key. Because Post items are retrieved after the Site is retrieved, it can use a more normalized model. This makes it easier to change the domain of Site and Post items in that example, at the cost of increased latency for common requests.
