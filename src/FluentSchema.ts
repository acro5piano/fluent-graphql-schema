import { FieldConfig } from './FieldConfig'

export interface FluentSchemaTypes {}

export function createFluentSchema<TContext>() {
  return new FluentSchema<TContext>()
}

export class FluentSchema<TContext> {
  t = <TResultTypeName extends string, TSourceTypeName>(
    typeName: TResultTypeName,
  ) => {
    return new FieldConfig<
      GetJsTypeFromGraphQLType<TResultTypeName>,
      TSourceTypeName,
      {},
      TContext
    >(typeName)
  }

  type: any = () => {}

  makeExecutableSchema: any = () => {}
}

type GetJsTypeFromGraphQLType<T> = T extends 'String!'
  ? string
  : T extends 'String'
  ? Maybe<string>
  : T extends 'String!'
  ? string
  : T extends 'Int'
  ? Maybe<number>
  : T extends 'Int!'
  ? number
  : T extends string
  ? T extends keyof FluentSchemaTypes
    ? Maybe<FluentSchemaTypes[T]>
    : T extends `[${infer TElm}!]!`
    ? TElm extends keyof FluentSchemaTypes
      ? Array<FluentSchemaTypes[TElm]>
      : never
    : T extends `[${infer TElm}]!`
    ? TElm extends keyof FluentSchemaTypes
      ? Array<Maybe<FluentSchemaTypes[TElm]>>
      : never
    : T extends `[${infer TElm}!]`
    ? TElm extends keyof FluentSchemaTypes
      ? Maybe<Array<FluentSchemaTypes[TElm]>>
      : never
    : T extends `[${infer TElm}]`
    ? TElm extends keyof FluentSchemaTypes
      ? Maybe<Array<Maybe<FluentSchemaTypes[TElm]>>>
      : never
    : T extends `${infer TNonNull}!`
    ? TNonNull extends keyof FluentSchemaTypes
      ? FluentSchemaTypes[TNonNull]
      : never
    : never
  : never

type Maybe<T> = T | undefined | null | void
