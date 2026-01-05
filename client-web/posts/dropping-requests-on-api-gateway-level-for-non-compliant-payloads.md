---
title: "Dropping Requests on API Gateway Level for Non-Compliant Payloads"
summary: "Validate requests against predefined models and refuse to answer for non-compliant payloads without compute time."
createdAt: "2023-07-14"
tags: ['aws', 'api']
image: '/images/posts/general/apigateway.png'
---

## Understanding the Challenge

When an API Gateway receives a request, it passes the request payload to the associated Lambda function for processing. However, in scenarios where the payload does not meet the API Gateway configuration, such as missing or invalid parameters, there is no need to forward the request to the Lambda function, as it would only waste resources and add unnecessary overhead.

To address this challenge, we will use a feature called "Request Validation" for API Gateway, which allows you to validate incoming requests against predefined models or schemas. By leveraging this feature, you can drop requests on the API Gateway level without invoking the corresponding Lambda function for non-compliant payloads. 

## Resolving the challenge on two steps

### 1. Define Schema
Start by defining request models or schemas using JSON Schema Draft 4. These models act as blueprints for validating incoming requests. They specify the structure, data types, and other constraints for the request payload.

```ts filename-app-stack
this.api = new aws_apigateway.RestApi(this, 'rest');

const requestModel = this.api.addModel('RequestModel', {
  contentType: 'application/json',
  schema: {
    title: 'Request Model',
    schema: aws_apigateway.JsonSchemaVersion.DRAFT4,
    type: aws_apigateway.JsonSchemaType.OBJECT,
    properties: {
      // Define the properties and validation rules for the request payload
      role: {
        type: aws_apigateway.JsonSchemaType.STRING,
        enum: ['admin', 'developer'],
      },
      username: { type: aws_apigateway.JsonSchemaType.STRING },
      password: {
        anyOf: [
          {
            type: aws_apigateway.JsonSchemaType.STRING,
          },
          {
            type: aws_apigateway.JsonSchemaType.INTEGER,
          },
        ],
      },
    },
    required: ['role', 'username', 'password'],
  },
});
```
- `contentType` is set to 'application/json', indicating that the model applies to JSON payloads.
- `schema` contains the actual JSON schema definition for the request model.
  - The `role` property is defined as a string and is restricted to two allowed values: 'admin' or 'developer'.
  - The `username` property is defined as a string as well.
  - The `password` property is defined using anyOf, which specifies that it can be either a string or an integer.
- The `required` property lists the properties that are mandatory in the request payload (role, username, and password).

### 2. Enable the validation on method
Enable request validation on your API Gateway by associating the request models with the corresponding methods or resources. This ensures that all incoming requests are validated against the defined models.

```ts filename-app-stack
// Enable request validation for the API methods
const testResource = this.api.root.addResource('test');
const testPost = testResource.addMethod(
  'POST',
  new aws_apigateway.LambdaIntegration(exampleLambda),
  {
    requestModels: {
      'application/json': requestModel,
    },
    requestValidatorOptions: {
      validateRequestBody: true,
    },
  }
);
```
- The `requestModels` property is used to associate the previously defined requestModel with the 'application/json' media type.
- The `requestValidatorOptions` property is set to enable request body validation by setting validateRequestBody to true.

Overall, we defined a request model/schema for JSON payload validation, and configured a POST method with request validation using the defined model.

## Testing the model schema

We will utilize Postman as client and send invalid JSON payload and observe the 400 response, then we will send correct payload and observe the integrated response from Lambda.

<video src="/images/posts/dropping-requests-on-api-gateway-level-for-non-compliant-payloads/testing-api-schema.mp4" controls ></video>

## Conclusion 
Preventing the requests that do not comply with the defined API configuration, you reduce cost but also you release the load from downstream resources.