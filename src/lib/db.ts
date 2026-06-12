import fs from 'fs/promises';
import path from 'path';
import { PG } from '@/app/components/PGCard';

const dbPath = path.join(process.cwd(), 'src', 'data', 'pgs.json');

export async function readPgs(): Promise<PG[]> {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read PGs from JSON file database', error);
    return [];
  }
}

export async function writePgs(pgs: PG[]): Promise<boolean> {
  try {
    await fs.writeFile(dbPath, JSON.stringify(pgs, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to write PGs to JSON file database', error);
    return false;
  }
}
