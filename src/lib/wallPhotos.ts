import { supabase } from './supabase'

export interface WallPhoto {
  id: string
  image_url: string
  uploaded_at: string
  is_active: boolean
}

export async function uploadWallPhoto(file: File): Promise<WallPhoto> {
  const filename = `${Date.now()}-${file.name}`

  // Upload raw full-resolution photo to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('wall-photos')
    .upload(filename, file)

  if (uploadError) throw uploadError

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from('wall-photos')
    .getPublicUrl(filename)

  // Set all existing photos to inactive
  const { error: deactivateError } = await supabase
    .from('wall_photos')
    .update({ is_active: false })
    .eq('is_active', true)

  if (deactivateError) throw deactivateError

  // Insert new photo as active
  const { data, error: insertError } = await supabase
    .from('wall_photos')
    .insert({
      image_url: urlData.publicUrl,
      is_active: true,
    })
    .select()
    .single()

  if (insertError) throw insertError

  return data as WallPhoto
}

export async function getWallPhotos(): Promise<WallPhoto[]> {
  const { data, error } = await supabase
    .from('wall_photos')
    .select('*')
    .order('uploaded_at', { ascending: false })

  if (error) throw error
  return data as WallPhoto[]
}

export async function getActiveWallPhoto(): Promise<WallPhoto | null> {
  const { data, error } = await supabase
    .from('wall_photos')
    .select('*')
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw error
  return data as WallPhoto | null
}
