import Tracetest from '@tracetest/client';
import { TestResource } from '@tracetest/client/dist/modules/openapi-client';
import { config } from 'dotenv';

config();

const { TRACETEST_API_TOKEN = '' } = process.env;
const [url = ''] = process.argv.slice(2);

const definition: TestResource = {
  type: 'Test',
  spec: {
    id: 'ZV1G3v2IR',
    name: 'Serverless: Import Pokemon',
    trigger: {
      type: 'http',
      httpRequest: {
        method: 'POST',
        url: '${var:ENDPOINT}/import',
        body: '{"id": ${var:POKEMON_ID}}\n',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    },
    specs: [
      // Validates the external service is called with the proper POKEMON_ID and returns 200
      {
        selector: 'span[tracetest.span.type="http" name="GET" http.method="GET"]',
        name: 'External API service should return 200',
        assertions: ['attr:http.status_code   =   200', 'attr:http.route  =  "/api/v2/pokemon/${var:POKEMON_ID}"'],
      },
      // Validates the duration of the DB operations is less than 100ms
      {
        selector: 'span[tracetest.span.type="database"]',
        name: 'All Database Spans: Processing time is less than 100ms',
        assertions: ['attr:tracetest.span.duration < 100ms'],
      },
      // Validates the response from the API Gateway is 200
      {
        selector: 'span[tracetest.span.type="general" name="Tracetest trigger"]',
        name: 'Initial request should return 200',
        assertions: ['attr:tracetest.response.status = 200'],
      },
    ],
  },
};

const main = async () => {
  if (!url)
    throw new Error(
      'The API Gateway URL is required as an argument. i.e: `npm test https://75yj353nn7.execute-api.us-east-1.amazonaws.com`'
    );

  const tracetest = await Tracetest(TRACETEST_API_TOKEN);

  const test = await tracetest.newTest(definition);
  await tracetest.runTest(test, {
    variables: [
      {
        key: 'ENDPOINT',
        value: `${url.trim()}/pokemon`,
      },
      {
        key: 'POKEMON_ID',
        value: `${Math.floor(Math.random() * 100) + 1}`,
      },
    ],
  });
  console.log(await tracetest.getSummary());
};

main();
