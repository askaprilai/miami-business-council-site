// Supabase Edge Function: Smart Match Collaborations
// Uses OpenAI GPT-4 to match members with collaboration requests

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get current user's profile
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch member profile
    const { data: member, error: memberError } = await supabaseClient
      .from('members')
      .select('id, first_name, last_name, industry, expertise, services_offered, looking_for, business_description')
      .eq('auth_user_id', user.id)
      .single()

    if (memberError || !member) {
      return new Response(
        JSON.stringify({ error: 'Member profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch open collaboration requests (excluding user's own posts)
    const { data: requests, error: requestsError } = await supabaseClient
      .from('member_needs')
      .select('id, title, description, category, budget_range, timeline, member_id')
      .eq('status', 'open')
      .neq('member_id', member.id)
      .limit(20) // Get top 20 to analyze

    if (requestsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch requests' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!requests || requests.length === 0) {
      return new Response(
        JSON.stringify({ matches: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare data for OpenAI
    const memberProfile = {
      industry: member.industry || 'not specified',
      expertise: member.expertise || 'not specified',
      services_offered: member.services_offered || 'not specified',
      looking_for: member.looking_for || 'not specified',
      description: member.business_description || 'not specified'
    }

    const requestsList = requests.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      category: r.category,
      budget: r.budget_range || 'not specified',
      timeline: r.timeline || 'flexible'
    }))

    // Call OpenAI API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency
        messages: [
          {
            role: 'system',
            content: `You are an expert business matchmaker. Your job is to analyze a member's profile and match them with collaboration requests they would be best suited to help with. Consider their expertise, services offered, industry knowledge, and interests. Return ONLY a JSON array of the top 5 matches, ordered by relevance.`
          },
          {
            role: 'user',
            content: `Member Profile:
Industry: ${memberProfile.industry}
Expertise: ${memberProfile.expertise}
Services Offered: ${memberProfile.services_offered}
Looking For: ${memberProfile.looking_for}
Description: ${memberProfile.description}

Available Collaboration Requests:
${JSON.stringify(requestsList, null, 2)}

Analyze these requests and return the top 5 that best match this member's profile. For each match, provide:
1. The request ID
2. A match score (0-100)
3. A brief explanation (1 sentence) of why it's a good match

Return ONLY valid JSON in this exact format:
[
  {
    "id": "request-id",
    "score": 95,
    "reason": "Your expertise in X directly addresses their need for Y"
  }
]`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'AI matching failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiData = await openaiResponse.json()
    const aiResponse = openaiData.choices[0].message.content

    // Parse AI response
    let matches
    try {
      matches = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse)
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enrich matches with full request data
    const enrichedMatches = matches.map((match: any) => {
      const request = requests.find(r => r.id === match.id)
      return {
        ...request,
        matchScore: match.score,
        matchReason: match.reason
      }
    }).filter((m: any) => m.id) // Remove any invalid matches

    return new Response(
      JSON.stringify({ matches: enrichedMatches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in smart-match-collaborations:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
