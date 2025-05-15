import { getLocalStorageEntry, setLocalStorageEntry } from '../localStorage'

export const getEndpoint = async () => {
  return getLocalStorageEntry('argus-api-endpoint')
}

export const setEndpoint = async (value: string) => {
  setLocalStorageEntry('argus-api-endpoint', value)
}

export const formatDuration = (seconds: number) => {
  const parts = []
  const units: [string, number][] = [
    ['d', 86400],
    ['h', 3600],
    ['m', 60],
    ['s', 1],
  ]

  for (const [label, unit] of units) {
    const value = Math.floor(seconds / unit)
    if (value > 0 || (label === 's' && parts.length === 0)) {
      parts.push(`${value}${label}`)
      seconds %= unit
    }
  }

  return parts.join(' ')
}
