import type { ResolverFn, JsType } from './types'
import { GraphQLArgumentConfig, GraphQLString } from 'graphql'
import { keys } from './utils'

export class FieldConfig<TResult, TSource, TArgs, TContext> {
  constructor(public resultTypeName: string, public sourceTypeName: string) {}

  resolve?: ResolverFn<TResult, TSource, TArgs, TContext>

  resolver(resolve: ResolverFn<TResult, TSource, TArgs, TContext>) {
    this.resolve = resolve
    return this
  }

  args<T extends JsType>(args: T) {
    return new FieldConfigWithArgs<TResult, TSource, T, TContext>(
      this.resultTypeName,
      this.sourceTypeName,
      args,
    )
  }

  getGraphQLArgs() {
    return {}
  }
}

export class FieldConfigWithArgs<TResult, TSource, TArgs, TContext> {
  constructor(
    public resultTypeName: string,
    public sourceTypeName: string,
    public args: TArgs,
  ) {}

  resolve?: ResolverFn<TResult, TSource, Plain<TArgs>, TContext>

  resolver(resolve: ResolverFn<TResult, TSource, Plain<TArgs>, TContext>) {
    this.resolve = resolve
    return this
  }

  getGraphQLArgs() {
    return keys(this.args).reduce((args, key) => {
      return {
        ...args,
        [key]: {
          type: GraphQLString,
        },
      }
    }, {} as GraphQLArgumentConfig)
  }
}

type Plain<T> = {
  [key in keyof T]: T[key] extends FieldConfig<infer TResult, any, any, any>
    ? TResult
    : never
}
