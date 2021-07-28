import test from 'ava'
import path from 'path'
import { createFluentSchema } from '../src'

interface Context {
  reqId: string
}

test('FluentSchema', async ({ truthy, is }) => {
  const fluentSchema = createFluentSchema<Context>()
  const { type } = fluentSchema

  type('User', (t) => ({
    id: t('ID!'),
    name: t('String'),
    posts: t('[Post!]!'),
  }))

  type('Post', (t) => ({
    id: t('ID!'),
    title: t('String!'),
    userId: t('String!').resolver(() => 'a'),
    user: t('User!').resolver(async (...params) => {
      const [source] = params
      return {
        id: source.userId,
        posts: [],
      }
    }),
  }))

  type('Query', (t) => ({
    users: t('[User!]!')
      .args({ name: t('String') })
      .resolver(async (...params) => {
        const [_source, args, ctx] = params
        ctx.reqId
        return [
          {
            id: '1',
            name: args.name || 'no name',
          },
        ]
      }),
    user: t('User')
      .args({ name: t('String') })
      .resolver(async (...params) => {
        const [, args] = params
        args.name
        return null
      }),
  }))

  truthy(fluentSchema)
  is(fluentSchema.makeExecutableSchema(), undefined)

  await fluentSchema.emitTsSchema(
    path.resolve(__dirname, '__generated__/fluent-graphql-schema.ts'),
    {
      moduleName: '../../src',
    },
  )
})
