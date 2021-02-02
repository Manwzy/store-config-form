import { isFunction } from "lodash";
import { Functional } from "./interface";

export const extractValueFromFunctional = <T>(
  data: Functional<T>,
  thisType?: any
) => {
  return isFunction(data) ? data.apply(thisType) : data;
};

export const isObject = (data: unknown): data is object => {
  return Object.prototype.toString.call(data) === "[object Object]";
};

export const isDataConsideredEmpty = (
  data: number | undefined | null | string | unknown[]
) => {
  if (Array.isArray(data)) {
    return data.length === 0;
  }
  return [undefined, "", null, -1].includes(data);
};

export const toArray = <K, V>(
  map: Map<K, V>,
  sortFn?: (a: V, b: V) => number
) => {
  if (!sortFn) {
    return Array.from(map.values());
  }
  return Array.from(map.values()).sort(sortFn);
};
