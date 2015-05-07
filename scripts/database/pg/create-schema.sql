--CREATE DATABASE "cd-zen-platform-development";

DROP TABLE IF EXISTS sys_entity;

CREATE TABLE sys_entity
(
  id character varying NOT NULL,
  base character varying,
  name character varying,
  fields character varying,
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
  auto boolean,
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
  username character varying,
  activated smallint,
  level smallint,
  mysql_user_id int,
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
  modified timestamp with time zone,
  accounts character varying[],
  locale character varying,
  banned smallint,
  ban_reason character varying,
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
  alpha2 character varying,
  alpha3 character varying,
  fips character varying,
  "number" character varying,
  name character varying,
  country_name character varying,
  continent character varying,
  geoname_id character varying,
  CONSTRAINT pk_cd_countries_id PRIMARY KEY (id)
)

WITH (
  OIDS=FALSE
);

DROP TABLE IF EXISTS cd_geonames CASCADE;

CREATE TABLE cd_geonames(
  id character varying NOT NULL,
  name character varying NOT NULL,
  asciiname character varying NOT NULL,
  alternatenames character varying[],
  latitude character varying,
  longitude character varying,
  feature_class character varying,
  feature_code character varying,
  country_code character varying,
  cc2 character varying,
  admin1_code character varying,
  admin1_name character varying,
  admin2_code character varying,
  admin2_name character varying,
  admin3_code character varying,
  admin3_name character varying,
  admin4_code character varying,
  admin4_name character varying,
  population character varying,
  elevation character varying,
  dem character varying,
  timezone character varying,
  modification_date character varying,
  geoname_id character varying,
  CONSTRAINT pk_cd_geonames_id PRIMARY KEY (id)
)

WITH (
  OIDS=FALSE
);

DROP TABLE IF EXISTS cd_dojos CASCADE;

CREATE TABLE cd_dojos(
  id character varying NOT NULL,
  mysql_dojo_id int,
  dojo_lead_id character varying,
  name character varying NOT NULL,
  creator character varying,
  created timestamp with time zone,
  verified_at timestamp with time zone,
  verified_by character varying,
  verified smallint NOT NULL DEFAULT 0,
  need_mentors smallint NOT NULL DEFAULT 0,
  mailing_list smallint NOT NULL DEFAULT 0,
  stage smallint NOT NULL DEFAULT 0,
  "time" character varying,
  "country" json,
  county json,
  state json,
  city json,
  place json,
  location character varying,
  coordinates character varying,
  geo_point json,
  notes text,
  email character varying,
  website character varying,
  twitter character varying,
  google_group character varying,
  eb_id character varying,
  supporter_image character varying,
  deleted smallint NOT NULL DEFAULT 0,
  deleted_by character varying,
  deleted_at timestamp with time zone,
  private smallint NOT NULL DEFAULT 0,
  url_slug character varying,
  continent character varying,
  alpha2 character varying,
  alpha3 character varying,
  address1 character varying,
  address2 character varying,
  country_number int,
  country_name character varying,
  admin1_code character varying,
  admin1_name character varying,
  admin2_code character varying,
  admin2_name character varying,
  admin3_code character varying,
  admin3_name character varying,
  admin4_code character varying,
  admin4_name character varying,
  place_geoname_id character varying,
  place_name character varying,
  CONSTRAINT pk_cd_dojos_id PRIMARY KEY (id)
)

WITH (
  OIDS=FALSE
);

DROP TABLE IF EXISTS cd_usersdojos CASCADE;

CREATE TABLE cd_usersdojos(
  id character varying NOT NULL,
  mysql_user_id int,
  mysql_dojo_id int,
  owner smallint,
  user_id character varying NOT NULL,
  dojo_id character varying NOT NULL,
  CONSTRAINT pk_cd_userdojos PRIMARY KEY (id)
)

WITH (
  OIDS=FALSE
);

DROP TABLE IF EXISTS cd_profiles CASCADE;

CREATE TABLE cd_profiles(
  id character varying NOT NULL,
  role int,
  dojo_id character varying,
  user_id character varying,
  mysql_user_id int,
  mysql_dojo_id character varying,
  CONSTRAINT pk_cd_profiles PRIMARY KEY (id)
)

WITH (
  OIDS=FALSE
);

DROP TABLE IF EXISTS cd_agreements CASCADE;

CREATE TABLE cd_agreements(
  mysql_user_id int,
  full_name character varying,
  ip_address character varying,
  "timestamp" timestamp with time zone,
  agreement_version smallint,
  user_id character varying,
  id character varying NOT NULL,
  CONSTRAINT pk_cd_agreements PRIMARY KEY (id)
)

WITH (
  OIDS=FALSE
);

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

DROP VIEW IF EXISTS cd_stats;

CREATE VIEW cd_stats AS
SELECT  continent, alpha2 as "country", country_name, 
         COUNT(DISTINCT CASE WHEN (verified = 1 AND stage != 4) THEN id END) AS "active_verified",
         COUNT(DISTINCT CASE WHEN verified = 1 THEN id END) AS "verified",
         COUNT(DISTINCT id) as "all"
FROM cd_dojos
WHERE "deleted" = 0
GROUP BY continent, alpha2, country_name