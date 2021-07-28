import { GraphQLResolveInfo } from 'graphql'

export type ResolverFn<TResult, TSource, TArgs, TContext> = (
  source: TSource,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>

export type Maybe<T> = T | undefined | null | void
