export interface User {
  id: string
  name: string
  posts: Post[]
}

export interface Post {
  id: string
  name: string
  user: User
}

export interface Query {
  users: User[]
}

export interface Schema {}

declare module '../../src' {
  interface FluentSchemaTypes {
    Query: any
    User: { id: string; name: string }
    Post: { id: string; title: string }
  }
}
