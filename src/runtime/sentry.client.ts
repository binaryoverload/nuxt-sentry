import type { Integration } from "@sentry/types"
import type { Options } from "@sentry/vue/types/types"

import {
  captureException,
  init,
  browserTracingIntegration as vueBrowserTracingIntegration,
  withScope,
} from "@sentry/vue"
import defu from "defu"
import { defineNuxtPlugin, useAppConfig, useRuntimeConfig } from "nuxt/app"

import { type DisableIntegrationConfig } from "../types"

export default defineNuxtPlugin({
  enforce: "pre",
  setup(nuxt) {
    const runtimeSentryConfig = useRuntimeConfig().public.sentry
    const appSentryConfig = useAppConfig().sentry

    const enabled = runtimeSentryConfig?.enabled ?? !process.dev
    const dsn = runtimeSentryConfig?.dsn
    const runtimeSdkConfig = runtimeSentryConfig?.clientSdk
    const runtimeDisableIntegrations = runtimeSentryConfig?.disableIntegrations ?? {}

    const appSdkConfig = appSentryConfig?.clientSdk
    const appConfig =
      typeof appSdkConfig === "function" ? appSdkConfig(nuxt.vueApp.$nuxt) : appSdkConfig

    const config: Partial<Options> = defu(runtimeSdkConfig, appConfig, {
      tracesSampleRate: 1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1,
      environment: process.dev ? "development" : "production",
      enabled,
    } as const)

    const configIntegrations = config.integrations

    const integrations =
      typeof configIntegrations === "function"
        ? config.integrations
        : buildIntegrations(configIntegrations ?? [], runtimeDisableIntegrations)

    init({
      app: nuxt.vueApp,
      dsn,
      ...config,
      integrations,
    })

    nuxt.vueApp.config.errorHandler = (err, context) => {
      withScope((scope) => {
        scope.setExtra("context", context)
        captureException(err)
      })
    }

    nuxt.hook("app:error", (err) => {
      captureException(err)
    })
  },
})

function buildIntegrations(
  configIntegrations: Integration[],
  disableIntegrations: DisableIntegrationConfig,
) {
  return function (sdkDefaultIntegrations: Integration[]): Integration[] {
    const defaultIntegrations: Integration[] = [vueBrowserTracingIntegration()]

    const resolvedIntegrations = [
      ...sdkDefaultIntegrations,
      ...defaultIntegrations,
      ...(configIntegrations ?? []),
    ]

    // Filter out duplicate integrations by their name with the latter taking precedence
    const integrationMap = {} as Record<string, Integration>
    for (const integration of resolvedIntegrations) {
      // If the integration is disabled, skip it
      if (disableIntegrations[integration.name] === true) {
        continue
      }

      integrationMap[integration.name] = integration
    }

    return Object.values(integrationMap)
  }
}
