# Install Pokeshop with K8s Manifests

1. [Get your Tracetest API key and env id](https://app.tracetest.io/retrieve-token)
2. Add your API key and env id in the `tracetest-agent.yaml`
3. Apply all resources

    ```bash
    kubectl apply -f .
    ```
4. Create and run a test by going to [`app.tracetest.io`](https://app.tracetest.io) and using the internal Kubernetes service networking:

    - **POST** `http://api.default.svc.cluster.local:8081/pokemon/import` - Body: `{ "id": 1 }`
    - **GET** `http://api.default.svc.cluster.local:8081/pokemon`

    ![](https://res.cloudinary.com/djwdcmwdz/image/upload/v1724764008/docs/app.tracetest.io_organizations_ttorg_e66318ba6544b856_environments_ttenv_4b0e8945dbe5045a_test_tTFZ453Ig_run_9_selectedSpan_bb8ba205b42a8619_nylqid.png)

5. View the trace and create test specs by going to the `Test` tab.

    ![](https://res.cloudinary.com/djwdcmwdz/image/upload/v1724764098/docs/app.tracetest.io_organizations_ttorg_e66318ba6544b856_environments_ttenv_4b0e8945dbe5045a_test_tTFZ453Ig_run_9_selectedSpan_bb8ba205b42a8619_1_xaxlbi.png)