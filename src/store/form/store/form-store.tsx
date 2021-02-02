import { Draft } from 'immer'
import { merge } from 'lodash'
import Store from '../..'
import { Field } from '../field'
import {
  BaseFormConfigDatas,
  BaseFormConfigs,
  FieldKeys,
  FormConfigsProp,
  GetFieldFromFieldConfig,
  GetFieldFromFormConfigs,
  GetFieldsFromFormConfigDatas,
  GetFormConfigsFromFormConfigDatas,
  GetFormStoreFromFormConfigDatas,
  GetFormStoreInitData,
  StringKeys,
  UnknownObj,
} from '../interface'
import { extractValueFromFunctional, toArray } from '../utils'

export class FormStore<
  FormConfigs extends BaseFormConfigs = BaseFormConfigs,
  OtherData extends UnknownObj = UnknownObj
> extends Store<GetFormStoreInitData<FormConfigs, OtherData>> {
  static createStore<
    FormConfigDatas extends BaseFormConfigDatas,
    OtherData extends UnknownObj
  >(configDatas: FormConfigsProp<FormConfigDatas>, other?: OtherData) {
    const store = new this({
      fields: new Map() as GetFieldsFromFormConfigDatas<FormConfigDatas>,
      ...other,
    })

    const map = this.createFields(store, configDatas)
    //store刚创建，可调用此方法
    store.refresh((draft) => {
      draft.fields = map
    })

    return (store as unknown) as GetFormStoreFromFormConfigDatas<
      FormConfigDatas,
      OtherData
    >
  }

  static composeConfigs<FormConfigDatas extends BaseFormConfigDatas>(
    configData: FormConfigsProp<FormConfigDatas>
  ) {
    const configs = extractValueFromFunctional(configData)
    const keys = Object.keys(configs) as StringKeys<FormConfigDatas>[]
    const data = keys.reduce((res, key) => {
      res[key] = extractValueFromFunctional(configs[key]) as any
      return res
    }, {} as GetFormConfigsFromFormConfigDatas<FormConfigDatas>)
    return data
  }

  static createFields<
    Store extends FormStore<any, any>,
    FormConfigDatas extends BaseFormConfigDatas
  >(store: Store, configDatas: FormConfigsProp<FormConfigDatas>) {
    const map: GetFieldsFromFormConfigDatas<FormConfigDatas> = new Map()
    const configs = this.composeConfigs(configDatas)
    const keys = Object.keys(configs) as StringKeys<FormConfigDatas>[]
    keys.forEach((key) => {
      const field = new Field(store, key, configs[key])
      map.set(field.fieldName, field as any)
    })
    return map
  }

  addFields<FormConfigDatas extends BaseFormConfigDatas>(
    configDatas: FormConfigsProp<FormConfigDatas>
  ) {
    const fieldsMap = FormStore.createFields(this, configDatas)
    return this.update((draft) => {
      Array.from(fieldsMap.entries()).forEach(([fieldName, field]) => {
        draft.fields.set(fieldName as Draft<typeof fieldName>, field as any)
      })
    })
  }

  clearFields() {
    return this.update((draft) => {
      draft.fields.clear()
    })
  }

  removeFields(fieldNames: FieldKeys[]) {
    return this.update((draft) => {
      fieldNames.forEach((fieldName) => {
        draft.fields.delete(fieldName.toString() as any)
      })
    })
  }

  getFields() {
    return this.data.fields
  }

  toFieldsArray(
    sortFn?: (
      a: GetFieldFromFormConfigs<FormConfigs>,
      b: GetFieldFromFormConfigs<FormConfigs>
    ) => number
  ) {
    return toArray(this.getFields(), sortFn)
  }

  toConfigsArray() {
    return this.toFieldsArray().map((item) => item.config)
  }

  getField<S extends StringKeys<FormConfigs>>(type: S) {
    return (this.data.fields.get(
      type.toString()
    ) as unknown) as GetFieldFromFieldConfig<FormConfigs[S], S>
  }

  getConfig<S extends StringKeys<FormConfigs>>(type: S) {
    return (this.data.fields.get(type.toString())
      ?.config as unknown) as FormConfigs[S]
  }

  updateField<S extends StringKeys<FormConfigs>, Return = void>(
    type: S,
    fn: (draft: Draft<GetFieldFromFieldConfig<FormConfigs[S], S>>) => Return
  ): void {
    return this.update((draft) => {
      const field = draft.fields.get(type.toString() as any)
      if (!field) {
        throw Error('field is not exist！')
      }
      return fn(field as any)
    })
  }

  collectFieldErrors() {
    return this.toFieldsArray()
      .map((item) => item.validateAndUpdate())
      .filter((item) => !!item)
  }

  async collectOutputData() {
    const errors = this.collectFieldErrors()
    if (errors.length > 0) {
      throw errors[0]
    }
    const data = await Promise.all(
      this.toFieldsArray().map((field) => {
        return field.submit?.()
      })
    )
    return data.reduce((res, current) => {
      return merge(res, current)
    }, {})
  }
}
