/**
 * Handlers for AWS Lmabda functions
 */

const request = require('superagent')
const aws = require('aws-sdk')

const API_ENDPOINT = process.env.API_ENDPOINT
const STATE_MACHINE_ARN = process.env.STATE_MACHINE_ARN

const stepFunction = new aws.StepFunctions()

const submit = async (input) => {
  console.log(`INPUT: ${JSON.stringify(input)}`)
  const url = `${API_ENDPOINT}/create`

  const res = await request.post(url)
    .set('Content-Type', 'application/json')
    .send(input)

  if (!res.ok) {
    console.error(`Error calling ${url}, details: ${JSON.stringify(res.error)}`)
  }
  console.log('Lambda function executed')
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'ok'
    })
  }
}

const startExec = async (event) => {
  console.log(`INPUT event: ${JSON.stringify(event)}`)
  console.log(`STATEMACHINE ARN: ${JSON.stringify(STATE_MACHINE_ARN)}`)

  const body = JSON.parse(event.body)

  const params = {
    stateMachineArn: STATE_MACHINE_ARN,
    input: JSON.stringify(body.input),
    name: body.name
  }

  try {
    await stepFunction.startExecution(params).promise()
  } catch (err) {
    console.error(`Error: ${JSON.stringify(err)}`)
    return {
      statusCode: err.statusCode,
      body: JSON.stringify({
        message: err.message
      })
    }
  }

  console.log('Lambda function executed')

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'ok'
    })
  }
}

module.exports = {
  submit,
  startExec
}
