'use client';

import { useState } from 'react';
import styles from './Events.module.css';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'networking' | 'workshop' | 'social';
  description: string;
  rsvpLink?: string;
}

const upcomingEvents: Event[] = [
  {
    id: '1',
    title: 'Monthly Networking Mixer',
    date: 'February 25, 2026',
    time: '6:00 PM - 8:00 PM',
    location: 'Miami Beach Convention Center',
    type: 'networking',
    description: 'Join fellow members for an evening of networking, drinks, and meaningful connections.',
    rsvpLink: 'https://lu.ma/wr4fh6t8',
  },
  {
    id: '2',
    title: 'Business Growth Workshop',
    date: 'March 5, 2026',
    time: '10:00 AM - 12:00 PM',
    location: 'Virtual Event',
    type: 'workshop',
    description: 'Learn strategies to scale your business in 2026 with expert speakers.',
  },
  {
    id: '3',
    title: 'Spring Social Celebration',
    date: 'March 21, 2026',
    time: '7:00 PM - 10:00 PM',
    location: 'Brickell City Centre Rooftop',
    type: 'social',
    description: 'Celebrate spring with fellow members at our exclusive rooftop event.',
  },
];

export default function Events() {
  const [filter, setFilter] = useState<'all' | 'networking' | 'workshop' | 'social'>('all');

  const filteredEvents = filter === 'all'
    ? upcomingEvents
    : upcomingEvents.filter(e => e.type === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'networking': return '🤝';
      case 'workshop': return '📚';
      case 'social': return '🎉';
      default: return '📅';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'networking': return 'Networking';
      case 'workshop': return 'Workshop';
      case 'social': return 'Social';
      default: return 'Event';
    }
  };

  return (
    <div className={styles.events}>
      <div className={styles.header}>
        <h1 className={styles.title}>Upcoming Events</h1>
        <p className={styles.subtitle}>
          Exclusive events for Miami Business Council members
        </p>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All Events
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'networking' ? styles.active : ''}`}
          onClick={() => setFilter('networking')}
        >
          🤝 Networking
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'workshop' ? styles.active : ''}`}
          onClick={() => setFilter('workshop')}
        >
          📚 Workshops
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'social' ? styles.active : ''}`}
          onClick={() => setFilter('social')}
        >
          🎉 Social
        </button>
      </div>

      {/* Events List */}
      <div className={styles.eventsList}>
        {filteredEvents.map((event) => (
          <div key={event.id} className={styles.eventCard}>
            <div className={styles.eventDate}>
              <span className={styles.eventIcon}>{getTypeIcon(event.type)}</span>
              <div>
                <span className={styles.dateText}>{event.date}</span>
                <span className={styles.timeText}>{event.time}</span>
              </div>
            </div>

            <div className={styles.eventContent}>
              <span className={`${styles.eventType} ${styles[event.type]}`}>
                {getTypeLabel(event.type)}
              </span>
              <h3 className={styles.eventTitle}>{event.title}</h3>
              <p className={styles.eventDescription}>{event.description}</p>
              <div className={styles.eventLocation}>
                <span className={styles.locationIcon}>📍</span>
                {event.location}
              </div>
            </div>

            <div className={styles.eventActions}>
              {event.rsvpLink ? (
                <a
                  href={event.rsvpLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.rsvpBtn}
                >
                  RSVP Now
                </a>
              ) : (
                <button className={styles.rsvpBtn}>
                  Coming Soon
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className={styles.noEvents}>
          <p>No events found for this category.</p>
        </div>
      )}

      {/* Calendar Link */}
      <div className={styles.calendarSection}>
        <div className={styles.calendarCard}>
          <span className={styles.calendarIcon}>📅</span>
          <div>
            <h3>Stay Updated</h3>
            <p>Add our events to your calendar to never miss an opportunity</p>
          </div>
          <button className={styles.calendarBtn}>
            Add to Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
