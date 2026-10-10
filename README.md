# @netgarden/svelte-datatables

Source-only Svelte 5 + Bootstrap library for server-side tables (paging, sorting,
filters). `Datatable` holds the reactive state; `DatatableView` renders it. The
query/page-info shapes mirror `maf/datatables` (Go): `sortBy`, `sortDir`, `filters`,
0-based `page`.

```ts
const table = new Datatable<User>(columns, (q) =>
  api.list(q).then((r) => ({ items: r.users, pageInfo: r.pageInfo }))
);
onMount(() => table.load());
```
```svelte
<DatatableView {table} />
```

Consume via `"@netgarden/svelte-datatables": "file:../../svelte-datatables"`. There is no
build step; apps compile the sources (SvelteKit apps may need `server.fs.allow` in dev).

## License

Apache License 2.0, see [LICENSE](LICENSE).
