ALTER TABLE "eval"."human_evaluations" DROP CONSTRAINT "recommendation_quality_must_be_1_to_5";--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" DROP CONSTRAINT "explanation_clarity_must_be_1_to_5";--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" DROP CONSTRAINT "relevance_to_profile_must_be_1_to_5";--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" DROP CONSTRAINT "course_variety_must_be_1_to_5";--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" DROP CONSTRAINT "trustworthiness_must_be_1_to_5";--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" ADD COLUMN "information_accuracy" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" ADD COLUMN "response_helpfulness" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" ADD COLUMN "response_relevance" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" ADD COLUMN "response_completeness" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" ADD COLUMN "conversational_quality" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" DROP COLUMN "recommendation_quality";--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" DROP COLUMN "explanation_clarity";--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" DROP COLUMN "relevance_to_profile";--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" DROP COLUMN "course_variety";--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" DROP COLUMN "trustworthiness";--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" ADD CONSTRAINT "information_accuracy_must_be_1_to_5" CHECK (information_accuracy >= 1 AND information_accuracy <= 5);--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" ADD CONSTRAINT "response_helpfulness_must_be_1_to_5" CHECK (response_helpfulness >= 1 AND response_helpfulness <= 5);--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" ADD CONSTRAINT "response_relevance_must_be_1_to_5" CHECK (response_relevance >= 1 AND response_relevance <= 5);--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" ADD CONSTRAINT "response_completeness_must_be_1_to_5" CHECK (response_completeness >= 1 AND response_completeness <= 5);--> statement-breakpoint
ALTER TABLE "eval"."human_evaluations" ADD CONSTRAINT "conversational_quality_must_be_1_to_5" CHECK (conversational_quality >= 1 AND conversational_quality <= 5);