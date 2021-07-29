import { FieldConfig } from './FieldConfig'
import { keys } from './utils'
import type { Maybe, Definite, PlainResolvableObject } from './types'
import { baseSchemaCode, gqlTypeToTsType } from './codegen'
import fs from 'fs/promises'

export interface FluentSchemaTypes {}

export function createFluentSchema<TContext>() {
  return new FluentSchema<TContext>()
}

export interface EmitTsSchemaOption {
  moduleName?: string
}

export class FluentSchema<TContext> {
  private jsTypeMap = new Map<
    string,
    Record<string, FieldConfig<any, any, any, any>>
  >()

  type = <TSourceTypeName extends TypeNameInSchema>(
    sourceTypeName: TSourceTypeName,
    fn: (
      t: <TResultTypeName extends TypeNameInSchema>(
        typeName: TResultTypeName,
      ) => FieldConfig<
        PlainResolvableObject<GetJsTypeFromGraphQLType<TResultTypeName>>,
        Definite<GetJsTypeFromGraphQLType<TSourceTypeName>>,
        {},
        TContext
      >,
    ) => any,
  ) => {
    const t = <TResultTypeName extends TypeNameInSchema>(
      resultTypeName: TResultTypeName,
    ) => {
      return new FieldConfig<unknown, any, {}, TContext>(
        resultTypeName,
        sourceTypeName,
      )
    }
    const a = fn(t)
    this.jsTypeMap.set(sourceTypeName, a)
  }

  makeExecutableSchema() {}

  async emitTsSchema(path: string, options: EmitTsSchemaOption = {}) {
    await fs.writeFile(path, this.toTsSchema(options), 'utf8')
  }

  private toTsSchema({
    moduleName = 'fluent-graphql-schema',
  }: EmitTsSchemaOption) {
    let code = baseSchemaCode
    const queue: Array<() => void> = []
    this.jsTypeMap.forEach((fieldConfig, typeName) => {
      code += `\n\nexport interface ${typeName} {`
      keys(fieldConfig).forEach((key) => {
        const config = fieldConfig[key]!
        const tsType = gqlTypeToTsType(config.resultTypeName)
        const mark = tsType.includes('Maybe') ? '?' : ''
        code += `\n  ${key}${mark}: ${gqlTypeToTsType(config.resultTypeName)}`
      })
      code += `\n}`
      queue.push(() => {
        code += `\n    ${typeName}: ${typeName}`
      })
    })
    code += `\n\ndeclare module '${moduleName}' {\n  interface FluentSchemaTypes {`
    queue.forEach((fn) => fn())
    code += `\n  }\n}\n`
    return code
  }
}

type TypeNameInSchema =
  | 'ID'
  | 'ID!'
  | 'Boolean'
  | 'Boolean!'
  | 'String'
  | 'String!'
  | 'Int'
  | 'Int!'
  | 'Float'
  | 'Float!'
  | keyof FluentSchemaTypes
  | MatrixGraphQLTypeString<keyof FluentSchemaTypes>

type MatrixGraphQLTypeString<T extends string> =
  | T
  | `${T}!`
  | `[${T}]`
  | `[${T}!]`
  | `[${T}!]!`

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
