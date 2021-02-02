import { isFunction } from 'lodash'
import React, { memo } from 'react'
import { Field } from '../field'
import { DisplayFormItem } from './display-form-item'

const NO_INJECT_KEY = 'data-no-form-inject'
export const MemoField = memo(
  ({
    field,
    topDisabled,
    topLabelWidth,
  }: {
    field: Field
    topDisabled: boolean
    topLabelWidth?: number
  }) => {
    const {
      label,
      // labelTip,
      required,
      helpTip,
      labelWidth,
      shouldHide,
      disabled,
    } = field.config
    if (shouldHide) {
      return null
    }

    const render = () => {
      const element = isFunction(field.config.editor)
        ? field.config.editor(field)
        : field.config.editor
      if (!React.isValidElement(element)) {
        return element
      }
      if (Reflect.has(element.props as any, NO_INJECT_KEY)) {
        return element
      }
      let injectProps = {
        disabled: disabled || topDisabled,
        value: field.value,
        onChange: (newValue: unknown) => {
          field.updateValue(newValue)
        },
      }
      Object.keys(injectProps).forEach((key) => {
        if (Reflect.has(element.props as any, key)) {
          Reflect.deleteProperty(injectProps, key)
        }
      })
      if (Reflect.ownKeys(injectProps).length === 0) {
        return element
      }
      return React.cloneElement(element as React.ReactElement, injectProps)
    }
    return (
      <DisplayFormItem
        required={required}
        error={field.error}
        help={helpTip}
        labelWidth={labelWidth || topLabelWidth}
        label={
          <span>
            {label}
            {/* {labelTip && (
              <Tooltip placement="topLeft" content={labelTip}>
                <Icon type="question-circle" fontSize={14} />
              </Tooltip>
            )} */}
          </span>
        }
      >
        {render()}
      </DisplayFormItem>
    )
  }
)
