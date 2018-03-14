// @flow
type Storage = {
  getItem: any,
  removeItem: any,
  setItem: any,
}
type AtomConfig<A> = {
  key?: string,
  storage?: Storage,
  init: (() => A) | (() => Promise<A>),
  stringify?: boolean,
  serialize?: any => string,
  deserialize?: string => any,
}

export type AtomCache<A> = {
  get: () => Promise<A>,
  reset: () => void | Promise<boolean>,
  set: A => Promise<void | boolean>,
}
export function createAtom<A>({
  storage,
  key,
  init,
  stringify,
  serialize,
  deserialize,
}: AtomConfig<A>): AtomCache<A> {
  if (stringify && !serialize) serialize = JSON.stringify
  if (stringify && !deserialize) deserialize = JSON.parse
  let _atom = undefined
  let get = async () => {
    if (_atom !== undefined) return _atom
    if (storage) {
      let stored = await storage.getItem(key)
      if (stored) _atom = deserialize ? deserialize(stored) : stored
    }
    if (!_atom) {
      _atom = await init()
      if (process.env.NODE_ENV !== 'production' && !_atom && !serialize)
        console.log(
          'atom-cache: warning, _atom is falsy, and many storage engines will choke on falsy values'
        )
      storage &&
        (await storage.setItem(key, serialize ? serialize(_atom) : _atom))
    }
    return _atom
  }
  let set = async value => {
    _atom = value
    if (storage) {
      let serialized = serialize ? serialize(_atom) : _atom
      return await storage.setItem(key, serialized)
    }
    return
  }
  const reset = () => {
    _atom = undefined
    return storage && storage.removeItem(key)
  }
  return {
    get,
    reset,
    set,
  }
}
