import type { DrinkChallenge } from '../core/drinks';
import { uid } from '../core/id';
import { getDb } from './database';

/** Défis (gorgées) ajoutés par l'utilisateur, fusionnés à ceux intégrés. */

export async function addCustomChallenge(text: string): Promise<string> {
  const db = await getDb();
  const id = `cc-${uid()}`;
  await db.runAsync('INSERT INTO custom_challenges (id, text, created_at) VALUES (?, ?, ?)', [
    id,
    text.trim(),
    Date.now(),
  ]);
  return id;
}

export async function listCustomChallenges(): Promise<DrinkChallenge[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ id: string; text: string }>(
    'SELECT id, text FROM custom_challenges ORDER BY created_at DESC',
  );
  return rows.map((r) => ({ id: r.id, text: r.text }));
}

export async function deleteCustomChallenge(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM custom_challenges WHERE id = ?', [id]);
}
