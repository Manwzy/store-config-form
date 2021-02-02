import { ReactNode } from 'react'
import style from './index.module.scss'

const DEFAULT_WIDTH = 100
export const DisplayFormItem = ({
  error,
  label,
  required,
  help,
  labelWidth,
  children,
}: {
  error?: ReactNode
  label: ReactNode
  required?: boolean
  help?: ReactNode
  labelWidth?: number
  children?: ReactNode
}) => {
  return (
    <div className={style.wrapper}>
      <label
        className={style.label}
        style={{ width: labelWidth || DEFAULT_WIDTH }}
      >
        {required && <span className={style.required}>*</span>}
        <span>{label}</span>
      </label>
      <div className={style.component}>
        <div>{children}</div>
        {error && <div className={style.error}>{error}</div>}
        {help && <div className={style.help}>{help}</div>}
      </div>
    </div>
  )
}
