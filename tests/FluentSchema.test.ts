import test from 'ava'
import { createFluentSchema } from '../src'

interface Context {
  reqId: string
}

test('FluentSchema', async ({ truthy, is }) => {
  const fluentSchema = createFluentSchema<Context>()
  const { type, t } = fluentSchema

  type('User', {
    id: t('ID!'),
    name: t('String!'),
    posts: t('[Post!]!'),
  })

  type('Post', {
    id: t('ID!'),
    title: t('String!'),
    userId: t('String!'),
    user: t('User!').resolver((...params) => {
      const [source] = params
      return {
        id: source.userId,
        name: 'f',
      }
    }),
  })

  type('Query', {
    users: t('[User!]!')
      .args({ name: t('String') })
      .resolver(async (...params) => {
        const [_source, args, ctx] = params
        ctx.reqId

        return [
          {
            id: '1',
            name: args.name || 'no name',
            posts: [],
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
  })

  truthy(fluentSchema)
  is(fluentSchema.makeExecutableSchema(), undefined)
})
