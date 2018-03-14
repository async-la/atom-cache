// @flow
type Storage = {
  getItem: any,
  removeItem: any,
  setItem: any,
}
type AtomConfig<A> = {
  key?: string,
  storage?: Storage,
  init?: () => A,
  initAsync?: () => Promise<A>,
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
  initAsync,
  stringify,
  serialize,
  deserialize,
}: AtomConfig<A>): AtomCache<A> {
  if (stringify && !serialize) serialize = JSON.stringify
  if (stringify && !deserialize) deserialize = JSON.parse
  let _atom = null
  let get = async () => {
    if (_atom) return _atom
    if (storage) {
      let stored = await storage.getItem(key)
      if (stored) _atom = deserialize ? deserialize(stored) : stored
    }
    if (!_atom) {
      if (init) _atom = init()
      if (initAsync) _atom = await initAsync()
      if (process.env.NODE_ENV !== 'production' && !_atom && !serialize)
        console.log(
          'atom-cache: warning, _atom is falsy, and many storage engines will choke on falsy values'
        )
      storage &&
        (await storage.setItem(key, serialize ? serialize(_atom) : _atom))
    }
    if (!_atom)
      throw new Error(
        'atomCache requires init or initAsync always return a valid value'
      )
    else return _atom
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
    _atom = null
    return storage && storage.removeItem(key)
  }
  return {
    get,
    reset,
    set,
  }
}
