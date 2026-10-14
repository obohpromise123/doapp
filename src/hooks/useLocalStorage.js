import { useEffect, useState } from 'react'

function read(key, initialValue) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? initialValue : JSON.parse(raw)
  } catch {
    return initialValue
  }
}

/** useState that mirrors its value into localStorage under `key`. */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => read(key, initialValue))

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage may be full or disabled (e.g. private mode); keep working in memory.
    }
  }, [key, value])

  return [value, setValue]
}
