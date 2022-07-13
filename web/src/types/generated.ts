/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/pokemon": {
    /** Get a paginated list of existing pokemons in the API */
    get: operations["getPokemons"];
    /** Create a new pokemon */
    post: operations["createPokemon"];
  };
  "/pokemon/featured": {
    /** Get a list of all pokemons featured in the show */
    get: operations["getFeaturedPokemons"];
  };
  "/pokemon/{id}": {
    /** delete the pokemon identified by the provided id */
    delete: operations["deletePokemon"];
    /** updates the pokemon identified by the provided id */
    patch: operations["updatePokemon"];
  };
  "/pokemon/import": {
    /** Import an existing pokemon from pokeapi.co */
    post: operations["importPokemon"];
  };
  "/pokemon/search": {
    /** search pokemons that their names contain the search term */
    get: operations["searchPokemons"];
  };
  "/pokemon/healthcheck": {
    /** validate if the api is working properly and can connect to all its dependencies */
    get: {
      responses: {
        /** successful operation */
        200: {
          content: {
            "application/json": components["schemas"]["HealthcheckResponse"];
          };
        };
        /** some required dependency is not available */
        500: {
          content: {
            "application/json": components["schemas"]["HealthcheckResponse"];
          };
        };
      };
    };
  };
}

export interface components {
  schemas: {
    Pokemon: {
      /** @description ID */
      id?: number;
      /**
       * @description Pokemon name
       * @example charmeleon
       */
      name?: string;
      /**
       * @description List of types of this specific pokemon separated by comma
       * @example fire
       */
      type?: string;
      /** @description Indicates if the pokemon was featured on the show */
      isFeatured?: boolean;
      /** @description URL for the image of the pokemon */
      imageUrl?: string;
    };
    CreatePokemonRequest: {
      /**
       * @description Pokemon name
       * @example charmeleon
       */
      name: string;
      /**
       * @description List of types of this specific pokemon separated by comma
       * @example fire
       */
      type: string;
      /**
       * @description Indicates if the pokemon was featured on the show
       * @example true
       */
      isFeatured: boolean;
      /**
       * @description URL for the image of the pokemon
       * @example https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png
       */
      imageUrl: string;
    };
    UpdatePokemonRequest: {
      /**
       * @description Pokemon name
       * @example charmeleon
       */
      name?: string;
      /**
       * @description List of types of this specific pokemon separated by comma
       * @example fire
       */
      type?: string;
      /**
       * @description Indicates if the pokemon was featured on the show
       * @example true
       */
      isFeatured?: boolean;
      /**
       * @description URL for the image of the pokemon
       * @example https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png
       */
      imageUrl?: string;
    };
    ImportPokemonRequest: {
      /**
       * @description Pokemon id
       * @example 52
       */
      id: number;
    };
    ImportPokemonResponse: {
      /** @description Pokemon id */
      id?: number;
    };
    HealthcheckResponse: {
      /** @description cache system is online and is accessible from the API */
      cache?: boolean;
      /** @description queue system is online and is accessible from the API */
      queue?: boolean;
      /** @description database system is online and is accessible from the API */
      database?: boolean;
    };
    InvalidRequest: {
      /** @description list of errors in the request validation */
      errors?: components["schemas"]["ValidationError"][];
    };
    ValidationError: {
      /** @description field that contains an invalid value */
      property?: string;
      /** @description array containing all reasons the validation failed */
      constraints?: string[];
    };
  };
}

export interface operations {
  /** Get a paginated list of existing pokemons in the API */
  getPokemons: {
    parameters: {
      query: {
        /** how many pokemons to skip */
        skip?: number;
        /** maximum number of pokemons to be returned */
        take?: number;
      };
    };
    responses: {
      /** successful operation */
      200: {
        content: {
          "application/json": components["schemas"]["Pokemon"][];
        };
      };
    };
  };
  /** Create a new pokemon */
  createPokemon: {
    responses: {
      /** successful operation */
      201: {
        content: {
          "application/json": components["schemas"]["Pokemon"];
        };
      };
      /** invalid request */
      400: {
        content: {
          "application/json": components["schemas"]["InvalidRequest"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CreatePokemonRequest"];
      };
    };
  };
  /** Get a list of all pokemons featured in the show */
  getFeaturedPokemons: {
    responses: {
      /** successful operation */
      200: {
        content: {
          "application/json": components["schemas"]["Pokemon"][];
        };
      };
    };
  };
  /** delete the pokemon identified by the provided id */
  deletePokemon: {
    parameters: {
      path: {
        /** id of the pokemon that will be deleted */
        id: number;
      };
    };
    responses: {
      /** successful operation */
      200: {
        content: {
          "application/json": components["schemas"]["Pokemon"];
        };
      };
      /** specified pokemon doesn't exist */
      404: unknown;
    };
  };
  /** updates the pokemon identified by the provided id */
  updatePokemon: {
    parameters: {
      path: {
        /** id of the pokemon that will be updated */
        id: number;
      };
    };
    responses: {
      /** successful operation */
      200: {
        content: {
          "application/json": components["schemas"]["Pokemon"];
        };
      };
      /** invalid request */
      400: {
        content: {
          "application/json": components["schemas"]["InvalidRequest"];
        };
      };
      /** specified pokemon doesn't exist */
      404: unknown;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["UpdatePokemonRequest"];
      };
    };
  };
  /** Import an existing pokemon from pokeapi.co */
  importPokemon: {
    responses: {
      /** successful operation */
      200: {
        content: {
          "application/json": components["schemas"]["ImportPokemonResponse"];
        };
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["ImportPokemonRequest"];
      };
    };
  };
  /** search pokemons that their names contain the search term */
  searchPokemons: {
    parameters: {
      query: {
        /** search term */
        s?: string;
      };
    };
    responses: {
      /** successful operation */
      200: {
        content: {
          "application/json": components["schemas"]["Pokemon"][];
        };
      };
    };
  };
}

export interface external {}