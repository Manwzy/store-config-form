import { useContext } from 'react'

import { GetFieldNameFromFormStore } from '../interface'
import { FormStore } from '../store/form-store'

import { FormStoreContext } from './use-form'

export const useField = <T extends FormStore>(
  key: GetFieldNameFromFormStore<T>
) => {
  const context = useContext(FormStoreContext)
  if (!context) {
    return null
  }

  return { field: context.store.getField(key), element: context.render(key) }
}
