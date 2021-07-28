import test from 'ava'
import { createFluentSchema } from '../src'

test('FluentSchema', async (t) => {
  const fluentSchema = createFluentSchema()

  t.truthy(fluentSchema)
})
