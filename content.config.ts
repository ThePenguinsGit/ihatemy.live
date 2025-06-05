import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { asSitemapCollection } from "@nuxtjs/sitemap/content";

export default defineContentConfig({
  collections: {
    docs: defineCollection(asSitemapCollection({
      type: 'page',
      source: 'docs/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        position : z.number().optional(),
        pageTitle: z.string().optional(),
      }),
    })),
    legal: defineCollection(asSitemapCollection({
      type: 'page',
      source: 'legal/**/*.md',
    }))
  }
})