import type {
  BrowserTracingOptions,
  ClientIntegrationConfig,
  ClientIntegrations,
} from "../types/integrations"
import type { Entries } from "../types/util"
import type { Integration, Options } from "@sentry/types"

import {
  breadcrumbsIntegration,
  browserApiErrorsIntegration,
  captureConsoleIntegration,
  captureException,
  contextLinesIntegration,
  debugIntegration,
  dedupeIntegration,
  extraErrorDataIntegration,
  functionToStringIntegration,
  globalHandlersIntegration,
  httpClientIntegration,
  httpContextIntegration,
  inboundFiltersIntegration,
  init,
  linkedErrorsIntegration,
  moduleMetadataIntegration,
  replayIntegration,
  reportingObserverIntegration,
  sessionTimingIntegration,
  browserTracingIntegration as vueBrowserTracingIntegration,
  withScope,
} from "@sentry/vue"
import defu from "defu"
import {
  type NuxtSSRContext,
  defineNuxtPlugin,
  useAppConfig,
  useRouter,
  useRuntimeConfig,
} from "nuxt/app"

type _NuxtApp = NuxtSSRContext["nuxt"]

const integrationMap: Record<ClientIntegrations, (...args: any) => any> = {
  Breadcrumbs: breadcrumbsIntegration,
  BrowserTracing: vueBrowserTracingIntegration,
  CaptureConsole: captureConsoleIntegration,
  ContextLines: contextLinesIntegration,
  Debug: debugIntegration,
  Dedupe: dedupeIntegration,
  ExtraErrorData: extraErrorDataIntegration,
  FunctionToString: functionToStringIntegration,
  GlobalHandlers: globalHandlersIntegration,
  HttpClient: httpClientIntegration,
  HttpContext: httpContextIntegration,
  InboundFilters: inboundFiltersIntegration,
  LinkedErrors: linkedErrorsIntegration,
  ModuleMetadata: moduleMetadataIntegration,
  Replay: replayIntegration,
  ReportingObserver: reportingObserverIntegration,
  SessionTiming: sessionTimingIntegration,
  TryCatch: browserApiErrorsIntegration,
}

const defaultIntegrations: ClientIntegrations[] = [
  "Breadcrumbs",
  "BrowserTracing",
  "Debug",
  "FunctionToString",
  "GlobalHandlers",
  "HttpContext",
  "InboundFilters",
  "LinkedErrors",
  "TryCatch",
]

export default defineNuxtPlugin({
  enforce: "pre",
  setup(nuxt) {
    const runtimeSentryConfig = useRuntimeConfig().public.sentry
    const appSentryConfig = useAppConfig().sentry

    const enabled = runtimeSentryConfig?.enabled ?? !import.meta.dev
    const dsn = runtimeSentryConfig?.dsn

    if (!dsn) {
      console.warn("Sentry DSN is not provided, Sentry will not be initialized.")
      return
    }

    const runtimeSdkConfig = runtimeSentryConfig?.clientSdk
    const runtimeIntegrations = runtimeSentryConfig?.clientIntegrations

    const appSdkConfig = appSentryConfig?.clientSdk
    const appIntegrations = appSentryConfig?.clientIntegrations
    const appConfig = typeof appSdkConfig === "function" ? appSdkConfig(nuxt) : appSdkConfig

    const integrationConfig = defu(runtimeIntegrations, appIntegrations)

    const config: Partial<Options> = defu(runtimeSdkConfig, appConfig, {
      tracesSampleRate: 1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1,
      environment: import.meta.dev ? "development" : "production",
      enabled,
    } as const)

    const integrations = config.integrations ?? buildIntegrations(integrationConfig)

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

function buildIntegrations(integrationConfig: ClientIntegrationConfig) {
  const integrations: Integration[] = []

  for (const [name, integration] of Object.entries(integrationMap) as Entries<
    typeof integrationMap
  >) {
    const options = integrationConfig[name]

    // If the integration is disabled, skip it
    if (options === false) continue

    // If the integration hasn't been configured and isn't a default, skip it
    if (options == null && !defaultIntegrations.includes(name)) continue

    const integrationOptions = options === true ? undefined : options

    if (name === "BrowserTracing") {
      const browserOptions = integrationOptions as BrowserTracingOptions | undefined
      integrations.push(
        vueBrowserTracingIntegration({
          ...browserOptions,
          router: useRouter(),
        }),
      )
      continue
    }

    integrations.push(integration(options === true ? undefined : options))
  }

  return integrations
}
