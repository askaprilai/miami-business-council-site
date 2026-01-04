// Member connections API with Supabase
import { createSupabaseClient, TABLES } from './supabase-config.js';

export default async function handler(req, res) {
  const supabase = createSupabaseClient(true); // Use service key for admin operations
  
  if (!supabase) {
    return res.status(500).json({ error: 'Database connection failed' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getConnections(req, res, supabase);
      case 'POST':
        return await createConnection(req, res, supabase);
      case 'PUT':
        return await updateConnectionStatus(req, res, supabase);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Connections API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// Get connections for a member
async function getConnections(req, res, supabase) {
  const { member_id, status } = req.query;

  if (!member_id) {
    return res.status(400).json({ error: 'Member ID required' });
  }

  try {
    let query = supabase
      .from(TABLES.CONNECTIONS)
      .select(`
        *,
        requester:members!member_connections_requester_id_fkey(
          id, first_name, last_name, company_name, industry
        ),
        recipient:members!member_connections_recipient_id_fkey(
          id, first_name, last_name, company_name, industry
        )
      `)
      .or(`requester_id.eq.${member_id},recipient_id.eq.${member_id}`);

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    // Format the response to show the "other" person in each connection
    const formattedConnections = data.map(connection => {
      const isRequester = connection.requester_id === member_id;
      const otherPerson = isRequester ? connection.recipient : connection.requester;
      
      return {
        id: connection.id,
        status: connection.status,
        message: connection.message,
        created_at: connection.created_at,
        updated_at: connection.updated_at,
        is_requester: isRequester,
        other_member: {
          id: otherPerson.id,
          name: `${otherPerson.first_name} ${otherPerson.last_name}`,
          company: otherPerson.company_name,
          industry: otherPerson.industry,
          avatar: `${otherPerson.first_name.charAt(0)}${otherPerson.last_name.charAt(0)}`.toUpperCase()
        }
      };
    });

    return res.status(200).json({ success: true, data: formattedConnections });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return res.status(400).json({ error: error.message });
  }
}

// Create a new connection request
async function createConnection(req, res, supabase) {
  const { requester_id, recipient_id, message = '' } = req.body;

  if (!requester_id || !recipient_id) {
    return res.status(400).json({ error: 'Requester and recipient IDs required' });
  }

  if (requester_id === recipient_id) {
    return res.status(400).json({ error: 'Cannot connect with yourself' });
  }

  try {
    // Check if connection already exists
    const { data: existing, error: checkError } = await supabase
      .from(TABLES.CONNECTIONS)
      .select('id, status')
      .or(`and(requester_id.eq.${requester_id},recipient_id.eq.${recipient_id}),and(requester_id.eq.${recipient_id},recipient_id.eq.${requester_id})`)
      .single();

    if (existing) {
      return res.status(400).json({ 
        error: 'Connection already exists', 
        status: existing.status 
      });
    }

    // Create new connection
    const { data: connection, error: connectionError } = await supabase
      .from(TABLES.CONNECTIONS)
      .insert([{
        requester_id,
        recipient_id,
        message,
        status: 'pending'
      }])
      .select(`
        *,
        requester:members!member_connections_requester_id_fkey(first_name, last_name, company_name),
        recipient:members!member_connections_recipient_id_fkey(first_name, last_name, company_name)
      `)
      .single();

    if (connectionError) throw connectionError;

    // Send notification email to recipient
    try {
      await sendConnectionNotification(connection, supabase);
    } catch (emailError) {
      console.error('Failed to send connection notification:', emailError);
      // Don't fail the request if email fails
    }

    return res.status(201).json({ success: true, data: connection });
  } catch (error) {
    console.error('Error creating connection:', error);
    return res.status(400).json({ error: error.message });
  }
}

// Update connection status (accept/decline)
async function updateConnectionStatus(req, res, supabase) {
  const { id } = req.query;
  const { status, member_id } = req.body; // member_id for authorization

  if (!id || !status || !member_id) {
    return res.status(400).json({ error: 'Connection ID, status, and member ID required' });
  }

  if (!['accepted', 'declined'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be accepted or declined' });
  }

  try {
    // Verify member is the recipient of this connection
    const { data: connection, error: fetchError } = await supabase
      .from(TABLES.CONNECTIONS)
      .select('*')
      .eq('id', id)
      .eq('recipient_id', member_id)
      .eq('status', 'pending')
      .single();

    if (fetchError || !connection) {
      return res.status(404).json({ error: 'Connection not found or unauthorized' });
    }

    // Update status
    const { data: updatedConnection, error: updateError } = await supabase
      .from(TABLES.CONNECTIONS)
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select(`
        *,
        requester:members!member_connections_requester_id_fkey(first_name, last_name, email),
        recipient:members!member_connections_recipient_id_fkey(first_name, last_name, email)
      `)
      .single();

    if (updateError) throw updateError;

    // Send status update notification
    try {
      await sendConnectionStatusNotification(updatedConnection, status, supabase);
    } catch (emailError) {
      console.error('Failed to send status notification:', emailError);
    }

    return res.status(200).json({ success: true, data: updatedConnection });
  } catch (error) {
    console.error('Error updating connection status:', error);
    return res.status(400).json({ error: error.message });
  }
}

// Helper function to send connection notification email
async function sendConnectionNotification(connection, supabase) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return;

  // Get recipient email
  const { data: recipient } = await supabase
    .from(TABLES.MEMBERS)
    .select('email')
    .eq('id', connection.recipient_id)
    .single();

  if (!recipient?.email) return;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Connection Request - Miami Business Council</h2>
      <p>Hi ${connection.recipient.first_name},</p>
      <p><strong>${connection.requester.first_name} ${connection.requester.last_name}</strong> from <strong>${connection.requester.company_name}</strong> would like to connect with you on Miami Business Council.</p>
      ${connection.message ? `<p><em>"${connection.message}"</em></p>` : ''}
      <p><a href="https://miamibusinesscouncil.com/partnership-portal.html" style="background: #d4af37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Connection Request</a></p>
    </div>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Miami Business Council <connections@miamibusinesscouncil.com>',
      to: [recipient.email],
      subject: `New connection request from ${connection.requester.first_name} ${connection.requester.last_name}`,
      html: emailHtml
    })
  });
}

// Helper function to send connection status notification
async function sendConnectionStatusNotification(connection, status, supabase) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Connection ${status === 'accepted' ? 'Accepted' : 'Declined'} - Miami Business Council</h2>
      <p>Hi ${connection.requester.first_name},</p>
      <p><strong>${connection.recipient.first_name} ${connection.recipient.last_name}</strong> has <strong>${status}</strong> your connection request.</p>
      ${status === 'accepted' ? '<p>You can now reach out to them directly through the member portal!</p>' : ''}
      <p><a href="https://miamibusinesscouncil.com/partnership-portal.html" style="background: #d4af37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Portal</a></p>
    </div>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Miami Business Council <connections@miamibusinesscouncil.com>',
      to: [connection.requester.email],
      subject: `Connection ${status} by ${connection.recipient.first_name} ${connection.recipient.last_name}`,
      html: emailHtml
    })
  });
}