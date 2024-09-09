/* eslint-disable */
import {
  CallOptions,
  ChannelCredentials,
  Client,
  ClientOptions,
  ClientUnaryCall,
  handleUnaryCall,
  makeGenericClientConstructor,
  Metadata,
  ServiceError,
  UntypedServiceImplementation,
} from "@grpc/grpc-js";
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "pokeshop";

export interface ImportPokemonRequest {
  id: number;
  isFixed?: boolean | undefined;
  ignoreCache?: boolean | undefined;
}

export interface GetPokemonRequest {
  skip?: number | undefined;
  take?: number | undefined;
  isFixed?: boolean | undefined;
}

export interface GetPokemonListResponse {
  items: Pokemon[];
  totalCount: number;
}

export interface Pokemon {
  id?: number | undefined;
  name: string;
  type: string;
  isFeatured: boolean;
  imageUrl?: string | undefined;
}

function createBaseImportPokemonRequest(): ImportPokemonRequest {
  return { id: 0, isFixed: undefined };
}

export const ImportPokemonRequest = {
  encode(message: ImportPokemonRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== 0) {
      writer.uint32(8).int32(message.id);
    }
    if (message.isFixed !== undefined) {
      writer.uint32(16).bool(message.isFixed);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ImportPokemonRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseImportPokemonRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.isFixed = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ImportPokemonRequest {
    return {
      id: isSet(object.id) ? Number(object.id) : 0,
      isFixed: isSet(object.isFixed) ? Boolean(object.isFixed) : undefined,
    };
  },

  toJSON(message: ImportPokemonRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    message.isFixed !== undefined && (obj.isFixed = message.isFixed);
    return obj;
  },

  create<I extends Exact<DeepPartial<ImportPokemonRequest>, I>>(base?: I): ImportPokemonRequest {
    return ImportPokemonRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ImportPokemonRequest>, I>>(object: I): ImportPokemonRequest {
    const message = createBaseImportPokemonRequest();
    message.id = object.id ?? 0;
    message.isFixed = object.isFixed ?? undefined;
    return message;
  },
};

function createBaseGetPokemonRequest(): GetPokemonRequest {
  return { skip: undefined, take: undefined, isFixed: undefined };
}

export const GetPokemonRequest = {
  encode(message: GetPokemonRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.skip !== undefined) {
      writer.uint32(8).int32(message.skip);
    }
    if (message.take !== undefined) {
      writer.uint32(16).int32(message.take);
    }
    if (message.isFixed !== undefined) {
      writer.uint32(24).bool(message.isFixed);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetPokemonRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetPokemonRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.skip = reader.int32();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.take = reader.int32();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.isFixed = reader.bool();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetPokemonRequest {
    return {
      skip: isSet(object.skip) ? Number(object.skip) : undefined,
      take: isSet(object.take) ? Number(object.take) : undefined,
      isFixed: isSet(object.isFixed) ? Boolean(object.isFixed) : undefined,
    };
  },

  toJSON(message: GetPokemonRequest): unknown {
    const obj: any = {};
    message.skip !== undefined && (obj.skip = Math.round(message.skip));
    message.take !== undefined && (obj.take = Math.round(message.take));
    message.isFixed !== undefined && (obj.isFixed = message.isFixed);
    return obj;
  },

  create<I extends Exact<DeepPartial<GetPokemonRequest>, I>>(base?: I): GetPokemonRequest {
    return GetPokemonRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GetPokemonRequest>, I>>(object: I): GetPokemonRequest {
    const message = createBaseGetPokemonRequest();
    message.skip = object.skip ?? undefined;
    message.take = object.take ?? undefined;
    message.isFixed = object.isFixed ?? undefined;
    return message;
  },
};

function createBaseGetPokemonListResponse(): GetPokemonListResponse {
  return { items: [], totalCount: 0 };
}

export const GetPokemonListResponse = {
  encode(message: GetPokemonListResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.items) {
      Pokemon.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.totalCount !== 0) {
      writer.uint32(16).int32(message.totalCount);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetPokemonListResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetPokemonListResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.items.push(Pokemon.decode(reader, reader.uint32()));
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.totalCount = reader.int32();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): GetPokemonListResponse {
    return {
      items: Array.isArray(object?.items) ? object.items.map((e: any) => Pokemon.fromJSON(e)) : [],
      totalCount: isSet(object.totalCount) ? Number(object.totalCount) : 0,
    };
  },

  toJSON(message: GetPokemonListResponse): unknown {
    const obj: any = {};
    if (message.items) {
      obj.items = message.items.map((e) => e ? Pokemon.toJSON(e) : undefined);
    } else {
      obj.items = [];
    }
    message.totalCount !== undefined && (obj.totalCount = Math.round(message.totalCount));
    return obj;
  },

  create<I extends Exact<DeepPartial<GetPokemonListResponse>, I>>(base?: I): GetPokemonListResponse {
    return GetPokemonListResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<GetPokemonListResponse>, I>>(object: I): GetPokemonListResponse {
    const message = createBaseGetPokemonListResponse();
    message.items = object.items?.map((e) => Pokemon.fromPartial(e)) || [];
    message.totalCount = object.totalCount ?? 0;
    return message;
  },
};

function createBasePokemon(): Pokemon {
  return { id: undefined, name: "", type: "", isFeatured: false, imageUrl: undefined };
}

export const Pokemon = {
  encode(message: Pokemon, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== undefined) {
      writer.uint32(8).int32(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.type !== "") {
      writer.uint32(26).string(message.type);
    }
    if (message.isFeatured === true) {
      writer.uint32(32).bool(message.isFeatured);
    }
    if (message.imageUrl !== undefined) {
      writer.uint32(42).string(message.imageUrl);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Pokemon {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePokemon();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.id = reader.int32();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.type = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.isFeatured = reader.bool();
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.imageUrl = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Pokemon {
    return {
      id: isSet(object.id) ? Number(object.id) : undefined,
      name: isSet(object.name) ? String(object.name) : "",
      type: isSet(object.type) ? String(object.type) : "",
      isFeatured: isSet(object.isFeatured) ? Boolean(object.isFeatured) : false,
      imageUrl: isSet(object.imageUrl) ? String(object.imageUrl) : undefined,
    };
  },

  toJSON(message: Pokemon): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = Math.round(message.id));
    message.name !== undefined && (obj.name = message.name);
    message.type !== undefined && (obj.type = message.type);
    message.isFeatured !== undefined && (obj.isFeatured = message.isFeatured);
    message.imageUrl !== undefined && (obj.imageUrl = message.imageUrl);
    return obj;
  },

  create<I extends Exact<DeepPartial<Pokemon>, I>>(base?: I): Pokemon {
    return Pokemon.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Pokemon>, I>>(object: I): Pokemon {
    const message = createBasePokemon();
    message.id = object.id ?? undefined;
    message.name = object.name ?? "";
    message.type = object.type ?? "";
    message.isFeatured = object.isFeatured ?? false;
    message.imageUrl = object.imageUrl ?? undefined;
    return message;
  },
};

export type PokeshopService = typeof PokeshopService;
export const PokeshopService = {
  getPokemonList: {
    path: "/pokeshop.Pokeshop/getPokemonList",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: GetPokemonRequest) => Buffer.from(GetPokemonRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => GetPokemonRequest.decode(value),
    responseSerialize: (value: GetPokemonListResponse) => Buffer.from(GetPokemonListResponse.encode(value).finish()),
    responseDeserialize: (value: Buffer) => GetPokemonListResponse.decode(value),
  },
  createPokemon: {
    path: "/pokeshop.Pokeshop/createPokemon",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: Pokemon) => Buffer.from(Pokemon.encode(value).finish()),
    requestDeserialize: (value: Buffer) => Pokemon.decode(value),
    responseSerialize: (value: Pokemon) => Buffer.from(Pokemon.encode(value).finish()),
    responseDeserialize: (value: Buffer) => Pokemon.decode(value),
  },
  importPokemon: {
    path: "/pokeshop.Pokeshop/importPokemon",
    requestStream: false,
    responseStream: false,
    requestSerialize: (value: ImportPokemonRequest) => Buffer.from(ImportPokemonRequest.encode(value).finish()),
    requestDeserialize: (value: Buffer) => ImportPokemonRequest.decode(value),
    responseSerialize: (value: ImportPokemonRequest) => Buffer.from(ImportPokemonRequest.encode(value).finish()),
    responseDeserialize: (value: Buffer) => ImportPokemonRequest.decode(value),
  },
} as const;

export interface PokeshopServer extends UntypedServiceImplementation {
  getPokemonList: handleUnaryCall<GetPokemonRequest, GetPokemonListResponse>;
  createPokemon: handleUnaryCall<Pokemon, Pokemon>;
  importPokemon: handleUnaryCall<ImportPokemonRequest, ImportPokemonRequest>;
}

export interface PokeshopClient extends Client {
  getPokemonList(
    request: GetPokemonRequest,
    callback: (error: ServiceError | null, response: GetPokemonListResponse) => void,
  ): ClientUnaryCall;
  getPokemonList(
    request: GetPokemonRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: GetPokemonListResponse) => void,
  ): ClientUnaryCall;
  getPokemonList(
    request: GetPokemonRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: GetPokemonListResponse) => void,
  ): ClientUnaryCall;
  createPokemon(request: Pokemon, callback: (error: ServiceError | null, response: Pokemon) => void): ClientUnaryCall;
  createPokemon(
    request: Pokemon,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: Pokemon) => void,
  ): ClientUnaryCall;
  createPokemon(
    request: Pokemon,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: Pokemon) => void,
  ): ClientUnaryCall;
  importPokemon(
    request: ImportPokemonRequest,
    callback: (error: ServiceError | null, response: ImportPokemonRequest) => void,
  ): ClientUnaryCall;
  importPokemon(
    request: ImportPokemonRequest,
    metadata: Metadata,
    callback: (error: ServiceError | null, response: ImportPokemonRequest) => void,
  ): ClientUnaryCall;
  importPokemon(
    request: ImportPokemonRequest,
    metadata: Metadata,
    options: Partial<CallOptions>,
    callback: (error: ServiceError | null, response: ImportPokemonRequest) => void,
  ): ClientUnaryCall;
}

export const PokeshopClient = makeGenericClientConstructor(PokeshopService, "pokeshop.Pokeshop") as unknown as {
  new (address: string, credentials: ChannelCredentials, options?: Partial<ClientOptions>): PokeshopClient;
  service: typeof PokeshopService;
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
