import type { Snippet } from 'svelte';

export type SortDir = 'asc' | 'desc';

// Column describes one table column: its header title, how to render a
// cell (given the row it belongs to), and — if sortable — the column
// name a click on its header toggles sorting by. Matches the server-side
// DatatableRequest/DatatablePageInfo shape (maf/datatables): sortKey and
// filters map directly onto sortBy/filters fields sent in the request.
export type Column<T> = {
	title: string;
	render: Snippet<[T]>;
	sortKey?: string;
};

export type PageInfo = { totalCount: number; page: number; pageSize: number };

export type DatatableQuery = {
	page: number;
	pageSize: number;
	sortBy: string;
	sortDir: SortDir;
	filters: Record<string, string>;
};

export type DatatableResult<T> = { items: T[]; pageInfo: PageInfo };

// A fetch function is just "call the generated rrpc list() method with
// this query" — keeping this a plain function (rather than hard-wiring a
// specific service) is what makes Datatable reusable across any
// DatatableRequest-backed endpoint.
export type DatatableFetch<T> = (query: DatatableQuery) => Promise<DatatableResult<T>>;

// Datatable holds all reactive state (rows, loading, error, page, sort,
// filters) for a paginated/sortable/filterable list. Render it with the
// companion DatatableView.svelte component.
export class Datatable<T> {
	columns: Column<T>[];
	pageSize: number;

	rows = $state<T[]>([]);
	loading = $state(true);
	error = $state('');
	page = $state(0);
	totalCount = $state(0);
	sortBy = $state('');
	sortDir = $state<SortDir>('asc');
	filters = $state<Record<string, string>>({});

	#fetch: DatatableFetch<T>;
	#filterDebounce: ReturnType<typeof setTimeout> | undefined;

	constructor(columns: Column<T>[], fetch: DatatableFetch<T>, pageSize = 25) {
		this.columns = columns;
		this.#fetch = fetch;
		this.pageSize = pageSize;
	}

	async load() {
		this.loading = true;
		this.error = '';
		try {
			const result = await this.#fetch({
				page: this.page,
				pageSize: this.pageSize,
				sortBy: this.sortBy,
				sortDir: this.sortDir,
				filters: this.filters
			});
			this.rows = result.items;
			this.totalCount = result.pageInfo.totalCount;
		} catch {
			this.error = 'Failed to load data.';
		} finally {
			this.loading = false;
		}
	}

	// Bind to a search input's oninput: setFilter('name', value). Debounced
	// (300ms) and resets to page 0, since a narrower/wider result set makes
	// the current page number meaningless.
	setFilter(key: string, value: string) {
		const next = { ...this.filters };
		if (value) {
			next[key] = value;
		} else {
			delete next[key];
		}
		this.filters = next;
		this.page = 0;
		clearTimeout(this.#filterDebounce);
		this.#filterDebounce = setTimeout(() => this.load(), 300);
	}

	toggleSort(column: string) {
		if (this.sortBy === column) {
			this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			this.sortBy = column;
			this.sortDir = 'asc';
		}
		this.page = 0;
		this.load();
	}

	sortIndicator(column: string): string {
		if (this.sortBy !== column) return '';
		return this.sortDir === 'asc' ? ' ▲' : ' ▼';
	}

	get hasPrevPage(): boolean {
		return this.page > 0;
	}

	get hasNextPage(): boolean {
		return (this.page + 1) * this.pageSize < this.totalCount;
	}

	prevPage() {
		if (!this.hasPrevPage) return;
		this.page -= 1;
		this.load();
	}

	nextPage() {
		if (!this.hasNextPage) return;
		this.page += 1;
		this.load();
	}

	get rangeLabel(): string {
		if (this.totalCount === 0) return '';
		const from = this.page * this.pageSize + 1;
		const to = Math.min((this.page + 1) * this.pageSize, this.totalCount);
		return `Showing ${from}–${to} of ${this.totalCount}`;
	}
}
