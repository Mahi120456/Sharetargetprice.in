'use client';

interface EventsSectionProps {
  events: any[];
}

export default function EventsSection({ events }: EventsSectionProps) {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Upcoming Events</h2>

      <div className="space-y-4">
        {events.slice(0, 5).map((event, index) => (
          <div 
            key={index} 
            className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
              📅
            </div>
            <div>
              <p className="font-semibold text-gray-900">{event.event_type}</p>
              <p className="text-sm text-gray-600 mt-0.5">
                {new Date(event.event_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              {event.description && (
                <p className="text-sm text-gray-500 mt-1">{event.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
