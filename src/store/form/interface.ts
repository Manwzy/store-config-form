import { Draft } from 'immer'
import { Field } from './field'
import { FieldConfig } from './field-config'
import { FormStore } from './store/form-store'
import { SingletonFormStore } from './store/singleton'

export type StringKeys<T extends {}> = Extract<keyof T, FieldKeys>
export type FieldKeys = string | number
export type UnknownObj = { [P in string]: unknown }

export type BaseFormConfigDatas = {
  [P in FieldKeys]: (() => FieldConfig) | FieldConfig
}
export type FormConfigsProp<
  FormConfigDatas extends BaseFormConfigDatas = BaseFormConfigDatas
> = () => FormConfigDatas

export type Functional<T> = T | (() => T)
export type DeFunctional<T> = T extends () => infer R ? R : T

export interface FormCommonProps<
  FormConfigDatas extends BaseFormConfigDatas,
  OtherData extends UnknownObj = UnknownObj
> {
  configs: FormConfigsProp<FormConfigDatas>
  topDependency?: unknown[]
  topDisabled?: boolean
  initData?: OtherData
  topLabelWidth?: number
}

export type GetFormConfigsFromFormConfigDatas<
  FormConfigDatas extends BaseFormConfigDatas
> = {
  [P in StringKeys<FormConfigDatas>]: DeFunctional<FormConfigDatas[P]>
}

export type GetFormStoreFromFormConfigDatas<
  FormConfigDatas extends BaseFormConfigDatas,
  OtherData extends UnknownObj
> = FormStore<GetFormConfigsFromFormConfigDatas<FormConfigDatas>, OtherData>

export type GetFormStoreByProp<
  ConfigsProp extends FormConfigsProp,
  OtherData extends UnknownObj
> = FormStore<
  GetFormConfigsFromFormConfigDatas<DeFunctional<ConfigsProp>>,
  OtherData
>

export type GetFormStore<Store extends typeof SingletonFormStore> = FormStore<
  GetFormConfigsFromFormConfigDatas<DeFunctional<Store['configs']>>,
  Store['initData']
>

export type GetFormStoreByConfigs<
  FormConfigDatas extends BaseFormConfigDatas,
  OtherData extends UnknownObj
> = FormStore<GetFormConfigsFromFormConfigDatas<FormConfigDatas>, OtherData>

export type BaseFormConfigs = {
  [P in FieldKeys]: FieldConfig
}

export type GetFieldFromFormConfigs<
  FormConfigs extends BaseFormConfigs,
  FieldName extends StringKeys<FormConfigs> = StringKeys<FormConfigs>
> = GetFieldFromFieldConfig<FormConfigs[StringKeys<FormConfigs>], FieldName>

export type GetFieldFromFieldConfig<
  Config extends FieldConfig,
  FieldName extends FieldKeys
> = Field<Config, FieldName>

export type GetFieldNameFromFormStore<Store extends FormStore> = StringKeys<
  GetFormConfigsFromStore<Store>
>
export type GetFormConfigsFromStore<T> = T extends FormStore<infer R>
  ? R
  : never

export type GetFieldFromFormStore<
  Store extends FormStore,
  FieldName extends StringKeys<GetFormConfigsFromStore<Store>>
> = GetFieldFromFormConfigs<GetFormConfigsFromStore<Store>, FieldName>

export type GetFieldsFromFormConfigs<FormConfigs extends BaseFormConfigs> = Map<
  keyof FormConfigs,
  GetFieldFromFormConfigs<FormConfigs, StringKeys<FormConfigs>>
>

export type GetFieldsFromFormConfigDatas<
  FormConfigDatas extends BaseFormConfigDatas
> = GetFieldsFromFormConfigs<GetFormConfigsFromFormConfigDatas<FormConfigDatas>>

export type GetFormStoreInitData<
  FormConfigs extends BaseFormConfigs,
  OtherData extends UnknownObj
> = {
  fields: GetFieldsFromFormConfigs<FormConfigs>
} & OtherData

export interface FormEditorProps<T extends FieldConfig> {
  value: DeFunctional<T['defaultValue']>
  onChange: (
    value:
      | DeFunctional<T['defaultValue']>
      | ((preValue: Draft<DeFunctional<T['defaultValue']>>) => void)
  ) => void
  disabled?: boolean
}

export type FormField<T extends FieldConfig = FieldConfig> = Field<T>

export type FormFieldValue<T extends FieldConfig> = DeFunctional<
  T['defaultValue']
>

export interface FieldConfigOptions<
  Value extends unknown = unknown,
  Extra extends UnknownObj = UnknownObj
> {
  defaultValue: Value
  extra?: Extra
  disabled?: boolean
  transform?: (value: Value, extra: Extra) => unknown
  output?: (value: Value, extra: Extra) => UnknownObj | Promise<UnknownObj>
}
