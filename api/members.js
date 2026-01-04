// API endpoints for member management with Supabase
import { createSupabaseClient, TABLES } from './supabase-config.js';

export default async function handler(req, res) {
  const supabase = createSupabaseClient();
  
  if (!supabase) {
    return res.status(500).json({ error: 'Database connection failed' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getMembers(req, res, supabase);
      case 'POST':
        return await createMember(req, res, supabase);
      case 'PUT':
        return await updateMember(req, res, supabase);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Members API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// Get all members or specific member
async function getMembers(req, res, supabase) {
  const { id, include_opportunities } = req.query;
  
  try {
    let query = supabase
      .from(TABLES.MEMBERS)
      .select(`
        *,
        ${include_opportunities ? `
          looking_for:business_opportunities!business_opportunities_member_id_fkey(category, description),
          can_offer:business_opportunities!business_opportunities_member_id_fkey(category, description)
        ` : ''}
      `)
      .eq('is_active', true);

    if (id) {
      query = query.eq('id', id).single();
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching members:', error);
    return res.status(400).json({ error: error.message });
  }
}

// Create new member
async function createMember(req, res, supabase) {
  const {
    email,
    first_name,
    last_name,
    company_name,
    job_title,
    industry,
    linkedin_url,
    company_size,
    membership_type,
    looking_for = [],
    can_offer = []
  } = req.body;

  if (!email || !first_name || !last_name || !company_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Insert member
    const { data: member, error: memberError } = await supabase
      .from(TABLES.MEMBERS)
      .insert([{
        email,
        first_name,
        last_name,
        company_name,
        job_title,
        industry,
        linkedin_url,
        company_size,
        membership_type
      }])
      .select()
      .single();

    if (memberError) throw memberError;

    // Insert business opportunities
    if (looking_for.length > 0 || can_offer.length > 0) {
      const opportunities = [
        ...looking_for.map(category => ({
          member_id: member.id,
          opportunity_type: 'looking_for',
          category
        })),
        ...can_offer.map(category => ({
          member_id: member.id,
          opportunity_type: 'can_offer',
          category
        }))
      ];

      const { error: oppError } = await supabase
        .from(TABLES.BUSINESS_OPPORTUNITIES)
        .insert(opportunities);

      if (oppError) throw oppError;
    }

    return res.status(201).json({ success: true, data: member });
  } catch (error) {
    console.error('Error creating member:', error);
    return res.status(400).json({ error: error.message });
  }
}

// Update member profile
async function updateMember(req, res, supabase) {
  const { id } = req.query;
  const {
    first_name,
    last_name,
    company_name,
    job_title,
    industry,
    linkedin_url,
    company_size,
    looking_for = [],
    can_offer = []
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Member ID required' });
  }

  try {
    // Update member
    const { data: member, error: memberError } = await supabase
      .from(TABLES.MEMBERS)
      .update({
        first_name,
        last_name,
        company_name,
        job_title,
        industry,
        linkedin_url,
        company_size,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (memberError) throw memberError;

    // Update business opportunities
    // First, delete existing opportunities
    await supabase
      .from(TABLES.BUSINESS_OPPORTUNITIES)
      .delete()
      .eq('member_id', id);

    // Then insert new ones
    if (looking_for.length > 0 || can_offer.length > 0) {
      const opportunities = [
        ...looking_for.map(category => ({
          member_id: id,
          opportunity_type: 'looking_for',
          category
        })),
        ...can_offer.map(category => ({
          member_id: id,
          opportunity_type: 'can_offer',
          category
        }))
      ];

      const { error: oppError } = await supabase
        .from(TABLES.BUSINESS_OPPORTUNITIES)
        .insert(opportunities);

      if (oppError) throw oppError;
    }

    return res.status(200).json({ success: true, data: member });
  } catch (error) {
    console.error('Error updating member:', error);
    return res.status(400).json({ error: error.message });
  }
}