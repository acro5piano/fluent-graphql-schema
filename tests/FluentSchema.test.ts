import test from 'ava'
import path from 'path'
import { createFluentSchema } from '../src'
import { db } from './fixtures'
import { gql } from './utils'

interface Context {
  reqId: string
}

test('FluentSchema', async ({ snapshot }) => {
  const fluentSchema = createFluentSchema<Context>()
  const { type } = fluentSchema

  type('User', (t) => ({
    id: t('ID!'),
    name: t('String'),
    posts: t('[Post!]!').resolver((user) => db.postsByUserId(user.id)),
  }))

  type('Post', (t) => ({
    id: t('ID!'),
    title: t('String!'),
    userId: t('String!').resolver(() => 'a'),
    user: t('User!').resolver((source) => {
      return db.userById(source.userId)
    }),
  }))

  type('Query', (t) => ({
    users: t('[User!]!').resolver(() => db.users()),
    user: t('User')
      .args({ name: t('String') })
      .resolver(async (...params) => {
        const [, args] = params
        return db.userByName(args.name)
      }),
  }))

  fluentSchema.makeExecutableSchema()

  await fluentSchema.emitTsSchema(
    path.resolve(__dirname, '__generated__/fluent-graphql-schema.ts'),
    {
      moduleName: '../../src',
    },
  )

  snapshot(fluentSchema.printGraphQLSchema())

  await fluentSchema
    .graphql(
      gql`
        query {
          users {
            id
            name
            posts {
              id
              title
              user {
                id
                name
              }
            }
          }
        }
      `,
    )
    .then(snapshot)

  await fluentSchema
    .graphql(
      gql`
        query {
          invalidQuery
        }
      `,
    )
    .then(snapshot)
})
