import { supabase } from './supabase'
import type { Hold, DbHold, DbHoldType, FeetRules } from '../types'

export interface CreateProblemInput {
  wallPhotoId: string
  name: string
  grade: string
  holds: Hold[]
  startHoldIds: Set<string>
  finishHoldIds: Set<string>
  feetRules: FeetRules
  startType: 'sit' | 'stand'
  status: 'project' | 'sent'
  rating: number | null
  tags: string[]
}

function resolveHoldType(
  hold: Hold,
  startHoldIds: Set<string>,
  finishHoldIds: Set<string>
): DbHoldType {
  if (finishHoldIds.has(hold.id)) return 'finish'
  if (startHoldIds.has(hold.id)) {
    return hold.type === 'hand' ? 'start_hand' : 'start_foot'
  }
  if (hold.type === 'foot') return 'foot_only'
  return 'hand'
}

function toDbHolds(
  holds: Hold[],
  startHoldIds: Set<string>,
  finishHoldIds: Set<string>
): DbHold[] {
  return holds.map((hold) => ({
    points: hold.points,
    strokeWidth: hold.strokeWidth,
    type: resolveHoldType(hold, startHoldIds, finishHoldIds),
  }))
}

export async function createProblem(input: CreateProblemInput): Promise<string> {
  const dbHolds = toDbHolds(input.holds, input.startHoldIds, input.finishHoldIds)

  // Map wizard 'sent' → DB 'active'
  const dbStatus = input.status === 'sent' ? 'active' : 'project'

  const { data, error } = await supabase
    .from('problems')
    .insert({
      wall_photo_id: input.wallPhotoId,
      name: input.name,
      grade: input.grade,
      move_count: null,
      holds: dbHolds,
      feet_rules: input.feetRules,
      start_type: input.startType,
      status: dbStatus,
      rating: input.rating,
      is_saved: false,
      tags: input.tags,
    })
    .select('id')
    .single()

  if (error) throw error

  // If sent, also create a send record
  if (input.status === 'sent') {
    const { error: sendError } = await supabase
      .from('sends')
      .insert({ problem_id: data.id })

    if (sendError) throw sendError
  }

  return data.id
}
