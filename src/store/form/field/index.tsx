import { Draft } from 'immer'
import { isEqual, isFunction } from 'lodash'
import { ReactNode } from 'react'
import { Immerable } from '../..'
import { FieldConfig } from '../field-config'
import { FieldKeys, UnknownObj } from '../interface'
import { FormStore } from '../store/form-store'
import { isDataConsideredEmpty, isObject } from '../utils'

@Immerable
export class Field<
  Config extends FieldConfig = FieldConfig,
  FieldName extends FieldKeys = FieldKeys
> {
  fieldName!: FieldName

  /**belonged store */
  private _store!: FormStore<any>
  getBelongedStore<T extends FormStore<any>>() {
    return this._store as T
  }

  /**owned config */
  private _config!: Config
  get config(): Readonly<Config> {
    return this._config
  }

  value!: Config['defaultValue']
  private _defaultValue!: this['value']

  extra = {} as NonNullable<Config['defaultExtra']>
  private _defaultExtra = {} as this['extra']

  error: ReactNode = ''

  constructor(
    store: FormStore<any, any>,
    fieldName: FieldName,
    config: Config
  ) {
    this.fieldName = fieldName
    this._store = store
    this._initConfig(this, config)
  }

  private _initConfig(draft: this, config: Config) {
    draft._config = config
    const newDefaultValue = draft.config.defaultValue
    const newDefaultExtra = draft.config.defaultExtra || ({} as any)
    //在配置更新时，如果默认值与上一次更新时的默认值不一致，则重置value
    if (!isEqual(newDefaultValue, draft._defaultValue)) {
      draft.value = newDefaultValue
      draft._defaultValue = newDefaultValue
    }
    if (!isEqual(newDefaultExtra, draft._defaultExtra)) {
      draft.extra = newDefaultExtra
      draft._defaultExtra = newDefaultExtra
    }
  }

  updateWholeConfig(newConfig: Config) {
    return this.updateWithoutCheck((draft) => {
      const current = draft as this
      current._initConfig(current, newConfig)
    })
  }

  /**
   * 前端本地数据校验
   * 千万注意不能是异步
   * 全部校验需使用此方法而不是check
   */
  validate(_draft: Readonly<this>): ReactNode {
    if (_draft.config.shouldHide) {
      //如果隐藏则无需校验
      return
    }
    if (_draft.config.required) {
      if (isDataConsideredEmpty(_draft.value as any)) {
        return `${_draft.config.label}不能为空`
      }
    }
    return _draft.config.check?.(_draft.value, _draft.extra)
  }

  /**
   * 前端本地数据转换成后端提交数据
   * 默认不做任何转换
   */
  async submit(): Promise<UnknownObj> {
    if (this.config.shouldHide) {
      //如果隐藏则不返回该字段
      return {}
    }
    const outputValue = await this.config.output?.(this.value, this.extra)
    if (isObject(outputValue)) {
      //如果有output配置，则直接使用output作为输出
      //如果output返回不是对象，忽略
      return outputValue as UnknownObj
    }
    if (this.config.transform) {
      //如果有transform配置，则使用field+transform作为输出
      return {
        [this.fieldName]: await this.config.transform(this.value, this.extra),
      }
    }
    //使用field+value作为输出
    return { [this.fieldName]: this.value }
  }

  /**
   * 全部校验且更新
   * 返回校验的错误
   */
  validateAndUpdate(): ReactNode {
    let error = this.validate(this)
    this.updateWithoutCheck((draft) => {
      draft.error = error
    })
    return error
  }

  /**
   * 更新数据
   */
  update(fn: (draft: Draft<this>) => void, shouldNotCheck?: boolean): void {
    return this._store.updateField(this.fieldName, (draft) => {
      fn((draft as unknown) as Draft<this>)
      if (!shouldNotCheck) {
        draft.error = draft.validate(draft as Readonly<this>)
      }
    })
  }

  /**updateWithoutCheck */
  updateWithoutCheck(fn: (draft: Draft<this>) => void) {
    return this.update(fn, true)
  }

  /**
   * 更方便的仅更新值
   */
  updateValue(
    value: this['value'] | ((preValue: Draft<this['value']>) => void),
    shouldNotCheck?: boolean
  ) {
    return this.update((draft) => {
      if (isFunction(value)) {
        value(draft.value)
      } else {
        draft.value = value as Draft<this['value']>
      }
    }, shouldNotCheck)
  }

  /**
   * 更方便的更新额外信息
   * 更新额外信息默认不需要校验
   */
  updateExtraInfo(
    extra: this['extra'] | ((preValue: Draft<this['extra']>) => void),
    shouldCheck?: boolean
  ) {
    return this.update((draft) => {
      if (isFunction(extra)) {
        extra(draft.extra)
      } else {
        draft.extra = extra as Draft<this['extra']>
      }
    }, !shouldCheck)
  }

  updateExtraInfoByKey<T extends keyof this['extra']>(
    key: T,
    newValue: this['extra'][T]
  ) {
    return this.updateExtraInfo((draft) => {
      const current = draft as this['extra']
      current[key] = newValue
    })
  }
}
