
# Serverless Framework AWS NodeJS Example

This template demonstrates how to deploy a NodeJS function running on AWS Lambda using the traditional Serverless Framework. The deployed function does not include any event definitions as well as any kind of persistence (database). For more advanced configurations check out the [examples repo](https://github.com/serverless/examples/) which includes integrations with SQS, DynamoDB or examples of functions that are triggered in `cron`-like manner. For details about configuration of specific `events`, please refer to our [documentation](https://www.serverless.com/framework/docs/providers/aws/events/).

## Usage

### Local development

```bash
serverless invoke local --function mailing --path data-bounce.json
```
## Refs
https://github.com/serverless/examples/  
https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/nodejs-handler.html  
https://docs.aws.amazon.com/ses/latest/dg/notification-examples.html

