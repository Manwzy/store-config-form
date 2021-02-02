import { useField } from '../hooks/use-field'
import { GetFieldNameFromFormStore } from '../interface'
import { FormStore } from '../store/form-store'

export function FormItem<T extends FormStore>(props: {
  name: GetFieldNameFromFormStore<T>
}) {
  const fieldContext = useField(props.name)
  if (!fieldContext) {
    return null
  }
  return fieldContext.element
}
