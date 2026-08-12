import { PaginatedResult } from './pagination.models';

export interface PaginateOptions {
  page?: number | string;
  perPage?: number | string;
}

const MAX_PER_PAGE = 100;

export async function paginate<
  T,
  FindManyArgs extends { where?: W },
  W = FindManyArgs['where'],
>(
  delegate: {
    count: (args: { where?: W }) => Promise<number>;
    findMany: (
      args: FindManyArgs & { skip?: number; take?: number },
    ) => Promise<T[]>;
  },
  args: FindManyArgs,
  options: PaginateOptions,
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, Math.floor(Number(options.page) || 1));
  const perPage = Math.min(
    MAX_PER_PAGE,
    Math.max(1, Math.floor(Number(options.perPage) || 10)),
  );
  const skip = (page - 1) * perPage;

  const [total, data] = await Promise.all([
    delegate.count({ where: args.where }),
    delegate.findMany({
      ...args,
      skip,
      take: perPage,
    }),
  ]);

  const lastPage = total === 0 ? 1 : Math.ceil(total / perPage);
  const currentPage = page;

  return {
    data,
    meta: {
      total,
      lastPage,
      currentPage,
      perPage,
      prev: currentPage > 1 ? currentPage - 1 : null,
      next: currentPage < lastPage ? currentPage + 1 : null,
    },
  };
}
