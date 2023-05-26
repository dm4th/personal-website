ALTER TABLE "public"."page_embedding" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

ALTER TABLE "public"."chats" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

ALTER TABLE "public"."chat_history" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

CREATE POLICY "Enable read access for anon" ON "public"."chat_roles"
AS PERMISSIVE FOR SELECT
TO anon
USING (true);

CREATE POLICY "Enable read access for anon" ON "public"."chats"
AS PERMISSIVE FOR SELECT
TO anon
USING (true);

CREATE POLICY "Enable read access for anon" ON "public"."chat_history"
AS PERMISSIVE FOR SELECT
TO anon
USING (true);

CREATE POLICY "Enable read access for anon" ON "public"."page"
AS PERMISSIVE FOR SELECT
TO anon
USING (true);

CREATE POLICY "Enable read access for anon" ON "public"."page_embedding"
AS PERMISSIVE FOR SELECT
TO anon
USING (true);

CREATE POLICY "Enable insert access for anon" ON "public"."chats"
AS PERMISSIVE FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Enable insert access for anon" ON "public"."chat_history"
AS PERMISSIVE FOR INSERT
TO anon
WITH CHECK (true);