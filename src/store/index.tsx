import React, { ReactElement, useEffect, useState } from 'react'
import { Draft, enableMapSet, immerable, produce } from 'immer'

/* eslint-disable  react-hooks/rules-of-hooks*/
//启动immer的map和set功能
enableMapSet()
/** */
export default class Store<Data> {
  /**
   * 储存所有子类实例
   */
  protected static map = new Map<symbol, Store<any>>()

  /**
   * get方法只存在于SingletonStore上
   */
  static get: any = () => {
    throw Error(
      'get can only be accessed when extended from SingletonStore, use getById instead'
    )
  }

  /**
   * 同上
   */
  static getContext: any = () => {
    throw Error(
      'getContext can only be accessed when extended from SingletonStore, use getContextById instead'
    )
  }

  /**
   * 同上
   */
  static getData: any = () => {
    throw Error(
      'getData can only be accessed when extended from SingletonStore, use getDataById instead'
    )
  }

  /**
   * 通过唯一id获取store实例
   */
  static getById = <T extends unknown>(id: symbol) => {
    const store = Store.map.get(id) as Store<T>
    if (!store) {
      throw Error('this store does not exist')
    }
    return store
  }

  /**
   * 同上
   */
  static getContextById = <T extends unknown>(id: symbol) => {
    return Store.getById<T>(id).context
  }

  /**
   * 同上
   */
  static getDataById = <T extends unknown>(id: symbol) => {
    return Store.getById<T>(id).data
  }

  //唯一id
  private _id: symbol
  //Provider的设置数据方法
  private _setData: React.Dispatch<React.SetStateAction<Data>> = () => {}
  //初始化数据
  private _initData: Data
  //Provide的context
  private _context: React.Context<Data>
  //Provider的数据
  private _data: Data
  //渲染次数，为了强制刷新使用
  private _setCount: React.Dispatch<React.SetStateAction<number>> = () => {}

  get data() {
    return this._data
  }

  get context() {
    return this._context
  }

  get id() {
    return this._id
  }

  constructor(initData: Data) {
    //保持
    this._initData = initData
    this._data = initData
    this._context = React.createContext<Data>(this._initData)
    this._id = Symbol('id')
    //在new时将实例添加进Store全局管理
    Store.map.set(this._id, this)
    console.log(
      `An instance of ${this.constructor.name} is set into Store map, and there is ${Store.map.size} instance left in map`
    )
  }

  update<Return = void>(fn: (draft: Draft<Data>) => Return) {
    //通过immer来更新数据，暂不支持异步更新
    return this._setData((oldData) => {
      const newData = produce(oldData, fn) as Data
      if (newData instanceof Promise) {
        throw Error('Async update is not supported now')
      }
      return newData
    })
  }

  updateByKey<K extends keyof Draft<Data>>(key: K, newValue: Draft<Data>[K]) {
    //通过immer来更新数据，暂不支持异步更新
    return this.update((draft) => {
      draft[key] = newValue
    })
  }

  /**此方法不能保证数据的准确性*/
  async updateAsync<Return = void>(fn: (draft: Draft<Data>) => Return) {
    const newData = await produce(this._data, fn)
    return this._setData(newData as Data)
  }

  /**
   * 强制刷新;
   * 通过更改count值，每次加1;
   */
  refresh = async (fn?: (draft: Data) => void | Promise<void>) => {
    await fn?.(this._data)
    return this._setCount((count) => count + 1)
  }

  onUpdated(_pre: Data, _current: Data) {}

  /**
   * store的Provider，即react的provider
   * 将其包裹在顶层可在更新数据时更新视觉
   */
  Provider = ({
    children,
  }: {
    children: ReactElement | (() => ReactElement)
  }) => {
    const [data, setData] = useState(this._initData)
    const [, setCount] = useState(0)
    this._setData = setData
    this._setCount = setCount
    const preData = this._data
    this._data = data
    useEffect(() => {
      this.onUpdated(preData, data)
    }, [data, preData])
    useEffect(() => {
      //页面离开后,解除对store的引用
      return () => {
        const isSuccess = Store.map.delete(this._id)
        console.log(
          `Deleting an instance of store ${this.constructor.name} ${
            isSuccess ? 'succeeds' : 'fails'
          }, and there is ${Store.map.size} instance left in map`
        )
      }
    }, [])
    return (
      <this._context.Provider value={data}>
        {typeof children === 'function' ? children() : children}
      </this._context.Provider>
    )
  }
}

/**
 * 将target的immerable设为true，使immer能像修改普通object一样修改它
 * 注意类中不能使用箭头函数，因为后续读、改依赖this
 * 修改后的对象会被freeze，因此不要直接修改对象的值，通过immer修改
 */
export const Immerable = (target: any) => {
  target[immerable] = true
  return new Proxy(target, {
    construct: function (target, context, args) {
      const data = Reflect.construct(target, context, args)
      for (let i in data) {
        if (data.hasOwnProperty(i) && data[i] instanceof Function) {
          //如果使用箭头函数直接抛错
          throw Error(
            `The immer store with class instance does not support arrow function when used, please modify the function "${i}" in class ${target.name}`
          )
        }
      }
      return data
    },
  })
}
