# Incident Response Plan
**Miami Business Council**
**Version:** 1.0
**Effective Date:** January 22, 2026
**Last Reviewed:** January 22, 2026

---

## Executive Summary

This Incident Response Plan (IRP) provides procedures for identifying, responding to, and recovering from security incidents affecting the Miami Business Council member portal and member data.

**Purpose:** Minimize impact of security incidents and ensure rapid, effective response.

**Scope:** All systems, data, and services related to MBC member portal.

**Incident Definition:** Any event that compromises the confidentiality, integrity, or availability of member data or portal services.

---

## 1. Incident Response Team

### 1.1 Core Team

| Role | Responsibilities | Contact |
|------|-----------------|---------|
| **Incident Commander** | Overall response coordination | April Sabral<br>april@retailu.ca<br>[Phone] |
| **Technical Lead** | System analysis, containment | [IT Contact or You]<br>[Email]<br>[Phone] |
| **Communications Lead** | Member/board notifications | [Communications Contact]<br>[Email]<br>[Phone] |
| **Legal Counsel** | Legal compliance, liability | [Attorney Name]<br>[Law Firm]<br>[Email]<br>[Phone] |
| **Board Representative** | Board liaison | [Board Member]<br>[Email]<br>[Phone] |

### 1.2 Extended Team (as needed)

- **Supabase Support:** support@supabase.com
- **Vercel Support:** support@vercel.com
- **Cyber Insurance:** [Provider] - [Policy #] - [Phone]
- **PR Consultant:** [If needed for major breach]
- **Forensics Firm:** [If needed for investigation]

### 1.3 Escalation Thresholds

| Severity | Criteria | Response Team | Notification |
|----------|----------|---------------|--------------|
| **Critical** | PII breach >50 members, system down >4 hours | Full team + Board | Immediate |
| **High** | PII breach <50 members, system down 1-4 hours | Core team | Within 1 hour |
| **Medium** | Attempted breach, degraded service | Technical + IC | Within 4 hours |
| **Low** | Suspicious activity, no confirmed breach | Technical Lead | Next business day |

---

## 2. Incident Types

### 2.1 Data Breach

**Definition:** Unauthorized access to member personal information

**Examples:**
- Database intrusion
- Stolen credentials
- Insider threat
- Vendor breach

**Indicators:**
- Unusual database queries
- Unexpected data exports
- Authentication anomalies
- Member reports of unauthorized access

### 2.2 Service Disruption

**Definition:** Portal unavailable or severely degraded

**Examples:**
- DDoS attack
- Infrastructure failure
- Malicious code injection
- Accidental deletion

**Indicators:**
- Portal down or slow
- Error messages
- Member complaints
- Monitoring alerts

### 2.3 Account Compromise

**Definition:** Individual member account accessed by unauthorized party

**Examples:**
- Email account takeover
- Magic link interception
- Session hijacking
- Social engineering

**Indicators:**
- Unusual login locations
- Multiple failed login attempts
- Member report of unauthorized activity
- Suspicious messages sent from account

### 2.4 Malware/Ransomware

**Definition:** Malicious software affecting systems

**Examples:**
- Ransomware encryption
- Trojan horses
- Keyloggers
- Cryptominers

**Indicators:**
- Files encrypted
- Ransom demand
- Unexpected CPU usage
- Antivirus alerts

---

## 3. Incident Response Phases

### Phase 1: DETECTION (0-15 minutes)

**Objective:** Identify and verify the incident

#### 3.1 Detection Sources

**Automated:**
- Supabase monitoring alerts
- Vercel error notifications
- Authentication logs (unusual patterns)
- Database query monitoring

**Manual:**
- Member reports
- Staff observation
- Security audits
- Media reports

#### 3.2 Initial Assessment

**Questions to answer:**
1. What happened?
2. When did it start?
3. What systems are affected?
4. Is it confirmed or suspected?
5. Is it still ongoing?

#### 3.3 Immediate Actions

✅ **Document everything**
- Screenshot errors
- Copy log files
- Note timeline
- Record observations

✅ **Preserve evidence**
- Don't delete logs
- Don't modify systems
- Take system snapshots
- Save email notifications

✅ **Verify incident**
- Rule out false positives
- Confirm with second person
- Check multiple sources

#### 3.4 Decision Point

**Is this a confirmed incident?**
- **YES** → Proceed to Containment (Phase 2)
- **NO** → Document as false alarm, continue monitoring
- **UNSURE** → Escalate to Technical Lead for assessment

---

### Phase 2: CONTAINMENT (15 minutes - 2 hours)

**Objective:** Stop the incident from spreading or worsening

#### 3.1 Short-Term Containment

**For Data Breach:**
1. Revoke compromised API keys immediately
   ```bash
   # Via Supabase Dashboard:
   # Project Settings → API → Revoke and generate new keys
   ```
2. Reset all session tokens
3. Enable IP restrictions if possible
4. Isolate affected systems
5. Block suspicious IP addresses

**For Service Disruption:**
1. Enable maintenance mode if needed
2. Scale down if DDoS suspected
3. Rollback recent deployments if applicable
4. Switch to backup systems if available

**For Account Compromise:**
1. Suspend affected account(s)
2. Revoke active sessions
3. Reset authentication for affected members
4. Enable additional logging

**For Malware:**
1. Disconnect infected systems
2. Block command & control IPs
3. Scan all systems
4. Restore from clean backups if needed

#### 3.2 Activate Incident Response Team

**Notify:**
- Incident Commander (immediately)
- Technical Lead (immediately)
- Other team members per severity

**Communication Template:**
```
SUBJECT: SECURITY INCIDENT - [SEVERITY] - [BRIEF DESCRIPTION]

INCIDENT: [Type of incident]
DETECTED: [Time and date]
STATUS: [Ongoing/Contained]
AFFECTED SYSTEMS: [List]
MEMBERS IMPACTED: [Number/percentage]

ACTIONS TAKEN:
- [List containment steps]

NEXT STEPS:
- [Immediate priorities]

CONFERENCE CALL: [If needed - link/number]

- [Your Name], Incident Commander
```

#### 3.3 Communication Freeze

**IMPORTANT:** Do NOT communicate externally until:
- Incident is confirmed and understood
- Legal counsel consulted (for breaches)
- Communication plan approved

**Exception:** Critical security updates to protect members

---

### Phase 3: ERADICATION (2-24 hours)

**Objective:** Remove the threat and vulnerabilities

#### 3.1 Root Cause Analysis

**Investigate:**
- How did the attacker gain access?
- What vulnerabilities were exploited?
- What data was accessed?
- How long was the breach active?

**Log Analysis:**
```bash
# Check Supabase auth logs
# Dashboard → Authentication → Logs

# Check Vercel deployment logs
# Dashboard → Deployments → [Select deployment] → Function Logs

# Check database query logs
# Dashboard → Database → Query Performance
```

#### 3.2 Remove Threat

**Delete:**
- Malicious code
- Backdoors
- Unauthorized accounts
- Malware

**Patch:**
- Security vulnerabilities
- Outdated dependencies
- Configuration weaknesses

**Update:**
- All passwords/keys (if exposed)
- Security rules
- Access controls

#### 3.3 Verify Clean State

**Checklist:**
- [ ] All malware removed
- [ ] Backdoors closed
- [ ] Vulnerabilities patched
- [ ] Systems scanned and clean
- [ ] Logs show no suspicious activity
- [ ] Independent verification (if major breach)

---

### Phase 4: RECOVERY (1-7 days)

**Objective:** Restore normal operations securely

#### 4.1 System Restoration

**Steps:**
1. Restore from clean backups (if needed)
2. Apply all security patches
3. Reconfigure security settings
4. Test all critical functions
5. Gradually restore services
6. Monitor closely for 48+ hours

**Testing Checklist:**
- [ ] Login/authentication works
- [ ] Member data intact
- [ ] Profile updates work
- [ ] Messages send correctly
- [ ] Events display properly
- [ ] Admin functions operational
- [ ] Performance acceptable

#### 4.2 Enhanced Monitoring

**For 30 days post-incident:**
- Review logs daily
- Monitor authentication patterns
- Track database queries
- Watch for similar attacks
- Set up additional alerts

#### 4.3 Member Communication

**Timeline:**

**Immediate (if critical):**
- Notify affected members within 24 hours
- Brief description only
- Protective actions they should take

**Follow-up (72 hours):**
- Detailed explanation
- What data was affected
- What we're doing
- Resources for members

**Final (7-14 days):**
- Incident resolved
- Preventive measures implemented
- Lessons learned (high-level)

**Communication Template:**
```
SUBJECT: Important Security Update - Miami Business Council

Dear [Member Name],

We are writing to inform you of a security incident affecting the Miami Business Council member portal.

WHAT HAPPENED:
[Brief, clear description]

WHEN:
[Date range]

WHAT DATA WAS AFFECTED:
[Specific data types - be transparent]

WHAT WE'RE DOING:
- [Immediate actions taken]
- [Long-term improvements]

WHAT YOU SHOULD DO:
- [Specific recommendations]
- [Links to resources]

We take the security of your information very seriously and sincerely apologize for this incident.

QUESTIONS:
Contact us at security@miamibusinesscouncil.com

Sincerely,
[Name], Miami Business Council
```

---

### Phase 5: POST-INCIDENT (1-4 weeks)

**Objective:** Learn from the incident and improve defenses

#### 5.1 Post-Incident Review Meeting

**When:** Within 1 week of incident resolution

**Attendees:**
- Incident Response Team
- Board representative
- Any relevant stakeholders

**Agenda:**
1. Incident timeline review
2. What went well
3. What could be improved
4. Root cause analysis
5. Preventive measures
6. Policy/procedure updates
7. Training needs

#### 5.2 Documentation

**Create:**

**Incident Report (Internal):**
- Timeline of events
- Actions taken
- Data affected
- Cost impact
- Lessons learned

**Incident Summary (Board):**
- Executive summary
- Member impact
- Financial impact
- Remediation steps
- Preventive measures

**Public Statement (if needed):**
- Approved by legal counsel
- Transparent but not overly technical
- Focus on resolution and prevention

#### 5.3 Preventive Measures

**Immediate (1 week):**
- Patch identified vulnerabilities
- Update access controls
- Enhance monitoring

**Short-term (1 month):**
- Implement new security controls
- Update policies and procedures
- Conduct security training
- Review vendor agreements

**Long-term (3-6 months):**
- Security audit
- Penetration testing
- Enhanced encryption
- Disaster recovery drills

#### 5.4 Regulatory Reporting

**Deadlines:**

| Regulation | Deadline | Method |
|------------|----------|--------|
| **GDPR** | 72 hours | Supervisory authority |
| **CCPA** | "Without unreasonable delay" | Written notice |
| **State breach laws** | Varies by state | Varies |
| **Cyber insurance** | Per policy (usually 48 hours) | Phone + written |

**Florida Data Breach Law:**
- Notify affected residents "as expeditiously as possible"
- No later than 30 days after determination of breach

---

## 4. Communication Protocols

### 4.1 Internal Communication

**During Incident:**
- Secure channel only (Signal, encrypted email)
- Regular updates every 2-4 hours
- Status updates to board (daily minimum)
- Document all decisions

**After Incident:**
- Post-mortem meeting
- Written report distributed
- Board presentation
- Staff training updates

### 4.2 External Communication

**Members:**
- Email notification (primary)
- Portal banner (if operational)
- Website announcement
- Social media (if major)

**Regulators:**
- Written notice per requirements
- Follow-up as requested
- Cooperation with investigations

**Media:**
- Prepared statement only
- Designated spokesperson
- Consistent messaging
- No speculation

**Template Responses:**

**For Media Inquiries:**
```
"We are aware of [incident type] affecting our member portal. The security and privacy of our members is our top priority. We have taken immediate action to [contain/resolve] the issue and are working with security experts to investigate. We will provide updates as appropriate. For more information, contact [spokesperson] at [email]."
```

**For Member Hotline:**
```
"Thank you for contacting Miami Business Council. We are responding to a security incident. Here's what we know: [brief summary]. Here's what you should do: [actions]. For more information, visit [URL] or email security@miamibusinesscouncil.com."
```

### 4.3 Communication "Do's and Don'ts"

**DO:**
- Be transparent and honest
- Provide specific, actionable guidance
- Express empathy and concern
- Give timeline for updates
- Offer support resources

**DON'T:**
- Speculate about cause
- Blame vendors or members
- Minimize the severity
- Make promises you can't keep
- Discuss ongoing investigation details

---

## 5. Incident Scenarios and Playbooks

### Scenario 1: Supabase Database Breach

**Indicators:**
- Alert from Supabase about unauthorized access
- Unusual database queries in logs
- Member data downloaded by unknown party

**Response:**
1. **Immediate (0-15 min):**
   - Verify alert is legitimate
   - Check Supabase audit logs
   - Document what data was accessed

2. **Containment (15-60 min):**
   - Rotate service role key immediately
   - Revoke compromised API keys
   - Reset all member sessions
   - Enable IP allowlist if possible

3. **Investigation (1-4 hours):**
   - Review all database access logs
   - Identify entry point
   - Determine data scope
   - Check for data exfiltration

4. **Notification (4-24 hours):**
   - Notify affected members
   - Report to authorities (if required)
   - File insurance claim

5. **Remediation (1-7 days):**
   - Patch vulnerabilities
   - Enhanced RLS policies
   - Implement additional monitoring
   - Security audit

### Scenario 2: Magic Link Interception

**Indicators:**
- Member reports unauthorized login
- Login from unusual location
- Multiple magic links requested

**Response:**
1. **Immediate:**
   - Suspend affected account
   - Revoke all sessions for that user
   - Check authentication logs

2. **Investigation:**
   - Verify member's email account security
   - Check if email was compromised
   - Review recent account activity

3. **Resolution:**
   - Reset member authentication
   - Guide member through email security
   - Monitor account for 30 days
   - Consider IP-based alerts

4. **Prevention:**
   - Reduce magic link expiry time
   - Add device verification
   - Implement suspicious login alerts

### Scenario 3: DDoS Attack

**Indicators:**
- Portal slow or unresponsive
- Spike in traffic from same IPs
- Vercel/Supabase alerts

**Response:**
1. **Immediate:**
   - Verify it's DDoS (not legitimate traffic)
   - Enable rate limiting
   - Contact Vercel/Supabase support

2. **Mitigation:**
   - Cloudflare DDoS protection (if available)
   - Block attacking IPs
   - Scale infrastructure if needed

3. **Communication:**
   - Update members about slowness
   - Provide ETA for resolution
   - Alternative contact methods

4. **Recovery:**
   - Monitor traffic patterns
   - Identify attack source
   - Implement permanent DDoS protection

### Scenario 4: Insider Threat

**Indicators:**
- Unauthorized data access by team member
- Data shared without authorization
- Suspicious admin activity

**Response:**
1. **Immediate:**
   - Revoke access immediately
   - Document evidence
   - Secure audit logs

2. **Investigation:**
   - Review all access logs
   - Determine data accessed
   - Interview if appropriate
   - Consult legal counsel

3. **Legal:**
   - Consider law enforcement
   - Review employment agreement
   - Document termination procedures

4. **Prevention:**
   - Review access controls
   - Implement dual control
   - Enhanced monitoring
   - Background checks

---

## 6. Tools and Resources

### 6.1 Incident Response Tools

**Communication:**
- Signal (encrypted messaging)
- Zoom (secure video calls)
- Google Workspace (secure docs)

**Investigation:**
- Supabase Dashboard (logs, monitoring)
- Vercel Dashboard (deployment logs)
- Browser DevTools (network analysis)

**Documentation:**
- Incident log template (see Appendix A)
- Timeline tracker
- Decision log

**Forensics (if needed):**
- Wireshark (network analysis)
- Log aggregation tools
- Forensics firm contact

### 6.2 Key Contacts

**Vendors:**
- Supabase Support: support@supabase.com
- Vercel Support: support@vercel.com
- Resend Support: support@resend.com

**Authorities:**
- FBI Cyber Division: (305) 944-9101 (Miami)
- Florida AG Cybercrime: (850) 414-3990
- FTC: identitytheft.gov

**Resources:**
- CISA (Cybersecurity & Infrastructure Security Agency): cisa.gov
- SANS Incident Response Guide: sans.org
- US-CERT: us-cert.gov

### 6.3 Insurance

**Cyber Insurance Policy:**
- Provider: [Insurance Company]
- Policy Number: [Number]
- Coverage: [Amount]
- Deductible: [Amount]
- Contact: [Adjuster] - [Phone]

**Report Claims:**
- Within 48 hours of discovery
- Use claim form (on file)
- Provide incident details
- Follow up documentation as requested

---

## 7. Training and Testing

### 7.1 Annual Training

**All Staff:**
- Security awareness
- Phishing recognition
- Password hygiene (email accounts)
- Incident reporting

**Incident Response Team:**
- Incident response procedures
- Communication protocols
- Regulatory requirements
- Tool familiarity

### 7.2 Tabletop Exercises

**Frequency:** Every 6 months

**Format:**
- 2-hour facilitated session
- Walk through scenario
- Test communication
- Identify gaps

**Sample Scenarios:**
- Database breach
- Ransomware attack
- Vendor compromise
- Extended outage

### 7.3 Plan Maintenance

**Review Schedule:**
- Annual full review
- Quarterly contact verification
- After each incident (update lessons learned)
- When systems change significantly

**Version Control:**
- Maintain version history
- Document all changes
- Board approval for major updates
- Distribute updated versions

---

## 8. Appendices

### Appendix A: Incident Log Template

```
INCIDENT LOG

Incident ID: [YYYY-MM-DD-###]
Incident Commander: [Name]
Date Opened: [Date/Time]
Date Closed: [Date/Time]
Status: [Open/Contained/Resolved/Closed]

INCIDENT DETAILS:
Type: [Breach/Disruption/Compromise/Malware/Other]
Severity: [Critical/High/Medium/Low]
Systems Affected: [List]
Members Impacted: [Number]

TIMELINE:
[Time] - [Event description]
[Time] - [Action taken]
[Time] - [Decision made]
...

ACTIONS TAKEN:
[ ] Containment steps
[ ] Eradication steps
[ ] Recovery steps
[ ] Notifications sent

DATA AFFECTED:
Type: [PII/Financial/Business/System]
Records: [Number]
Exfiltrated: [Yes/No/Unknown]

COSTS:
Direct: [$Amount]
Indirect: [$Amount]
Insurance: [$Amount recovered]

LESSONS LEARNED:
What went well:
-

What needs improvement:
-

Preventive measures:
-

ATTACHMENTS:
- [List supporting documents]
```

### Appendix B: Notification Checklist

**For Data Breaches:**

**Immediate (0-24 hours):**
- [ ] Assess scope of breach
- [ ] Consult legal counsel
- [ ] Notify insurance carrier
- [ ] Draft member notification
- [ ] Prepare regulatory notifications

**Short-term (24-72 hours):**
- [ ] Notify affected members
- [ ] File regulatory reports (if required)
- [ ] Set up member hotline
- [ ] Prepare media statement
- [ ] Update website/portal

**Ongoing:**
- [ ] Provide regular updates
- [ ] Answer member questions
- [ ] Cooperate with authorities
- [ ] Monitor for misuse
- [ ] Offer credit monitoring (if applicable)

### Appendix C: Regulatory Requirements Summary

| Jurisdiction | Law | Notification Trigger | Deadline | Recipients |
|--------------|-----|---------------------|----------|-----------|
| **Federal** | HIPAA | Health data breach | 60 days | HHS, individuals |
| **Federal** | GLBA | Financial data breach | ASAP | Individuals |
| **California** | CCPA | Personal info breach | Unreasonable delay | Individuals, AG |
| **Florida** | Fla. Stat. § 501.171 | Personal info breach | 30 days max | Individuals, AG |
| **EU** | GDPR | Personal data breach | 72 hours | DPA, individuals |
| **Multi-state** | Various | Varies | Varies | Varies |

**Note:** Consult legal counsel for specific requirements.

### Appendix D: Member FAQs (Post-Breach)

**Q: What happened?**
A: [Specific, honest description]

**Q: Was my data accessed?**
A: [Yes/No/We believe...]

**Q: What should I do?**
A: [Specific actions]

**Q: Will this happen again?**
A: [Preventive measures taken]

**Q: Can I trust MBC with my data?**
A: [Transparency about security measures]

**Q: Should I cancel my membership?**
A: [Understanding response, no pressure]

---

## Document Control

**Owner:** Miami Business Council Board of Directors
**Maintained by:** Incident Commander (April Sabral)
**Approved by:** [Board Chair Name]
**Approval Date:** [Date]

**Review Schedule:**
- Annual review: January
- Post-incident review: As needed
- Major change review: As needed

**Distribution:**
- Board members
- Incident Response Team
- Key staff
- Legal counsel

**Classification:** CONFIDENTIAL - INTERNAL USE ONLY

**Version History:**
- v1.0 (January 22, 2026): Initial version

---

**Questions or suggestions for improvement?**
Contact: april@retailu.ca
