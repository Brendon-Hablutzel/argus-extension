import { useEffect, useMemo, useState } from 'react'
import { formatDuration, getEndpoint, setEndpoint } from './util'
import { EventsResponse, TabEventType } from './types'

const Dashboard = ({ endpoint }: { endpoint: string }) => {
  // default since is 1 day ago
  const [since] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 1)
    return date
  })
  // default until is now
  const [until] = useState(() => new Date())
  const [profileIds] = useState([])

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

  useEffect(() => {
    ;(async () => {
      setLoading(true)

      try {
        const searchParams = new URLSearchParams([
          ...profileIds.map((profileId) => ['profileId', profileId]),
          ['since', since.getTime().toString()],
          ['until', until.getTime().toString()],
        ])

        const metricsUrl = new URL(
          `${endpoint}/metrics?${searchParams.toString()}`
        )

        const res = await fetch(metricsUrl)
        const rawData = await res.json()
        const data = EventsResponse.parse(rawData)

        setFetchedEvents(data.events)
      } catch (e) {
        console.error(e)
        setError(`${e}`)
      } finally {
        setLoading(false)
      }
    })()
  }, [endpoint, since, until, profileIds])

  const sitesByDuration = useMemo(
    () =>
      siteToDuration
        ? [...siteToDuration.entries()].sort((a, b) => b[1] - a[1])
        : undefined,
    [siteToDuration]
  )

  return (
    <div className="flex justify-center">
      <div className="w-[100%] max-w-[900px] border-[1px] border-black/20 rounded-lg p-2">
        {loading ? (
          <div>loading ...</div>
        ) : error ? (
          <div>error: {error}</div>
        ) : (
          <div>
            <div>
              <h2 className="text-xl">Sites by time</h2>
              <ul>
                {sitesByDuration?.map((siteEntry) => (
                  <li>
                    {siteEntry[0]} : {formatDuration(siteEntry[1])}
                  </li>
                ))}
              </ul>
            </div>
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
    <div className="flex flex-col gap-2 p-2">
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
        <Dashboard endpoint={apiEndpoint} />
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
