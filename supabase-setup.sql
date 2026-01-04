-- Miami Business Council Supabase Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Members table
CREATE TABLE members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    job_title TEXT,
    industry TEXT,
    linkedin_url TEXT,
    company_size TEXT CHECK (company_size IN ('solo', 'small', 'medium', 'large')),
    membership_type TEXT CHECK (membership_type IN ('individual', 'nonprofit', 'business')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Business opportunities table
CREATE TABLE business_opportunities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('looking_for', 'can_offer')),
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Member connections table
CREATE TABLE member_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    requester_id UUID REFERENCES members(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES members(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(requester_id, recipient_id)
);

-- Events table
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    max_attendees INTEGER,
    luma_event_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Event registrations table
CREATE TABLE event_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    registration_status TEXT DEFAULT 'registered' CHECK (registration_status IN ('registered', 'attended', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(event_id, member_id)
);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_member_connections_updated_at BEFORE UPDATE ON member_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_company ON members(company_name);
CREATE INDEX idx_members_industry ON members(industry);
CREATE INDEX idx_business_opportunities_member_id ON business_opportunities(member_id);
CREATE INDEX idx_business_opportunities_type ON business_opportunities(opportunity_type);
CREATE INDEX idx_member_connections_requester ON member_connections(requester_id);
CREATE INDEX idx_member_connections_recipient ON member_connections(recipient_id);
CREATE INDEX idx_member_connections_status ON member_connections(status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_member ON event_registrations(member_id);

-- Row Level Security (RLS) policies
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Members can read all active members but only update their own profile
CREATE POLICY "Members can view active members" ON members FOR SELECT USING (is_active = true);
CREATE POLICY "Members can update own profile" ON members FOR UPDATE USING (auth.uid()::text = id::text);

-- Business opportunities policies
CREATE POLICY "Anyone can view business opportunities" ON business_opportunities FOR SELECT USING (true);
CREATE POLICY "Members can manage own opportunities" ON business_opportunities FOR ALL USING (auth.uid()::text = (SELECT id::text FROM members WHERE members.id = member_id));

-- Connection policies
CREATE POLICY "Members can view their connections" ON member_connections FOR SELECT USING (
    auth.uid()::text = requester_id::text OR auth.uid()::text = recipient_id::text
);
CREATE POLICY "Members can create connection requests" ON member_connections FOR INSERT WITH CHECK (
    auth.uid()::text = requester_id::text
);
CREATE POLICY "Recipients can update connection status" ON member_connections FOR UPDATE USING (
    auth.uid()::text = recipient_id::text
);

-- Events policies
CREATE POLICY "Anyone can view active events" ON events FOR SELECT USING (is_active = true);

-- Event registrations policies
CREATE POLICY "Members can view own registrations" ON event_registrations FOR SELECT USING (
    auth.uid()::text = member_id::text
);
CREATE POLICY "Members can register for events" ON event_registrations FOR INSERT WITH CHECK (
    auth.uid()::text = member_id::text
);

-- Insert sample data
INSERT INTO members (email, first_name, last_name, company_name, job_title, industry, linkedin_url, company_size, membership_type) VALUES
('april@apriljsabral.com', 'April', 'Sabral', 'AskApril AI', 'Founder & CEO', 'Technology', 'https://linkedin.com/in/apriljsabral', 'small', 'business'),
('tommy@themadyungroup.com', 'Tommy', 'Martinez', 'The Madyun Group', 'Principal', 'Real Estate', null, 'medium', 'business'),
('team@fanbusiness.com', 'FAN', 'Team', 'FAN Business', 'Marketing Agency', 'Marketing', null, 'small', 'business'),
('contact@ilmoda.com', 'Ilmoda', 'Team', 'Ilmoda', 'Fashion & Design', 'Fashion', null, 'small', 'business');

-- Insert sample business opportunities
INSERT INTO business_opportunities (member_id, opportunity_type, category) VALUES
-- April Sabral - Looking for
((SELECT id FROM members WHERE email = 'april@apriljsabral.com'), 'looking_for', 'Partnerships'),
((SELECT id FROM members WHERE email = 'april@apriljsabral.com'), 'looking_for', 'Clients'),
((SELECT id FROM members WHERE email = 'april@apriljsabral.com'), 'can_offer', 'Business Strategy'),
((SELECT id FROM members WHERE email = 'april@apriljsabral.com'), 'can_offer', 'Consulting'),

-- Tommy Martinez
((SELECT id FROM members WHERE email = 'tommy@themadyungroup.com'), 'looking_for', 'Partnerships'),
((SELECT id FROM members WHERE email = 'tommy@themadyungroup.com'), 'looking_for', 'Investors'),
((SELECT id FROM members WHERE email = 'tommy@themadyungroup.com'), 'can_offer', 'Mentoring'),
((SELECT id FROM members WHERE email = 'tommy@themadyungroup.com'), 'can_offer', 'Expertise'),

-- FAN Team
((SELECT id FROM members WHERE email = 'team@fanbusiness.com'), 'looking_for', 'Clients'),
((SELECT id FROM members WHERE email = 'team@fanbusiness.com'), 'looking_for', 'Partnerships'),
((SELECT id FROM members WHERE email = 'team@fanbusiness.com'), 'can_offer', 'Services'),
((SELECT id FROM members WHERE email = 'team@fanbusiness.com'), 'can_offer', 'Expertise'),

-- Ilmoda Team
((SELECT id FROM members WHERE email = 'contact@ilmoda.com'), 'looking_for', 'Investors'),
((SELECT id FROM members WHERE email = 'contact@ilmoda.com'), 'looking_for', 'Partnerships'),
((SELECT id FROM members WHERE email = 'contact@ilmoda.com'), 'can_offer', 'Services'),
((SELECT id FROM members WHERE email = 'contact@ilmoda.com'), 'can_offer', 'Expertise');

-- Insert upcoming event
INSERT INTO events (title, description, event_date, location, luma_event_id) VALUES
('Monthly Breakfast Networking', 'Connect with fellow business leaders over breakfast and coffee in the Miami Design District.', '2025-01-28 09:00:00-05', 'Miami Design District', 'au2tl4nm');

COMMENT ON TABLE members IS 'Member profiles and basic information';
COMMENT ON TABLE business_opportunities IS 'What members are looking for and what they can offer';
COMMENT ON TABLE member_connections IS 'Connection requests and relationships between members';
COMMENT ON TABLE events IS 'Business council events and networking opportunities';
COMMENT ON TABLE event_registrations IS 'Member registrations for events';