import type { SentryVitePluginOptions } from "@sentry/vite-plugin"
import type { Options as SentryVueOptions } from "@sentry/vue/types/types"
import type { NuxtApp } from "nuxt/app"

export type SentryConfig = Partial<Omit<SentryVueOptions, "Vue" | "app" | "dsn">>

export interface DisableIntegrationConfig {
  Breadcrumbs?: boolean
  BrowserTracing?: boolean
  CaptureConsole?: boolean
  ContextLines?: boolean
  Debug?: boolean
  Dedupe?: boolean
  ExtraErrorData?: boolean
  FunctionToString?: boolean
  GlobalHandlers?: boolean
  HttpClient?: boolean
  HttpContext?: boolean
  InboundFilters?: boolean
  LinkedErrors?: boolean
  ModuleMetadata?: boolean
  Replay?: boolean
  ReportingObserver?: boolean
  RewriteFrames?: boolean
  SessionTiming?: boolean
  TryCatch?: boolean
  [key: string]: boolean | undefined
}

export interface ModuleOptions {
  /** @default true */
  enabled?: boolean
  /** @default true */
  deleteSourcemapsAfterUpload?: boolean
  vitePlugin: SentryVitePluginOptions
}

export interface RuntimeConfig {
  dsn: string
  enabled?: boolean
  disableIntegrations?: DisableIntegrationConfig
  clientSdk?: SentryConfig
}

export interface AppConfig {
  clientSdk?: SentryConfig | ((app: NuxtApp) => SentryConfig)
}

declare module "@nuxt/schema" {
  interface PublicRuntimeConfig {
    sentry: RuntimeConfig
  }
  interface NuxtConfig {
    sentry?: ModuleOptions
  }
  interface AppConfigInput {
    sentry?: AppConfig
  }
  interface AppConfig {
    sentry?: AppConfig
  }
}
