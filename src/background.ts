console.log('background script loaded')

export const getFocusedTabs = async () => {
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

setInterval(async () => {
  const focusedTabs = await getFocusedTabs()

  console.log('recorded focused tabs', focusedTabs)
}, 1000)
