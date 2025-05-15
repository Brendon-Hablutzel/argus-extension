import { getLocalStorageEntry, setLocalStorageEntry } from '../localStorage'

export const getEndpoint = async () => {
  return getLocalStorageEntry('argus-ingest-endpoint')
}

export const setEndpoint = async (value: string) => {
  setLocalStorageEntry('argus-ingest-endpoint', value)
}

export const getProfileId = async () => {
  return getLocalStorageEntry('argus-profile-id')
}

export const setProfileId = async (value: string) => {
  return setLocalStorageEntry('argus-profile-id', value)
}
