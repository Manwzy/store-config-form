import { isFunction } from 'lodash'
import { ReactNode } from 'react'
import { Field } from '../field'
import { FieldConfigOptions, Functional, UnknownObj } from '../interface'

export abstract class BaseFieldConfig<
  T extends Partial<FieldConfigOptions> = Partial<FieldConfigOptions>
> implements FieldConfig {
  abstract label: FieldConfig['label']

  get defaultValue() {
    return this.options.defaultValue
  }

  get defaultExtra() {
    return (this.options.extra || {}) as T['extra'] extends unknown
      ? UnknownObj
      : NonNullable<T['extra']>
  }

  get disabled(): T['disabled'] {
    return this.options.disabled
  }

  async transform(value: T['defaultValue'], extra: UnknownObj) {
    const trans = this.options?.transform
    return trans ? trans(value, extra) : value
  }

  async output(value: T['defaultValue'], extra: UnknownObj) {
    //如果没有传output，则返回undefined，会被忽略
    return this.options.output?.(value, extra) as UnknownObj
  }

  options: T
  constructor(options: T) {
    this.options = options || {}
  }
}

export interface FieldConfig<
  Value extends unknown = any,
  Extra extends UnknownObj = UnknownObj
> {
  label: string
  defaultValue: Value
  defaultExtra?: Extra
  required?: boolean
  labelTip?: ReactNode
  labelWidth?: number
  helpTip?: ReactNode
  disabled?: boolean
  shouldHide?: boolean
  dependency?: unknown[]

  editor?: ((field: Field) => JSX.Element) | ReactNode
  preview?: ((field: Field) => JSX.Element) | ReactNode
  onFieldChange?: (pre: Field<any>, next: Field<any>) => void
  check?: (value: Value, extra: Extra) => ReactNode
  output?: (value: Value, extra: Extra) => UnknownObj | Promise<UnknownObj>
  transform?: (value: Value, extra: Extra) => unknown | Promise<unknown>
}

export const createFieldConfig = <
  Value extends unknown = any,
  Extra extends UnknownObj = UnknownObj
>(
  config: Functional<FieldConfig<Value, Extra>>
) => {
  return isFunction(config) ? config : () => config
}

export const createSingletonConfig = <Config extends FieldConfig>(
  config: Functional<Config>
) => {
  return isFunction(config) ? config : () => config
}
