ALTER TABLE cd_usersdojos
ADD COLUMN user_types json[],
ADD COLUMN user_permissions json[];