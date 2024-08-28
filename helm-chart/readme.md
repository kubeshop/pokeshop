# Install Pokeshop with Helm

1. Execute `helm dependency update`
2. Execute `helm install -f ./values.yaml pokeshop .`
3. [Get your Tracetest API key and env id](https://app.tracetest.io/retrieve-token)
4. Execute

    ```bash
    helm repo add tracetestcloud https://kubeshop.github.io/tracetest-cloud-charts --force-update && helm install agent tracetestcloud/tracetest-agent --set agent.apiKey=<TRACETEST_API_KEY> --set agent.environmentId=<TRACETEST_ENVIRONMENT_ID>
    ```

5. Create and run a test by going to [`app.tracetest.io`](https://app.tracetest.io) and using the internal Kubernetes service networking:

    - **POST** `http://pokeshop-pokemon-api.default.svc.cluster.local:8081/pokemon/import` - Body: `{ "id": 1 }`
    - **GET** `http://pokeshop-pokemon-api.default.svc.cluster.local:8081/pokemon`

    ![](https://res.cloudinary.com/djwdcmwdz/image/upload/v1724764008/docs/app.tracetest.io_organizations_ttorg_e66318ba6544b856_environments_ttenv_4b0e8945dbe5045a_test_tTFZ453Ig_run_9_selectedSpan_bb8ba205b42a8619_nylqid.png)
