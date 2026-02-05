# Miami Business Council
## Platform Operating Budget 2025

*Prepared for Board Meeting | February 2025*

---

## Executive Summary

The MBC platform runs on a modern, scalable technology stack that keeps costs low while enabling growth. Current infrastructure can support up to 100 members on free tiers, with minimal costs scaling as membership grows.

**Current Monthly Cost (at ~25 members): ~$5-20/month**
**Projected Cost at 150 members: ~$100-150/month**

---

## Technology Stack Overview

| Service | Purpose | Current Status |
|---------|---------|----------------|
| **Vercel** | Website hosting & API | Free tier |
| **Supabase** | Database, Authentication, Storage | Free tier |
| **OpenAI** | AI-powered member matching | Pay-per-use |
| **Zeffy** | Payment processing | Free (0% fees) |
| **Domain** | miamibusinesscouncil.com | Paid annually |

---

## Detailed Monthly Costs by Member Count

### Infrastructure Costs

| Members | Vercel | Supabase | OpenAI (AI Matching) | Domain | Email | **Monthly Total** |
|---------|--------|----------|----------------------|--------|-------|-------------------|
| **25**  | $0     | $0       | ~$5                  | $1     | $0    | **$6**            |
| **50**  | $0     | $0       | ~$10                 | $1     | $0    | **$11**           |
| **75**  | $0     | $0       | ~$15                 | $1     | $20   | **$36**           |
| **100** | $0     | $25      | ~$20                 | $1     | $20   | **$66**           |
| **125** | $20    | $25      | ~$25                 | $1     | $20   | **$91**           |
| **150** | $20    | $25      | ~$30                 | $1     | $35   | **$111**          |
| **200** | $20    | $25      | ~$40                 | $1     | $35   | **$121**          |
| **300** | $20    | $25      | ~$60                 | $1     | $50   | **$156**          |
| **500** | $20    | $75      | ~$100                | $1     | $75   | **$271**          |

---

## Service Pricing Details

### Vercel (Hosting)
| Tier | Monthly Cost | Features |
|------|--------------|----------|
| **Hobby (Free)** | $0 | 100GB bandwidth, serverless functions |
| **Pro** | $20/mo | 1TB bandwidth, analytics, team features |

*Upgrade recommended at 100-125 members or when team collaboration needed*

### Supabase (Database & Auth)
| Tier | Monthly Cost | Database | Storage | Users |
|------|--------------|----------|---------|-------|
| **Free** | $0 | 500 MB | 1 GB | 50K MAU |
| **Pro** | $25/mo | 8 GB | 100 GB | 100K MAU |
| **Team** | $599/mo | 16 GB | 200 GB | 100K MAU |

*Upgrade to Pro recommended at ~100 members for performance and reliability*

### OpenAI (AI Member Matching)
| Model Used | Cost per 1M tokens | Est. Cost per Match |
|------------|-------------------|---------------------|
| **GPT-4o-mini** | $0.15 input / $0.60 output | ~$0.01-0.02 |

**Estimated Monthly AI Usage:**
- 25 members × 4 matches/month = 100 calls = ~$2-5/mo
- 100 members × 4 matches/month = 400 calls = ~$8-20/mo
- 150 members × 4 matches/month = 600 calls = ~$15-30/mo

*Note: Using GPT-4o-mini keeps costs extremely low while maintaining quality*

### Email Service (Future - Resend/SendGrid)
| Tier | Monthly Cost | Emails/Month |
|------|--------------|--------------|
| **Free** | $0 | 3,000 |
| **Starter** | $20/mo | 50,000 |
| **Growth** | $35/mo | 100,000 |

*Currently using manual email; automation recommended at 75+ members*

### Zeffy (Payment Processing)
| | Traditional Processor | Zeffy |
|--|----------------------|-------|
| **Fee** | 2.9% + $0.30 | **0%** |
| **On $100 membership** | $3.20 | **$0** |
| **Annual savings (100 members)** | -- | **~$3,840** |

*Zeffy saves significant processing fees - major cost advantage*

---

## Developer/Maintenance Costs

### Option A: As-Needed Support
*Bug fixes and minor updates only*

| Hours/Month | Rate | Monthly Cost |
|-------------|------|--------------|
| 2-5 hours | $100/hr | **$200-500** |

**Best for:** Stable platform with occasional fixes

### Option B: Monthly Retainer
*Regular maintenance + feature development*

| Hours/Month | Monthly Cost | Includes |
|-------------|--------------|----------|
| 10 hrs | **$1,000-1,500** | Bug fixes, minor features, monitoring |
| 20 hrs | **$2,000-3,000** | Active development, new features |
| 40 hrs | **$4,000-6,000** | Dedicated part-time developer |

**Best for:** Growing platform with regular updates needed

### Option C: Agency Partnership
*Full-service support*

| Level | Monthly Cost | Includes |
|-------|--------------|----------|
| Basic | **$1,500-2,500** | Maintenance, 24hr response, hosting |
| Growth | **$3,000-5,000** | Active development, strategy |

---

## Total Annual Budget Projections

### Conservative (Minimal Dev Support)

| Members | Platform/yr | Dev (3 hrs/mo) | **Annual Total** |
|---------|-------------|----------------|------------------|
| 25 | $72 | $3,600 | **$3,672** |
| 50 | $132 | $3,600 | **$3,732** |
| 100 | $792 | $4,800 | **$5,592** |
| 150 | $1,332 | $6,000 | **$7,332** |

### Moderate (10 hr/mo Retainer)

| Members | Platform/yr | Dev (10 hrs/mo) | **Annual Total** |
|---------|-------------|-----------------|------------------|
| 25 | $72 | $12,000 | **$12,072** |
| 50 | $132 | $12,000 | **$12,132** |
| 100 | $792 | $15,000 | **$15,792** |
| 150 | $1,332 | $18,000 | **$19,332** |

### Growth (20 hr/mo Active Development)

| Members | Platform/yr | Dev (20 hrs/mo) | **Annual Total** |
|---------|-------------|-----------------|------------------|
| 25 | $72 | $24,000 | **$24,072** |
| 50 | $132 | $30,000 | **$30,132** |
| 100 | $792 | $36,000 | **$36,792** |
| 150 | $1,332 | $42,000 | **$43,332** |

---

## Cost Per Member Analysis

| Members | Conservative | Moderate | Growth |
|---------|--------------|----------|--------|
| 25 | $147/member/yr | $483/member/yr | $963/member/yr |
| 50 | $75/member/yr | $243/member/yr | $603/member/yr |
| 100 | $56/member/yr | $158/member/yr | $368/member/yr |
| 150 | $49/member/yr | $129/member/yr | $289/member/yr |

**Key Insight:** Cost per member drops significantly with growth. At 150 members, even full development support costs less than $25/month per member.

---

## Revenue vs. Cost Comparison

*Assuming $100/month membership fee*

| Members | Monthly Revenue | Monthly Platform Cost | Monthly Dev Cost | **Net Margin** |
|---------|-----------------|----------------------|------------------|----------------|
| 25 | $2,500 | $6 | $300 | **$2,194 (88%)** |
| 50 | $5,000 | $11 | $500 | **$4,489 (90%)** |
| 100 | $10,000 | $66 | $1,250 | **$8,684 (87%)** |
| 150 | $15,000 | $111 | $1,500 | **$13,389 (89%)** |

---

## Recommendations

### Immediate (Current - 50 Members)
- Remain on free tiers for all services
- Budget $200-500/month for as-needed developer support
- **Total Monthly Budget: $500**

### Short-term (50-100 Members)
- Upgrade Supabase to Pro tier ($25/mo)
- Implement email automation ($20/mo)
- Establish 10-hour developer retainer ($1,000-1,500/mo)
- **Total Monthly Budget: $1,500-2,000**

### Growth Phase (100-200 Members)
- Upgrade Vercel to Pro tier ($20/mo)
- Increase developer retainer to 15-20 hours
- Consider part-time community manager
- **Total Monthly Budget: $2,500-3,500**

---

## Key Takeaways for the Board

1. **Platform costs are minimal** - Modern cloud architecture keeps infrastructure under $150/month even at 150+ members

2. **AI matching is cost-effective** - Using GPT-4o-mini costs ~$0.01-0.02 per match, enabling AI-powered features affordably

3. **Zeffy saves ~$3,800/year** - Zero payment processing fees vs. traditional 2.9% + $0.30

4. **Developer costs are the main expense** - Budget 80-90% of tech costs for development/maintenance

5. **Strong unit economics** - Even with full development support, platform costs are <$30/member/month

6. **Scalable foundation** - Architecture can grow to 500+ members without major changes

---

## Appendix: Service Links & Contacts

- **Vercel Dashboard**: vercel.com/dashboard
- **Supabase Dashboard**: supabase.com/dashboard
- **OpenAI API**: platform.openai.com
- **Zeffy**: zeffy.com

---

*This budget assumes current architecture. Major feature additions (mobile app, video conferencing integration, etc.) would require separate project budgets.*

*Prepared February 2025*
