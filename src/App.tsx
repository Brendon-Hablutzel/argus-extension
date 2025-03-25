import { useEffect, useState } from 'react'
import { getEndpoint, setEndpoint } from './storage'

const App = () => {
  const [displayEndpoint, setDisplayEndpoint] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      const fetchedEndpoint = await getEndpoint()
      setDisplayEndpoint(fetchedEndpoint)
    })()
  }, [])

  const [showSubmitted, setShowSubmitted] = useState<string | null>(null)

  const handleEndpointChange = async (e: React.FormEvent) => {
    e.preventDefault()

    setShowSubmitted(null)

    try {
      await setEndpoint(displayEndpoint)
      setShowSubmitted('submitted!')
      await new Promise((resolve) => setTimeout(resolve, 750))
      setShowSubmitted(null)
    } catch (e) {
      console.error(e)
      setShowSubmitted('error')
    }
  }

  return (
    <div className="p-2 w-52 font-overpass">
      <h1 className="text-3xl">Argus</h1>
      <h3>Monitor your website usage</h3>
      <form onSubmit={handleEndpointChange}>
        <div className="flex flex-col gap-1">
          <div className="text-base">Endpoint</div>
          <div className="flex gap-1">
            <input
              className="text-sm p-1 border-[1px] rounded-md"
              placeholder="none"
              type="text"
              value={displayEndpoint}
              onChange={(e) => setDisplayEndpoint(e.target.value)}
            />
            <button
              className="text-sm hover:cursor-pointer bg-gray-200 p-1 rounded-md border-[1px]"
              type="submit"
            >
              Set
            </button>
          </div>
          {showSubmitted ? <div>{showSubmitted}</div> : null}
        </div>
      </form>
      <p></p>
    </div>
  )
}

export default App
