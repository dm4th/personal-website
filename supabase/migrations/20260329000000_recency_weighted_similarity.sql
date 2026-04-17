-- Add recency weighting to document similarity search.
-- Recent content gets up to a 25% similarity boost, decaying linearly over 1 year.
-- Content older than 1 year receives no boost (but no penalty either).
-- Formula: similarity * (1.0 + 0.25 * max(0, 1.0 - age_in_years))

CREATE OR REPLACE FUNCTION "public"."document_similarity"("embedding" vector(1536), "match_threshold" double precision, "match_count" integer)
RETURNS TABLE (
    content_path text,
    content text,
    content_title text,
    similarity double precision
)
    LANGUAGE "plpgsql"
    AS $$
#variable_conflict use_variable
begin
  return query
  select
    '/info/'::text ||
    coalesce(page.directory,'unknown')::text ||
    '/'::text ||
    coalesce(page.page_name,'unknown')::text ||
    '#user-content-'::text ||
    coalesce(coalesce(page.sub_section, page.section),'unknown')::text as content_path,
    page_embedding.text as content,
    initcap(replace(coalesce(coalesce(page.sub_section, page.section), 'Unknown'), '-', ' '))::text as content_title,
    (
      (page_embedding.embedding <#> embedding) * -1
      * (1.0 + 0.25 * greatest(0.0, 1.0 - extract(epoch from (now() - page.last_updated)) / (365.25 * 24 * 3600)))
    ) as similarity
  from page_embedding JOIN page on page_embedding.page_id = page.id

  -- Filter on raw cosine similarity (before recency boost) to avoid excluding old but relevant content
  where (page_embedding.embedding <#> embedding) * -1 > match_threshold

  -- Order by recency-boosted similarity score
  order by similarity desc

  limit match_count;
end;
$$;

ALTER FUNCTION "public"."document_similarity"("embedding" vector(1536), "match_threshold" double precision, "match_count" integer) OWNER TO "postgres";
