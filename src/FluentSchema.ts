import { FieldConfig } from './FieldConfig'
import { keys } from './utils'
import type { Maybe, Definite } from './types'
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

  type = <TSourceTypeName extends string>(
    sourceTypeName: TSourceTypeName,
    fn: (
      t: <TResultTypeName extends string>(
        typeName: TResultTypeName,
      ) => FieldConfig<
        GetJsTypeFromGraphQLType<TResultTypeName>,
        Definite<GetJsTypeFromGraphQLType<TSourceTypeName>>,
        {},
        TContext
      >,
    ) => any,
  ) => {
    const t = <TResultTypeName extends string>(
      resultTypeName: TResultTypeName,
    ) => {
      return new FieldConfig<
        GetJsTypeFromGraphQLType<TResultTypeName>,
        Definite<GetJsTypeFromGraphQLType<TSourceTypeName>>,
        {},
        TContext
      >(resultTypeName, sourceTypeName)
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
        code += `\n  ${key}: ${gqlTypeToTsType(config.resultTypeName)}`
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

const baseSchemaCode = `// eslint-disable

type Maybe<T> = T | null | undefined`

function gqlTypeToTsType(gqlType: string) {
  switch (gqlType) {
    case 'String!':
      return 'string'
    case 'String':
      return 'Maybe<string>'
    case 'ID!':
      return 'string' // TODO: specify IDType
    case 'ID':
      return 'Maybe<string>'
    default:
      const matchNonNullArray = gqlType.match(/\[(.+)\!]!$/)
      if (matchNonNullArray) {
        return `${matchNonNullArray[1]}[]`
      }
      const matchNullableArray = gqlType.match(/\[(.+)\!]$/)
      if (matchNullableArray) {
        return `Maybe<${matchNullableArray[1]}[]>`
      }
      const maybeMatchNullableArray = gqlType.match(/\[(.+)\]$/)
      if (maybeMatchNullableArray) {
        return `Maybe<Maybe<${maybeMatchNullableArray[1]}>[]>`
      }
      const nonNullableType = gqlType.match(/(.+)!$/)
      if (nonNullableType) {
        return `${nonNullableType[1]}`
      }
      return `Maybe<${gqlType}>`
  }
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
