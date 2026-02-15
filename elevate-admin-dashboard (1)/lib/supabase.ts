
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hdumbjxhjhuprwqvqntm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkdW1ianhoamh1cHJ3cXZxbnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NjgxMjEsImV4cCI6MjA4NjQ0NDEyMX0._O6Q0_TDg8FfNSy444gwF7HhQxTg3hFBc5GonUeqguQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
