ALTER TABLE sys_user ADD COLUMN terms_conditions_accepted boolean;
ALTER TABLE sys_user ADD COLUMN phone character varying;
ALTER TABLE cd_dojos ADD COLUMN mailing_list smallint NOT NULL DEFAULT 0;