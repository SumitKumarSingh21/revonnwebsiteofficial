import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationPayload {
  user_id: string;
  title: string;
  body: string;
  data?: any;
  url?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const payload: PushNotificationPayload = await req.json();
    const { user_id, title, body, data, url } = payload;

    if (!user_id || !title || !body) {
      throw new Error('user_id, title, and body are required');
    }

    console.log('Sending push notification to user:', user_id);

    // Get user's push tokens
    const { data: pushTokens, error: tokenError } = await supabaseClient
      .from('user_push_tokens')
      .select('*')
      .eq('user_id', user_id);

    if (tokenError) {
      console.error('Error fetching push tokens:', tokenError);
      throw tokenError;
    }

    if (!pushTokens || pushTokens.length === 0) {
      console.log('No push tokens found for user:', user_id);
      return new Response(
        JSON.stringify({ success: true, message: 'No push tokens registered for user' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const results = [];

    for (const tokenRecord of pushTokens) {
      try {
        if (tokenRecord.platform === 'web') {
          // Send web push notification
          const webPushPayload = {
            title,
            body,
            icon: '/Revonn logo.ico',
            badge: '/Revonn logo.ico',
            data: { url, ...data }
          };

          // Parse the subscription object
          const subscription = JSON.parse(tokenRecord.token);
          
          // For now, we'll just log web push - you'll need to implement actual web push with VAPID keys
          console.log('Would send web push notification:', webPushPayload);
          results.push({ platform: 'web', success: true, message: 'Web push logged' });
          
        } else if (tokenRecord.platform === 'mobile') {
          // Send mobile push notification using Firebase or other service
          // For now, we'll just log mobile push
          console.log('Would send mobile push notification to token:', tokenRecord.token);
          results.push({ platform: 'mobile', success: true, message: 'Mobile push logged' });
        }
      } catch (error) {
        console.error(`Error sending ${tokenRecord.platform} push:`, error);
        results.push({ 
          platform: tokenRecord.platform, 
          success: false, 
          error: error.message 
        });
      }
    }

    // Also create in-app notification
    const { error: notifError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id,
        type: data?.type || 'general',
        title,
        message: body,
        data: data || {},
        read: false
      });

    if (notifError) {
      console.error('Error creating in-app notification:', notifError);
    } else {
      console.log('In-app notification created successfully');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Push notifications processed', 
        results 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});