import React, { ReactNode, ReactText, useRef } from 'react'
import { FieldComponent } from '../components/field-wrapper'
import { BaseFormConfigDatas, FormCommonProps, StringKeys } from '../interface'
import { FormStore } from '../store/form-store'
import { extractValueFromFunctional } from '../utils'
import { FormStoreContext } from './use-form'

export function useFormWithStore<
  T extends FormStore<any, any>,
  FormConfigDatas extends BaseFormConfigDatas
>(
  store: T,
  configs: FormCommonProps<FormConfigDatas>['configs'],
  options?: Omit<FormCommonProps<FormConfigDatas>, 'configs' | 'initData'>
) {
  const topDependency = options?.topDependency || []
  const topDisabled = options?.topDisabled || false
  const excutedConfigs = useRef(extractValueFromFunctional(configs))
  const excutedTopDependency = useRef(extractValueFromFunctional(topDependency))
  const excutedTopDisabled = useRef(extractValueFromFunctional(topDisabled))

  const render = (key: StringKeys<FormConfigDatas>) => {
    const field = store.getField(key)
    if (!field) {
      return null
    }
    return (
      <FieldComponent
        field={field}
        key={key as ReactText}
        configData={excutedConfigs.current[key]}
        topDependency={excutedTopDependency.current || []}
        topDisabled={excutedTopDisabled.current || false}
        topLabelWidth={options?.topLabelWidth}
      ></FieldComponent>
    )
  }

  const wrap = (children: () => ReactNode) => {
    return (
      <store.Provider>
        {() => {
          //每次重新渲染时都重新获取一次最新的configs
          excutedConfigs.current = extractValueFromFunctional(configs)
          excutedTopDependency.current = extractValueFromFunctional(
            topDependency
          )
          excutedTopDisabled.current = extractValueFromFunctional(topDisabled)
          return (
            <FormStoreContext.Provider value={{ store, render } as any}>
              {children()}
            </FormStoreContext.Provider>
          )
        }}
      </store.Provider>
    )
  }

  return {
    store,
    render,
    wrap,
    node: wrap(() => {
      return store.toFieldsArray().map((field) => {
        return render(field.fieldName as any)
      })
    }),
  }
}
