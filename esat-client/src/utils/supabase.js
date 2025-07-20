// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmaciokjcuwkunikmwgv.supabase.co'; // 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYWNpb2tqY3V3a3VuaWttd2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Nzk4ODUsImV4cCI6MjA2ODU1NTg4NX0.SNwrjWU4O2t2oxexU1hzKSh-LCbBHQMGAhs4RVWxWNE';            

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
