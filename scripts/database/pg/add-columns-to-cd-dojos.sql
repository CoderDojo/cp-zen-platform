ALTER TABLE cd_dojos 
ADD COLUMN dojo_lead_id character varying, 
ADD COLUMN mailing_list smallint NOT NULL DEFAULT 0,
ADD COLUMN mentor_invites json[];