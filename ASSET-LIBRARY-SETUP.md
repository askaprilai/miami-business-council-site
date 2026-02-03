# Logo & Asset Library Setup Guide

## 🎯 What This Does

Creates a high-resolution logo database system for Miami Business Council with:
- **Member company logos** - High-res logos for each member
- **MBC brand assets** - Miami Business Council's own branding materials
- **Sponsor logos** - Event sponsor and partner logos
- **Marketing assets** - General marketing materials

## 📦 Features

✅ High-resolution storage (up to 10MB per file)
✅ Organized by category (member, brand, sponsor, marketing)
✅ Metadata tracking (file size, dimensions, upload date, uploader)
✅ Members can upload their own company logos
✅ Admin can manage all assets
✅ Automatic member profile updates when logo uploaded
✅ Version history (old logos marked inactive, not deleted)

---

## 🚀 Installation Steps

### Step 1: Run SQL Migration in Supabase

1. **Go to Supabase Dashboard**
   https://supabase.com/dashboard/project/vsnvtujkkkbjpuuwxvyd

2. **Open SQL Editor**
   Click "SQL Editor" in the left sidebar

3. **Create New Query**
   Click "+ New query"

4. **Copy & Paste the Migration**
   Open the file: `supabase/migrations/create-asset-library.sql`
   Copy all contents and paste into the SQL Editor

5. **Run the Migration**
   Click "Run" button (or press Cmd/Ctrl + Enter)
   Wait for "Success" message

6. **Verify Storage Buckets Created**
   - Go to "Storage" in left sidebar
   - You should see 4 new buckets:
     - `member-logos`
     - `mbc-brand-assets`
     - `sponsor-logos`
     - `marketing-assets`

7. **Verify Table Created**
   - Go to "Table Editor" in left sidebar
   - You should see new table: `asset_library`
   - Click on it to view structure

---

### Step 2: Install Dependencies

```bash
cd /Users/apriljsabral/Documents/miami-business-council-site
npm install
```

This installs the `formidable` package needed for file uploads.

---

### Step 3: Deploy to Vercel

```bash
git add .
git commit -m "Add logo asset library system with high-res storage"
git push origin main
```

Vercel will automatically deploy the new API endpoint `/api/upload-logo`.

---

## 📸 How It Works

### For Members:

1. **Log into Member Portal**
2. **Go to Profile section**
3. **Click "🖼️ Upload Logo" under Company Logo**
4. **Select high-res logo file** (PNG or JPG up to 10MB)
5. **Logo uploads and displays immediately**
6. **Old logo is archived** (marked inactive, not deleted)

### For Admins:

1. **Access Admin Asset Manager** (coming soon)
2. **Upload brand assets, sponsor logos, marketing materials**
3. **View all uploaded assets organized by category**
4. **Download high-res originals anytime**
5. **Search and filter by company, date, type**

---

## 🗂️ Database Structure

### Storage Buckets:

| Bucket Name | Purpose | Max Size | Who Can Upload |
|-------------|---------|----------|----------------|
| `member-logos` | Member company logos | 10MB | Members (their own) |
| `mbc-brand-assets` | MBC branding | 10MB | Admins only |
| `sponsor-logos` | Event sponsors | 10MB | Admins only |
| `marketing-assets` | Marketing materials | 10MB | Admins only |

### Asset Library Table:

```sql
asset_library:
  - id (UUID, primary key)
  - member_id (UUID, links to member)
  - asset_type (member_logo, mbc_brand, sponsor_logo, marketing)
  - category (company_logo, event_banner, social_media, etc.)
  - file_name (original filename)
  - file_url (public Supabase Storage URL)
  - file_type (png, jpg, svg, webp)
  - file_size (bytes)
  - width (pixels)
  - height (pixels)
  - uploaded_by (who uploaded it)
  - description (optional notes)
  - alt_text (for accessibility)
  - is_active (true/false - for version history)
  - created_at (timestamp)
  - updated_at (timestamp)
```

### Members Table (Enhanced):

New columns added:
```sql
members:
  - company_logo_url (TEXT) - Latest logo URL
  - company_logo_updated_at (TIMESTAMPTZ) - Last updated
```

---

## 🔒 Security (Row Level Security)

### Members Can:
- ✅ View all active assets
- ✅ Upload their own company logo
- ✅ Update their own company logo
- ✅ Delete their own company logo
- ❌ Cannot upload brand assets, sponsor logos, or marketing materials
- ❌ Cannot modify other members' logos

### Admins Can:
- ✅ View all assets (active and inactive)
- ✅ Upload any type of asset
- ✅ Update any asset
- ✅ Delete any asset
- ✅ Access all storage buckets

**Admin Emails:**
- april@miamibusinesscouncil.com
- info@miamibusinesscouncil.com

---

## 🧪 Testing the System

### Test Member Logo Upload:

1. Log into member portal as a test member
2. Go to Profile section
3. Click "🖼️ Upload Logo"
4. Upload a high-res company logo (PNG or JPG)
5. Verify:
   - Logo appears in preview
   - Logo shows in member directory
   - `asset_library` table has new record
   - `member-logos` bucket has file
   - `members.company_logo_url` is updated

### Test Admin Access:

1. Log in as admin (april@miamibusinesscouncil.com)
2. Access asset manager (coming soon)
3. Upload a brand asset or sponsor logo
4. Verify:
   - Asset appears in admin dashboard
   - `asset_library` table has record
   - Correct bucket has the file

---

## 📊 API Endpoints

### POST `/api/upload-logo`

Upload a company logo (members) or brand asset (admins).

**Request:**
```javascript
// FormData with:
{
  logo: File, // The image file
  memberId: String, // Member UUID
  authToken: String, // Supabase auth token
  assetType: String, // 'member_logo' (default)
  description: String // Optional description
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logo uploaded successfully",
  "asset": {
    "id": "uuid",
    "url": "https://vsnvtujkkkbjpuuwxvyd.supabase.co/storage/v1/object/public/member-logos/...",
    "fileName": "company-logo.png",
    "fileType": "png",
    "fileSize": 245678
  }
}
```

---

## 🔮 Future Enhancements

### Phase 1 (Current):
- ✅ Database structure
- ✅ Storage buckets
- ✅ API endpoint
- ✅ Member logo upload

### Phase 2 (Coming Soon):
- Admin asset manager dashboard
- Bulk upload interface
- Image optimization/resizing
- Download high-res zip

### Phase 3 (Future):
- SVG support for vector logos
- Print-ready PDF/AI file storage
- Brand guidelines repository
- Asset usage analytics

---

## 📁 Files Created

1. **supabase/migrations/create-asset-library.sql**
   SQL migration to create buckets, tables, and RLS policies

2. **api/upload-logo.js**
   API endpoint for uploading logos with validation

3. **ASSET-LIBRARY-SETUP.md** (this file)
   Setup instructions and documentation

4. **package.json** (updated)
   Added `formidable` dependency for file uploads

---

## 🆘 Troubleshooting

### "Missing Supabase configuration" error:
- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set in Vercel environment variables

### "Upload failed" error:
- Check file size is under 10MB
- Verify file is PNG or JPG format
- Check Supabase storage quota

### "Unauthorized" error:
- Verify user is logged in to portal
- Check auth token is valid
- Verify member exists in database

### Bucket doesn't exist:
- Re-run SQL migration in Supabase
- Check Storage section in Supabase dashboard
- Verify bucket name spelling

---

## 📞 Support

Questions? Contact April at april@miamibusinesscouncil.com

---

**Created:** February 3, 2026
**Status:** Ready to deploy
**Version:** 1.0
