import {sqliteTable,text,integer,uniqueIndex,index} from 'drizzle-orm/sqlite-core';
export const contentItems=sqliteTable('content_items',{
  id:text('id').primaryKey(),type:text('type').notNull(),slug:text('slug').notNull(),locale:text('locale').notNull(),
  title:text('title').notNull(),summary:text('summary').notNull(),category:text('category').notNull(),body:text('body').notNull(),
  image:text('image').notNull(),mediaUrl:text('media_url'),duration:text('duration'),
  published:integer('published',{mode:'boolean'}).notNull().default(false),illustrative:integer('illustrative',{mode:'boolean'}).notNull().default(false),
  publishedAt:text('published_at').notNull(),createdAt:text('created_at').notNull(),updatedAt:text('updated_at').notNull()
},t=>[uniqueIndex('content_locale_type_slug').on(t.locale,t.type,t.slug),index('content_public_lookup').on(t.published,t.locale,t.type)]);
export const enquiries=sqliteTable('enquiries',{
  id:text('id').primaryKey(),submissionKey:text('submission_key').notNull().unique(),reference:text('reference').notNull().unique(),
  name:text('name').notNull(),company:text('company'),email:text('email').notNull(),phone:text('phone'),service:text('service').notNull(),
  message:text('message').notNull(),locale:text('locale').notNull(),consent:integer('consent',{mode:'boolean'}).notNull(),
  status:text('status').notNull().default('new'),ipHash:text('ip_hash'),createdAt:text('created_at').notNull()
},t=>[index('enquiry_rate_limit').on(t.ipHash,t.createdAt)]);
