import { Http, Tracetest } from 'k6/x/tracetest';
import { sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '5s',
  teardownTimeout: '2m',
};

const POKESHOP_DEMO_URL = __ENV.POKESHOP_DEMO_URL || 'http://localhost:8081';

const http = new Http();
const tracetest = Tracetest();

export default function () {
  const url = `${POKESHOP_DEMO_URL}/pokemon`;
  const payload = JSON.stringify({
    name: 'charizard',
    type: 'flying',
    imageUrl: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/006.png',
    isFeatured: false,
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const definition = `type: Test
spec:
  id: k6-tracetest-pokeshop-add-pokemon
  name: "K6 - Add a Pokemon"
  trigger:
    type: k6
  specs:
  - selector: span[tracetest.span.type="http" name="POST /pokemon" http.method="POST"]
    name: The POST /pokemon was called correctly
    assertions:
    - attr:http.status_code = 201
  - selector: span[tracetest.span.type="general" name="validate request"]
    name: The request sent to API is valid
    assertions:
    - attr:validation.is_valid = "true"
  - selector: span[tracetest.span.type="database" name="create pokeshop.pokemon" db.system="postgres" db.name="pokeshop" db.user="ashketchum" db.operation="create" db.sql.table="pokemon"]
    name: A Pokemon was inserted on database
    assertions:
    - attr:db.result | json_path '$.imageUrl'  =  "https://assets.pokemon.com/assets/cms2/img/pokedex/full/006.png"
`;

  const response = http.post(url, payload, params);

  tracetest.runTest(
    response.trace_id,
    {
      definition,
      should_wait: true,
    },
    {
      url,
      method: 'GET',
    }
  );

  sleep(1);
}

export function handleSummary() {
  return {
    stdout: tracetest.summary(),
  };
}

export function teardown() {
  tracetest.validateResult();
}
