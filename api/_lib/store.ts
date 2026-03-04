import { createClient } from '@supabase/supabase-js';
import { AnalyzeOutput, ContextPackage } from '../../shared/types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const memorySnapshots = new Map<string, ContextPackage>();

export async function storeSnapshot(context: ContextPackage) {
  memorySnapshots.set(context.snapshot_id, context);
  if (!supabase) return;
  await supabase.from('snapshots').upsert({
    snapshot_id: context.snapshot_id,
    ticker: context.ticker,
    start_utc: context.aggregated_bars[0]?.start_utc ?? context.exchange_timestamp_utc,
    end_utc: context.exchange_timestamp_utc,
    raw_ticks_link: null,
    context,
  });
}

export async function getSnapshot(snapshotId: string): Promise<ContextPackage | null> {
  if (memorySnapshots.has(snapshotId)) return memorySnapshots.get(snapshotId)!;
  if (!supabase) return null;
  const { data } = await supabase
    .from('snapshots')
    .select('context')
    .eq('snapshot_id', snapshotId)
    .maybeSingle();
  return (data?.context as ContextPackage | undefined) ?? null;
}

export async function storeAnalysis(userId: string, context: ContextPackage, result: AnalyzeOutput) {
  if (!supabase) return;
  await supabase.from('analyses').insert({
    user_id: userId,
    ticker: context.ticker,
    snapshot_id: context.snapshot_id,
    context,
    result,
  });
}
