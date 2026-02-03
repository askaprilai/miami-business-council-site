// Upload company logo - Members can upload their own company logo
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disable body parser for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Database configuration error' });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Parse form data with formidable
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB max
      allowEmptyFiles: false,
      filter: function ({ mimetype }) {
        // Accept only image files
        return mimetype && mimetype.startsWith('image/');
      }
    });

    const [fields, files] = await form.parse(req);

    // Extract data
    const memberId = fields.memberId?.[0];
    const authToken = fields.authToken?.[0];
    const assetType = fields.assetType?.[0] || 'member_logo';
    const description = fields.description?.[0];

    if (!memberId || !authToken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!files.logo || !files.logo[0]) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const logoFile = files.logo[0];
    const fileBuffer = fs.readFileSync(logoFile.filepath);
    const fileName = logoFile.originalFilename || 'logo.png';
    const fileType = logoFile.mimetype.split('/')[1]; // png, jpg, etc.

    // Verify auth token and get member
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authToken);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify member exists and belongs to this user
    const { data: member, error: memberError } = await supabaseAdmin
      .from('members')
      .select('id, email, auth_user_id')
      .eq('id', memberId)
      .eq('auth_user_id', user.id)
      .single();

    if (memberError || !member) {
      return res.status(403).json({ error: 'Member not found or unauthorized' });
    }

    // Generate unique file name
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${memberId}/${timestamp}-${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('member-logos')
      .upload(storagePath, fileBuffer, {
        contentType: logoFile.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload file', details: uploadError.message });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('member-logos')
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Create asset library record
    const { data: asset, error: assetError } = await supabaseAdmin
      .from('asset_library')
      .insert({
        member_id: memberId,
        asset_type: assetType,
        category: 'company_logo',
        file_name: sanitizedFileName,
        file_url: publicUrl,
        file_type: fileType,
        file_size: logoFile.size,
        uploaded_by: user.id,
        description: description || null,
        alt_text: `${member.email} company logo`,
        is_active: true
      })
      .select()
      .single();

    if (assetError) {
      console.error('Asset record error:', assetError);
      // Try to clean up uploaded file
      await supabaseAdmin.storage.from('member-logos').remove([storagePath]);
      return res.status(500).json({ error: 'Failed to create asset record', details: assetError.message });
    }

    // Delete old logo from storage if it exists
    const { data: oldAssets } = await supabaseAdmin
      .from('asset_library')
      .select('file_url, id')
      .eq('member_id', memberId)
      .eq('asset_type', 'member_logo')
      .neq('id', asset.id);

    if (oldAssets && oldAssets.length > 0) {
      // Mark old assets as inactive
      await supabaseAdmin
        .from('asset_library')
        .update({ is_active: false })
        .in('id', oldAssets.map(a => a.id));
    }

    // Return success with asset data
    return res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      asset: {
        id: asset.id,
        url: publicUrl,
        fileName: sanitizedFileName,
        fileType: fileType,
        fileSize: logoFile.size
      }
    });

  } catch (error) {
    console.error('Error uploading logo:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
