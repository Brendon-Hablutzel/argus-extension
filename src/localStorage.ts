export const getLocalStorageEntry = async (key: string) => {
  const vals = await chrome.storage.local.get(key)
  return vals[key]
}

export const setLocalStorageEntry = async (key: string, value: string) => {
  await chrome.storage.local.set({ [key]: value })
}
