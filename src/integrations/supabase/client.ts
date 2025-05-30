
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hkzbybyotyozggqfkxvr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhremJ5YnlvdHlvemdncWZreHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNDQyODQsImV4cCI6MjA1ODkyMDI4NH0.htXVKC6QAdMl7DxST0G0fcId02vl6Rsyw6EjbvpKn-E";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Helper function to set up a custom auth token for development purposes
// This is useful because we're using a custom authentication system, not Supabase Auth
export const setupAdminSession = async (role: 'admin' | 'user' | null, username: string) => {
  if (role) {
    // For development, we're setting custom headers to bypass RLS
    // In production, this would be handled by proper authentication
    
    // Store auth details in localStorage for persistence
    localStorage.setItem('supabase_auth_token', JSON.stringify({
      role: role,
      username: username
    }));
    
    // Set custom headers on the Supabase client for the current session
    supabase.functions.setAuth(SUPABASE_PUBLISHABLE_KEY);
    
    // Apply headers for RLS policies
    const previousHeaders = supabase.rest.headers;
    supabase.rest.headers = {
      ...previousHeaders,
      'x-user-role': role,
      'x-user-id': username
    };
    
    // Log the authentication setup
    console.log(`Set up ${role} session for ${username}`);
    return true;
  } else {
    // Clear auth token when logged out
    localStorage.removeItem('supabase_auth_token');
    
    // Reset headers
    supabase.rest.headers = {};
    
    console.log('Cleared authentication session');
    return false;
  }
};

// Add a helper function to check if a table exists
export const tableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Try to run a simple count query with limit 0 to check if table exists
    const { error } = await supabase
      .from(tableName as any)
      .select('*', { count: 'exact', head: true })
      .limit(0);
    
    // If there's no error, the table exists
    return !error;
  } catch (error) {
    console.error('Error checking if table exists:', error);
    return false;
  }
};

// Add a helper function to check if user is authenticated as admin
export const isAuthenticatedAsAdmin = async (): Promise<boolean> => {
  try {
    // Check our custom auth token first (for development)
    const authToken = localStorage.getItem('supabase_auth_token');
    if (authToken) {
      const parsed = JSON.parse(authToken);
      return parsed.role === 'admin';
    }
    
    // Fallback to checking Supabase session (if we implement Supabase Auth later)
    const session = await supabase.auth.getSession();
    if (session?.data?.session?.user) {
      return true; // Would need proper role checking if using Supabase Auth
    }
    
    return false;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};
