/** Operation kinds exposed as available filter values by the facets endpoint. */
export type FacetOperationType = 'income' | 'outcome'

/** Business segments exposed as available filter values by the facets endpoint. */
export type FacetBusinessType = 'B2B' | 'B2C'

/** Categories exposed as available filter values by the facets endpoint. */
export type FacetCategory =
  | 'suppliers'
  | 'sales'
  | 'operational'
  | 'administrative'
  | 'others'

/**
 * Response shape returned by `GET /api/metrics/facets`.
 * Facet lists and date bounds describe the complete available dataset; they are
 * not segmented by a selected business type or operation type.
 */
export interface FacetsResponse {
  /**
   * Distinct operation kinds present in the dataset, usable as filter options.
   * Valid values: `income` and `outcome`.
   */
  operation_types: FacetOperationType[]

  /**
   * Distinct business segments present in the dataset, usable as filter options.
   * Valid values: `B2B` and `B2C`.
   */
  business_types: FacetBusinessType[]

  /**
   * Distinct categories present in the dataset, usable as filter options.
   * Valid values: `suppliers`, `sales`, `operational`, `administrative`, and `others`.
   */
  categories: FacetCategory[]

  /**
   * Earliest movement date in the complete dataset, inclusive.
   * Format: ISO 8601 calendar date `YYYY-MM-DD` (for example, `2024-01-31`).
   */
  min_date: string

  /**
   * Latest movement date in the complete dataset, inclusive.
   * Format: ISO 8601 calendar date `YYYY-MM-DD` (for example, `2024-12-31`).
   */
  max_date: string
}

/**
 * One anomaly candidate returned by `GET /api/metrics/alerts`.
 */
export interface AlertEntry {
  /**
   * Label for the aggregated period.
   * Valid formats depend on `group_by`: `YYYY-MM-DD` for `day`, `YYYY-Www`
   * for `week`, and `YYYY-MM` for `month`.
   */
  period: string

  /**
   * Total expenses aggregated for this period.
   * Value: a JSON number; the API rounds the value to two decimal places.
   */
  outcome_total: number

  /**
   * Average expenses used as the comparison baseline.
   * Value: a JSON number rounded to two decimal places. The current API
   * averages all earlier periods in the requested summary, not specifically
   * only the three immediately preceding periods.
   */
  baseline_average: number

  /**
   * Relative increase over the baseline, calculated as
   * `(outcome_total - baseline_average) / baseline_average`.
    * Valid values: positive JSON numbers rounded to four decimal places, since
    * the endpoint returns entries only when the ratio exceeds a non-negative
    * threshold. This is a ratio, not a percentage value (for example, `0.25`
    * represents a 25% increase).
   */
  increase_ratio: number
}

/**
 * Complete JSON response from `GET /api/metrics/alerts`.
 * The API returns a bare array of alert entries, without an enclosing object.
 */
export interface AlertsResponse extends Array<AlertEntry> {}

/** One category total returned by `GET /api/metrics/categories/top`. */
export interface CategoryEntry {
  /**
   * Category whose movements are included in this total.
   * Valid values: `suppliers`, `sales`, `operational`, `administrative`, and
   * `others`.
   */
  category: FacetCategory

  /**
   * Operation kind used to calculate the category total.
   * Valid values: `income` and `outcome`.
   */
  operation_type: FacetOperationType

  /**
   * Sum of movement amounts for this category and operation kind.
   * Value: a JSON number rounded to two decimal places by the API.
   */
  total_amount: number
}

/**
 * Complete response from `GET /api/metrics/categories/top`.
 * The API returns a bare array of category entries, without an enclosing object.
 */
export interface TopCategoriesResponse extends Array<CategoryEntry> {}
