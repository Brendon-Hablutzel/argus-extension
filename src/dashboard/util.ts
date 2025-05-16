import { getLocalStorageEntry, setLocalStorageEntry } from '../localStorage'
import { EventsResponse, EventsResponseType } from './types'

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

  return (parts.length > 2 ? parts.slice(0, 2) : parts).join(' ')
}

export const fetchMetrics = async (
  endpoint: string,
  profileIds: string[],
  since: Date | null,
  until: Date | null
): Promise<EventsResponseType> => {
  const searchParams = new URLSearchParams([
    ...profileIds.map((profileId) => ['profileId', profileId]),
  ])

  if (since) {
    searchParams.append('since', since.getTime().toString())
  }

  if (until) {
    searchParams.append('until', until.getTime().toString())
  }

  const metricsUrl = new URL(`${endpoint}/metrics?${searchParams.toString()}`)

  const res = await fetch(metricsUrl)
  const rawData = await res.json()
  const data = EventsResponse.parse(rawData)

  return data
}
