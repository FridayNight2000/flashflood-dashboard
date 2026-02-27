### Work in progress

### Type placement rules

- Put app-wide shared contracts in `types/` (for example `Station`, API response DTOs).
- Put map feature shared UI types in `app/map/types.ts` (for example `ActiveTab`, `BasinTabData`, search suggestion types, chart point DTOs).
- Keep file-local prop/helper types next to the component or hook that owns them.
- Keep server-only query filter types in `lib/queries/*`.
- Avoid importing types from component files into hooks; both should import from a feature type module instead.
