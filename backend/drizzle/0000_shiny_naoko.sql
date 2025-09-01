CREATE TABLE "sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"description" varchar(255),
	"startTime" varchar(255) NOT NULL,
	"endTime" varchar(255) NOT NULL,
	"compensation" varchar(255) NOT NULL
);
