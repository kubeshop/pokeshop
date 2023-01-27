# API overview

The primary goal of this API is not to provide functionality for its users, it was built to be used by the [Tracetest] team as an API to be used in our demo. It's secondary goal is to act as an example of how to instrument REST APIs using OpenTelemetry. So, if you want to understand how to instrument an API using OpenTelemetry, this API might be a good starting point.

## Endpoints
This section is reserved to explain how each endpoint work in a more general way.

> :warning: if you want to know more details about requests and responses of each endpoint, take a look at our [OpenAPI specification](https://github.com/kubeshop/pokeshop/blob/master/openapi/openapi.yaml).

### GET /pokemon

**Description**: Get a list of pokemons from the API

**Request**:
```js
// GET /pokemon?take=20&skip=0
```

Response:


```json
[
    {
        "id": 25,
        "name": "pikachu",
        "type": "electric",
        "imageUrl": "https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png",
        "isFeatured": true
    },
    {
        "id": 26,
        "name": "raichu",
        "type": "electric",
        "imageUrl": "https://assets.pokemon.com/assets/cms2/img/pokedex/full/026.png",
        "isFeatured": true
    }
]
```

**Flow**:

![Get pokemon flow](https://github.com/kubeshop/pokeshop/blob/master/docs/diagrams/api-get-pokemon.png?)

### POST /pokemon

**Description**: Create a new pokemon

**Request**:

```js
// POST /pokemon
```

```json
{
    "name": "meowth",
    "type": "normal",
    "imageUrl": "https://assets.pokemon.com/assets/cms2/img/pokedex/full/052.png",
    "isFeatured": true
}
```

Successful response:
```
// 201 Created
```

```json
{
    "id": 1000,
    "name": "meowth",
    "type": "normal",
    "imageUrl": "https://assets.pokemon.com/assets/cms2/img/pokedex/full/052.png",
    "isFeatured": true
}
```

> **Note**: the field `id` is automatically generated. It doesn't match the real id of the pokemon.

Failed response:
```
// 400 Bad Request
```

```json
{
    "errors": [
        {
            "property": "name",
            "constraints": [
                "name cannot be empty"
            ]
        },
        {
            "property": "type",
            "constraints": [
                "type cannot be empty"
            ]
        }
    ]
}
```

**Flow**:

![create pokemon flow](https://github.com/kubeshop/pokeshop/blob/master/docs/diagrams/api-create-pokemon.png?)

### POST /pokemon/import

**Description**: Import an existing pokemon from PokeAPI and inserts it into the database

**Request**:

> **Note**:This is import "Persian" into our API)
```js
// POST /pokemon/import
```

```json
{
    "id": 53
}
```

Successful response:


```json
{
    "id": 53
}
```

Failed response:

```json
{
    "errors": [
        {
            "property": "id",
            "constraints": [
                "id must be positive"
            ]
        }
    ]
}
```

**API Flow**:

![import pokemon flow on API](https://github.com/kubeshop/pokeshop/blob/master/docs/diagrams/api-import-pokemon.png?)

**Worker Flow**:

![import pokemon flow on worker](https://github.com/kubeshop/pokeshop/blob/master/docs/diagrams/worker-import-pokemon.png?)

