export enum TablePaginationType {
  page = 'page',
  scroll = 'scroll',
}

export interface TablePagination {
  pageSize: number;
  type: TablePaginationType;
}

export enum TableSortDirection {
  asc = 'asc',
  desc = 'desc',
  none = '',
}

export interface TableSort {
  col: string;
  direction: TableSortDirection;
}

export enum TableEvents {
  getSelectedItems = 'getSelectedItems',
  resetSelectedItems = 'clearSelectedItems',
  resetFilter = 'resetFilter',
  reset = 'reset',
}

export interface TableConfig {
  select?: {
    enabled: boolean;
    default?: boolean;
  };
  filter?: {
    enabled: boolean;
    filterPredicate?: (...args: any[]) => boolean;
  };
  pagination?: {
    enabled: boolean;
    callback: (...args: any[]) => void;
  };
}
