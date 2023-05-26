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
    (page_embedding.embedding <#> embedding) * -1 as similarity
  from page_embedding JOIN page on page_embedding.page_id = page.id

  -- The dot product is negative because of a Postgres limitation, so we negate it
  where (page_embedding.embedding <#> embedding) * -1 > match_threshold
  
  order by page_embedding.embedding <#> embedding

  limit match_count;
end;
$$;

ALTER FUNCTION "public"."document_similarity"("embedding" vector(1536), "match_threshold" double precision, "match_count" integer) OWNER TO "postgres";