import { pick } from 'lodash'
import { useRef } from 'react'
import { COMMON_KEY } from '../../constants'
import { useForm } from '../../hooks/use-form'
import {
  BaseFormConfigDatas,
  FormCommonProps,
  GetFormStoreFromFormConfigDatas,
  UnknownObj,
} from '../../interface'

export function FormFields<
  FormConfigDatas extends BaseFormConfigDatas,
  OtherData extends UnknownObj
>(
  props: {
    getStore?: (
      store: GetFormStoreFromFormConfigDatas<FormConfigDatas, OtherData>
    ) => void
  } & FormCommonProps<FormConfigDatas, OtherData>
) {
  const { store, node } = useForm(props.configs, pick(props, COMMON_KEY))
  useRef(props.getStore?.(store))
  return node
}
