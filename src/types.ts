import { GraphQLResolveInfo } from 'graphql'
import type { PickByValue, OmitByValue } from 'utility-types'

export type ResolverFn<TResult, TSource, TArgs, TContext> = (
  source: TSource,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>

export type Maybe<T> = T | undefined | null | void
export type Definite<T> = T extends undefined | null | void ? never : T

export type JsScalar = string | number | boolean | undefined | null

// If Array type, recursively apply it.
// If object type, pick scalar values from the object and make rest parameters optional.
// Else, return given type itself.
export type PlainResolvableObject<T> = T extends Array<infer E>
  ? Array<PlainResolvableObject<E>>
  : T extends object
  ? PickByValue<T, JsScalar> & Partial<OmitByValue<T, JsScalar>>
  : T
