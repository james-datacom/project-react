# Spec Delta

## Purpose

Let people estimate daily protein from body weight, activity, and goal in the browser, with clear validation and a result they can split across meals.

## ADDED Requirements

### Requirement: Calculator page
The Protein Calculator page SHALL show the title Protein Calculator with an icon before it. The page SHALL remain usable on desktop, tablet, and mobile, and its text and controls SHALL stay readable in light mode and in dark mode. Opening or refreshing `/health/protein-calculator` on the published site SHALL show this page.

#### Scenario: Title and icon
- **WHEN** the user opens the Protein Calculator page
- **THEN** the page shows the title Protein Calculator
- **THEN** an icon is shown immediately before that title

#### Scenario: Themes stay readable
- **WHEN** the user views the page in light mode and in dark mode
- **THEN** the title, fields, and actions remain readable in both themes

#### Scenario: Published route loads the page
- **WHEN** the user opens or refreshes `/health/protein-calculator` on the published site
- **THEN** the Protein Calculator page is shown

### Requirement: Required inputs
The page SHALL collect body weight, weight unit, age, sex, activity level, and goal. All six SHALL be required. Weight unit SHALL offer kg and lb and SHALL default to kg. Age SHALL be a whole number from 18 through 100. Sex SHALL offer Male and Female. Activity level SHALL offer Sedentary, Lightly Active, Moderately Active, Very Active, and Athlete. Goal SHALL offer Maintain Weight, Lose Fat, and Build Muscle. Body weight SHALL be a number greater than 0.

#### Scenario: Defaults and choices are offered
- **WHEN** the user opens the page before changing any field
- **THEN** the weight unit is kg
- **THEN** sex, activity level, and goal offer only the choices named for each field

#### Scenario: Boundaries are enforced
- **WHEN** body weight is 0 or less, or age is below 18 or above 100
- **THEN** that field is invalid

### Requirement: Validation and actions
Each invalid field SHALL show a message under that field. Calculate SHALL stay disabled until every required field is valid. Reset SHALL clear every input and any result, and SHALL return the weight unit to kg.

#### Scenario: Calculate waits for a valid form
- **WHEN** any required field is empty or invalid
- **THEN** Calculate is disabled
- **THEN** a message is shown under each invalid field

#### Scenario: Calculate becomes available
- **WHEN** every required field is valid
- **THEN** Calculate is enabled

#### Scenario: Reset clears the form
- **WHEN** the user has entered values or produced a result and activates Reset
- **THEN** the inputs are cleared
- **THEN** the weight unit is kg
- **THEN** no result is shown

### Requirement: Client-side protein estimate
Calculate SHALL produce the estimate in the browser without a server request. Pounds SHALL convert to kilograms as `kg = lb × 0.453592` before the estimate. Daily protein SHALL be weight in kilograms times the multiplier, then rounded to the nearest whole gram, with halves rounding up. The multiplier SHALL be the activity base plus the goal adjustment, and SHALL NOT exceed 2.2 g/kg. Age and sex SHALL NOT change the result.

Activity bases, in g/kg, SHALL be Sedentary 0.8, Lightly Active 1.0, Moderately Active 1.3, Very Active 1.6, and Athlete 1.8. Goal adjustments, in g/kg, SHALL be Maintain Weight +0.0, Lose Fat +0.3, and Build Muscle +0.4.

#### Scenario: Kilograms use the activity and goal multipliers
- **WHEN** the user calculates 80 kg, age 30, Male, Moderately Active, and Maintain Weight
- **THEN** the multiplier used is 1.3 g/kg
- **THEN** the daily protein is 104 grams

#### Scenario: Pounds convert before multiplying
- **WHEN** the user calculates 200 lb, age 40, Female, Sedentary, and Maintain Weight
- **THEN** the weight is converted as 200 × 0.453592 kilograms
- **THEN** the multiplier used is 0.8 g/kg
- **THEN** the daily protein is 73 grams

#### Scenario: Goal raises the multiplier
- **WHEN** the user calculates 70 kg, age 25, Female, Athlete, and Build Muscle
- **THEN** the multiplier used is 2.2 g/kg
- **THEN** the daily protein is 154 grams

#### Scenario: The multiplier is capped
- **WHEN** the activity base plus the goal adjustment is greater than 2.2
- **THEN** the multiplier used is 2.2 g/kg

#### Scenario: Age and sex do not change grams
- **WHEN** two valid calculations use the same weight, unit, activity, and goal, and differ only in age or sex
- **THEN** both results show the same daily protein and the same multiplier

#### Scenario: Calculation does not call a server
- **WHEN** the user calculates a valid form
- **THEN** the result appears without a server request

### Requirement: Result card
After a successful calculation, the page SHALL show daily protein in grams per day, the multiplier in g/kg, the per-meal amount for 3 meals, and the per-meal amount for 4 meals. Per-meal amounts SHALL be the rounded daily total divided by 3 and by 4. Below the result, the page SHALL show exactly: "This is an estimate only. Consult a healthcare professional for personalized advice." No result SHALL be shown before the first successful calculation. The page SHALL NOT save history, profile data, or any other health calculator.

#### Scenario: Result shows grams, multiplier, meals, and disclaimer
- **WHEN** a calculation succeeds with a rounded daily total of 104 grams and a multiplier of 1.3 g/kg
- **THEN** the result shows 104 grams per day
- **THEN** the result shows 1.3 g/kg
- **THEN** the result shows 104 divided by 3 for 3 meals
- **THEN** the result shows 104 divided by 4 for 4 meals
- **THEN** the disclaimer "This is an estimate only. Consult a healthcare professional for personalized advice." appears below the result

#### Scenario: No result before calculation
- **WHEN** the user has not yet calculated successfully
- **THEN** the result card is not shown
