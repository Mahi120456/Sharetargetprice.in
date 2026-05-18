'use client';

interface EventsSectionProps {
  events: any[];
}

export default function EventsSection({ events }: EventsSectionProps) {
  if (!events || events.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
      <ul className="space-y-2">
        {events.slice(0, 5).map((ev, idx) => (
          <li key={idx} className="flex justify-between border-b py-2">
            <span>{ev.eventName || ev.title || 'Event'}</span>
            <span className="text-gray-500">{ev.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
