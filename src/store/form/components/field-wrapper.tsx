import { isEqualWith } from 'lodash'
import React, { useEffect } from 'react'
import { Field } from '../field'
import { FieldConfig } from '../field-config'
import { usePrevious } from '../hooks/use-previous'
import { extractValueFromFunctional } from '../utils'
import { MemoField } from './memo-field'

export const FieldComponent = ({
  field,
  configData,
  topDependency,
  topDisabled,
  topLabelWidth,
}: {
  field: Field
  configData?: (() => FieldConfig) | FieldConfig
  topDependency: unknown[]
  topDisabled: boolean
  topLabelWidth?: number
}) => {
  const preField = usePrevious(field)

  useEffect(() => {
    if (preField) {
      field.config.onFieldChange?.(preField, field)
    }
  }, [preField, field])

  const config = extractValueFromFunctional(configData) as FieldConfig
  const dependency = config
    ? [...(config.dependency || []), ...topDependency]
    : []
  const preDependency = usePrevious(dependency)
  const isDependencySame = (
    oldDependency: unknown[],
    newDependency: unknown[]
  ) => {
    if (oldDependency.length !== newDependency.length) {
      return false
    }
    return isEqualWith(oldDependency, newDependency, (value, othValue) => {
      return value?.every((_: any, index: any) => {
        return Object.is(value[index], othValue[index])
      })
    })
  }

  useEffect(() => {
    if (
      config &&
      preDependency &&
      !isDependencySame(preDependency, dependency)
    ) {
      //第一次渲染时无需更新配置，因为初始化已有配置
      field.updateWholeConfig(config)
    }
  })

  return (
    <MemoField
      field={field}
      topDisabled={topDisabled}
      topLabelWidth={topLabelWidth}
    ></MemoField>
  )
}
