import { isFunction, pick } from 'lodash'
import { ReactNode, useRef } from 'react'
import { COMMON_KEY } from '../../constants'
import { useForm } from '../../hooks/use-form'
import {
  BaseFormConfigDatas,
  FormCommonProps,
  GetFormStoreFromFormConfigDatas,
  UnknownObj,
} from '../../interface'

export function Form<
  FormConfigDatas extends BaseFormConfigDatas,
  OtherData extends UnknownObj
>(
  props: {
    children:
      | ReactNode
      | ((
          store: GetFormStoreFromFormConfigDatas<FormConfigDatas, OtherData>
        ) => ReactNode)
    getStore?: (
      store: GetFormStoreFromFormConfigDatas<FormConfigDatas, OtherData>
    ) => void
  } & FormCommonProps<FormConfigDatas, OtherData>
) {
  const { store, wrap } = useForm(props.configs, pick(props, COMMON_KEY))
  useRef(props.getStore?.(store))
  return wrap(() =>
    isFunction(props.children) ? props.children(store) : props.children
  )
}
