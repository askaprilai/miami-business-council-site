# Smart Match Collaborations - Supabase Edge Function

AI-powered matching system that recommends collaboration requests to members based on their profile and expertise.

## Features

- Uses OpenAI GPT-4o-mini for intelligent matching
- Analyzes member profile (industry, expertise, services)
- Compares with open collaboration requests
- Returns top 5 matches with scores and explanations

## Setup

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Link to Your Supabase Project

```bash
cd /Users/apriljsabral/Documents/miami-business-council-site
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Set Environment Variables

In your Supabase dashboard:
- Go to **Settings** > **Edge Functions**
- Add secret: `OPENAI_API_KEY` with your OpenAI API key

### 4. Deploy the Function

```bash
supabase functions deploy smart-match-collaborations
```

### 5. Test the Function

```bash
curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/smart-match-collaborations' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

## Usage

The function is called automatically from the portal when a member visits the Collaboration Hub. It returns:

```json
{
  "matches": [
    {
      "id": "uuid",
      "title": "Need logo designer",
      "description": "...",
      "category": "design",
      "budget_range": "1k-5k",
      "timeline": "short-term",
      "member_id": "uuid",
      "matchScore": 95,
      "matchReason": "Your graphic design expertise perfectly matches their branding needs"
    }
  ]
}
```

## Cost Optimization

- Uses `gpt-4o-mini` (cheaper than GPT-4)
- Analyzes only top 20 open requests
- Returns max 5 recommendations
- Cached for 5 minutes per user (implement in frontend)

## Error Handling

- Returns empty array if no matches
- Handles missing member profiles gracefully
- Logs errors for debugging
