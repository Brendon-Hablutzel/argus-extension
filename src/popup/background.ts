import { getEndpoint, getProfileId } from './storage'

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
  url: string
  title: string
  status: 'loading' | 'unloaded' | 'complete'
  profileId: string
}

const recordActiveTab = async (
  endpoint: string,
  timestamp: Date,
  tab: ActiveTab
) => {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timestamp: timestamp.getTime(),
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
    console.log('skipping recording')
    return
  }

  const profileId = await getProfileId()
  console.log('profile id:', profileId)

  if (!profileId) {
    console.log('skipping recording')
    return
  }

  const focusedTabs = await getFocusedTabs()

  const activeTab = focusedTabs[0] as chrome.tabs.Tab | undefined

  console.log('active tab:', activeTab)

  if (activeTab === undefined) {
    console.log('skipping recording')
    return
  }

  if (
    activeTab.status !== 'loading' &&
    activeTab.status !== 'unloaded' &&
    activeTab.status !== 'complete'
  ) {
    console.error('invalid tab status:', activeTab.status)
    console.log('skipping recording')
    return
  }

  const now = new Date()

  const res = await recordActiveTab(endpoint, now, {
    url: activeTab.url ?? '',
    title: activeTab.title ?? '',
    status: activeTab.status,
    profileId,
  })
  console.log(res)
}, 1000)
