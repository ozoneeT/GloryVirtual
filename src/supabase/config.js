import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://srcpetbskzeewjutggtk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyY3BldGJza3plZXdqdXRnZ3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NDA1MjksImV4cCI6MjA1MjQxNjUyOX0.MJSmlRw_TRALm0BI5_4Fsz1-hkd-9TV1singzS1UCg4';

export const supabase = createClient(supabaseUrl, supabaseKey); 