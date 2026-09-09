# Routing and remote data

## Ownership

Let route files own routing. They validate params and search, load or preload route dependencies, handle redirects, and pass typed routing state and callbacks to the page.

Preserve the router's configured route mode. In a TanStack file-based application, keep one `createFileRoute` declaration in each route module and let generated routing assemble the tree. A centralized `createRoute` registry is a different architecture, not a refactor of the file-based one.

```text
src/routes/runs.tsx       createFileRoute, validation, loader, route callbacks
  -> src/pages/runs-page.tsx       page boundary and readable composition
       -> src/components/run-list.tsx       one focused component
```

Keep page-defining state in validated URL search parameters. Search, filters, sorting, pagination, and selected views belong in the URL when refresh, history navigation, or sharing should restore them. Keep ephemeral interaction state local.

Make the page a readable composition of focused hooks and components. The route-facing page component owns the error boundary and Suspense boundary. It delegates to a data loader or content component that calls TanStack suspense queries.

## Query states

Successful content receives defined data. Do not manufacture an empty value while a request is pending.

Keep the persistent application shell above page data boundaries. Default to one boundary for the page's data-dependent content. Place a narrower boundary around a genuinely independent slow region when progressive rendering improves the screen.

Treat empty, error, and pending as distinct states. A background refetch keeps successful data visible. Use the application's loader and error fallback components.
