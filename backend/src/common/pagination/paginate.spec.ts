import { paginateCollection } from './paginate';

describe('paginateCollection', () => {
  it('should_return_requested_page_with_shared_pagination_metadata', () => {
    expect(paginateCollection(['a', 'b', 'c', 'd', 'e'], { page: 2, perPage: 2 })).toEqual({
      data: ['c', 'd'],
      meta: {
        total: 5,
        lastPage: 3,
        currentPage: 2,
        perPage: 2,
        prev: 1,
        next: 3,
      },
    });
  });
});
