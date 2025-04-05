import { getEndpoint } from './storage'

console.log('background script loaded')

const getFocusedTabs = async () => {
  const windows = await chrome.windows.getAll()
  const focusedWindow = windows.find((window) => window.focused)

  const activeTabs = await chrome.tabs.query({
    active: true,
  })

  const focusedTabs = focusedWindow
    ? activeTabs.filter((tab) => tab.windowId === focusedWindow.id)
    : []

  return focusedTabs
}

interface ActiveTab {
  timestamp: number
  url: string
  title: string
  status: 'loading' | 'unloaded' | 'complete'
}

const recordActiveTab = async (
  endpoint: string,
  tab: ActiveTab | undefined
) => {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tab,
    }),
  })

  const data = await res.json()

  return data
}

setInterval(async () => {
  const endpoint = await getEndpoint()
  console.log('endpoint:', endpoint)

  if (!endpoint) {
    return
  }

  const focusedTabs = await getFocusedTabs()

  const activeTab = focusedTabs[0] as chrome.tabs.Tab | undefined
  console.log('recording active tab:', activeTab)

  if (
    activeTab &&
    activeTab.status !== 'loading' &&
    activeTab.status !== 'unloaded' &&
    activeTab.status !== 'complete'
  ) {
    console.error('invalid tab status:', activeTab.status)
    return
  }

  const now = new Date()

  const res = await recordActiveTab(
    endpoint,
    activeTab
      ? {
          timestamp: now.getTime(),
          url: activeTab.url ?? '',
          title: activeTab.title ?? '',
          // must be one of theses becaues of prior check
          status: activeTab.status as 'loading' | 'unloaded' | 'complete',
        }
      : undefined
  )
  console.log(res)
}, 3000)
