import { useMemo, useRef } from 'react'

import { FormConfigsProp, GetFormStoreByProp, UnknownObj } from '../interface'
import { toArray } from '../utils'

export const useStoreRef = <
  ConfigsProps extends FormConfigsProp,
  OtherData extends UnknownObj = UnknownObj
>() => {
  type Store = GetFormStoreByProp<ConfigsProps, OtherData>
  const storeRef = useRef<Store | null>(null)
  const store = useMemo(
    () =>
      new Proxy({} as Store, {
        get: (_, prop) => {
          if (!storeRef.current) {
            return undefined
          }
          return Reflect.get(storeRef.current!, prop)
        },
      }),
    []
  )
  return {
    store: store, //as Partial<typeof store>,
    getStore: (store: Store) => {
      storeRef.current = store
    },
  }
}

export const useStoreManagerRef = <
  ConfigsProps extends FormConfigsProp,
  OtherData extends UnknownObj = UnknownObj,
  Key extends string | number | symbol = any
>() => {
  type Store = GetFormStoreByProp<ConfigsProps, OtherData>
  const stores = useRef<Map<Key, Store>>(new Map())
  const get = (key: Key) => {
    if (!stores.current.has(key)) {
      return new Proxy({} as Store, {
        get: (_, prop) => {
          if (!stores.current.has(key)) {
            return undefined
          }
          return Reflect.get(stores.current.get(key)!, prop)
        },
      })
    }
    return stores.current.get(key)! //as Partial<typeof store>,
  }
  return {
    storeManager: {
      get,
      toArray: () => {
        return toArray(stores.current)
      },
    },
    getStore: (key: Key, store: Store) => {
      stores.current.set(key, store)
    },
  }
}
