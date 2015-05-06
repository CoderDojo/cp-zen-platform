DROP TABLE IF EXISTS cd_dojoleads CASCADE;

CREATE TABLE cd_dojoleads(
  user_id character varying,
  email character varying,
  application json,
  current_step integer,
  id character varying NOT NULL,
  CONSTRAINT pk_cd_dojoleads PRIMARY KEY (id)
)

WITH (
  OIDS=FALSE
);