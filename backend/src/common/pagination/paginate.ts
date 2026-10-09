import { PaginatedResult } from './pagination.models';

export interface PaginateOptions {
  page?: number | string;
  perPage?: number | string;
}

const MAX_PER_PAGE = 100;

const getPagination = (options: PaginateOptions) => {
  const page = Math.max(1, Math.floor(Number(options.page) || 1));
  const perPage = Math.min(MAX_PER_PAGE, Math.max(1, Math.floor(Number(options.perPage) || 10)));

  return { page, perPage, skip: (page - 1) * perPage };
};

const getPaginationMeta = (total: number, page: number, perPage: number) => {
  const lastPage = total === 0 ? 1 : Math.ceil(total / perPage);

  return {
    total,
    lastPage,
    currentPage: page,
    perPage,
    prev: page > 1 ? page - 1 : null,
    next: page < lastPage ? page + 1 : null,
  };
};

export function paginateCollection<T>(items: readonly T[], options: PaginateOptions) {
  const { page, perPage, skip } = getPagination(options);

  return {
    data: items.slice(skip, skip + perPage),
    meta: getPaginationMeta(items.length, page, perPage),
  } satisfies PaginatedResult<T>;
}

export async function paginate<T, FindManyArgs extends { where?: W }, W = FindManyArgs['where']>(
  delegate: {
    count: (args: { where?: W }) => Promise<number>;
    findMany: (args: FindManyArgs & { skip?: number; take?: number }) => Promise<unknown[]>;
  },
  args: FindManyArgs,
  options: PaginateOptions,
): Promise<PaginatedResult<T>> {
  const { page, perPage, skip } = getPagination(options);

  const [total, data] = await Promise.all([
    delegate.count({ where: args.where }),
    delegate.findMany({
      ...args,
      skip,
      take: perPage,
    }),
  ]);

  return {
    data: data as T[],
    meta: getPaginationMeta(total, page, perPage),
  };
}
