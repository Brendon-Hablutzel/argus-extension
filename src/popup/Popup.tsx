import { useEffect, useState } from 'react'
import { getEndpoint, getProfileId, setEndpoint, setProfileId } from './util'

const Popup = () => {
  const [displayEndpoint, setDisplayEndpoint] = useState<string>('')
  const [displayProfileId, setDisplayProfileId] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      await Promise.allSettled([
        (async () => {
          const fetchedEndpoint = await getEndpoint()
          setDisplayEndpoint(fetchedEndpoint)
        })(),
        (async () => {
          const fetchedProfileId = await getProfileId()
          setDisplayProfileId(fetchedProfileId)
        })(),
      ])
    })()
  }, [])

  const [showSubmitted, setShowSubmitted] = useState<string | null>(null)

  const handleEndpointChange = async (e: React.FormEvent) => {
    e.preventDefault()

    setShowSubmitted(null)

    try {
      await setEndpoint(displayEndpoint)
      await setProfileId(displayProfileId)
      setShowSubmitted('submitted!')
      await new Promise((resolve) => setTimeout(resolve, 750))
      setShowSubmitted(null)
    } catch (e) {
      console.error(e)
      setShowSubmitted('error')
    }
  }

  return (
    <div className="p-2 w-72 font-overpass">
      <h1 className="text-3xl text-center">Argus</h1>
      <h3 className="mb-1 text-center">Monitor your website usage</h3>
      <form onSubmit={handleEndpointChange}>
        <div className="flex flex-col gap-1">
          <div className="flex flex-col p-2 border-[1px] border-black/50 rounded-md">
            <h5 className="text-sm">Endpoint</h5>
            <input
              className="text-sm p-1 border-[1px] rounded-md mb-3"
              placeholder="none"
              type="text"
              value={displayEndpoint}
              onChange={(e) => setDisplayEndpoint(e.target.value)}
            />

            <h5 className="text-sm">Profile</h5>
            <input
              className="text-sm p-1 border-[1px] rounded-md"
              placeholder="none"
              type="text"
              value={displayProfileId}
              onChange={(e) => setDisplayProfileId(e.target.value)}
            />
          </div>
          <button
            className="text-sm hover:cursor-pointer bg-gray-200 p-1 rounded-md border-[1px] border-black/50"
            type="submit"
          >
            Update Config
          </button>
          {showSubmitted ? <div>{showSubmitted}</div> : null}
        </div>
      </form>
      <p></p>
    </div>
  )
}

export default Popup
