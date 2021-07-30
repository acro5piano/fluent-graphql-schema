import type { ResolverFn, JsType } from './types'
import {
  GraphQLArgumentConfig,
  GraphQLString,
  GraphQLOutputType,
} from 'graphql'
import { keys, gqlStringTypeToGraphQLType } from './utils'

export class FieldConfig<TResult, TSource, TArgs, TContext> {
  constructor(
    public resultTypeName: string,
    public sourceTypeName: string,
    public _args: TArgs,
  ) {}

  resolve?: ResolverFn<TResult, TSource, Plain<TArgs>, TContext>

  resolver(resolve: ResolverFn<TResult, TSource, Plain<TArgs>, TContext>) {
    this.resolve = resolve
    return this
  }

  args<T extends JsType>(args: T) {
    return new FieldConfig<TResult, TSource, T, TContext>(
      this.resultTypeName,
      this.sourceTypeName,
      args,
    )
  }

  getGraphQLArgs(typeMap: Map<string, GraphQLOutputType>) {
    if (!this._args) {
      return {}
    }
    return keys(this._args).reduce((args, key) => {
      const argType = this._args[key]
      return {
        ...args,
        [key]: {
          // @ts-ignore: later, add type to TArgs
          type: gqlStringTypeToGraphQLType(argType.resultTypeName, typeMap),
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
