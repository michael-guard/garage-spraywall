import { supabase } from './supabase'
import type { Hold, DbHold, DbHoldType, FeetRules, ProblemListItem } from '../types'

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

// --- Fetching ---

export type SortOption = 'best' | 'newest' | 'oldest' | 'most_repeats' | 'least_repeats'

export interface FetchProblemsOptions {
  search?: string
  minGrade?: string
  maxGrade?: string
  projectsOnly?: boolean
  savedOnly?: boolean
  sort?: SortOption
}

const GRADE_ORDER = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10']

function gradeIndex(grade: string): number {
  return GRADE_ORDER.indexOf(grade)
}

export async function fetchProblems(opts: FetchProblemsOptions = {}): Promise<ProblemListItem[]> {
  let query = supabase
    .from('problems')
    .select('id, name, grade, status, rating, is_saved, tags, created_at, sends(count)')

  // Status filtering: default hides archived
  if (opts.projectsOnly) {
    query = query.eq('status', 'project')
  } else {
    query = query.in('status', ['project', 'active'])
  }

  // Saved filter
  if (opts.savedOnly) {
    query = query.eq('is_saved', true)
  }

  // Search by name (case-insensitive partial match)
  if (opts.search?.trim()) {
    query = query.ilike('name', `%${opts.search.trim()}%`)
  }

  // Sort — server-side where possible
  if (opts.sort === 'oldest') {
    query = query.order('created_at', { ascending: true })
  } else if (opts.sort === 'best') {
    query = query.order('rating', { ascending: false, nullsFirst: false })
  } else if (opts.sort !== 'most_repeats' && opts.sort !== 'least_repeats') {
    // Default: newest
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) throw error

  // Transform response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let items: ProblemListItem[] = (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    grade: row.grade,
    status: row.status,
    rating: row.rating,
    is_saved: row.is_saved,
    tags: row.tags ?? [],
    created_at: row.created_at,
    send_count: row.sends?.[0]?.count ?? 0,
  }))

  // Client-side grade range filter
  if (opts.minGrade) {
    const minIdx = gradeIndex(opts.minGrade)
    items = items.filter((p) => gradeIndex(p.grade) >= minIdx)
  }
  if (opts.maxGrade) {
    const maxIdx = gradeIndex(opts.maxGrade)
    items = items.filter((p) => gradeIndex(p.grade) <= maxIdx)
  }

  // Client-side sort for send-count-based sorts
  if (opts.sort === 'most_repeats') {
    items.sort((a, b) => b.send_count - a.send_count)
  } else if (opts.sort === 'least_repeats') {
    items.sort((a, b) => a.send_count - b.send_count)
  }

  return items
}
