import {
  GraphQLString,
  GraphQLID,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLList,
  GraphQLOutputType,
} from 'graphql'

export function keys<T>(obj: T): Array<keyof T> {
  return Object.keys(obj) as any
}

export function gqlStringTypeToGraphQLType(
  gqlType: string,
  graphqlTypeMap: Map<string, GraphQLOutputType>,
) {
  function getType([, typeName]: string[]) {
    if (!typeName) {
      throw new Error(`invalid type name`)
    }
    const type = graphqlTypeMap.get(typeName)
    if (!type) {
      throw new Error(`Cannot get type: ${typeName}`)
    }
    return type
  }
  switch (gqlType) {
    case 'Boolean!':
      return new GraphQLNonNull(GraphQLBoolean)
    case 'Boolean':
      return GraphQLBoolean
    case 'String!':
      return new GraphQLNonNull(GraphQLString)
    case 'String':
      return GraphQLString
    case 'ID!':
      return new GraphQLNonNull(GraphQLID)
    case 'ID':
      return GraphQLID
    default:
      const matchNonNullArray = gqlType.match(/\[(.+)\!]!$/)
      if (matchNonNullArray) {
        return new GraphQLNonNull(
          new GraphQLList(new GraphQLNonNull(getType(matchNonNullArray))),
        )
      }
      const matchNullableArray = gqlType.match(/\[(.+)\!]$/)
      if (matchNullableArray) {
        return new GraphQLList(getType(matchNullableArray))
      }
      const maybeMatchNullableArray = gqlType.match(/\[(.+)\]$/)
      if (maybeMatchNullableArray) {
        return new GraphQLList(getType(maybeMatchNullableArray))
      }
      const nonNullableType = gqlType.match(/(.+)!$/)
      if (nonNullableType) {
        return new GraphQLNonNull(getType(nonNullableType))
      }
      return graphqlTypeMap.get(gqlType)!
  }
}
