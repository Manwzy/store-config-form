import React, { useRef } from 'react'
import {
  BaseFormConfigDatas,
  FieldKeys,
  FormCommonProps,
  UnknownObj,
} from '../interface'
import { FormStore } from '../store/form-store'
import { useFormWithStore } from './use-form-with-store'

export const FormStoreContext = React.createContext<
  | {
      store: FormStore
      render: (key: FieldKeys) => JSX.Element
    }
  | undefined
>(undefined)

export function useForm<
  FormConfigDatas extends BaseFormConfigDatas,
  OtherData extends UnknownObj
>(
  configs: FormCommonProps<FormConfigDatas, OtherData>['configs'],
  options?: Omit<FormCommonProps<FormConfigDatas, OtherData>, 'configs'>
) {
  const store = useRef(FormStore.createStore(configs, options?.initData))
  return useFormWithStore(store.current, configs, options)
}
