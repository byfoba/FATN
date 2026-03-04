import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { Tick } from '../core/types';

export function loadTicksFromCsv(csvPath: string): Tick[] {
  const raw = fs.readFileSync(csvPath, 'utf8');
  const rows = parse(raw, { columns: true, skip_empty_lines: true });
  return rows.map((r: any) => ({ ts: r.ts, price: Number(r.price), size: Number(r.size) }));
}
