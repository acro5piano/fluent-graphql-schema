import { PlainResolvableObject } from '../src'
import { User, Post, Maybe } from './__generated__/fluent-graphql-schema'

export const db = {
  users(): PlainResolvableObject<User>[] {
    return [
      {
        id: '1',
        name: 'Kay',
      },
    ]
  },
  userByName(name: Maybe<string>): Maybe<PlainResolvableObject<User>> {
    return [
      {
        id: '1',
        name: 'Kay',
      },
    ].filter((u) => u.name === name)[0]
  },
  userById(id: string): PlainResolvableObject<User> {
    return {
      id,
      name: 'Kay',
    }
  },
  postsByUserId(userId: string): PlainResolvableObject<Post>[] {
    return [
      {
        id: '1',
        userId,
        title: 'Hello',
      },
    ]
  },
}
