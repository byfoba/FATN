'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function TimezoneSaver() {
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tz);
  }, []);

  const saveTimezone = async () => {
    const userId = 'demo-user'; // TODO: replace with Supabase auth user id
    await supabase.from('users').upsert({ id: userId, timezone, preferences: {} });
    alert('Timezone saved');
  };

  return (
    <div>
      <p>Detected timezone: {timezone || 'Detecting...'}</p>
      <button onClick={saveTimezone}>Save timezone to profile</button>
    </div>
  );
}
