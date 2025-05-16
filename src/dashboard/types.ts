import { z } from 'zod'

export const TabStatus = z.enum(['unloaded', 'loading', 'complete', ''])

export const TabEvent = z.object({
  timestamp: z.number(),
  url: z.string(),
  title: z.string(),
  status: TabStatus,
})

export type TabEventType = z.infer<typeof TabEvent>

export const EventsResponse = z.object({
  events: z.array(TabEvent),
})

export type EventsResponseType = z.infer<typeof EventsResponse>
