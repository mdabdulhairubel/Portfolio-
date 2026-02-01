
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rpuxshhbmqayipsdcaip.supabase.co';
const supabaseKey = 'sb_publishable_b7akv_o65icLU6XWMjnkpw_GxuC7Tei';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to upload files
export const uploadFile = async (bucket: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
};
