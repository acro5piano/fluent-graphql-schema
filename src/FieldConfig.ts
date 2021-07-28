import type { ResolverFn } from './types'
import type { FluentSchemaTypes } from './FluentSchema'

export class FieldConfig<TResult, TSource, TArgs, TContext> {
  constructor(public typeName: string) {}

  resolver(_fn: ResolverFn<TResult, TSource, TArgs, TContext>) {
    return this
  }

  args<T extends object>(_args: T) {
    return new FieldConfigWithArgs<TResult, TSource, Plain<T>, TContext>(
      this.typeName,
    )
  }
}

export class FieldConfigWithArgs<TResult, TSource, TArgs, TContext> {
  constructor(public typeName: string) {}

  resolver(_fn: ResolverFn<TResult, TSource, TArgs, TContext>) {
    return this
  }
}

type Plain<T> = {
  [key in keyof T]: T[key] extends FieldConfig<infer TResult, any, any, any>
    ? TResult
    : never
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
