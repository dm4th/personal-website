CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


create policy "Allow Authenticated to Manipulate Avatars 1oj01fe_0"
on "storage"."objects"
as permissive
for select
to authenticated
using ((bucket_id = 'avatars'::text));


create policy "Allow Authenticated to Manipulate Avatars 1oj01fe_1"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'avatars'::text));


create policy "Allow Authenticated to Manipulate Avatars 1oj01fe_2"
on "storage"."objects"
as permissive
for update
to authenticated
using ((bucket_id = 'avatars'::text));


create policy "Allow Authenticated to Manipulate Avatars 1oj01fe_3"
on "storage"."objects"
as permissive
for delete
to authenticated
using ((bucket_id = 'avatars'::text));


create policy "Authenticated can upload an avatar."
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'avatars'::text));


create policy "Avatar images are publicly accessible."
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'avatars'::text));



