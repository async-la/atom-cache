// @flow
import test from 'ava'

import { createAtom } from '../src'
import { createMemoryStorage } from 'storage-memory'

test('first get returns value found in storage', async (t) => {
  let storage = createMemoryStorage()
  await storage.setItem('foo', 'bar')
  
  let atom = createAtom({
      key: 'foo',
      storage,
      init: () => 'baz'
  })

  let value = await atom.get()
  t.is(value, 'bar')
})

test('first get returns result of init if nothing is in storage', async (t) => {
    let storage = createMemoryStorage()
    
    let atom = createAtom({
        key: 'foo',
        storage,
        init: () => 'baz'
    })
  
    let value = await atom.get()
    t.is(value, 'baz')
  })

  test('initAsync can optionally be used for async initialization', async (t) => {
    let storage = createMemoryStorage()
    
    let atom = createAtom({
        key: 'foo',
        storage,
        init: async () => 'baz'
    })
  
    let value = await atom.get()
    t.is(value, 'baz')
  })