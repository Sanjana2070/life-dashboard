export interface HabitLog {
  id: number
  date: string
  habit: string
  completed: boolean
  notes?: string
}

export type HabitKey =
  | 'read_books'
  | 'breathwork'
  | 'morning_pages'
  | 'movement_prompt'
  | 'brush_twice'
  | 'movement_video'

export const HABIT_LABELS: Record<HabitKey, string> = {
  read_books: 'Read Books',
  breathwork: 'Breathwork',
  morning_pages: 'Morning Pages',
  movement_prompt: 'Movement Prompt',
  brush_twice: 'Brush Twice',
  movement_video: 'Movement Video',
}

export interface SleepLog {
  id: number
  date: string
  bedtime?: string
  wake_time?: string
  quality?: number
  notes?: string
}

export interface FoodLog {
  id: number
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  description?: string
  created_at: string
}

export interface MealPrep {
  id: number
  week_start: string
  plan: string
}

export interface MovementLog {
  id: number
  date: string
  type: 'walk' | 'exercise' | 'dance'
  duration_minutes?: number
  notes?: string
}

export type MoodPeriod = 'morning' | 'afternoon' | 'night'

export interface MoodEntry {
  id: number
  date: string
  period: MoodPeriod
  rating: number
  music_listened?: string
  created_at: string
}

export interface SheetData {
  headers: string[]
  rows: Record<string, string>[]
}

export interface ProductivityDay {
  date: string
  usage: Record<string, number>
  top5?: Array<{ site: string; seconds: number }>
}
