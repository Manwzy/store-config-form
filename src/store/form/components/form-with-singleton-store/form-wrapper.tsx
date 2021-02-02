import { pick } from 'lodash'
import React, { ReactNode } from 'react'
import { COMMON_KEY } from '../../constants'
import { SingletonFormStore } from '../../store/singleton'
import { FormWithStore } from '../form-with-store/form-wrapper'

export function FormWithSingletonFormStore<
  Constructor extends typeof SingletonFormStore
>(props: {
  constructor: Constructor
  children: ReactNode | ((store: ReturnType<Constructor['get']>) => ReactNode)
}) {
  const { constructor, children } = props
  return (
    <FormWithStore
      store={constructor.get()}
      configs={constructor.configs}
      children={children}
      {...pick(constructor, COMMON_KEY)}
    ></FormWithStore>
  )
}
