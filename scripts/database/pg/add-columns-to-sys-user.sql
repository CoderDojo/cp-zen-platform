ALTER TABLE sys_user
ADD COLUMN terms_conditions_accepted boolean,
ADD COLUMN mailing_list smallint NOT NULL DEFAULT 0;