/*

  This file contains types for the integrations that are supported by the Sentry JS SDK.

  Unfortunately, the Sentry SDK does not export all types for the integrations, so we have to define them ourselves.

*/

import type { RequestInstrumentationOptions, replayIntegration } from "@sentry/vue"

export interface ClientIntegrationConfig {
  Breadcrumbs?: Partial<BreadcrumbsOptions> | boolean
  BrowserTracing?: Partial<BrowserTracingOptions> | boolean
  CaptureConsole?: Partial<CaptureConsoleOptions> | boolean
  ContextLines?: Partial<ContextLinesOptions> | boolean
  Debug?: Partial<DebugOptions> | boolean
  Dedupe?: boolean
  ExtraErrorData?: Partial<ExtraErrorDataOptions> | boolean
  FunctionToString?: boolean
  GlobalHandlers?: Partial<GlobalHandlersOptions> | boolean
  HttpClient?: Partial<HttpClientOptions> | boolean
  HttpContext?: boolean
  InboundFilters?: Partial<InboundFiltersOptions> | boolean
  LinkedErrors?: Partial<LinkedErrorsOptions> | boolean
  ModuleMetadata?: boolean
  Replay?: Partial<ReplayConfiguration> | boolean
  ReportingObserver?: Partial<ReportingObserverOptions> | boolean
  SessionTiming?: boolean
  TryCatch?: boolean
}

export type ClientIntegrations = keyof ClientIntegrationConfig

// https://github.com/getsentry/sentry-javascript/blob/develop/packages/browser/src/integrations/breadcrumbs.ts
export interface BreadcrumbsOptions {
  console: boolean
  dom:
    | boolean
    | {
        serializeAttribute?: string | string[]
        maxStringLength?: number
      }
  fetch: boolean
  history: boolean
  sentry: boolean
  xhr: boolean
}

// https://github.com/getsentry/sentry-javascript/blob/develop/packages/vue/src/browserTracingIntegration.ts
export interface BrowserTracingOptions
  extends Omit<RequestInstrumentationOptions, "shouldCreateSpanForRequest"> {
  /**
   * The time to wait in ms until the transaction will be finished during an idle state. An idle state is defined
   * by a moment where there are no in-progress spans.
   *
   * The transaction will use the end timestamp of the last finished span as the endtime for the transaction.
   * If there are still active spans when this the `idleTimeout` is set, the `idleTimeout` will get reset.
   * Time is in ms.
   *
   * Default: 1000
   */
  idleTimeout: number
  /**
   * The max duration for a transaction. If a transaction duration hits the `finalTimeout` value, it
   * will be finished.
   * Time is in ms.
   *
   * Default: 30000
   */
  finalTimeout: number
  /**
   * The heartbeat interval. If no new spans are started or open spans are finished within 3 heartbeats,
   * the transaction will be finished.
   * Time is in ms.
   *
   * Default: 5000
   */
  heartbeatInterval: number
  /**
   * If a span should be created on page load.
   * If this is set to `false`, this integration will not start the default page load span.
   * Default: true
   */
  instrumentPageLoad: boolean
  /**
   * If a span should be created on navigation (history change).
   * If this is set to `false`, this integration will not start the default navigation spans.
   * Default: true
   */
  instrumentNavigation: boolean
  /**
   * Flag spans where tabs moved to background with "cancelled". Browser background tab timing is
   * not suited towards doing precise measurements of operations. By default, we recommend that this option
   * be enabled as background transactions can mess up your statistics in nondeterministic ways.
   *
   * Default: true
   */
  markBackgroundSpan: boolean
  /**
   * If true, Sentry will capture long tasks and add them to the corresponding transaction.
   *
   * Default: true
   */
  enableLongTask: boolean
  /**
   * If true, Sentry will capture INP web vitals as standalone spans .
   *
   * Default: false
   */
  enableInp: boolean
  /**
   * Sample rate to determine interaction span sampling.
   * interactionsSampleRate is applied on top of the global tracesSampleRate.
   * ie a tracesSampleRate of 0.1 and interactionsSampleRate of 0.5 will result in a 0.05 sample rate for interactions.
   *
   * Default: 1
   */
  interactionsSampleRate: number
  /**
   * What to use for route labels.
   * By default, we use route.name (if set) and else the path.
   *
   * Default: 'name'
   */
  routeLabel?: "name" | "path"
}

// https://github.com/getsentry/sentry-javascript/blob/develop/packages/core/src/integrations/captureconsole.ts
export interface CaptureConsoleOptions {
  levels?: string[]
}

// https://github.com/getsentry/sentry-javascript/blob/develop/packages/browser/src/integrations/contextlines.ts
export interface ContextLinesOptions {
  /**
   * Sets the number of context lines for each frame when loading a file.
   * Defaults to 7.
   *
   * Set to 0 to disable loading and inclusion of source files.
   */
  frameContextLines?: number
}

// https://github.com/getsentry/sentry-javascript/blob/develop/packages/core/src/integrations/debug.ts
export interface DebugOptions {
  /** Controls whether console output created by this integration should be stringified. Default: `false` */
  stringify?: boolean
  /** Controls whether a debugger should be launched before an event is sent. Default: `false` */
  debugger?: boolean
}

// https://github.com/getsentry/sentry-javascript/blob/develop/packages/core/src/integrations/extraerrordata.ts
export interface ExtraErrorDataOptions {
  /**
   * The object depth up to which to capture data on error objects.
   */
  depth: number

  /**
   * Whether to capture error causes. Defaults to true.
   *
   * More information: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
   */
  captureErrorCause: boolean
}

// https://github.com/getsentry/sentry-javascript/blob/develop/packages/browser/src/integrations/globalhandlers.ts
export type GlobalHandlersIntegrationsOptionKeys = "onerror" | "onunhandledrejection"

export type GlobalHandlersOptions = Record<GlobalHandlersIntegrationsOptionKeys, boolean>

// https://github.com/getsentry/sentry-javascript/blob/develop/packages/browser/src/integrations/httpclient.ts
export type HttpStatusCodeRange = [number, number] | number
export type HttpRequestTarget = string | RegExp

export interface HttpClientOptions {
  /**
   * HTTP status codes that should be considered failed.
   * This array can contain tuples of `[begin, end]` (both inclusive),
   * single status codes, or a combinations of both
   *
   * Example: [[500, 505], 507]
   * Default: [[500, 599]]
   */
  failedRequestStatusCodes: HttpStatusCodeRange[]

  /**
   * Targets to track for failed requests.
   * This array can contain strings or regular expressions.
   *
   * Example: ['http://localhost', /api\/.*\/]
   * Default: [/.*\/]
   */
  failedRequestTargets: HttpRequestTarget[]
}

// https://github.com/getsentry/sentry-javascript/blob/develop/packages/core/src/integrations/inboundfilters.ts
export interface InboundFiltersOptions {
  allowUrls: Array<string | RegExp>
  denyUrls: Array<string | RegExp>
  ignoreErrors: Array<string | RegExp>
  ignoreTransactions: Array<string | RegExp>
  ignoreInternal: boolean
  disableErrorDefaults: boolean
}

// https://github.com/getsentry/sentry-javascript/blob/develop/packages/browser/src/integrations/linkederrors.ts
export interface LinkedErrorsOptions {
  key?: string
  limit?: number
}

// https://github.com/getsentry/sentry-javascript/blob/develop/packages/replay-internal/src/types/replay.ts
export type ReplayConfiguration = Exclude<Parameters<typeof replayIntegration>[0], undefined>

// https://github.com/getsentry/sentry-javascript/blob/develop/packages/browser/src/integrations/reportingobserver.ts
export type ReportTypes = "crash" | "deprecation" | "intervention"

export interface ReportingObserverOptions {
  types?: ReportTypes[]
}
