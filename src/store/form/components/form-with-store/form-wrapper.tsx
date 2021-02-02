import { isFunction, pick } from 'lodash'
import { ReactNode } from 'react'
import { COMMON_KEY } from '../../constants'
import { useFormWithStore } from '../../hooks/use-form-with-store'
import {
  BaseFormConfigDatas,
  FormCommonProps,
  GetFormStoreFromFormConfigDatas,
  UnknownObj,
} from '../../interface'

export function FormWithStore<
  FormConfigDatas extends BaseFormConfigDatas,
  OtherData extends UnknownObj
>(
  props: {
    children:
      | ReactNode
      | ((
          store: GetFormStoreFromFormConfigDatas<FormConfigDatas, OtherData>
        ) => ReactNode)
    store: GetFormStoreFromFormConfigDatas<FormConfigDatas, OtherData>
  } & Omit<FormCommonProps<FormConfigDatas, OtherData>, 'initData'>
) {
  const { store, configs, children } = props
  const { wrap } = useFormWithStore(store, configs, pick(props, COMMON_KEY))
  return wrap(() => (isFunction(children) ? children(store) : children))
}
