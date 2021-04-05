# Challenge Orchestrator

This is the base code for challenge orchestrator which setup two lumbda functions and a state machine on AWS platform using serverless.

## Dependency

- Nodejs v12
- serverless

## Environment Variables

| Name         | Description                              |
| ------------ | ---------------------------------------- |
| REGION       | AWS region                               |
| API_ENDPOINT | The endpoint for lambda function to call |

The environment variables are passed using `dotEnv`, so there should be a `.env` file containing the variables in the root folder before deployment. You can find a example of `.env` in the root folder called `example.env`.

## How to deploy

1. Install dependencies

   ```bash
   npm install
   ```
   
2. Run lint

   ```bash
   npm run lint
   npm run lint:fix  # with fix
   ```
   
3. Configure AWS account with serverless. Refer https://www.serverless.com/framework/docs/providers/aws/guide/credentials/ for details.

4. Deploy

  ```bash
  npm run deploy
  ```
  
5. Remove resources after varification

   ```bash
   npm run destroy
   ```

   

## Explainations

Currently, two lambda functions and one step function (state machine) is deployed for demostration.

| Name          | Type            | Handler               |
| ------------- | --------------- | --------------------- |
| submit        | Lambda function | src/handler.submit    |
| startExec     | Lambda function | src/handler.startExec |
| submitMachine | state machine   | N/A                   |

The workflow is:

- user send http request to trigger `startExec`
- `startExec` starts `submitMachine`
- `stateMachine` start from state `CallSubmit`, and execute `submit` as a task
- `stateMachine` stop as `CallSubmit` is the only state it has for now



## Verification

1. Deploy the lambda functions and state machine as instructed above. Copying `example.env` to `.env` and keeping the environment variables is recommended.

2. Note that there is an endpoints in the console output for startExec.

3. Make a POST request to the endpoint'. The body of the POST request must have field "input" and "name". "name" should be unique for each execution. For example

   ```bash
   curl -X POST 'https://e0gbflxn58.execute-api.us-east-1.amazonaws.com/dev/start' \
   --header 'Content-Type: application/json' \
   --data-raw '{
       "input": {
           "message": "hello",
           "value": 123
       },
       "name": "name1"
   }'
   ```

   

   - Check status code 200 and message 'ok' from response

   - Go to https://console.aws.amazon.com/cloudwatch/home, click log groups from left menu, check logs from both lambda functions

   - Go to https://console.aws.amazon.com/states/home, click the stateMachine and check the executions and logs of it.

   - Go to https://webhook.site/#!/de92f4c4-dc9d-4d90-9b00-8bcb350d19e9/9ed801a9-e0e3-4fcf-b868-ef94e089cae0/1, check the request details from `submit` function. The body should be the same as your request.

     Note: this url is related to `API_ENDPOINT` variable. Any request sent to this endpoint will be shown on the page. If you change `API_ENDPOINT`, you have to check the request on your own.

4. Don't forget to remove resources after verification : )

## Local Deploy

### Lambda Functions

Lambda functions can be deployed locally with the help of plugin  `serverless-offline`. Just run `sls offline` and you can invoke your lambdas.

You can also configure it to run in docker. Add `--useDocker` after the command. See https://www.npmjs.com/package/serverless-offline for details.

### Step functions 

There is a dockerized step function image provided by Amazon, but step functions have to be deployed to it using aws command line tool with template.yaml file and the file can't be generated from serverless.yml file. So another file has to be maintained which is not a good idea.

What's more, lambda functions and step functions use ARNs to interact with each other. I'm not sure if it will work with local-deployed lambda function.

With all the above being said, I will leave this part as TBD. https://docs.aws.amazon.com/step-functions/latest/dg/sfn-local-lambda.html might be a possible solution for your reference.