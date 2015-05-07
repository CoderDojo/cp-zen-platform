ALTER TABLE cd_dojos ADD COLUMN dojo_lead_id character varying;
ALTER TABLE cd_dojos ADD COLUMN mailing_list smallint NOT NULL DEFAULT 0;