"use client";

// src/hooks/useICalSync.ts
import { useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format, eachDayOfInterval } from 'date-fns';
import ICAL from 'ical.js';

interface ParsedEvent {
  uid: string;
  summary: string;
  startDate: Date;
  endDate: Date;
  description?: string;
}

interface AvailabilityRecord {
  room_id: string;
  date: string;
  is_available: boolean;
  block_type: string;
  created_at: string;
}

interface SyncProgress {
  step: string;
  current: number;
  total: number;
  currentRoom?: string;
}

interface RoomSyncResult {
  room_id: string;
  room_name: string;
  platform: string;
  success: boolean;
  eventsProcessed: number;
  datesBlocked: number;
  error?: string;
  executionTime?: number;
}

interface MultiRoomSyncResult {
  success: boolean;
  totalConfigs: number;
  successfulSyncs: number;
  failedSyncs: number;
  results: RoomSyncResult[];
  timestamp: string;
}

interface CalendarConfig {
  id: string;
  room_id: string;
  room_name: string;
  platform: string;
  ical_url: string;
  is_active: boolean;
  sync_interval_hours: number;
  last_sync_at?: string | null;
  last_sync_status?: string | null;
}

interface NightBasedStrategy {
  strategy: 'night_based' | 'complete_block';
  blockType: string;
  reason: string;
}

export const useICalSync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Create single client instance for all operations
  const supabaseClient = useMemo(() => createClient(), []);

  const downloadICalData = useCallback(async (url: string, supabase: ReturnType<typeof createClient>): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('No authenticated session found');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ical-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      let errorMessage = `Edge Function HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    if (!result.success || !result.data || typeof result.data !== 'string') {
      throw new Error(result.error || 'Invalid iCal data format');
    }

    if (!result.data.includes('BEGIN:VCALENDAR')) {
      throw new Error('Invalid iCal data');
    }

    return result.data;
  }, []);

  const parseICalEvents = useCallback((icalData: string): ParsedEvent[] => {
    const jcalData = ICAL.parse(icalData);
    const vcalendar = new ICAL.Component(jcalData);
    const vevents = vcalendar.getAllSubcomponents('vevent');

    const parsedEvents: ParsedEvent[] = [];

    for (const vevent of vevents) {
      try {
        const icalEvent = new ICAL.Event(vevent);

        if (!icalEvent.startDate || !icalEvent.endDate) continue;

        const startDate = icalEvent.startDate.toJSDate();
        const endDate = icalEvent.endDate.toJSDate();

        if (startDate >= endDate) continue;

        parsedEvents.push({
          uid: icalEvent.uid || `generated-${Date.now()}-${Math.random()}`,
          summary: icalEvent.summary || 'External Booking',
          startDate,
          endDate,
          description: icalEvent.description || undefined
        });
      } catch {
        continue;
      }
    }

    return parsedEvents;
  }, []);

  const determineNightBasedStrategy = (event: ParsedEvent): NightBasedStrategy => {
    const summary = event.summary.toLowerCase().trim();

    if (summary.includes('airbnb')) {
      if (summary.includes('not available')) {
        return {
          strategy: 'complete_block',
          blockType: 'prep_before',
          reason: 'Airbnb preparation time'
        };
      }

      return {
        strategy: 'night_based',
        blockType: 'full',
        reason: 'Airbnb guest booking'
      };
    }

    if (summary.includes('closed - not available')) {
      return {
        strategy: 'night_based',
        blockType: 'full',
        reason: 'Booking.com guest reservation'
      };
    }

    if (summary.includes('booking')) {
      return {
        strategy: 'night_based',
        blockType: 'full',
        reason: 'Booking.com guest reservation'
      };
    }

    if (summary.includes('maintenance') || summary.includes('blocked')) {
      return {
        strategy: 'complete_block',
        blockType: 'full',
        reason: 'Administrative closure'
      };
    }

    return {
      strategy: 'night_based',
      blockType: 'full',
      reason: 'Guest booking'
    };
  };

  const applyNightBasedBlocking = (allDays: Date[], strategy: NightBasedStrategy): Date[] => {
    if (strategy.strategy === 'night_based') {
      if (strategy.reason === 'Booking.com guest reservation') {
        return allDays.slice(1); // Same-day turnover for Booking.com
      }
      return allDays; // Standard night-based blocking
    }

    if (strategy.strategy === 'complete_block') {
      return allDays; // Block all days
    }

    return allDays;
  };

  const createAvailabilityRecords = useCallback((events: ParsedEvent[], roomId: string): AvailabilityRecord[] => {
    const records: AvailabilityRecord[] = [];
    const processedDates = new Set<string>();

    for (const event of events) {
      try {
        const startDateLocal = new Date(event.startDate);
        const endDateLocal = new Date(event.endDate);

        startDateLocal.setHours(startDateLocal.getHours() + 2);
        endDateLocal.setHours(endDateLocal.getHours() + 2);

        const standardDays = eachDayOfInterval({
          start: startDateLocal,
          end: endDateLocal
        }).slice(0, -1);

        if (standardDays.length === 0) continue;

        const blockingStrategy = determineNightBasedStrategy(event);
        const datesToBlock = applyNightBasedBlocking(standardDays, blockingStrategy);

        for (const date of datesToBlock) {
          const dateStr = format(date, 'yyyy-MM-dd');

          if (!processedDates.has(dateStr)) {
            processedDates.add(dateStr);

            records.push({
              room_id: roomId,
              date: dateStr,
              is_available: false,
              block_type: blockingStrategy.blockType,
              created_at: new Date().toISOString()
            });
          }
        }
      } catch {
        continue;
      }
    }

    return records;
  }, []);

  const clearAvailabilityData = useCallback(async (roomId: string, supabase: ReturnType<typeof createClient>): Promise<void> => {
    // Verify auth session before attempting delete
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required for sync operation');
    }

    console.log('[iCal Sync] clearAvailabilityData START', { roomId, userId: session.user?.id });

    // Get count before delete for diagnostic purposes
    const { count: beforeCount } = await supabase
      .from('room_availability')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .eq('is_available', false);

    console.log('[iCal Sync] Records to delete:', beforeCount || 0);

    const { error, count } = await supabase
      .from('room_availability')
      .delete({ count: 'exact' })
      .eq('room_id', roomId)
      .eq('is_available', false);

    console.log(`[iCal Sync] DELETE result for room ${roomId}:`, {
      error: error?.message || null,
      rowsDeleted: count,
      expectedRows: beforeCount
    });

    if (error) {
      throw new Error(`Failed to clear availability data: ${error.message}`);
    }
  }, []);

  const insertAvailabilityRecords = useCallback(async (records: AvailabilityRecord[], supabase: ReturnType<typeof createClient>): Promise<void> => {
    if (records.length === 0) return;

    // Verify auth session before attempting insert
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required for sync operation');
    }

    console.log('[iCal Sync] insertAvailabilityRecords START', {
      recordCount: records.length,
      userId: session.user?.id
    });

    const batchSize = 100;
    let batchNumber = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      batchNumber++;

      console.log(`[iCal Sync] INSERT batch ${batchNumber}:`, batch.length, 'records');

      const { error } = await supabase
        .from('room_availability')
        .insert(batch);

      if (error) {
        console.error(`[iCal Sync] INSERT batch ${batchNumber} FAILED:`, error);
        throw new Error(`Failed to insert availability records: ${error.message}`);
      }
    }

    console.log('[iCal Sync] insertAvailabilityRecords COMPLETE', {
      totalRecords: records.length,
      totalBatches: batchNumber
    });
  }, []);

  const getActiveConfigs = useCallback(async (supabase: ReturnType<typeof createClient>): Promise<CalendarConfig[]> => {
    const { data: configsData, error: configsError } = await supabase
      .from('room_ical_configs')
      .select('*')
      .eq('is_active', true)
      .order('room_id');

    if (configsError) {
      throw new Error(`Failed to fetch configurations: ${configsError.message}`);
    }

    if (!configsData || configsData.length === 0) {
      return [];
    }

    const roomIds = configsData.map((config: any) => config.room_id);
    const { data: roomsData } = await supabase
      .from('rooms')
      .select('id, name')
      .in('id', roomIds);

    const roomNameMap = new Map();
    if (roomsData) {
      roomsData.forEach((room: any) => {
        roomNameMap.set(room.id, room.name);
      });
    }

    return configsData.map((config: any) => ({
      id: config.id,
      room_id: config.room_id,
      room_name: roomNameMap.get(config.room_id) || 'Unknown Room',
      platform: config.platform,
      ical_url: config.ical_url,
      is_active: config.is_active,
      sync_interval_hours: config.sync_interval_hours,
      last_sync_at: config.last_sync_at,
      last_sync_status: config.last_sync_status
    }));
  }, []);

  const getPendingConfigs = useCallback(async (supabase: ReturnType<typeof createClient>): Promise<CalendarConfig[]> => {
    const configs = await getActiveConfigs(supabase);
    const now = new Date();

    return configs.filter(config => {
      if (!config.last_sync_at) return true;

      const lastSync = new Date(config.last_sync_at);
      const hoursElapsed = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

      return hoursElapsed >= config.sync_interval_hours;
    });
  }, [getActiveConfigs]);

  const updateSyncResult = useCallback(async (
    configId: string,
    success: boolean,
    eventsProcessed: number,
    datesBlocked: number,
    supabase: ReturnType<typeof createClient>,
    errorMessage?: string
  ): Promise<void> => {
    try {
      const updateData = {
        last_sync_at: new Date().toISOString(),
        last_sync_status: success ? 'success' : 'error',
        events_last_sync: eventsProcessed,
        dates_last_sync: datesBlocked,
        last_error_message: errorMessage || null,
        updated_at: new Date().toISOString()
      };

      await supabase
        .from('room_ical_configs')
        .update(updateData)
        .eq('id', configId);
    } catch {
      // Silent fail for update operations
    }
  }, []);

  const syncSingleConfig = useCallback(async (config: CalendarConfig): Promise<RoomSyncResult> => {
    const startTime = Date.now();

    try {
      console.log('[iCal Sync] syncSingleConfig START', {
        room: config.room_name,
        platform: config.platform
      });

      const icalData = await downloadICalData(config.ical_url, supabaseClient);
      const events = parseICalEvents(icalData);
      await clearAvailabilityData(config.room_id, supabaseClient);
      const records = createAvailabilityRecords(events, config.room_id);
      await insertAvailabilityRecords(records, supabaseClient);

      const executionTime = Date.now() - startTime;
      await updateSyncResult(config.id, true, events.length, records.length, supabaseClient);

      console.log('[iCal Sync] syncSingleConfig SUCCESS', {
        room: config.room_name,
        events: events.length,
        records: records.length,
        time: executionTime
      });

      return {
        room_id: config.room_id,
        room_name: config.room_name,
        platform: config.platform,
        success: true,
        eventsProcessed: events.length,
        datesBlocked: records.length,
        executionTime
      };
    } catch (err) {
      const executionTime = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : 'Unknown sync error';

      console.error('[iCal Sync] syncSingleConfig FAILED', {
        room: config.room_name,
        error: errorMessage
      });

      await updateSyncResult(config.id, false, 0, 0, supabaseClient, errorMessage);

      return {
        room_id: config.room_id,
        room_name: config.room_name,
        platform: config.platform,
        success: false,
        eventsProcessed: 0,
        datesBlocked: 0,
        error: errorMessage,
        executionTime
      };
    }
  }, [downloadICalData, parseICalEvents, clearAvailabilityData, createAvailabilityRecords, insertAvailabilityRecords, updateSyncResult, supabaseClient]);

  const syncAllCalendars = useCallback(async (): Promise<MultiRoomSyncResult> => {
    const result: MultiRoomSyncResult = {
      success: false,
      totalConfigs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      results: [],
      timestamp: new Date().toISOString()
    };

    try {
      setLoading(true);
      setError(null);
      setProgress({ step: 'Fetching configurations', current: 0, total: 0 });

      const configs = await getActiveConfigs(supabaseClient);
      result.totalConfigs = configs.length;

      if (configs.length === 0) {
        result.success = true;
        setLastSyncTime(new Date());
        return result;
      }

      setProgress({ step: 'Syncing calendars', current: 0, total: configs.length });

      for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        setProgress({
          step: 'Syncing calendars',
          current: i + 1,
          total: configs.length,
          currentRoom: config.room_name
        });

        const syncResult = await syncSingleConfig(config);
        result.results.push(syncResult);

        if (syncResult.success) {
          result.successfulSyncs++;
        } else {
          result.failedSyncs++;
        }
      }

      result.success = result.successfulSyncs > 0;
      setLastSyncTime(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown sync error';
      setError(message);
    } finally {
      setLoading(false);
      setProgress(null);
    }

    return result;
  }, [getActiveConfigs, syncSingleConfig, supabaseClient]);

  const processAutomaticSync = useCallback(async (): Promise<MultiRoomSyncResult> => {
    const result: MultiRoomSyncResult = {
      success: false,
      totalConfigs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      results: [],
      timestamp: new Date().toISOString()
    };

    try {
      const configs = await getPendingConfigs(supabaseClient);
      result.totalConfigs = configs.length;

      if (configs.length === 0) {
        result.success = true;
        return result;
      }

      for (const config of configs) {
        const syncResult = await syncSingleConfig(config);
        result.results.push(syncResult);

        if (syncResult.success) {
          result.successfulSyncs++;
        } else {
          result.failedSyncs++;
        }
      }

      result.success = result.successfulSyncs > 0;
    } catch {
      // Silent error handling for automatic sync
    }

    return result;
  }, [getPendingConfigs, syncSingleConfig, supabaseClient]);

  const getSyncStatus = useCallback(async () => {
    const configs = await getActiveConfigs(supabaseClient);
    return configs.map(config => ({
      room_name: config.room_name,
      platform: config.platform,
      last_sync_at: config.last_sync_at,
      last_sync_status: config.last_sync_status,
      sync_interval_hours: config.sync_interval_hours
    }));
  }, [getActiveConfigs, supabaseClient]);

  const testTableAccess = useCallback(async () => {
    try {
      const { data, error } = await supabaseClient
        .from('room_ical_configs')
        .select('id')
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }, [supabaseClient]);

  return {
    syncAllCalendars,
    processAutomaticSync,
    getActiveConfigs: useCallback(() => getActiveConfigs(supabaseClient), [getActiveConfigs, supabaseClient]),
    getPendingConfigs: useCallback(() => getPendingConfigs(supabaseClient), [getPendingConfigs, supabaseClient]),
    getSyncStatus,
    downloadICalData: useCallback((url: string) => downloadICalData(url, supabaseClient), [downloadICalData, supabaseClient]),
    parseICalEvents,
    clearAvailabilityData: useCallback((roomId: string) => clearAvailabilityData(roomId, supabaseClient), [clearAvailabilityData, supabaseClient]),
    createAvailabilityRecords,
    testTableAccess,
    loading,
    error,
    progress,
    lastSyncTime
  };
};
