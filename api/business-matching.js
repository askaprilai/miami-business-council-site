// Business matching algorithm API with Supabase
import { createSupabaseClient, TABLES } from './supabase-config.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createSupabaseClient();
  
  if (!supabase) {
    return res.status(500).json({ error: 'Database connection failed' });
  }

  try {
    const { member_id, looking_for = [], can_offer = [], limit = 10 } = req.body;

    if (!member_id) {
      return res.status(400).json({ error: 'Member ID required' });
    }

    // Get all active members with their opportunities
    const { data: members, error: membersError } = await supabase
      .from(TABLES.MEMBERS)
      .select(`
        id,
        first_name,
        last_name,
        company_name,
        industry,
        linkedin_url,
        business_opportunities (
          opportunity_type,
          category
        )
      `)
      .eq('is_active', true)
      .neq('id', member_id); // Exclude the requesting member

    if (membersError) throw membersError;

    // Calculate match scores
    const matches = members.map(member => {
      const memberLookingFor = member.business_opportunities
        .filter(opp => opp.opportunity_type === 'looking_for')
        .map(opp => opp.category);
      
      const memberCanOffer = member.business_opportunities
        .filter(opp => opp.opportunity_type === 'can_offer')
        .map(opp => opp.category);

      // Calculate match score based on complementary needs
      let score = 0;
      let matchReasons = [];

      // Check if what they're looking for matches what user can offer
      const mutualBenefit1 = memberLookingFor.some(need => 
        can_offer.some(offer => 
          offer.toLowerCase().includes(need.toLowerCase()) || 
          need.toLowerCase().includes(offer.toLowerCase())
        )
      );

      // Check if what user is looking for matches what they can offer  
      const mutualBenefit2 = looking_for.some(need =>
        memberCanOffer.some(offer => 
          offer.toLowerCase().includes(need.toLowerCase()) ||
          need.toLowerCase().includes(offer.toLowerCase())
        )
      );

      // Industry synergy bonus
      const industryMatch = member.industry && looking_for.some(need => 
        need.toLowerCase().includes(member.industry.toLowerCase()) ||
        member.industry.toLowerCase().includes(need.toLowerCase())
      );

      // Calculate base score
      if (mutualBenefit1 && mutualBenefit2) {
        score = 90;
        matchReasons.push('Perfect mutual partnership opportunity');
      } else if (mutualBenefit1) {
        score = 75;
        matchReasons.push('You can help with their business needs');
      } else if (mutualBenefit2) {
        score = 70;
        matchReasons.push('They can help with your business needs');
      } else if (industryMatch) {
        score = 60;
        matchReasons.push('Industry expertise alignment');
      } else {
        score = 40;
        matchReasons.push('General networking opportunity');
      }

      // Add randomness to prevent static results (±10 points)
      score += Math.floor(Math.random() * 21) - 10;
      score = Math.max(30, Math.min(99, score)); // Clamp between 30-99

      return {
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        company: member.company_name,
        industry: member.industry,
        avatar: `${member.first_name.charAt(0)}${member.last_name.charAt(0)}`.toUpperCase(),
        lookingFor: memberLookingFor,
        canOffer: memberCanOffer,
        linkedin: member.linkedin_url,
        score: score,
        matchReason: matchReasons.join(', ')
      };
    });

    // Sort by score and limit results
    const topMatches = matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return res.status(200).json({ 
      success: true, 
      data: topMatches,
      total_members: members.length 
    });

  } catch (error) {
    console.error('Business matching error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}