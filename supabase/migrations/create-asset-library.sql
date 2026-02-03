-- =====================================================
-- LOGO & ASSET MANAGEMENT SYSTEM
-- High-resolution storage for member logos, branding, and sponsor assets
-- =====================================================

-- 1. Create Storage Buckets
-- These store the actual high-res files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('member-logos', 'member-logos', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']),
  ('mbc-brand-assets', 'mbc-brand-assets', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']),
  ('sponsor-logos', 'sponsor-logos', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']),
  ('marketing-assets', 'marketing-assets', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2. Create Asset Library Table
-- Tracks metadata for all uploaded assets
CREATE TABLE IF NOT EXISTS public.asset_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('member_logo', 'mbc_brand', 'sponsor_logo', 'marketing')),
  category TEXT, -- e.g., 'company_logo', 'event_banner', 'social_media'
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- png, jpg, svg, webp
  file_size INTEGER, -- in bytes
  width INTEGER, -- image width in pixels
  height INTEGER, -- image height in pixels
  uploaded_by UUID REFERENCES auth.users(id),
  description TEXT,
  alt_text TEXT, -- for accessibility
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add company_logo_url to members table
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
ADD COLUMN IF NOT EXISTS company_logo_updated_at TIMESTAMPTZ;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_asset_library_member_id ON public.asset_library(member_id);
CREATE INDEX IF NOT EXISTS idx_asset_library_asset_type ON public.asset_library(asset_type);
CREATE INDEX IF NOT EXISTS idx_asset_library_uploaded_by ON public.asset_library(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_asset_library_created_at ON public.asset_library(created_at DESC);

-- 5. Enable Row Level Security
ALTER TABLE public.asset_library ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for asset_library table

-- Members can view all active assets
CREATE POLICY "Members can view active assets"
ON public.asset_library
FOR SELECT
TO authenticated
USING (is_active = true);

-- Members can insert their own company logos
CREATE POLICY "Members can upload their own logos"
ON public.asset_library
FOR INSERT
TO authenticated
WITH CHECK (
  asset_type = 'member_logo'
  AND member_id IN (
    SELECT id FROM public.members WHERE auth_user_id = auth.uid()
  )
);

-- Members can update their own logos
CREATE POLICY "Members can update their own logos"
ON public.asset_library
FOR UPDATE
TO authenticated
USING (
  member_id IN (
    SELECT id FROM public.members WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  member_id IN (
    SELECT id FROM public.members WHERE auth_user_id = auth.uid()
  )
);

-- Members can delete their own logos
CREATE POLICY "Members can delete their own logos"
ON public.asset_library
FOR DELETE
TO authenticated
USING (
  member_id IN (
    SELECT id FROM public.members WHERE auth_user_id = auth.uid()
  )
);

-- Admins can do everything (update this with actual admin check)
CREATE POLICY "Admins can manage all assets"
ON public.asset_library
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.members
    WHERE auth_user_id = auth.uid()
    AND (email = 'april@miamibusinesscouncil.com' OR email = 'info@miamibusinesscouncil.com')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.members
    WHERE auth_user_id = auth.uid()
    AND (email = 'april@miamibusinesscouncil.com' OR email = 'info@miamibusinesscouncil.com')
  )
);

-- 7. Storage Policies for member-logos bucket

-- Members can upload to their own folder
CREATE POLICY "Members can upload their logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'member-logos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.members WHERE auth_user_id = auth.uid()
  )
);

-- Anyone can view public logos
CREATE POLICY "Anyone can view member logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'member-logos');

-- Members can update their own logos
CREATE POLICY "Members can update their logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'member-logos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.members WHERE auth_user_id = auth.uid()
  )
);

-- Members can delete their own logos
CREATE POLICY "Members can delete their logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'member-logos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM public.members WHERE auth_user_id = auth.uid()
  )
);

-- 8. Storage Policies for admin buckets (mbc-brand-assets, sponsor-logos, marketing-assets)

-- Only admins can upload to admin buckets
CREATE POLICY "Admins can upload brand assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('mbc-brand-assets', 'sponsor-logos', 'marketing-assets')
  AND EXISTS (
    SELECT 1 FROM public.members
    WHERE auth_user_id = auth.uid()
    AND (email = 'april@miamibusinesscouncil.com' OR email = 'info@miamibusinesscouncil.com')
  )
);

-- Anyone can view public assets
CREATE POLICY "Anyone can view brand assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id IN ('mbc-brand-assets', 'sponsor-logos', 'marketing-assets'));

-- Only admins can update/delete
CREATE POLICY "Admins can update brand assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('mbc-brand-assets', 'sponsor-logos', 'marketing-assets')
  AND EXISTS (
    SELECT 1 FROM public.members
    WHERE auth_user_id = auth.uid()
    AND (email = 'april@miamibusinesscouncil.com' OR email = 'info@miamibusinesscouncil.com')
  )
);

CREATE POLICY "Admins can delete brand assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id IN ('mbc-brand-assets', 'sponsor-logos', 'marketing-assets')
  AND EXISTS (
    SELECT 1 FROM public.members
    WHERE auth_user_id = auth.uid()
    AND (email = 'april@miamibusinesscouncil.com' OR email = 'info@miamibusinesscouncil.com')
  )
);

-- 9. Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_asset_library_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER asset_library_updated_at
BEFORE UPDATE ON public.asset_library
FOR EACH ROW
EXECUTE FUNCTION update_asset_library_updated_at();

-- 10. Function to update member's company_logo_url when they upload
CREATE OR REPLACE FUNCTION update_member_logo_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.asset_type = 'member_logo' AND NEW.member_id IS NOT NULL THEN
    UPDATE public.members
    SET
      company_logo_url = NEW.file_url,
      company_logo_updated_at = NOW()
    WHERE id = NEW.member_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_member_logo
AFTER INSERT OR UPDATE ON public.asset_library
FOR EACH ROW
EXECUTE FUNCTION update_member_logo_url();

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Query all member logos:
-- SELECT * FROM asset_library WHERE asset_type = 'member_logo' AND is_active = true;

-- Query assets for specific member:
-- SELECT * FROM asset_library WHERE member_id = 'xxx-xxx-xxx';

-- Query all MBC brand assets:
-- SELECT * FROM asset_library WHERE asset_type = 'mbc_brand' AND is_active = true;

-- Get member with their logo:
-- SELECT m.*, m.company_logo_url FROM members m WHERE m.id = 'xxx';
