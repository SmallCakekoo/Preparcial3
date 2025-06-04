import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lummeoqvtxppzdyqjhra.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bW1lb3F2dHhwcHpkeXFqaHJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMjI3MjIsImV4cCI6MjA2NDU5ODcyMn0.SfJgZTgHdAIEBQVMiXuWpz-BeD8Cq14tJ6JuHMHNW0M";
export const supabase = createClient(supabaseUrl, supabaseKey);
