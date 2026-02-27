import { useState, useCallback, useRef } from 'react'
import type { Hold } from '../types'

export interface UseUndoRedoReturn {
  holds: Hold[]
  addHold: (hold: Hold) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  clearAll: () => void
}

export function useUndoRedo(): UseUndoRedoReturn {
  const [holds, setHolds] = useState<Hold[]>([])
  const undoStack = useRef<Hold[][]>([])
  const redoStack = useRef<Hold[][]>([])
  // Force re-render when stacks change (for canUndo/canRedo)
  const [, setRevision] = useState(0)
  const bump = () => setRevision((r) => r + 1)

  const addHold = useCallback((hold: Hold) => {
    setHolds((prev) => {
      undoStack.current.push(prev)
      redoStack.current = []
      bump()
      return [...prev, hold]
    })
  }, [])

  const undo = useCallback(() => {
    setHolds((prev) => {
      if (undoStack.current.length === 0) return prev
      redoStack.current.push(prev)
      const restored = undoStack.current.pop()!
      bump()
      return restored
    })
  }, [])

  const redo = useCallback(() => {
    setHolds((prev) => {
      if (redoStack.current.length === 0) return prev
      undoStack.current.push(prev)
      const restored = redoStack.current.pop()!
      bump()
      return restored
    })
  }, [])

  const clearAll = useCallback(() => {
    setHolds((prev) => {
      if (prev.length === 0) return prev
      undoStack.current.push(prev)
      redoStack.current = []
      bump()
      return []
    })
  }, [])

  return {
    holds,
    addHold,
    undo,
    redo,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    clearAll,
  }
}
