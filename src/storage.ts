const getLocalStorageEntry = async (key: string) => {
  const vals = await chrome.storage.local.get(key)
  return vals[key]
}

const setLocalStorageEntry = async (key: string, value: string) => {
  await chrome.storage.local.set({ [key]: value })
}

export const getEndpoint = async () => {
  return getLocalStorageEntry('argus-endpoint')
}

export const setEndpoint = async (value: string) => {
  setLocalStorageEntry('argus-endpoint', value)
}

export const getProfileId = async () => {
  return getLocalStorageEntry('argus-profile-id')
}

export const setProfileId = async (value: string) => {
  return setLocalStorageEntry('argus-profile-id', value)
}
