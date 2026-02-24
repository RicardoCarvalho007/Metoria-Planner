export type Course = "AA_HL" | "AA_SL" | "AI_HL" | "AI_SL";

export interface SubTopic {
  id: string;
  name: string;
  learningObjectives: string[];
}

export interface SessionGuide {
  key_concepts: string[];
  practice_tasks: string[];
  self_check: string[];
  ib_exam_tips: string[];
}

export interface Topic {
  id: string;
  name: string;
  courses: Course[];
  difficulty: 1 | 2 | 3;
  hours: number;
  subTopics: SubTopic[];
}

export const SYLLABUS: Topic[] = [
  // ── AA Topic 1: Number & Algebra ──────────────────────────────────
  { id: "aa_1_1", name: "Sequences & Series — Arithmetic", courses: ["AA_HL","AA_SL"], difficulty: 1, hours: 2, subTopics: [
    { id: "aa_1_1_a", name: "Common difference & nth term formula", learningObjectives: ["Use u_n = u_1 + (n-1)d to find any term", "Identify arithmetic sequences from given data"] },
    { id: "aa_1_1_b", name: "Sum of arithmetic series", learningObjectives: ["Apply S_n = n/2(2u_1 + (n-1)d)", "Solve problems involving partial sums"] },
    { id: "aa_1_1_c", name: "Applications of arithmetic sequences", learningObjectives: ["Model real-world linear growth patterns", "Solve word problems involving arithmetic progressions"] },
  ]},
  { id: "aa_1_2", name: "Sequences & Series — Geometric", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_1_2_a", name: "Common ratio & nth term formula", learningObjectives: ["Use u_n = u_1 * r^(n-1)", "Determine if a sequence is geometric"] },
    { id: "aa_1_2_b", name: "Sum of finite geometric series", learningObjectives: ["Apply S_n = u_1(1 - r^n)/(1 - r)", "Solve for unknowns in geometric series"] },
    { id: "aa_1_2_c", name: "Applications & compound growth", learningObjectives: ["Model exponential growth and decay", "Connect geometric sequences to real scenarios"] },
  ]},
  { id: "aa_1_3", name: "Sequences & Series — Sigma Notation & Infinite Series", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_1_3_a", name: "Sigma notation", learningObjectives: ["Express sums using sigma notation", "Evaluate sums from sigma expressions"] },
    { id: "aa_1_3_b", name: "Convergent infinite geometric series", learningObjectives: ["Determine convergence condition |r| < 1", "Calculate S_∞ = u_1 / (1 - r)"] },
  ]},
  { id: "aa_1_4", name: "Exponents & Logarithms — Laws and Properties", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_1_4_a", name: "Laws of exponents", learningObjectives: ["Apply product, quotient, and power rules", "Simplify expressions with rational exponents"] },
    { id: "aa_1_4_b", name: "Laws of logarithms", learningObjectives: ["Apply log product, quotient, and power rules", "Convert between exponential and logarithmic form"] },
  ]},
  { id: "aa_1_5", name: "Exponents & Logarithms — Change of Base & Equations", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_1_5_a", name: "Change of base formula", learningObjectives: ["Apply log_a(x) = ln(x)/ln(a)", "Evaluate logarithms with any base using GDC"] },
    { id: "aa_1_5_b", name: "Solving exponential & logarithmic equations", learningObjectives: ["Solve equations of the form a^x = b", "Use logarithms to find unknown exponents"] },
  ]},
  { id: "aa_1_6", name: "Binomial Theorem — Expansion", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_1_6_a", name: "Binomial expansion for positive integers", learningObjectives: ["Expand (a+b)^n using the binomial theorem", "Find specific terms in binomial expansions"] },
    { id: "aa_1_6_b", name: "Pascal's triangle", learningObjectives: ["Use Pascal's triangle to find coefficients", "Identify patterns in binomial coefficients"] },
  ]},
  { id: "aa_1_7", name: "Binomial Theorem — Binomial Coefficients", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 1, subTopics: [
    { id: "aa_1_7_a", name: "nCr notation and calculation", learningObjectives: ["Calculate nCr using factorials", "Apply nCr in counting and probability problems"] },
  ]},
  { id: "aa_1_8", name: "Complex Numbers — Introduction & Cartesian Form", courses: ["AA_HL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_1_8_a", name: "The imaginary unit and complex numbers", learningObjectives: ["Define i and express numbers as a + bi", "Perform addition, subtraction, and multiplication"] },
    { id: "aa_1_8_b", name: "Complex conjugate and division", learningObjectives: ["Find the conjugate of a complex number", "Divide complex numbers using conjugates"] },
  ]},
  { id: "aa_1_9", name: "Complex Numbers — Modulus-Argument & Polar Form", courses: ["AA_HL"], difficulty: 3, hours: 2, subTopics: [
    { id: "aa_1_9_a", name: "Modulus and argument", learningObjectives: ["Calculate |z| and arg(z)", "Represent complex numbers on the Argand diagram"] },
    { id: "aa_1_9_b", name: "Polar form and multiplication", learningObjectives: ["Write z = r(cos θ + i sin θ)", "Multiply and divide in polar form"] },
  ]},
  { id: "aa_1_10", name: "Complex Numbers — Euler Form & De Moivre's Theorem", courses: ["AA_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "aa_1_10_a", name: "Euler's formula", learningObjectives: ["Express z = re^(iθ)", "Convert between Cartesian, polar, and Euler forms"] },
    { id: "aa_1_10_b", name: "De Moivre's theorem", learningObjectives: ["Apply (r cis θ)^n = r^n cis(nθ)", "Use De Moivre's to find powers of complex numbers"] },
    { id: "aa_1_10_c", name: "Applications to trigonometric identities", learningObjectives: ["Derive multiple angle formulas using De Moivre's", "Express cos(nθ) and sin(nθ) in terms of cos θ and sin θ"] },
  ]},
  { id: "aa_1_11", name: "Complex Numbers — Roots of Complex Numbers", courses: ["AA_HL"], difficulty: 3, hours: 2, subTopics: [
    { id: "aa_1_11_a", name: "nth roots of complex numbers", learningObjectives: ["Find all n roots of z^n = w", "Represent roots equally spaced on the Argand diagram"] },
    { id: "aa_1_11_b", name: "Roots of unity", learningObjectives: ["Find and plot the nth roots of unity", "Understand geometric properties of roots of unity"] },
  ]},
  { id: "aa_1_12", name: "Proof — Proof by Induction", courses: ["AA_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "aa_1_12_a", name: "Principle of mathematical induction", learningObjectives: ["Structure a proof: base case, inductive step, conclusion", "Prove summation formulas by induction"] },
    { id: "aa_1_12_b", name: "Induction for divisibility and inequalities", learningObjectives: ["Apply induction to divisibility statements", "Prove inequalities hold for all n ≥ k"] },
  ]},
  { id: "aa_1_13", name: "Proof — Proof by Contradiction & Counterexample", courses: ["AA_HL"], difficulty: 3, hours: 2, subTopics: [
    { id: "aa_1_13_a", name: "Proof by contradiction", learningObjectives: ["Assume the negation and derive a contradiction", "Prove irrationality of √2 and similar results"] },
    { id: "aa_1_13_b", name: "Proof by counterexample", learningObjectives: ["Disprove conjectures with specific counterexamples", "Distinguish between proof and disproof strategies"] },
  ]},
  { id: "aa_1_14", name: "Systems of Linear Equations", courses: ["AA_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "aa_1_14_a", name: "Solving 3×3 systems", learningObjectives: ["Use row reduction to solve systems of 3 equations", "Interpret unique, infinite, and no-solution cases"] },
    { id: "aa_1_14_b", name: "Geometric interpretation", learningObjectives: ["Relate systems to intersections of planes", "Classify systems as consistent or inconsistent"] },
  ]},

  // ── AA Topic 2: Functions ─────────────────────────────────────────
  { id: "aa_2_1", name: "Functions — Concepts, Domain & Range", courses: ["AA_HL","AA_SL"], difficulty: 1, hours: 2, subTopics: [
    { id: "aa_2_1_a", name: "Function notation and mapping", learningObjectives: ["Use f(x) notation and identify functions vs relations", "Determine domain and range from graphs and equations"] },
    { id: "aa_2_1_b", name: "Types of functions", learningObjectives: ["Identify one-to-one, many-to-one, and onto functions", "Use the vertical and horizontal line tests"] },
  ]},
  { id: "aa_2_2", name: "Functions — Transformations", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 3, subTopics: [
    { id: "aa_2_2_a", name: "Translations", learningObjectives: ["Apply horizontal and vertical shifts: f(x-a)+b", "Determine the translation from one graph to another"] },
    { id: "aa_2_2_b", name: "Stretches and reflections", learningObjectives: ["Apply vertical stretch af(x) and horizontal stretch f(bx)", "Reflect in x-axis (-f(x)) and y-axis (f(-x))"] },
    { id: "aa_2_2_c", name: "Combined transformations", learningObjectives: ["Apply multiple transformations in correct order", "Write the equation of a transformed function"] },
  ]},
  { id: "aa_2_3", name: "Functions — Composite & Inverse Functions", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_2_3_a", name: "Composite functions", learningObjectives: ["Find (f∘g)(x) and (g∘f)(x)", "Determine domain of composite functions"] },
    { id: "aa_2_3_b", name: "Inverse functions", learningObjectives: ["Find f^(-1)(x) algebraically", "Understand the reflection relationship y = x"] },
  ]},
  { id: "aa_2_4", name: "Quadratic Functions — Vertex Form & Factoring", courses: ["AA_HL","AA_SL"], difficulty: 1, hours: 2, subTopics: [
    { id: "aa_2_4_a", name: "Vertex form and completing the square", learningObjectives: ["Convert standard form to vertex form f(x) = a(x-h)^2 + k", "Identify vertex, axis of symmetry from vertex form"] },
    { id: "aa_2_4_b", name: "Factored form and x-intercepts", learningObjectives: ["Factor quadratics and find roots", "Sketch quadratics from intercepts and vertex"] },
  ]},
  { id: "aa_2_5", name: "Quadratic Functions — Discriminant & Roots", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_2_5_a", name: "The discriminant", learningObjectives: ["Use Δ = b²-4ac to determine nature of roots", "Relate discriminant to graph of parabola"] },
    { id: "aa_2_5_b", name: "Quadratic formula and applications", learningObjectives: ["Solve quadratics using the formula", "Apply to real-world optimization problems"] },
  ]},
  { id: "aa_2_6", name: "Exponential & Logarithmic Functions — Graphs & Properties", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_2_6_a", name: "Exponential function graphs", learningObjectives: ["Sketch y = a^x and y = e^x, identify asymptotes", "Apply transformations to exponential functions"] },
    { id: "aa_2_6_b", name: "Logarithmic function graphs", learningObjectives: ["Sketch y = log_a(x) as inverse of exponential", "Identify domain, range, and asymptotes"] },
  ]},
  { id: "aa_2_7", name: "Exponential & Logarithmic Functions — Equations & Inequalities", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_2_7_a", name: "Solving exponential equations", learningObjectives: ["Solve equations with same base and different bases", "Use logarithms to solve a^x = b analytically"] },
    { id: "aa_2_7_b", name: "Modelling with exponential functions", learningObjectives: ["Set up growth/decay models y = Ae^(kt)", "Find unknown parameters from given conditions"] },
  ]},
  { id: "aa_2_8", name: "Rational Functions — Reciprocal & Graphs", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_2_8_a", name: "Reciprocal function y = 1/x", learningObjectives: ["Sketch y = 1/x and identify asymptotes", "Apply transformations to y = a/(x-h) + k"] },
    { id: "aa_2_8_b", name: "Self-inverse and key features", learningObjectives: ["Identify vertical and horizontal asymptotes", "Determine behaviour near asymptotes"] },
  ]},
  { id: "aa_2_9", name: "Rational Functions — Partial Fractions", courses: ["AA_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "aa_2_9_a", name: "Decomposition into partial fractions", learningObjectives: ["Decompose proper rational functions with distinct linear factors", "Handle repeated and irreducible quadratic factors"] },
    { id: "aa_2_9_b", name: "Applications of partial fractions", learningObjectives: ["Use partial fractions in integration", "Simplify algebraic expressions using decomposition"] },
  ]},
  { id: "aa_2_10", name: "Polynomial Functions — Factor & Remainder Theorem", courses: ["AA_HL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_2_10_a", name: "Factor theorem", learningObjectives: ["Test if (x-a) is a factor using f(a) = 0", "Fully factor polynomials of degree 3+"] },
    { id: "aa_2_10_b", name: "Remainder theorem", learningObjectives: ["Find remainder when dividing p(x) by (x-a)", "Apply polynomial long division"] },
  ]},
  { id: "aa_2_11", name: "Polynomial Functions — Graphs & Roots", courses: ["AA_HL"], difficulty: 3, hours: 2, subTopics: [
    { id: "aa_2_11_a", name: "Graphing higher-degree polynomials", learningObjectives: ["Sketch polynomials using zeros and end behaviour", "Identify multiplicities of roots from graphs"] },
  ]},
  { id: "aa_2_12", name: "Absolute Value Functions & Inequalities", courses: ["AA_HL"], difficulty: 3, hours: 2, subTopics: [
    { id: "aa_2_12_a", name: "Absolute value function", learningObjectives: ["Sketch y = |f(x)| and y = f(|x|)", "Solve equations and inequalities involving |x|"] },
  ]},

  // ── AA Topic 3: Geometry & Trigonometry ───────────────────────────
  { id: "aa_3_1", name: "Trigonometry — Radian Measure, Arcs & Sectors", courses: ["AA_HL","AA_SL"], difficulty: 1, hours: 2, subTopics: [
    { id: "aa_3_1_a", name: "Radian measure", learningObjectives: ["Convert between degrees and radians", "Use radian measure in calculations"] },
    { id: "aa_3_1_b", name: "Arc length and sector area", learningObjectives: ["Calculate arc length l = rθ", "Calculate sector area A = r²θ/2"] },
  ]},
  { id: "aa_3_2", name: "Trigonometry — Unit Circle & Exact Values", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_3_2_a", name: "Unit circle and CAST diagram", learningObjectives: ["Define sin, cos, tan using the unit circle", "Determine sign of trig ratios in each quadrant"] },
    { id: "aa_3_2_b", name: "Exact trigonometric values", learningObjectives: ["Know exact values for 0°, 30°, 45°, 60°, 90°", "Apply exact values in problem solving"] },
  ]},
  { id: "aa_3_3", name: "Trigonometry — Sine & Cosine Rule", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_3_3_a", name: "Sine rule", learningObjectives: ["Apply a/sin A = b/sin B = c/sin C", "Identify and resolve the ambiguous case"] },
    { id: "aa_3_3_b", name: "Cosine rule and area formula", learningObjectives: ["Apply c² = a² + b² - 2ab cos C", "Calculate triangle area using A = ½ab sin C"] },
  ]},
  { id: "aa_3_4", name: "Trigonometric Functions — Graphs & Transformations", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 3, subTopics: [
    { id: "aa_3_4_a", name: "Graphs of sin, cos, tan", learningObjectives: ["Sketch standard trigonometric graphs", "Identify period, amplitude, and phase shift"] },
    { id: "aa_3_4_b", name: "Transformed trig functions", learningObjectives: ["Sketch y = a sin(b(x-c)) + d", "Read parameters from given graphs"] },
  ]},
  { id: "aa_3_5", name: "Trigonometric Identities — Pythagorean & Compound Angles", courses: ["AA_HL","AA_SL"], difficulty: 3, hours: 3, subTopics: [
    { id: "aa_3_5_a", name: "Pythagorean identities", learningObjectives: ["Apply sin²θ + cos²θ = 1 and derived identities", "Simplify trigonometric expressions"] },
    { id: "aa_3_5_b", name: "Compound angle formulas", learningObjectives: ["Apply sin(A±B) and cos(A±B) formulas", "Prove identities using compound angle formulas"] },
  ]},
  { id: "aa_3_6", name: "Trigonometric Identities — Double Angle Formulas", courses: ["AA_HL","AA_SL"], difficulty: 3, hours: 2, subTopics: [
    { id: "aa_3_6_a", name: "Double angle identities", learningObjectives: ["Apply sin(2A), cos(2A), tan(2A) formulas", "Use identities to solve equations and simplify expressions"] },
  ]},
  { id: "aa_3_7", name: "Trigonometric Equations", courses: ["AA_HL","AA_SL"], difficulty: 3, hours: 3, subTopics: [
    { id: "aa_3_7_a", name: "Solving trig equations analytically", learningObjectives: ["Find general and specific solutions in given intervals", "Use identities to reduce equations to solvable form"] },
    { id: "aa_3_7_b", name: "Equations requiring factoring or substitution", learningObjectives: ["Factor trigonometric expressions", "Use substitution t = tan(θ/2) or similar"] },
  ]},
  { id: "aa_3_8", name: "Vectors — Concepts, Notation & Operations", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_3_8_a", name: "Vector notation and representation", learningObjectives: ["Represent vectors as column vectors and with unit vectors i, j, k", "Calculate magnitude of a vector"] },
    { id: "aa_3_8_b", name: "Vector addition and scalar multiplication", learningObjectives: ["Add/subtract vectors algebraically and geometrically", "Multiply vectors by scalars"] },
  ]},
  { id: "aa_3_9", name: "Vectors — Dot Product & Angle Between Vectors", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_3_9_a", name: "Scalar (dot) product", learningObjectives: ["Calculate a·b = a₁b₁ + a₂b₂ + a₃b₃", "Use a·b = |a||b|cos θ to find angles"] },
    { id: "aa_3_9_b", name: "Perpendicularity", learningObjectives: ["Determine if vectors are perpendicular using a·b = 0", "Find components of vectors using projections"] },
  ]},
  { id: "aa_3_10", name: "Vectors — Lines in 2D and 3D", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_3_10_a", name: "Vector equation of a line", learningObjectives: ["Write r = a + td for a line through a point with direction d", "Determine if a point lies on a line"] },
    { id: "aa_3_10_b", name: "Intersection of lines", learningObjectives: ["Find intersection point of two lines", "Determine if lines are parallel, intersecting, or skew"] },
  ]},
  { id: "aa_3_11", name: "Vectors — Cross Product", courses: ["AA_HL"], difficulty: 3, hours: 2, subTopics: [
    { id: "aa_3_11_a", name: "Cross product definition and calculation", learningObjectives: ["Calculate a × b using determinant method", "Interpret cross product as area of parallelogram"] },
  ]},
  { id: "aa_3_12", name: "Vectors — Planes & Intersections", courses: ["AA_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "aa_3_12_a", name: "Equation of a plane", learningObjectives: ["Write scalar and vector equations of planes", "Find normal vector to a plane"] },
    { id: "aa_3_12_b", name: "Intersection of planes and lines", learningObjectives: ["Find line of intersection of two planes", "Find point where a line meets a plane"] },
  ]},
  { id: "aa_3_13", name: "Vectors — Distances: Point to Line, Point to Plane", courses: ["AA_HL"], difficulty: 3, hours: 2, subTopics: [
    { id: "aa_3_13_a", name: "Distance formulas", learningObjectives: ["Calculate shortest distance from a point to a line", "Calculate distance from a point to a plane"] },
  ]},

  // ── AA Topic 4: Statistics & Probability ──────────────────────────
  { id: "aa_4_1", name: "Statistics — Sampling Methods & Data Types", courses: ["AA_HL","AA_SL"], difficulty: 1, hours: 1, subTopics: [
    { id: "aa_4_1_a", name: "Sampling techniques and data classification", learningObjectives: ["Distinguish between random, systematic, and stratified sampling", "Classify data as discrete, continuous, qualitative, or quantitative"] },
  ]},
  { id: "aa_4_2", name: "Statistics — Measures of Central Tendency", courses: ["AA_HL","AA_SL"], difficulty: 1, hours: 2, subTopics: [
    { id: "aa_4_2_a", name: "Mean, median, and mode", learningObjectives: ["Calculate mean, median, mode for raw and grouped data", "Choose the appropriate measure for a given context"] },
  ]},
  { id: "aa_4_3", name: "Statistics — Measures of Dispersion & Box Plots", courses: ["AA_HL","AA_SL"], difficulty: 1, hours: 2, subTopics: [
    { id: "aa_4_3_a", name: "Range, IQR, variance, and standard deviation", learningObjectives: ["Calculate and interpret range, IQR, variance, and standard deviation", "Construct and interpret box-and-whisker plots"] },
  ]},
  { id: "aa_4_4", name: "Statistics — Cumulative Frequency & Histograms", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_4_4_a", name: "Cumulative frequency diagrams", learningObjectives: ["Construct cumulative frequency tables and curves", "Estimate median and quartiles from curves"] },
    { id: "aa_4_4_b", name: "Histograms and frequency density", learningObjectives: ["Draw and interpret histograms with equal/unequal class widths", "Use frequency density for unequal intervals"] },
  ]},
  { id: "aa_4_5", name: "Probability — Basic Rules & Venn Diagrams", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_4_5_a", name: "Probability rules", learningObjectives: ["Apply addition rule P(A∪B) = P(A) + P(B) - P(A∩B)", "Calculate complementary probability P(A') = 1 - P(A)"] },
    { id: "aa_4_5_b", name: "Venn diagrams", learningObjectives: ["Represent events using Venn diagrams", "Read probabilities from Venn diagrams"] },
  ]},
  { id: "aa_4_6", name: "Probability — Conditional Probability & Independence", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_4_6_a", name: "Conditional probability", learningObjectives: ["Calculate P(A|B) = P(A∩B)/P(B)", "Use two-way tables for conditional probability"] },
    { id: "aa_4_6_b", name: "Independent events", learningObjectives: ["Test independence: P(A∩B) = P(A)P(B)", "Apply multiplication rule for independent events"] },
  ]},
  { id: "aa_4_7", name: "Probability — Tree Diagrams & Bayes' Theorem", courses: ["AA_HL","AA_SL"], difficulty: 3, hours: 3, subTopics: [
    { id: "aa_4_7_a", name: "Tree diagrams", learningObjectives: ["Construct tree diagrams for multi-stage experiments", "Calculate probabilities using multiplication along branches"] },
    { id: "aa_4_7_b", name: "Bayes' theorem", learningObjectives: ["Apply Bayes' theorem to reverse conditional probabilities", "Solve practical problems involving false positives/negatives"] },
  ]},
  { id: "aa_4_8", name: "Distributions — Discrete Random Variables", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_4_8_a", name: "Expected value and variance", learningObjectives: ["Calculate E(X) and Var(X) from probability tables", "Interpret expected value in context"] },
  ]},
  { id: "aa_4_9", name: "Distributions — Binomial Distribution", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_4_9_a", name: "Binomial probability and parameters", learningObjectives: ["Identify binomial conditions and calculate P(X=k)", "Find mean np and variance np(1-p)"] },
  ]},
  { id: "aa_4_10", name: "Distributions — Normal Distribution", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 3, subTopics: [
    { id: "aa_4_10_a", name: "Properties and standardization", learningObjectives: ["Standardize using Z = (X-μ)/σ", "Use GDC to find probabilities and inverse normal values"] },
    { id: "aa_4_10_b", name: "Normal distribution applications", learningObjectives: ["Find unknown μ or σ given probability conditions", "Model real-world data with normal distributions"] },
  ]},
  { id: "aa_4_11", name: "Hypothesis Testing — Concepts & Null Hypothesis", courses: ["AA_HL"], difficulty: 3, hours: 2, subTopics: [
    { id: "aa_4_11_a", name: "Setting up hypothesis tests", learningObjectives: ["Formulate H₀ and H₁ correctly", "Understand significance level, p-value, and Type I/II errors"] },
  ]},
  { id: "aa_4_12", name: "Hypothesis Testing — t-tests & z-tests", courses: ["AA_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "aa_4_12_a", name: "One-sample and two-sample tests", learningObjectives: ["Perform z-tests for population means", "Perform t-tests when σ is unknown"] },
    { id: "aa_4_12_b", name: "Interpreting results", learningObjectives: ["Compare p-value to significance level", "Write conclusions in context"] },
  ]},
  { id: "aa_4_13", name: "Hypothesis Testing — Confidence Intervals", courses: ["AA_HL"], difficulty: 3, hours: 2, subTopics: [
    { id: "aa_4_13_a", name: "Constructing confidence intervals", learningObjectives: ["Calculate confidence intervals for population mean", "Interpret confidence intervals in context"] },
  ]},
  { id: "aa_4_14", name: "Linear Correlation & Regression", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_4_14_a", name: "Correlation coefficient and LSRL", learningObjectives: ["Calculate and interpret Pearson's r", "Find and use the regression line y = ax + b"] },
  ]},

  // ── AA Topic 5: Calculus ──────────────────────────────────────────
  { id: "aa_5_1", name: "Calculus — Limits & Continuity", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_5_1_a", name: "Concept of limits", learningObjectives: ["Evaluate limits graphically and algebraically", "Understand limit notation and behaviour at infinity"] },
    { id: "aa_5_1_b", name: "Continuity", learningObjectives: ["Determine where a function is continuous", "Identify removable and essential discontinuities"] },
  ]},
  { id: "aa_5_2", name: "Differentiation — First Principles", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_5_2_a", name: "Derivative from first principles", learningObjectives: ["Derive f'(x) = lim(h→0) [f(x+h)-f(x)]/h", "Use first principles for simple polynomial functions"] },
  ]},
  { id: "aa_5_3", name: "Differentiation — Rules (Power, Product, Quotient, Chain)", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 3, subTopics: [
    { id: "aa_5_3_a", name: "Power rule", learningObjectives: ["Differentiate x^n for any rational n", "Apply sum/difference rules"] },
    { id: "aa_5_3_b", name: "Product and quotient rules", learningObjectives: ["Apply d/dx[uv] = u'v + uv'", "Apply d/dx[u/v] = (u'v - uv')/v²"] },
    { id: "aa_5_3_c", name: "Chain rule", learningObjectives: ["Differentiate composite functions dy/dx = dy/du × du/dx", "Combine chain rule with product/quotient rules"] },
  ]},
  { id: "aa_5_4", name: "Differentiation — Trig, Exponential & Log Functions", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_5_4_a", name: "Derivatives of standard functions", learningObjectives: ["Differentiate sin x, cos x, tan x, e^x, ln x", "Apply chain rule to these functions"] },
  ]},
  { id: "aa_5_5", name: "Applications of Differentiation — Tangents & Normals", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_5_5_a", name: "Equations of tangent and normal lines", learningObjectives: ["Find gradient at a point and write tangent equation", "Find equation of normal (perpendicular to tangent)"] },
  ]},
  { id: "aa_5_6", name: "Applications of Differentiation — Increasing/Decreasing & Stationary Points", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_5_6_a", name: "Stationary points and nature", learningObjectives: ["Find stationary points where f'(x) = 0", "Classify using first or second derivative test"] },
  ]},
  { id: "aa_5_7", name: "Applications of Differentiation — Optimization", courses: ["AA_HL","AA_SL"], difficulty: 3, hours: 3, subTopics: [
    { id: "aa_5_7_a", name: "Optimization problems", learningObjectives: ["Set up optimization models from word problems", "Find maximum/minimum values using calculus"] },
  ]},
  { id: "aa_5_8", name: "Applications of Differentiation — Related Rates", courses: ["AA_HL"], difficulty: 3, hours: 2, subTopics: [
    { id: "aa_5_8_a", name: "Related rates of change", learningObjectives: ["Apply chain rule to relate rates: dy/dt = dy/dx × dx/dt", "Solve practical related rates problems"] },
  ]},
  { id: "aa_5_9", name: "Differentiation — Implicit & Parametric Differentiation", courses: ["AA_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "aa_5_9_a", name: "Implicit differentiation", learningObjectives: ["Differentiate implicitly defined functions", "Find dy/dx for equations like x² + y² = r²"] },
    { id: "aa_5_9_b", name: "Parametric differentiation", learningObjectives: ["Find dy/dx = (dy/dt)/(dx/dt) for parametric curves", "Find second derivatives for parametric equations"] },
  ]},
  { id: "aa_5_10", name: "Integration — Antiderivatives & Indefinite Integrals", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_5_10_a", name: "Basic integration rules", learningObjectives: ["Integrate x^n, sin x, cos x, e^x, 1/x", "Apply constant of integration"] },
  ]},
  { id: "aa_5_11", name: "Integration — Definite Integrals & Area", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "aa_5_11_a", name: "Definite integrals and the FTC", learningObjectives: ["Evaluate definite integrals using antiderivatives", "Understand the Fundamental Theorem of Calculus"] },
    { id: "aa_5_11_b", name: "Area under a curve", learningObjectives: ["Calculate area between a curve and the x-axis", "Handle regions below the x-axis"] },
  ]},
  { id: "aa_5_12", name: "Integration — Area Between Curves & Volumes", courses: ["AA_HL","AA_SL"], difficulty: 3, hours: 3, subTopics: [
    { id: "aa_5_12_a", name: "Area between curves", learningObjectives: ["Set up and evaluate integrals for area between two curves", "Find intersection points to determine limits"] },
    { id: "aa_5_12_b", name: "Volumes of revolution", learningObjectives: ["Calculate volume by rotating about x- or y-axis", "Apply V = π∫[f(x)]² dx"] },
  ]},
  { id: "aa_5_13", name: "Integration — Integration by Substitution", courses: ["AA_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "aa_5_13_a", name: "u-substitution technique", learningObjectives: ["Choose appropriate substitution and change limits", "Apply to definite and indefinite integrals"] },
  ]},
  { id: "aa_5_14", name: "Integration — Integration by Parts", courses: ["AA_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "aa_5_14_a", name: "Integration by parts formula", learningObjectives: ["Apply ∫u dv = uv - ∫v du", "Use repeated integration by parts for complex integrals"] },
  ]},
  { id: "aa_5_15", name: "Integration — Partial Fractions Integration", courses: ["AA_HL"], difficulty: 3, hours: 2, subTopics: [
    { id: "aa_5_15_a", name: "Integrating using partial fractions", learningObjectives: ["Decompose rational functions and integrate each term", "Handle distinct, repeated, and quadratic factors"] },
  ]},
  { id: "aa_5_16", name: "Differential Equations — Separable Equations", courses: ["AA_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "aa_5_16_a", name: "Separable ODEs", learningObjectives: ["Separate variables and integrate both sides", "Find particular solutions using initial conditions"] },
  ]},
  { id: "aa_5_17", name: "Differential Equations — Homogeneous & Integrating Factor", courses: ["AA_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "aa_5_17_a", name: "First-order linear ODEs", learningObjectives: ["Solve using integrating factor e^(∫P(x)dx)", "Verify solutions by substitution"] },
  ]},
  { id: "aa_5_18", name: "Maclaurin Series", courses: ["AA_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "aa_5_18_a", name: "Maclaurin series expansions", learningObjectives: ["Derive Maclaurin series for e^x, sin x, cos x, ln(1+x)", "Approximate function values using partial sums"] },
    { id: "aa_5_18_b", name: "Operations on series", learningObjectives: ["Add, multiply, and substitute Maclaurin series", "Determine interval of convergence"] },
  ]},

  // ── AI Topic 1: Number & Algebra ──────────────────────────────────
  { id: "ai_1_1", name: "Number Skills — Approximation, Estimation & Error", courses: ["AI_HL","AI_SL"], difficulty: 1, hours: 2, subTopics: [
    { id: "ai_1_1_a", name: "Rounding, significant figures & percentage error", learningObjectives: ["Round to specified decimal places and significant figures", "Calculate percentage error and absolute error"] },
  ]},
  { id: "ai_1_2", name: "Number Skills — Scientific Notation", courses: ["AI_HL","AI_SL"], difficulty: 1, hours: 1, subTopics: [
    { id: "ai_1_2_a", name: "Standard form operations", learningObjectives: ["Express numbers in a × 10^k form", "Perform calculations in scientific notation"] },
  ]},
  { id: "ai_1_3", name: "Sequences — Arithmetic Sequences & Series", courses: ["AI_HL","AI_SL"], difficulty: 1, hours: 2, subTopics: [
    { id: "ai_1_3_a", name: "Arithmetic sequences and sums", learningObjectives: ["Find nth term and sum of arithmetic sequences", "Apply to real-world contexts"] },
  ]},
  { id: "ai_1_4", name: "Sequences — Geometric Sequences & Series", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_1_4_a", name: "Geometric sequences and sums", learningObjectives: ["Find nth term and sum of geometric sequences", "Determine convergence of infinite geometric series"] },
  ]},
  { id: "ai_1_5", name: "Financial Math — Compound Interest & Depreciation", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_1_5_a", name: "Compound interest", learningObjectives: ["Apply FV = PV(1 + r/100k)^(kn)", "Calculate simple and compound interest"] },
    { id: "ai_1_5_b", name: "Depreciation", learningObjectives: ["Model reducing balance depreciation", "Compare appreciation and depreciation models"] },
  ]},
  { id: "ai_1_6", name: "Financial Math — Annuities & Amortization", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_1_6_a", name: "Annuities and loan repayments", learningObjectives: ["Calculate present and future value of annuities", "Construct amortization tables"] },
  ]},
  { id: "ai_1_7", name: "Logarithms — Laws & Solving Equations", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_1_7_a", name: "Logarithm laws and equations", learningObjectives: ["Apply log laws to simplify expressions", "Solve exponential equations using logarithms"] },
  ]},
  { id: "ai_1_8", name: "Matrices — Operations & Determinants", courses: ["AI_HL"], difficulty: 2, hours: 3, subTopics: [
    { id: "ai_1_8_a", name: "Matrix arithmetic", learningObjectives: ["Add, subtract, and multiply matrices", "Calculate 2×2 and 3×3 determinants"] },
  ]},
  { id: "ai_1_9", name: "Matrices — Inverse Matrices", courses: ["AI_HL"], difficulty: 3, hours: 2, subTopics: [
    { id: "ai_1_9_a", name: "Finding and using inverse matrices", learningObjectives: ["Calculate A^(-1) for 2×2 matrices", "Use technology for larger matrices"] },
  ]},
  { id: "ai_1_10", name: "Matrices — Solving Systems with Matrices", courses: ["AI_HL"], difficulty: 3, hours: 2, subTopics: [
    { id: "ai_1_10_a", name: "Matrix method for systems", learningObjectives: ["Write systems as AX = B and solve X = A^(-1)B", "Interpret solutions geometrically"] },
  ]},
  { id: "ai_1_11", name: "Matrices — Transformations", courses: ["AI_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "ai_1_11_a", name: "Transformation matrices", learningObjectives: ["Apply rotation, reflection, and scaling matrices", "Compose transformations by matrix multiplication"] },
  ]},
  { id: "ai_1_12", name: "Eigenvalues & Eigenvectors", courses: ["AI_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "ai_1_12_a", name: "Finding eigenvalues and eigenvectors", learningObjectives: ["Solve det(A - λI) = 0 for eigenvalues", "Find eigenvectors for each eigenvalue"] },
    { id: "ai_1_12_b", name: "Diagonalization", learningObjectives: ["Diagonalize matrices using eigenvectors", "Apply to powers of matrices and long-term behaviour"] },
  ]},

  // ── AI Topic 2: Functions ─────────────────────────────────────────
  { id: "ai_2_1", name: "Functions — Concepts, Notation & Graphing", courses: ["AI_HL","AI_SL"], difficulty: 1, hours: 2, subTopics: [
    { id: "ai_2_1_a", name: "Function basics", learningObjectives: ["Use function notation and identify domain/range", "Graph functions using technology and by hand"] },
  ]},
  { id: "ai_2_2", name: "Linear Models — Equations & Graphs", courses: ["AI_HL","AI_SL"], difficulty: 1, hours: 2, subTopics: [
    { id: "ai_2_2_a", name: "Linear functions and modelling", learningObjectives: ["Write equations in gradient-intercept and point-gradient form", "Model linear relationships from data"] },
  ]},
  { id: "ai_2_3", name: "Quadratic Models — Vertex, Roots & Graphs", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_2_3_a", name: "Quadratic modelling", learningObjectives: ["Identify vertex, intercepts, and axis of symmetry", "Solve quadratic models in context"] },
  ]},
  { id: "ai_2_4", name: "Exponential Models — Growth & Decay", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_2_4_a", name: "Exponential growth and decay models", learningObjectives: ["Model with y = Ae^(kt) or y = Ab^x", "Determine parameters from given data"] },
  ]},
  { id: "ai_2_5", name: "Logarithmic Models", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_2_5_a", name: "Logarithmic modelling", learningObjectives: ["Recognize logarithmic relationships in data", "Linearize exponential data using log transformations"] },
  ]},
  { id: "ai_2_6", name: "Sinusoidal Models — Graphs & Equations", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 3, subTopics: [
    { id: "ai_2_6_a", name: "Sinusoidal modelling", learningObjectives: ["Model periodic phenomena with y = a sin(b(x-c)) + d", "Determine amplitude, period, and phase shift from data"] },
  ]},
  { id: "ai_2_7", name: "Direct & Inverse Variation", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_2_7_a", name: "Variation models", learningObjectives: ["Model direct (y = kx^n) and inverse (y = k/x^n) variation", "Find the constant of proportionality from data"] },
  ]},
  { id: "ai_2_8", name: "Piecewise & Further Functions", courses: ["AI_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "ai_2_8_a", name: "Piecewise functions", learningObjectives: ["Define and graph piecewise functions", "Model real-world scenarios with piecewise models"] },
  ]},
  { id: "ai_2_9", name: "Transformations of Functions", courses: ["AI_HL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_2_9_a", name: "Function transformations", learningObjectives: ["Apply translations, stretches, and reflections", "Compose multiple transformations"] },
  ]},
  { id: "ai_2_10", name: "Rational Functions & Asymptotes", courses: ["AI_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "ai_2_10_a", name: "Rational functions", learningObjectives: ["Identify vertical, horizontal, and oblique asymptotes", "Sketch rational function graphs"] },
  ]},

  // ── AI Topic 3: Geometry & Trigonometry ───────────────────────────
  { id: "ai_3_1", name: "Trigonometry — Right-Angled Triangles & Exact Values", courses: ["AI_HL","AI_SL"], difficulty: 1, hours: 2, subTopics: [
    { id: "ai_3_1_a", name: "SOHCAHTOA and exact values", learningObjectives: ["Apply sin, cos, tan to right-angled triangles", "Use exact trigonometric values for standard angles"] },
  ]},
  { id: "ai_3_2", name: "Trigonometry — Sine Rule, Cosine Rule & Area", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_3_2_a", name: "Non-right triangle trigonometry", learningObjectives: ["Apply sine rule, cosine rule, and area formula", "Choose the correct rule for a given triangle problem"] },
  ]},
  { id: "ai_3_3", name: "Trigonometry — 3D Geometry Problems", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 3, subTopics: [
    { id: "ai_3_3_a", name: "3D trigonometry applications", learningObjectives: ["Find angles and lengths in 3D shapes", "Apply trigonometry to real-world 3D problems"] },
  ]},
  { id: "ai_3_4", name: "Geometry — Surface Area & Volume of Solids", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_3_4_a", name: "3D solids", learningObjectives: ["Calculate surface area and volume of standard solids", "Apply to composite shapes and real-world objects"] },
  ]},
  { id: "ai_3_5", name: "Voronoi Diagrams — Construction & Properties", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_3_5_a", name: "Voronoi diagram construction", learningObjectives: ["Construct Voronoi diagrams from a set of sites", "Identify perpendicular bisectors and vertices"] },
  ]},
  { id: "ai_3_6", name: "Voronoi Diagrams — Nearest Neighbour & Applications", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_3_6_a", name: "Applications of Voronoi diagrams", learningObjectives: ["Solve nearest-neighbour problems using Voronoi regions", "Apply to urban planning and facility location"] },
  ]},
  { id: "ai_3_7", name: "Graph Theory — Networks & Terminology", courses: ["AI_HL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_3_7_a", name: "Graph theory basics", learningObjectives: ["Define vertices, edges, degree, and types of graphs", "Represent real-world networks as graphs"] },
  ]},
  { id: "ai_3_8", name: "Graph Theory — Minimum Spanning Trees (Kruskal & Prim)", courses: ["AI_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "ai_3_8_a", name: "MST algorithms", learningObjectives: ["Apply Kruskal's and Prim's algorithms", "Find minimum total weight spanning a network"] },
  ]},
  { id: "ai_3_9", name: "Graph Theory — Chinese Postman & Travelling Salesman", courses: ["AI_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "ai_3_9_a", name: "Route optimization", learningObjectives: ["Solve Chinese Postman problem for route inspection", "Apply nearest-neighbour heuristic for TSP"] },
  ]},

  // ── AI Topic 4: Statistics & Probability ──────────────────────────
  { id: "ai_4_1", name: "Statistics — Sampling & Data Collection", courses: ["AI_HL","AI_SL"], difficulty: 1, hours: 2, subTopics: [
    { id: "ai_4_1_a", name: "Sampling methods", learningObjectives: ["Apply random, systematic, stratified, and quota sampling", "Identify bias in sampling methods"] },
  ]},
  { id: "ai_4_2", name: "Statistics — Measures of Central Tendency & Spread", courses: ["AI_HL","AI_SL"], difficulty: 1, hours: 2, subTopics: [
    { id: "ai_4_2_a", name: "Descriptive statistics", learningObjectives: ["Calculate mean, median, mode, range, IQR, and standard deviation", "Choose appropriate measures for skewed data"] },
  ]},
  { id: "ai_4_3", name: "Statistics — Frequency Tables, Histograms & Box Plots", courses: ["AI_HL","AI_SL"], difficulty: 1, hours: 2, subTopics: [
    { id: "ai_4_3_a", name: "Statistical displays", learningObjectives: ["Construct and interpret frequency tables, histograms, and box plots", "Compare distributions using statistical displays"] },
  ]},
  { id: "ai_4_4", name: "Bivariate Statistics — Scatter Diagrams & Correlation", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_4_4_a", name: "Scatter diagrams and correlation", learningObjectives: ["Describe correlation strength and direction", "Calculate and interpret Pearson's r and Spearman's rs"] },
  ]},
  { id: "ai_4_5", name: "Bivariate Statistics — Linear Regression (LSRL)", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_4_5_a", name: "Regression lines", learningObjectives: ["Find equation of LSRL using technology", "Use regression line for prediction and interpolation"] },
  ]},
  { id: "ai_4_6", name: "Probability — Basic Rules & Venn Diagrams", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_4_6_a", name: "Probability fundamentals", learningObjectives: ["Apply addition and multiplication rules", "Use Venn diagrams and sample spaces"] },
  ]},
  { id: "ai_4_7", name: "Probability — Conditional Probability & Independence", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_4_7_a", name: "Conditional probability and independence", learningObjectives: ["Calculate P(A|B) from tables and tree diagrams", "Test and apply independence of events"] },
  ]},
  { id: "ai_4_8", name: "Distributions — Binomial Distribution", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_4_8_a", name: "Binomial model", learningObjectives: ["Recognize binomial conditions and calculate probabilities", "Find expected value and standard deviation"] },
  ]},
  { id: "ai_4_9", name: "Distributions — Normal Distribution", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 3, subTopics: [
    { id: "ai_4_9_a", name: "Normal distribution", learningObjectives: ["Standardize and find probabilities using GDC", "Apply inverse normal to find boundaries"] },
  ]},
  { id: "ai_4_10", name: "Hypothesis Testing — Chi-Squared Test for Independence", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 3, subTopics: [
    { id: "ai_4_10_a", name: "Chi-squared test", learningObjectives: ["Set up contingency tables and calculate expected values", "Perform chi-squared test and interpret p-value"] },
  ]},
  { id: "ai_4_11", name: "Hypothesis Testing — Goodness of Fit", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_4_11_a", name: "Goodness of fit test", learningObjectives: ["Compare observed to expected frequencies", "Apply chi-squared goodness of fit test"] },
  ]},
  { id: "ai_4_12", name: "Hypothesis Testing — t-tests", courses: ["AI_HL","AI_SL"], difficulty: 3, hours: 3, subTopics: [
    { id: "ai_4_12_a", name: "t-tests for means", learningObjectives: ["Perform one-sample and paired t-tests", "Interpret results in context"] },
  ]},
  { id: "ai_4_13", name: "Further Probability — Bayes' Theorem", courses: ["AI_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "ai_4_13_a", name: "Bayes' theorem", learningObjectives: ["Apply Bayes' theorem to update probabilities", "Solve medical testing and reliability problems"] },
  ]},
  { id: "ai_4_14", name: "Further Probability — Poisson Distribution", courses: ["AI_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "ai_4_14_a", name: "Poisson distribution", learningObjectives: ["Recognize Poisson conditions and calculate probabilities", "Find mean and variance of Poisson distribution"] },
  ]},
  { id: "ai_4_15", name: "Further Probability — Continuous Random Variables", courses: ["AI_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "ai_4_15_a", name: "Continuous distributions", learningObjectives: ["Use PDF and CDF for continuous random variables", "Calculate probabilities and expected values"] },
  ]},
  { id: "ai_4_16", name: "Further Probability — Transition Matrices & Markov Chains", courses: ["AI_HL"], difficulty: 3, hours: 4, subTopics: [
    { id: "ai_4_16_a", name: "Markov chains", learningObjectives: ["Set up transition matrices from given data", "Find steady-state probabilities"] },
    { id: "ai_4_16_b", name: "Long-term behaviour", learningObjectives: ["Calculate state probabilities after n steps", "Interpret long-term predictions"] },
  ]},

  // ── AI Topic 5: Calculus ──────────────────────────────────────────
  { id: "ai_5_1", name: "Calculus — Introduction to Derivatives", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_5_1_a", name: "Concept of the derivative", learningObjectives: ["Understand derivative as rate of change and gradient", "Interpret derivative graphically"] },
  ]},
  { id: "ai_5_2", name: "Differentiation — Polynomials, Trig, Exp & Log", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 3, subTopics: [
    { id: "ai_5_2_a", name: "Differentiation rules", learningObjectives: ["Differentiate polynomials, trigonometric, exponential, and log functions", "Apply chain rule for composite functions"] },
  ]},
  { id: "ai_5_3", name: "Applications — Tangents, Normals & Stationary Points", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2, subTopics: [
    { id: "ai_5_3_a", name: "Applications of derivatives", learningObjectives: ["Find equations of tangent and normal lines", "Locate and classify stationary points"] },
  ]},
  { id: "ai_5_4", name: "Applications — Optimization Problems", courses: ["AI_HL","AI_SL"], difficulty: 3, hours: 3, subTopics: [
    { id: "ai_5_4_a", name: "Optimization", learningObjectives: ["Model optimization problems and find maximum/minimum values", "Apply to real-world contexts (profit, area, volume)"] },
  ]},
  { id: "ai_5_5", name: "Integration — Indefinite & Definite Integrals", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 3, subTopics: [
    { id: "ai_5_5_a", name: "Integration basics", learningObjectives: ["Find antiderivatives for standard functions", "Evaluate definite integrals"] },
  ]},
  { id: "ai_5_6", name: "Integration — Area Under & Between Curves", courses: ["AI_HL","AI_SL"], difficulty: 3, hours: 3, subTopics: [
    { id: "ai_5_6_a", name: "Area calculations", learningObjectives: ["Calculate area under curves and between curves", "Set up integrals from graph or equation"] },
  ]},
  { id: "ai_5_7", name: "Kinematics — Displacement, Velocity & Acceleration", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 3, subTopics: [
    { id: "ai_5_7_a", name: "Kinematics with calculus", learningObjectives: ["Relate displacement, velocity, and acceleration via calculus", "Solve motion problems using integration and differentiation"] },
  ]},
  { id: "ai_5_8", name: "Differential Equations — Slope Fields & Euler's Method", courses: ["AI_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "ai_5_8_a", name: "Slope fields and numerical methods", learningObjectives: ["Sketch and interpret slope fields for dy/dx = f(x,y)", "Apply Euler's method for numerical approximation"] },
  ]},
  { id: "ai_5_9", name: "Differential Equations — Separable Equations", courses: ["AI_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "ai_5_9_a", name: "Solving separable ODEs", learningObjectives: ["Separate variables and integrate", "Model growth, decay, and logistic problems"] },
  ]},
  { id: "ai_5_10", name: "Differential Equations — Coupled Systems", courses: ["AI_HL"], difficulty: 3, hours: 3, subTopics: [
    { id: "ai_5_10_a", name: "Coupled differential equations", learningObjectives: ["Set up systems of first-order ODEs", "Interpret phase portraits and equilibrium points"] },
  ]},
];

export const COURSE_LABELS: Record<Course, string> = {
  AA_HL: "Math AA HL",
  AA_SL: "Math AA SL",
  AI_HL: "Math AI HL",
  AI_SL: "Math AI SL",
};

export const XP_FOR_DIFFICULTY: Record<number, number> = { 1: 100, 2: 200, 3: 300 };

export const CHAPTERS: Record<string, string> = {
  "1": "Number & Algebra",
  "2": "Functions",
  "3": "Geometry & Trigonometry",
  "4": "Statistics & Probability",
  "5": "Calculus",
};

export function getTopicsForCourse(course: Course): Topic[] {
  return SYLLABUS.filter((t) => t.courses.includes(course));
}

export function getChapterForTopic(topicId: string): string {
  const match = topicId.match(/_(\d+)_/);
  return match ? match[1] : "1";
}

export function getSubTopicsForTopic(topicId: string): SubTopic[] {
  const topic = SYLLABUS.find((t) => t.id === topicId);
  return topic?.subTopics ?? [];
}

import { SESSION_GUIDES } from "@/data/sessionGuides";

export function getSessionGuide(topicId: string): SessionGuide | null {
  const guide = SESSION_GUIDES[topicId];
  if (guide) return guide;
  const topic = SYLLABUS.find((t) => t.id === topicId);
  if (!topic) return null;
  const concepts = topic.subTopics.flatMap((st) => st.learningObjectives).slice(0, 5);
  return {
    key_concepts: concepts.length ? concepts : [topic.name + ": review the sub-topics and objectives."],
    practice_tasks: ["Practice problems from your textbook for this topic.", "Try past paper questions on this area."],
    self_check: ["Can I explain the main ideas?", "Can I do a typical exam question without help?"],
    ib_exam_tips: ["Review the learning objectives in the syllabus.", "Check GDC usage if applicable."],
  };
}
