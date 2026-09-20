<script lang="ts" generics="T">
	import type { Datatable } from './datatable.svelte';

	let { table }: { table: Datatable<T> } = $props();
</script>

{#if table.error}
	<div class="alert alert-danger">{table.error}</div>
{/if}

{#if table.loading}
	<div class="spinner-border" role="status">
		<span class="visually-hidden">Loading…</span>
	</div>
{:else if table.rows.length === 0}
	<p class="text-muted">No results found.</p>
{:else}
	<table class="table table-hover align-middle">
		<thead>
			<tr>
				{#each table.columns as column (column.title)}
					{#if column.sortKey}
						<th role="button" onclick={() => table.toggleSort(column.sortKey!)}>
							{column.title}{table.sortIndicator(column.sortKey)}
						</th>
					{:else}
						<th>{column.title}</th>
					{/if}
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each table.rows as row, i (i)}
				<tr>
					{#each table.columns as column (column.title)}
						<td>{@render column.render(row)}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="d-flex justify-content-between align-items-center">
		<span class="text-muted small">{table.rangeLabel}</span>
		<div>
			<button
				class="btn btn-sm btn-outline-secondary me-2"
				disabled={!table.hasPrevPage}
				onclick={() => table.prevPage()}
			>
				Previous
			</button>
			<button
				class="btn btn-sm btn-outline-secondary"
				disabled={!table.hasNextPage}
				onclick={() => table.nextPage()}
			>
				Next
			</button>
		</div>
	</div>
{/if}
