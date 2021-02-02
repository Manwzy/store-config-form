import Store from './index'
export abstract class SingletonStore<T> extends Store<T> {
  static readonly id: symbol
  static readonly initData: any
  static get() {
    if (this === SingletonStore) {
      throw Error('This method can only be called by subclass')
    }
    let store
    try {
      store = Store.getById(this.id)
      //eslint-disable-next-line
    } catch (e) {}
    if (!store) {
      //如果没有store则创建一个store
      const constructor = this as any
      store = new constructor(constructor.initData)
    }
    return store
  }
  static getContext() {
    return this.get().context
  }
  static getData() {
    return this.get().data
  }

  constructor(initData: T) {
    super(initData)
    if (this.constructor === SingletonStore) {
      throw Error(`Abstract class cannot be instantialized`)
    }
    //类被继承
    const currentConstructor: any = this.constructor

    let instance
    try {
      //如果类中已包含该对象，则抛错，不能同时有两个该类实例
      instance = Store.getById(currentConstructor.id)
      //eslint-disable-next-line
    } catch (e) {}
    if (instance) {
      throw Error(
        `The ${currentConstructor.name} is extended from SingletonStore and can only be instantialized for once`
      )
    }
    //为被继承的对象添加额外属性
    currentConstructor.id = this.id
  }
}
