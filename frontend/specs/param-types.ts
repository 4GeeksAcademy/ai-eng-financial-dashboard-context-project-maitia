/**
 * Optional date query parameters used by the metrics endpoints.
 */
export interface DateRangeFilter {
  /**
   * Inclusive lower bound for the movement date filter; omit it to leave the
   * beginning of the date range unbounded.
   * Valid values: calendar dates accepted by the API as ISO 8601 `YYYY-MM-DD`.
   */
  start_date?: string

  /**
   * Inclusive upper bound for the movement date filter; omit it to leave the
   * end of the date range unbounded.
   * Valid values: calendar dates accepted by the API as ISO 8601 `YYYY-MM-DD`.
   */
  end_date?: string
}

/**
 * Query parameters for requesting expense alerts.
 * Extends the API's optional date range filters.
 */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Minimum relative increase over the baseline required for an alert.
   * The UI allows values from `0.01` through `1.0`; the API accepts any number
   * greater than or equal to `0` and defaults to `0.3` when omitted.
   * This is a ratio (for example, `0.3` represents 30%), not a percentage
   * entered on a 0–100 scale.
   */
  threshold?: number
}

/**
 * Query parameters for `GET /api/metrics/categories/top`.
 * Includes optional date bounds and filters for operation and business type.
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Operation kind whose movements are included in category totals.
   * Valid values: `income` or `outcome`; the API defaults to `outcome` when
   * omitted.
   */
  operation_type?: 'income' | 'outcome'

  /**
   * Maximum number of top category entries to return.
   * Valid integer range: `1`–`20` inclusive; the API defaults to `5` when
   * omitted.
   */
  limit?: number

  /**
   * Optional business segment by which movements are filtered before
   * calculating category totals.
   * Valid values: `B2B` or `B2C`; omit to include both segments.
   */
  business_type?: 'B2B' | 'B2C'
}
