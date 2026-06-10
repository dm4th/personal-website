# Executive Memo: Consumer Loan Delinquency and Rate Cycle Risk

**To:** Credit Risk Committee
**From:** Data Science - Risk Analytics
**Date:** Q4 2024
**Re:** Leading indicators for consumer delinquency

---

## Headline Finding

Federal Funds Rate increases lead consumer loan delinquency by approximately
**8 quarters** (correlation r = 0.46, OLS R-squared = 0.4031).

Rate-tightening cycles are a reliable early warning signal for rising portfolio
stress. This lead time creates a planning window for reserve builds and
underwriting tightening before losses materialize.

## Current Situation

Consumer loan delinquency stands at **3.38%** and is rising
as of Q4 2024. With the Fed having held rates at 5.25-5.50% for most of 2024
before beginning cuts in September, the elevated delinquency environment
is consistent with historical patterns.

## Model Details

Using quarterly FRED data (2000 Q1 - 2024 Q4), a simple lagged OLS regression
with Fed Funds Rate and Unemployment Rate as predictors at lag 8Q
explains 40% of the variance in consumer
delinquency.

Key coefficients:
- Fed Funds Rate (lag 8Q): 0.6479 percentage points per 1pp rate move
- Unemployment Rate (lag 8Q): 0.4351 percentage points per 1pp unemployment move

## Business Implication for a Lender or Payments Company

1. **Reserve timing:** Build loan loss reserves 2-3 quarters before expected rate
   peaks, not at peak. History shows delinquency peaks lag the Fed by 8Q.

2. **Underwriting gates:** Tighten DTI limits and reduce unsecured credit line
   expansions when the Fed Funds Rate rises more than 200bps in a 12-month window.

3. **Portfolio segmentation:** Delinquency impact is not uniform. Subprime and
   near-prime segments respond faster and with higher amplitude. The headline
   DRCLACBS rate understates tail risk in higher-risk cohorts.

4. **Payments adjacency:** Rising delinquency correlates with increased chargebacks,
   payment failures, and buy-now-pay-later default rates. Fraud models should
   incorporate macro rate-cycle state as a feature.

## Limitations and Uncertainty

This analysis reflects correlations, not causal mechanisms. Several important
caveats apply:

- **Small sample:** Only 3 full rate-tightening cycles are captured (2004-2006,
  2015-2018, 2022-2023). Statistical power is limited.

- **Regime changes:** The post-COVID period involved extraordinary fiscal
  stimulus, student loan payment moratoria, and accumulated household savings
  that dampened the delinquency response to rate hikes. The current cycle may
  normalize or may reflect structural shifts in consumer balance sheets.

- **Aggregation hides dispersion:** DRCLACBS is an aggregate rate across all
  commercial banks. Credit card delinquency (DRCCLACBS) and auto loan delinquency
  respond with different lead times and amplitudes.

- **This is a signal, not a model:** A production credit risk model would
  incorporate loan-level LTV, FICO distribution, vintage curves, and regional
  unemployment differentials. This macro-level analysis sets the direction;
  loan-level models set the magnitude.

---

*Data source: Federal Reserve Bank of St. Louis (FRED). Series: FEDFUNDS, UNRATE, DRCLACBS.*
*Analysis produced using Python (pandas, numpy). Model is purely illustrative.*
