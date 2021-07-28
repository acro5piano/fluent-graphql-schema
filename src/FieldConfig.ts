import type { ResolverFn } from './types'

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
