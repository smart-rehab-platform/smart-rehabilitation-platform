/**
 * Apply database/migrations/016_unique_speech_analysis_submission.sql.
 * Audits duplicate speech_analyses groups, then applies cleanup + unique index
 * in one transaction.
 *
 * Run: node scripts/apply-migration-016-unique-speech-analysis-submission.js
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../src/database/db");

const migrationPath = path.resolve(
  __dirname,
  "..",
  "..",
  "database",
  "migrations",
  "016_unique_speech_analysis_submission.sql"
);

const duplicateGroupSql = `
  SELECT
    sa.submission_id,
    COUNT(*)::int AS analysis_count,
    json_agg(
      json_build_object(
        'id', sa.id,
        'analyzed_at', sa.analyzed_at,
        'transcript', sa.transcript,
        'word_accuracy_percentage', sa.word_accuracy_percentage
      )
      ORDER BY sa.analyzed_at DESC, sa.id DESC
    ) AS analyses
  FROM speech_analyses sa
  GROUP BY sa.submission_id
  HAVING COUNT(*) > 1
  ORDER BY COUNT(*) DESC, sa.submission_id
`;

(async () => {
  const client = await pool.connect();
  try {
    const fks = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        rc.delete_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      JOIN information_schema.referential_constraints rc
        ON rc.constraint_name = tc.constraint_name
       AND rc.constraint_schema = tc.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
       AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND ccu.table_name = 'speech_analyses'
      ORDER BY tc.table_name, kcu.column_name
    `);

    const indexesBefore = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = 'speech_analyses'
      ORDER BY indexname
    `);

    const beforeAnalyses = await client.query(
      `SELECT COUNT(*)::int AS count FROM speech_analyses`
    );
    const beforeNotes = await client.query(
      `SELECT COUNT(*)::int AS count FROM ai_progress_notes`
    );
    const beforeNotesLinked = await client.query(
      `SELECT COUNT(*)::int AS count FROM ai_progress_notes WHERE speech_analysis_id IS NOT NULL`
    );

    const groups = await client.query(duplicateGroupSql);
    const duplicateIds = [];
    const canonicalIds = [];
    const groupReports = [];

    for (const group of groups.rows) {
      const analyses = group.analyses;
      const canonical = analyses[0];
      const duplicates = analyses.slice(1);
      canonicalIds.push(canonical.id);
      duplicates.forEach((row) => duplicateIds.push(row.id));

      const notes = await client.query(
        `
        SELECT id, speech_analysis_id, created_at
        FROM ai_progress_notes
        WHERE speech_analysis_id = ANY($1::uuid[])
        ORDER BY created_at
        `,
        [analyses.map((row) => row.id)]
      );

      const comparedTo = await client.query(
        `
        SELECT id, compared_to_analysis_id
        FROM speech_analyses
        WHERE compared_to_analysis_id = ANY($1::uuid[])
        `,
        [duplicates.map((row) => row.id)]
      );

      groupReports.push({
        submission_id: group.submission_id,
        analysis_count: group.analysis_count,
        keep: canonical,
        remove: duplicates,
        ai_progress_notes: notes.rows,
        compared_to_refs: comparedTo.rows,
      });
    }

    console.log(
      JSON.stringify(
        {
          phase: "pre_cleanup_audit",
          fks: fks.rows,
          indexes: indexesBefore.rows,
          counts: {
            speech_analyses: beforeAnalyses.rows[0].count,
            ai_progress_notes: beforeNotes.rows[0].count,
            ai_progress_notes_linked: beforeNotesLinked.rows[0].count,
            duplicate_groups: groups.rows.length,
            duplicate_rows_to_remove: duplicateIds.length,
          },
          groups: groupReports,
        },
        null,
        2
      )
    );

    await client.query("BEGIN");

    const notesDeleted =
      duplicateIds.length === 0
        ? { rows: [] }
        : await client.query(
            `
            DELETE FROM ai_progress_notes
            WHERE speech_analysis_id = ANY($1::uuid[])
            RETURNING id, speech_analysis_id
            `,
            [duplicateIds]
          );

    const comparedNulled =
      duplicateIds.length === 0
        ? { rows: [] }
        : await client.query(
            `
            UPDATE speech_analyses
            SET compared_to_analysis_id = NULL
            WHERE compared_to_analysis_id = ANY($1::uuid[])
            RETURNING id
            `,
            [duplicateIds]
          );

    const analysesDeleted =
      duplicateIds.length === 0
        ? { rows: [] }
        : await client.query(
            `
            DELETE FROM speech_analyses
            WHERE id = ANY($1::uuid[])
            RETURNING id, submission_id, analyzed_at
            `,
            [duplicateIds]
          );

    const remainingDuplicates = await client.query(duplicateGroupSql);
    if (remainingDuplicates.rows.length > 0) {
      throw new Error(
        `Cleanup left ${remainingDuplicates.rows.length} duplicate group(s)`
      );
    }

    const sql = fs.readFileSync(migrationPath, "utf8");
    const statements = sql
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await client.query(statement);
      const preview = statement.replace(/\s+/g, " ").slice(0, 88);
      console.log("OK:", preview);
    }

    await client.query("COMMIT");

    const afterAnalyses = await client.query(
      `SELECT COUNT(*)::int AS count FROM speech_analyses`
    );
    const afterNotes = await client.query(
      `SELECT COUNT(*)::int AS count FROM ai_progress_notes`
    );
    const afterNotesLinked = await client.query(
      `SELECT COUNT(*)::int AS count FROM ai_progress_notes WHERE speech_analysis_id IS NOT NULL`
    );
    const afterGroups = await client.query(duplicateGroupSql);
    const indexesAfter = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = 'speech_analyses'
      ORDER BY indexname
    `);

    const uniqueCheck = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname = 'idx_speech_analyses_submission_id_unique'
    `);

    console.log(
      JSON.stringify(
        {
          phase: "post_cleanup_migration",
          counts: {
            speech_analyses: afterAnalyses.rows[0].count,
            ai_progress_notes: afterNotes.rows[0].count,
            ai_progress_notes_linked: afterNotesLinked.rows[0].count,
            duplicate_groups: afterGroups.rows.length,
          },
          deleted: {
            ai_progress_notes: notesDeleted.rows,
            compared_to_nulled: comparedNulled.rows,
            speech_analyses: analysesDeleted.rows,
            canonical_kept: canonicalIds,
          },
          indexes: indexesAfter.rows,
          unique_index: uniqueCheck.rows[0] || null,
        },
        null,
        2
      )
    );
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (_) {}
    console.error("Migration 016 failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
