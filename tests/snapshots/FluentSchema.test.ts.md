# Snapshot report for `tests/FluentSchema.test.ts`

The actual snapshot is saved in `FluentSchema.test.ts.snap`.

Generated by [AVA](https://avajs.dev).

## FluentSchema

> Snapshot 1

    `type Query {␊
      users: [User!]!␊
      user(name: String, id: Int!): User␊
    }␊
    ␊
    type User {␊
      id: ID!␊
      name: String␊
      posts: [Post!]!␊
    }␊
    ␊
    type Post {␊
      id: ID!␊
      title: String!␊
      userId: String!␊
      user: User!␊
    }␊
    `

> Snapshot 2

    {
      data: {
        users: [
          {
            id: '1',
            name: 'Kay',
            posts: [
              {
                id: '1',
                title: 'Hello',
                user: {
                  id: '1',
                  name: 'Kay',
                },
              },
            ],
          },
        ],
      },
    }

> Snapshot 3

    {
      errors: [
        GraphQLError {
          locations: [
            {
              column: 11,
              line: 3,
            },
          ],
          message: 'Cannot query field "invalidQuery" on type "Query".',
        },
      ],
    }