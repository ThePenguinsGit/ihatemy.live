import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import {defineSitemapSchema} from "@nuxtjs/sitemap/content";
import { defineRobotsSchema } from '@nuxtjs/robots/content'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: 'docs/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        position : z.number().optional(),
        pageTitle: z.string().optional(),
        sitemap: defineSitemapSchema(),
        robots: defineRobotsSchema(),
      }),
    }),
    legal: defineCollection({
      type: 'page',
      source: 'legal/**/*.md',
    })
  }
})