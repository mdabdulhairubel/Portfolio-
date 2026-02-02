
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rpuxshhbmqayipsdcaip.supabase.co';
const supabaseKey = 'sb_publishable_b7akv_o65icLU6XWMjnkpw_GxuC7Tei';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to upload files
export const uploadFile = async (bucket: string, file: File) => {
  if (!bucket) throw new Error("Bucket name is required");
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.floor(Math.random() * 100000)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type // Explicitly set content type
    });

  if (error) {
    console.error("Supabase Storage Error Details:", error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
};
