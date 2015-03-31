DROP TABLE IF EXISTS sys_entity;

CREATE TABLE sys_entity
(
  id character varying NOT NULL,
  base character varying,
  name character varying,
  "zone" character varying,
  seneca json,
  CONSTRAINT pk_sys_entity_id PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);



DROP TABLE IF EXISTS sys_account;

CREATE TABLE sys_account
(
  id character varying NOT NULL,
  orignick character varying,
  name character varying,
  origuser character varying,
  active boolean,
  users character varying,
  CONSTRAINT pk_sys_account_id PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);



DROP TABLE IF EXISTS sys_login CASCADE;

CREATE TABLE sys_login
(
  id character varying,
  nick character varying,
  email character varying,
  "user" character varying,
  "when" timestamp with time zone,
  why character varying,
  token character varying,
  active boolean,
  ended character varying,
  CONSTRAINT pk_sys_login_id PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);



DROP TABLE IF EXISTS sys_user CASCADE;

CREATE TABLE sys_user
(
  id character varying NOT NULL,
  nick character varying,
  email character varying,
  name character varying,
  first_name character varying,
  last_name character varying,
  roles character varying[],
  active boolean,
  "when" timestamp with time zone,
  confirmed boolean,
  confirmcode character varying,
  salt character varying,
  pass character varying,
  admin boolean,
  accounts character varying[],
  locale character varying,
  CONSTRAINT pk_sys_user_id PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);



DROP TABLE IF EXISTS sys_reset CASCADE;

CREATE TABLE sys_reset
(
  id character varying NOT NULL,
  nick character varying,
  "user" character varying,
  "when" timestamp with time zone,
  active boolean,
  CONSTRAINT pk_sys_reset_id PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);

DROP TABLE IF EXISTS cd_countries CASCADE;

CREATE TABLE cd_countries(
  id character varying NOT NULL,
  continent character varying NOT NULL,
  alpha2 character varying,
  alpha3 character varying,
  "number" character varying,
  country_name character varying,
  CONSTRAINT pk_cd_countries_id PRIMARY KEY (id)
)

WITH (
  OIDS=FALSE
);

DROP TABLE IF EXISTS cd_dojos CASCADE;

CREATE TABLE cd_dojos(
  id character varying NOT NULL,
  name character varying NOT NULL,
  creator character varying,
  created timestamp with time zone,
  verified_at timestamp with time zone,
  verified_by character varying,
  verified smallint NOT NULL DEFAULT 0,
  need_mentors smallint NOT NULL DEFAULT 0,
  stage smallint NOT NULL DEFAULT 0,
  "time" character varying,
  "country" char(2),
  location character varying,
  coordinates character varying,
  notes text,
  email character varying,
  website character varying,
  twitter character varying,
  google_group character varying,
  eb_id character varying,
  supporter_image character varying,
  deleted smallint NOT NULL DEFAULT 0,
  deleted_by character varying NOT NULL,
  deleted_at timestamp with time zone,
  private smallint NOT NULL DEFAULT 0,
  url_slug character varying,
  CONSTRAINT pk_cd_dojos_id PRIMARY KEY (id)
)

WITH (
  OIDS=FALSE
);