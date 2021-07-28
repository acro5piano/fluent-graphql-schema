// eslint-disable

type Maybe<T> = T | null | undefined

export interface User {
  id: string
  name?: Maybe<string>
  posts: Post[]
}

export interface Post {
  id: string
  title: string
  userId: string
  user: User
}

export interface Query {
  users: User[]
  user?: Maybe<User>
}

declare module '../../src' {
  interface FluentSchemaTypes {
    User: User
    Post: Post
    Query: Query
  }
}
