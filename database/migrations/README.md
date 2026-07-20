# Database Migrations

Migrations in this folder are applied **manually**. There is no automatic migration runner in the backend yet.

## `006_prepare_refresh_tokens.sql`

Renames `refresh_tokens.token` to `token_hash`, aligns constraints/indexes, and prepares the table for SHA-256 hashed refresh tokens.

### Docker (Linux / macOS / Git Bash)

```bash
docker exec -i smart_rehab_postgres \
  psql -U postgres -d smart_rehab_db \
  < database/migrations/006_prepare_refresh_tokens.sql
```

### Windows CMD

```cmd
type database\migrations\006_prepare_refresh_tokens.sql | docker exec -i smart_rehab_postgres psql -U postgres -d smart_rehab_db
```

### PowerShell

```powershell
Get-Content database\migrations\006_prepare_refresh_tokens.sql -Raw | docker exec -i smart_rehab_postgres psql -U postgres -d smart_rehab_db
```

## Verification (read-only)

After applying the migration:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'refresh_tokens'
ORDER BY ordinal_position;
```

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'refresh_tokens';
```

```sql
SELECT COUNT(*) FROM refresh_tokens;
```

Expected columns include `token_hash` (`character varying`), not `token`.
