ALTER TABLE "public"."chat_history"
    DROP CONSTRAINT "chat_history_chat_id_fkey";

ALTER TABLE "public"."chat_history"
    ADD CONSTRAINT "chat_history_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id")
    ON DELETE CASCADE;

ALTER TABLE "public"."chat_history"
    DROP CONSTRAINT "chat_history_role_id_fkey";

ALTER TABLE "public"."chat_history"
    ADD CONSTRAINT "chat_history_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."chat_roles"("id")
    ON DELETE CASCADE;

ALTER TABLE "public"."chat_history"
    DROP CONSTRAINT "chat_history_user_id_fkey";

ALTER TABLE "public"."chat_history"
    ADD CONSTRAINT "chat_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id")
    ON DELETE CASCADE;

ALTER TABLE "public"."chat_roles"
    DROP CONSTRAINT "chat_roles_user_id_fkey";

ALTER TABLE "public"."chat_roles"
    ADD CONSTRAINT "chat_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id")
    ON DELETE CASCADE;

ALTER TABLE "public"."chats"
    DROP CONSTRAINT "chats_role_id_fkey";

ALTER TABLE "public"."chats"
    ADD CONSTRAINT "chats_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."chat_roles"("id")
    ON DELETE CASCADE;

ALTER TABLE "public"."chats"
    DROP CONSTRAINT "chats_user_id_fkey";

ALTER TABLE "public"."chats"
    ADD CONSTRAINT "chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id")
    ON DELETE CASCADE;

ALTER TABLE "public"."page_embedding"
    DROP CONSTRAINT "page_embedding_page_id_fkey";

ALTER TABLE "public"."page_embedding"
    ADD CONSTRAINT "page_embedding_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "public"."page"("id")
    ON DELETE CASCADE;