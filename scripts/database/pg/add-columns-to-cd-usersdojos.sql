ALTER TABLE cd_usersdojos
ADD COLUMN user_types character varying[],
ADD COLUMN user_permissions json[];