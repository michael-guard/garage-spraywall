export interface Point {
  x: number  // 0-100, percentage of image width
  y: number  // 0-100, percentage of image height
}

export interface Hold {
  id: string
  points: Point[]        // closed polygon, percentage coords. SVG closes with Z.
  strokeWidth: number    // percentage of image width (zoom-relative: visualWidth / scale)
  type: 'hand' | 'foot'
}

// Hold type as stored in the DB problems.holds JSONB column
export type DbHoldType = 'hand' | 'foot_only' | 'start_hand' | 'start_foot' | 'finish'

// A single hold as persisted in the problems.holds JSONB array
export interface DbHold {
  points: Point[]
  strokeWidth: number
  type: DbHoldType
}

// Feet rules options
export type FeetRules = 'selected_only' | 'follow_hands' | 'open'

// Problem status in the DB
export type ProblemStatus = 'project' | 'active' | 'archived'

// Narrow type for the problem list view (no holds JSONB)
export interface ProblemListItem {
  id: string
  name: string
  grade: string
  status: ProblemStatus
  rating: number | null
  is_saved: boolean
  tags: string[]
  created_at: string
  send_count: number
}

// Full problem with holds (for detail view)
export interface Problem extends ProblemListItem {
  wall_photo_id: string
  wall_photo_url: string
  holds: DbHold[]
  feet_rules: FeetRules
  start_type: 'sit' | 'stand'
  updated_at: string
}
