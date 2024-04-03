import { Http, Tracetest } from 'k6/x/tracetest';
import { sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '5s',
};

const POKESHOP_DEMO_URL = __ENV.POKESHOP_DEMO_URL || 'http://localhost:8081';

const http = new Http();
const tracetest = Tracetest();

let pokemonId = 6; // charizard

export default function () {
  const url = `${POKESHOP_DEMO_URL}/pokemon/import`;
  const payload = JSON.stringify({
    id: pokemonId++,
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const definition = `type: Test
spec:
  id: k6-tracetest-pokeshop-import-pokemon
  name: K6
  description: K6
  trigger:
    type: k6
  specs:
    - selector: span[tracetest.span.type="general" name="import pokemon"]
      name: Should have imported the pokemon
      assertions:
        - attr:tracetest.selected_spans.count = 1
    - selector: |-
        span[tracetest.span.type="http" net.peer.name="pokeapi.co" http.method="GET"]
      name: Should trigger a request to the POKEAPI
      assertions:
        - attr:http.url   =  "https://pokeapi.co/api/v2/pokemon/${pokemonId}"
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
