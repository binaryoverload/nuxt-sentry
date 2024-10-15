import type { SentryModuleOptions } from "./types/module"
import type { Nuxt } from "@nuxt/schema"
import type { Plugin } from "vite"

import { addPlugin, addVitePlugin, createResolver, defineNuxtModule, useLogger } from "@nuxt/kit"
import { type SentryVitePluginOptions, sentryVitePlugin } from "@sentry/vite-plugin"
import defu from "defu"

const logger = useLogger("nuxt:sentry")

export default defineNuxtModule<SentryModuleOptions>({
  meta: {
    name: "@binaryoverload/nuxt-sentry",
    configKey: "sentry",
    compatibility: {
      nuxt: "^3.0.0",
    },
  },
  async setup(_moduleOptions: SentryModuleOptions, nuxt: Nuxt) {
    if (_moduleOptions.enabled === false) {
      logger.warn("Sentry module is disabled")
      return
    }

    logger.info("Setting up Sentry module")

    const moduleOptions = defu(_moduleOptions, {
      deleteSourcemapsAfterUpload: true,
      vitePlugin: {
        disable: process.env.NODE_ENV !== "production" || !process.env.CI,
        release: {
          deploy: {
            env: process.env.NODE_ENV ?? "development",
          },
        },
      },
    } satisfies Partial<SentryModuleOptions>)

    const resolver = createResolver(import.meta.url)

    nuxt.options.sourcemap.client = true

    const defaults: SentryVitePluginOptions = {}
    if (moduleOptions.deleteSourcemapsAfterUpload) {
      defaults.sourcemaps = {
        filesToDeleteAfterUpload: [".output/**/*.map"],
      }
    }

    nuxt.options.build.transpile.push("@sentry/vue")

    addVitePlugin(() => sentryVitePlugin(defu(moduleOptions.vitePlugin, defaults)) as Plugin)

    addPlugin(resolver.resolve("./runtime/sentry.client"))
  },
})
