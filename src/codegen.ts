export const baseSchemaCode = `// eslint-disable

export type Maybe<T> = T | null | undefined | void`

export function gqlTypeToTsType(gqlType: string) {
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
