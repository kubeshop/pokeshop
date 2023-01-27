# Installing

## Run it locally

To try it locally, you can use `docker-compose` to run the API, its Worker, and all its dependencies.

### Requirements
- [docker](https://www.docker.com/get-started/)
- [docker-compose](https://docs.docker.com/compose/install/)

### Steps

1. Clone the project
2. Go to the `api` folder inside the project folder
3. Execute `docker-compose up`

### Script

```$
git clone git@github.com:kubeshop/pokeshop.git
cd pokeshop/api
docker-compose up
```

## Run on a Kubernetes cluster

If you want to run this project on a real cluster, we provide a helm chart to install it. This installation doesn't create a jaeger instance for you, so you have to install it manually and set the `JAEGER_HOST` and `JAEGER_PORT` on the `env` section of the file `helm-chart/values.yml`.

### Requirements
1. [helm](https://helm.sh/)

### Steps
1. Clone the project
2. Go to the helm-chart folder inside the project folder
3. Execute `helm dependency update`
4. Update `JAEGER_HOST` and `JAEGER_PORT` on the file `helm-chart/values.yml` to reflect your cluster's jaeger instance
5. Execute `helm install -n demo -f values.yaml --create-namespace demo .`

> :warning: **This will create a namespace called "demo" on your cluster**. If you wish to change it, replace `-n demo` on step 5 with `-n <your-namespace>`.