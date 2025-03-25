export const getEndpoint = async () => {
  const vals = await chrome.storage.local.get('argus-endpoint')
  return vals['argus-endpoint']
}

export const setEndpoint = async (value: string) => {
  await chrome.storage.local.set({ ['argus-endpoint']: value })
}
