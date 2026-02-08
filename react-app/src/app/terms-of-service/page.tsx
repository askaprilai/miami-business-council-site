import { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components';
import styles from '../privacy-policy/page.module.css';

export const metadata: Metadata = {
  title: 'Terms of Service | Miami Business Council',
  description: 'Miami Business Council Terms of Service - Rules and guidelines for using our member portal.',
};

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>Terms of Service</h1>
          <p>Miami Business Council</p>
        </div>

        <div className={styles.container}>
          <div className={styles.lastUpdated}>
            <strong>Effective Date:</strong> January 22, 2026<br />
            <strong>Last Updated:</strong> January 22, 2026<br />
            <strong>Version:</strong> 1.0
          </div>

          <nav className={styles.toc}>
            <h3>Table of Contents</h3>
            <ul>
              <li><a href="#agreement">1. Agreement to Terms</a></li>
              <li><a href="#eligibility">2. Eligibility & Account Registration</a></li>
              <li><a href="#membership">3. Membership & Fees</a></li>
              <li><a href="#acceptable-use">4. Acceptable Use Policy</a></li>
              <li><a href="#intellectual-property">5. Content & Intellectual Property</a></li>
              <li><a href="#disclaimers">6. Disclaimers & Limitations</a></li>
              <li><a href="#termination">7. Term & Termination</a></li>
              <li><a href="#dispute">8. Dispute Resolution</a></li>
              <li><a href="#contact">9. Contact Information</a></li>
            </ul>
          </nav>

          <section>
            <h2 id="agreement">1. Agreement to Terms</h2>
            <p>By accessing or using the Miami Business Council (&quot;MBC&quot;) member portal and services, you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use our services.</p>
            <p><strong>These Terms constitute a legally binding agreement between you and Miami Business Council.</strong></p>
          </section>

          <section>
            <h2 id="eligibility">2. Eligibility & Account Registration</h2>

            <h3>2.1 Membership Requirements</h3>
            <p>To use our services, you must:</p>
            <ul>
              <li>Be at least 18 years old</li>
              <li>Be a business owner, executive, or professional in the Miami area</li>
              <li>Have paid applicable membership dues</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain an active email address</li>
              <li>Comply with all applicable laws</li>
            </ul>

            <h3>2.2 Account Responsibilities</h3>
            <p>You agree to:</p>
            <ul>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information</li>
              <li>Keep your email account secure</li>
              <li>Not share your magic link authentication with others</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activity under your account</li>
            </ul>
          </section>

          <section>
            <h2 id="membership">3. Membership & Fees</h2>

            <h3>3.1 Membership Types</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Annual Fee</th>
                  <th>Benefits</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Business</td>
                  <td>$450/year</td>
                  <td>Full portal access, all features</td>
                </tr>
                <tr>
                  <td>Individual</td>
                  <td>$250/year</td>
                  <td>Full portal access, all features</td>
                </tr>
                <tr>
                  <td>Non-Profit</td>
                  <td>$350/year</td>
                  <td>Full portal access, all features</td>
                </tr>
              </tbody>
            </table>

            <h3>3.2 Payment Terms</h3>
            <ul>
              <li>Memberships are billed annually</li>
              <li>Payment due upon registration or renewal</li>
              <li>All fees are non-refundable except as required by law</li>
              <li>Prices subject to change with 30-day notice</li>
            </ul>

            <h3>3.3 Refund Policy</h3>
            <p><strong>Full Refund:</strong> Within 7 days of initial purchase (if unused)</p>
            <p><strong>No Refunds:</strong> After 7 days, for partial periods, or due to account suspension/termination</p>
          </section>

          <section>
            <h2 id="acceptable-use">4. Acceptable Use Policy</h2>

            <h3>4.1 Permitted Uses</h3>
            <p>You may use our services to:</p>
            <ul>
              <li>Create a professional profile</li>
              <li>Network with other business professionals</li>
              <li>Attend MBC events</li>
              <li>Share business opportunities</li>
              <li>Send professional messages to members</li>
            </ul>

            <h3>4.2 Prohibited Conduct</h3>
            <div className={styles.warningBox}>
              <h3>You May NOT:</h3>
              <ul>
                <li>Harass, threaten, or intimidate other members</li>
                <li>Send unsolicited commercial messages (spam)</li>
                <li>Provide false information in your profile</li>
                <li>Impersonate another person or entity</li>
                <li>Attempt to hack or breach our systems</li>
                <li>Use automated tools (bots, scrapers)</li>
                <li>Post content you don&apos;t own or have rights to</li>
                <li>Use the platform primarily for advertising</li>
                <li>Recruit members for MLM/pyramid schemes</li>
                <li>Violate any local, state, or federal laws</li>
              </ul>
            </div>

            <h3>4.3 Consequences of Violations</h3>
            <p>Violations may result in:</p>
            <ul>
              <li>Warning notice</li>
              <li>Temporary suspension</li>
              <li>Permanent account termination</li>
              <li>Loss of membership fees (no refund)</li>
              <li>Legal action if warranted</li>
            </ul>
          </section>

          <section>
            <h2 id="intellectual-property">5. Content & Intellectual Property</h2>

            <h3>5.1 Your Content</h3>
            <p><strong>Ownership:</strong> You retain ownership of content you post</p>
            <p><strong>License:</strong> By posting content, you grant MBC a worldwide, non-exclusive, royalty-free license to:</p>
            <ul>
              <li>Display your content in the member portal</li>
              <li>Use your profile in member directory</li>
              <li>Show your content to other members</li>
              <li>Create derivative works (e.g., AI matching recommendations)</li>
            </ul>

            <p><strong>We will NOT:</strong></p>
            <ul>
              <li>Sell your content to third parties</li>
              <li>Use your content for unrelated advertising</li>
              <li>Share your content outside the member community</li>
            </ul>

            <h3>5.2 Our Content</h3>
            <p>All MBC content is owned by Miami Business Council:</p>
            <ul>
              <li>Platform design and code</li>
              <li>MBC logo and branding</li>
              <li>AI matching algorithms</li>
              <li>Documentation and guides</li>
            </ul>
          </section>

          <section>
            <h2 id="disclaimers">6. Disclaimers & Limitations</h2>

            <h3>6.1 Service Warranty</h3>
            <div className={styles.warningBox}>
              <h3>Important Legal Notice</h3>
              <p><strong>THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND.</strong></p>
              <p>We DO NOT warrant:</p>
              <ul>
                <li>Uninterrupted or error-free service</li>
                <li>Security from unauthorized access</li>
                <li>Accuracy of member-provided information</li>
                <li>Results from using our services</li>
              </ul>
            </div>

            <h3>6.2 Business Relationships</h3>
            <p><strong>MBC is NOT responsible for:</strong></p>
            <ul>
              <li>Business deals between members</li>
              <li>Quality of member services</li>
              <li>Disputes between members</li>
              <li>Financial losses from member interactions</li>
            </ul>

            <p><strong>You acknowledge:</strong> Member connections are at your own risk. MBC does not vet business practices. Due diligence is your responsibility.</p>

            <h3>6.3 Limitation of Liability</h3>
            <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong></p>
            <p>MBC&apos;s total liability is limited to the amount paid for membership in the past 12 months, maximum $500.</p>

            <p><strong>MBC shall NOT be liable for:</strong></p>
            <ul>
              <li>Indirect, incidental, or consequential damages</li>
              <li>Loss of profits, revenue, or data</li>
              <li>Business interruption</li>
              <li>Damages from member interactions</li>
            </ul>
          </section>

          <section>
            <h2 id="termination">7. Term & Termination</h2>

            <h3>7.1 Termination by You</h3>
            <p>You may cancel your membership by emailing: <a href="mailto:membership@miamibusinesscouncil.com">membership@miamibusinesscouncil.com</a></p>
            <ul>
              <li>Portal access ends at subscription expiration</li>
              <li>No refund for unused period</li>
              <li>Data deleted per Privacy Policy</li>
            </ul>

            <h3>7.2 Termination by Us</h3>
            <p>We may suspend or terminate your account if:</p>
            <ul>
              <li>You violate these Terms</li>
              <li>You engage in fraudulent activity</li>
              <li>You harm other members</li>
              <li>Your account is inactive for 2+ years</li>
              <li>Required by law</li>
            </ul>
          </section>

          <section>
            <h2 id="dispute">8. Dispute Resolution</h2>

            <h3>8.1 Informal Resolution</h3>
            <p>Before filing a claim, please contact us at <a href="mailto:legal@miamibusinesscouncil.com">legal@miamibusinesscouncil.com</a> to attempt resolution.</p>

            <h3>8.2 Binding Arbitration</h3>
            <div className={styles.warningBox}>
              <h3>Arbitration Agreement</h3>
              <p><strong>You agree that all disputes shall be resolved by binding arbitration, not in court.</strong></p>
              <ul>
                <li>No class actions or jury trials</li>
                <li>Governed by Federal Arbitration Act</li>
                <li>American Arbitration Association (AAA) rules</li>
                <li>Location: Miami, Florida</li>
              </ul>
              <p><strong>Exceptions:</strong> Small claims court (under $10,000) or injunctive relief for IP infringement</p>
            </div>

            <h3>8.3 Governing Law</h3>
            <p>These Terms are governed by the laws of the State of Florida and federal laws of the United States.</p>
          </section>

          <section>
            <h2>9. General Provisions</h2>

            <h3>9.1 Modifications</h3>
            <p>We may modify these Terms at any time with 30-day notice via email. Continued use constitutes acceptance.</p>

            <h3>9.2 Severability</h3>
            <p>If any provision is found unenforceable, the remaining provisions remain in effect.</p>

            <h3>9.3 Entire Agreement</h3>
            <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and MBC.</p>
          </section>

          <section>
            <h2 id="contact">10. Contact Information</h2>

            <p><strong>General Inquiries:</strong><br />
            Email: <a href="mailto:info@miamibusinesscouncil.com">info@miamibusinesscouncil.com</a></p>

            <p><strong>Membership:</strong><br />
            Email: <a href="mailto:membership@miamibusinesscouncil.com">membership@miamibusinesscouncil.com</a></p>

            <p><strong>Legal:</strong><br />
            Email: <a href="mailto:legal@miamibusinesscouncil.com">legal@miamibusinesscouncil.com</a></p>

            <div className={styles.highlightBox}>
              <h3>Acknowledgment</h3>
              <p><strong>By creating an account or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong></p>
            </div>
          </section>

          <Link href="/" className={styles.backLink}>
            &larr; Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
