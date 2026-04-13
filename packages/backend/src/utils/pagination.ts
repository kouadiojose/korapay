import { Knex } from 'knex';
import { PaginatedResult } from '../types/common.types';

export async function paginate<T>(
  query: Knex.QueryBuilder,
  page: number = 1,
  perPage: number = 20
): Promise<PaginatedResult<T>> {
  const safePage = Math.max(1, page);
  const safePerPage = Math.min(Math.max(1, perPage), 100);
  const offset = (safePage - 1) * safePerPage;

  const countQuery = query.clone().clearSelect().clearOrder().count('* as total').first();
  const dataQuery = query.clone().limit(safePerPage).offset(offset);

  const [countResult, data] = await Promise.all([countQuery, dataQuery]);

  const total = Number((countResult as { total: string | number })?.total ?? 0);
  const totalPages = Math.ceil(total / safePerPage);

  return {
    data: data as T[],
    pagination: {
      page: safePage,
      perPage: safePerPage,
      total,
      totalPages,
    },
  };
}
