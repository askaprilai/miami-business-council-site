// Supabase Edge Function: Smart Match Members
// Uses OpenAI GPT-4 to match members with other members based on business profiles

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
    console.log('🚀 Smart match members function called');

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
    console.log('🔐 Getting current user...');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError) {
      console.error('❌ Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: authError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (!user) {
      console.error('❌ No user found');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    console.log('✅ User authenticated:', user.id);

    // Fetch current member profile
    console.log('👤 Fetching current member profile...');
    const { data: currentMember, error: memberError } = await supabaseClient
      .from('members')
      .select('id, first_name, last_name, industry, expertise, services_offered, looking_for, business_description, company_name, job_title')
      .eq('auth_user_id', user.id)
      .single()

    if (memberError) {
      console.error('❌ Member fetch error:', memberError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch member profile', details: memberError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!currentMember) {
      console.error('❌ No member found for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'Member profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Current member found:', currentMember.id, currentMember.first_name, currentMember.last_name);

    // Fetch other active members (excluding current user)
    console.log('👥 Fetching other members...');
    const { data: otherMembers, error: membersError } = await supabaseClient
      .from('members')
      .select('id, first_name, last_name, industry, expertise, services_offered, looking_for, business_description, company_name, job_title, linkedin_url, profile_photo_url')
      .eq('is_active', true)
      .neq('id', currentMember.id)
      .limit(50) // Get top 50 to analyze

    if (membersError) {
      console.error('❌ Members fetch error:', membersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch members', details: membersError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!otherMembers || otherMembers.length === 0) {
      console.log('⚠️ No other members found');
      return new Response(
        JSON.stringify({ matches: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Found', otherMembers.length, 'other members');

    // Prepare current member profile for AI
    const currentProfile = {
      name: `${currentMember.first_name} ${currentMember.last_name}`,
      company: currentMember.company_name || 'not specified',
      role: currentMember.job_title || 'not specified',
      industry: currentMember.industry || 'not specified',
      expertise: currentMember.expertise || [],
      services_offered: currentMember.services_offered || [],
      looking_for: currentMember.looking_for || [],
      description: currentMember.business_description || 'not specified'
    }

    // Prepare other members list for AI
    const membersList = otherMembers.map((m, idx) => ({
      id: m.id,
      index: idx,
      name: `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Member',
      company: m.company_name || 'Company',
      role: m.job_title || 'not specified',
      industry: m.industry || 'not specified',
      expertise: m.expertise || [],
      services_offered: m.services_offered || [],
      looking_for: m.looking_for || [],
      description: m.business_description || 'not specified'
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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert business matchmaker for a professional networking organization. Your job is to analyze a member's profile and match them with other members who would be ideal business connections. Consider:
- Industry alignment and complementary services
- What they offer vs what others need
- What they need vs what others offer
- Potential for partnerships, referrals, or mutual benefit
- Professional synergies and collaboration opportunities

Return ONLY a JSON array of the top 10 matches, ordered by relevance.`
          },
          {
            role: 'user',
            content: `Current Member Profile:
Name: ${currentProfile.name}
Company: ${currentProfile.company}
Role: ${currentProfile.role}
Industry: ${currentProfile.industry}
Expertise: ${JSON.stringify(currentProfile.expertise)}
Services Offered: ${JSON.stringify(currentProfile.services_offered)}
Looking For: ${JSON.stringify(currentProfile.looking_for)}
Description: ${currentProfile.description}

Other Members Available:
${JSON.stringify(membersList, null, 2)}

Analyze these members and return the top 10 that would be the best business matches for the current member. For each match, provide:
1. The member index (from the list above)
2. A match score (0-100)
3. Match type: "ideal-client" (they need what you offer), "service-provider" (you need what they offer), "mutual" (both benefit), "partnership" (collaboration opportunity), or "networking" (industry alignment)
4. 2-3 specific reasons why it's a good match
5. A brief value proposition (1 sentence)

Return ONLY valid JSON in this exact format:
[
  {
    "index": 0,
    "score": 95,
    "matchType": "mutual",
    "reasons": ["They offer marketing services you're looking for", "You offer tech services they need", "Same industry focus"],
    "valueProposition": "Perfect mutual benefit opportunity for service exchange"
  }
]`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
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
    let aiMatches
    try {
      aiMatches = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse)
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Enrich matches with full member data
    const enrichedMatches = aiMatches.map((match: any) => {
      const member = otherMembers[match.index]
      if (!member) return null

      return {
        id: member.id,
        name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Member',
        company: member.company_name || 'Company',
        industry: member.industry || 'Professional Services',
        avatar: member.first_name && member.last_name
          ? `${member.first_name[0]}${member.last_name[0]}`.toUpperCase()
          : 'MB',
        avatarUrl: member.profile_photo_url,
        linkedin: member.linkedin_url,
        services: member.services_offered || [],
        idealClient: {
          needsHelp: member.looking_for || []
        },
        valueProposition: match.valueProposition,
        matchScore: match.score,
        matchType: match.matchType,
        matchReasons: match.reasons,
        mutualBenefit: match.matchType === 'mutual'
      }
    }).filter((m: any) => m !== null) // Remove any invalid matches

    return new Response(
      JSON.stringify({ matches: enrichedMatches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in smart-match-members:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
