import { BaseFormConfigDatas, FormConfigsProp } from '../interface'

import { FormStore } from './form-store'

export abstract class SingletonFormStore extends FormStore {
  static readonly id: symbol
  static readonly configs: FormConfigsProp<BaseFormConfigDatas>
  static readonly topDependency: unknown[]
  static readonly topDisabled: boolean
  static readonly topLabelWidth?: number
  static readonly initData: { [P in string]: any }
  static get(): FormStore<any, any> {
    if (this === SingletonFormStore) {
      throw Error('This method can only be called by subclass')
    }
    try {
      return this.getById(this.id) as ReturnType<
        typeof FormStore['createStore']
      >
    } catch (e) {
      return this.createStore(this.configs, this.initData)
    }
  }
  static getContext() {
    return this.get().context
  }
  static getData() {
    return this.get().data
  }

  constructor(initData: any) {
    super(initData)
    if (this.constructor === SingletonFormStore) {
      throw Error(`Abstract class cannot be instantialized`)
    }
    //类被继承
    const currentConstructor: any = this.constructor

    let instance
    try {
      //如果类中已包含该对象，则抛错，不能同时有两个该类实例
      instance = currentConstructor.getById(currentConstructor.id)
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
