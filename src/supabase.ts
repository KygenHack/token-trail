import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qxngeruactrpobzlmzvo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bmdlcnVhY3RycG9iemxtenZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE1MDMyOTMsImV4cCI6MjAzNzA3OTI5M30.54_ylhmOTKJA5720w9r4SwpgGWV5yL61-FB3OBqTAxI';
export const supabase = createClient(supabaseUrl, supabaseKey);
