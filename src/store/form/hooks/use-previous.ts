import { isEqual } from 'lodash'
import { useEffect, useRef, useState } from 'react'

export function usePrevious<T>(value: T) {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

//info作为初始值，当info深比较变化时，会自动更新同步到最新的info
export function useUpdatedInfo<T>(info: T) {
  const preInfo = usePrevious(info)
  const [newInfo, setNewInfo] = useState(info)
  useEffect(() => {
    if (!isEqual(preInfo, info)) {
      setNewInfo(info)
    }
  }, [info, preInfo])
  return [newInfo, setNewInfo] as [typeof newInfo, typeof setNewInfo]
}
