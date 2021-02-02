import { pick } from 'lodash'
import React from 'react'
import { COMMON_KEY } from '../../constants'
import { SingletonFormStore } from '../../store/singleton'
import { FormFieldsWithStore } from '../form-with-store/form-fields'

export function FormFieldsWithSingletonFormStore<
  Constructor extends typeof SingletonFormStore
>(props: { constructor: Constructor }) {
  const { constructor } = props
  return (
    <FormFieldsWithStore
      store={constructor.get()}
      configs={constructor.configs}
      {...pick(constructor, COMMON_KEY)}
    ></FormFieldsWithStore>
  )
}
