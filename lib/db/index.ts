import { pg } from "./postgres";

export const db = {
  async execute<T = unknown>(
    query: string,
    params: unknown[] = []
  ): Promise<[T[], unknown]> {
    const result = await pg.query(query, params);
    return [result.rows as T[], undefined];
  },

  async query<T = unknown>(
    query: string,
    params: unknown[] = []
  ): Promise<[T[], unknown]> {
    const result = await pg.query(query, params);
    return [result.rows as T[], undefined];
  },
};