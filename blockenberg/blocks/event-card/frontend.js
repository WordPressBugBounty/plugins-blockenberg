( function () {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.bkec-wrap[data-schema="1"]').forEach(function (wrap) {
      var raw = wrap.dataset.event;
      if (!raw) return;
      var e;
      try { e = JSON.parse(raw); } catch(err) { return; }

      var schema = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        'name': e.name || '',
        'description': e.description || '',
        'startDate': e.startDate && e.startTime ? e.startDate + 'T' + e.startTime : e.startDate,
        'endDate':   e.endDate   && e.endTime   ? e.endDate   + 'T' + e.endTime   : e.endDate,
        'eventStatus': 'https://schema.org/EventScheduled',
        'eventAttendanceMode': e.eventType === 'Virtual'
          ? 'https://schema.org/OnlineEventAttendanceMode'
          : e.eventType === 'Hybrid'
            ? 'https://schema.org/MixedEventAttendanceMode'
            : 'https://schema.org/OfflineEventAttendanceMode',
        'url': e.url || undefined,
      };

      if (e.venueName) {
        schema.location = {
          '@type': 'Place',
          'name': e.venueName,
          'address': { '@type': 'PostalAddress', 'streetAddress': e.venueAddress || '' }
        };
      }
      if (e.organizer) {
        schema.organizer = { '@type': 'Organization', 'name': e.organizer };
      }
      if (e.image) schema.image = e.image;

      schema = JSON.parse(JSON.stringify(schema));

      var script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
  });
}() );
