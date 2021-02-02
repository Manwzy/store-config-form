import { pick } from 'lodash'
import { COMMON_KEY } from '../../constants'
import { useFormWithStore } from '../../hooks/use-form-with-store'
import {
  BaseFormConfigDatas,
  FormCommonProps,
  GetFormStoreFromFormConfigDatas,
  UnknownObj,
} from '../../interface'

export function FormFieldsWithStore<
  FormConfigDatas extends BaseFormConfigDatas,
  OtherData extends UnknownObj
>(
  props: {
    store: GetFormStoreFromFormConfigDatas<FormConfigDatas, OtherData>
  } & Omit<FormCommonProps<FormConfigDatas, OtherData>, 'initData'>
) {
  const { store, configs } = props
  const { node } = useFormWithStore(store, configs, pick(props, COMMON_KEY))
  return node
}
