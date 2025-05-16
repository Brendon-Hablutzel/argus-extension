import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchMetrics, formatDuration, getEndpoint, setEndpoint } from './util'
import { TabEventType } from './types'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const toDatetimeLocal = (date: Date | null): string => {
  if (date === null) {
    return ''
  }

  const pad = (n: number) => n.toString().padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

const fromDatetimeLocal = (value: string): Date | null => {
  if (value === '') {
    return null
  }

  const [datePart, timePart] = value.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute)
}

const WebsitesFrequencyBarChart = ({
  sitesByDuration,
}: {
  sitesByDuration: [string, number][]
}) => {
  const rechartsData = sitesByDuration.map((entry) => ({
    url: entry[0],
    count: entry[1],
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={rechartsData} layout="vertical" margin={{ left: 50 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={formatDuration} />
        <YAxis dataKey="url" type="category" width={150} interval={0} />
        <Tooltip formatter={formatDuration} />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}

const Dashboard = ({ endpoint }: { endpoint: string }) => {
  // default since is 1 day ago
  const [since, setSince] = useState<Date | null>(() => {
    const date = new Date()
    date.setDate(date.getDate() - 1)
    return date
  })

  // default until is now (null)
  const [until, setUntil] = useState<Date | null>(null)
  const [profileIds, setProfileIds] = useState<string[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fetchedEvents, setFetchedEvents] = useState<null | TabEventType[]>(
    null
  )

  const siteToDuration = useMemo(() => {
    if (fetchedEvents === null) {
      return undefined
    }

    const map = new Map<string, number>()

    for (const record of fetchedEvents) {
      try {
        const url = new URL(record.url)
        const hostname = url.hostname
        map.set(hostname, (map.get(hostname) ?? 0) + 1)
      } catch (e) {
        // catches invalid urls
        console.log(record, e)
      }
    }

    return map
  }, [fetchedEvents])

  const getMetrics = useCallback(async () => {
    setLoading(true)

    try {
      const data = await fetchMetrics(endpoint, profileIds, since, until)

      setFetchedEvents(data.events)
    } catch (e) {
      console.error(e)
      setError(`${e}`)
    } finally {
      setLoading(false)
    }
  }, [endpoint, profileIds, since, until])

  useEffect(() => {
    getMetrics()
    // should only run on initial render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sitesByDuration = useMemo(
    () =>
      siteToDuration
        ? [...siteToDuration.entries()].sort((a, b) => b[1] - a[1])
        : undefined,
    [siteToDuration]
  )

  const handleRefetch = () => {
    getMetrics()
  }

  return (
    <div className="flex justify-center">
      <div className="w-[100%] max-w-[1000px] border-[1px] border-black/20 rounded-lg p-4">
        <div className="flex gap-3 justify-between items-center">
          <div className="flex gap-2">
            <label
              className="font-bold text-sm flex items-center"
              htmlFor="since-time"
            >
              Since
            </label>
            <input
              className="px-1 text-base border-[0.5px] border-black/20 rounded-lg"
              type="datetime-local"
              id="since-time"
              value={toDatetimeLocal(since)}
              onChange={(e) => setSince(fromDatetimeLocal(e.target.value))}
            />
          </div>
          <div className="flex gap-2">
            <label
              className="font-bold text-sm flex items-center"
              htmlFor="until-time"
            >
              Until
            </label>
            <input
              className="px-1 text-base border-[0.5px] border-black/20 rounded-lg"
              type="datetime-local"
              id="until-time"
              value={toDatetimeLocal(until)}
              onChange={(e) => setUntil(fromDatetimeLocal(e.target.value))}
            />
          </div>
          <div className="flex gap-2">
            <label
              className="px-2 font-bold text-sm flex items-center"
              htmlFor="profile-ids"
            >
              Profile ID(s)
            </label>
            <input
              className="text-base px-2 border-[0.5px] border-black/20 rounded-lg"
              type="text"
              id="profile-ids"
              placeholder="profile1,profile2..."
              value={profileIds.join(',')}
              onChange={(e) => setProfileIds(e.target.value.split(','))}
            />
          </div>
          <div>
            <button
              className="text-base hover:cursor-pointer px-2 border-[1px] border-black/20 rounded-lg font-bold"
              onClick={handleRefetch}
            >
              Refetch
            </button>
          </div>
        </div>
        <br />
        {loading ? (
          <div>loading ...</div>
        ) : error ? (
          <div>error: {error}</div>
        ) : (
          <div className="flex flex-col gap-2">
            <div>
              {sitesByDuration ? (
                <WebsitesFrequencyBarChart sitesByDuration={sitesByDuration} />
              ) : null}
            </div>
            {fetchedEvents ? (
              <p>
                {fetchedEvents?.length} samples (
                {formatDuration(fetchedEvents?.length)})
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

const DashboardWrapper = () => {
  // api endpoint from local storage
  // undefined indicates loading
  const [apiEndpoint, setApiEndpoint] = useState<string | undefined>(undefined)

  useEffect(() => {
    // read endpoint from local storage on initial load
    ;(async () => {
      const endpoint = await getEndpoint()
      if (!endpoint) {
        setApiEndpoint('')
      } else {
        setApiEndpoint(endpoint)
      }
    })()
  }, [setApiEndpoint])

  // for controlled endpoint input
  const [apiEndpointInput, setApiEndpointInput] = useState('')

  const handleApiEndpointSubmit = async () => {
    // set in local storage
    await setEndpoint(apiEndpointInput)
    // set for this component
    setApiEndpoint(apiEndpointInput)
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      {apiEndpoint === undefined ? (
        <p>loading...</p>
      ) : !apiEndpoint ? (
        <div className="flex flex-col gap-2">
          <p>No endpoint found, enter one below:</p>
          <form onSubmit={handleApiEndpointSubmit} className="flex gap-2">
            <input
              className="text-sm p-1 border-[1px] rounded-md"
              type="url"
              value={apiEndpointInput}
              onChange={(e) => setApiEndpointInput(e.target.value)}
              placeholder="Endpoint"
            />
            <button
              disabled={apiEndpointInput.length === 0}
              className="text-sm hover:cursor-pointer bg-gray-200 p-1 rounded-md border-[1px] border-black/50"
              type="submit"
            >
              Set Endpoint
            </button>
          </form>
        </div>
      ) : (
        <Dashboard key={apiEndpoint} endpoint={apiEndpoint} />
      )}
      <div className="flex justify-center">
        {apiEndpoint ? (
          <button
            className="hover:cursor-pointer px-2 py-1 border-[1px] rounded-lg border-black/20"
            onClick={async () => {
              // set in local storage
              await setEndpoint('')
              // set the controlled value for the endpoint input
              setApiEndpointInput('')
              // set the state used when fetching data
              setApiEndpoint('')
            }}
          >
            Reset Endpoint
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default DashboardWrapper
