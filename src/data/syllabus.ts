export type Course = "AA_HL" | "AA_SL" | "AI_HL" | "AI_SL";

export interface Topic {
  id: string;
  name: string;
  courses: Course[];
  difficulty: 1 | 2 | 3;
  hours: number;
}

export const SYLLABUS: Topic[] = [
  { id: "aa_1_1", name: "Sequences & Series — Arithmetic", courses: ["AA_HL","AA_SL"], difficulty: 1, hours: 2 },
  { id: "aa_1_2", name: "Sequences & Series — Geometric", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2 },
  { id: "aa_1_3", name: "Sequences & Series — Sigma Notation & Infinite Series", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2 },
  { id: "aa_1_4", name: "Exponents & Logarithms — Laws and Properties", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2 },
  { id: "aa_1_5", name: "Exponents & Logarithms — Change of Base & Equations", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2 },
  { id: "aa_1_6", name: "Binomial Theorem — Expansion", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2 },
  { id: "aa_1_7", name: "Binomial Theorem — Binomial Coefficients", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 1 },
  { id: "aa_1_8", name: "Complex Numbers — Introduction & Cartesian Form", courses: ["AA_HL"], difficulty: 2, hours: 2 },
  { id: "aa_1_9", name: "Complex Numbers — Modulus-Argument & Polar Form", courses: ["AA_HL"], difficulty: 3, hours: 2 },
  { id: "aa_1_10", name: "Complex Numbers — Euler Form & De Moivre's Theorem", courses: ["AA_HL"], difficulty: 3, hours: 3 },
  { id: "aa_2_1", name: "Functions — Concepts, Domain & Range", courses: ["AA_HL","AA_SL"], difficulty: 1, hours: 2 },
  { id: "aa_2_2", name: "Functions — Transformations", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 3 },
  { id: "aa_2_3", name: "Functions — Composite & Inverse Functions", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2 },
  { id: "aa_2_4", name: "Quadratic Functions — Vertex Form & Factoring", courses: ["AA_HL","AA_SL"], difficulty: 1, hours: 2 },
  { id: "aa_2_5", name: "Quadratic Functions — Discriminant & Roots", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2 },
  { id: "aa_3_1", name: "Trigonometry — Radian Measure, Arcs & Sectors", courses: ["AA_HL","AA_SL"], difficulty: 1, hours: 2 },
  { id: "aa_3_2", name: "Trigonometry — Unit Circle & Exact Values", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2 },
  { id: "aa_3_5", name: "Trigonometric Identities — Pythagorean & Compound Angles", courses: ["AA_HL","AA_SL"], difficulty: 3, hours: 3 },
  { id: "aa_4_5", name: "Probability — Basic Rules & Venn Diagrams", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2 },
  { id: "aa_4_9", name: "Distributions — Binomial Distribution", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2 },
  { id: "aa_4_10", name: "Distributions — Normal Distribution", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 3 },
  { id: "aa_5_1", name: "Calculus — Limits & Continuity", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2 },
  { id: "aa_5_2", name: "Differentiation — First Principles", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2 },
  { id: "aa_5_3", name: "Differentiation — Rules (Power, Product, Quotient, Chain)", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 3 },
  { id: "aa_5_7", name: "Applications of Differentiation — Optimization", courses: ["AA_HL","AA_SL"], difficulty: 3, hours: 3 },
  { id: "aa_5_10", name: "Integration — Antiderivatives & Indefinite Integrals", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2 },
  { id: "aa_5_11", name: "Integration — Definite Integrals & Area", courses: ["AA_HL","AA_SL"], difficulty: 2, hours: 2 },
  { id: "ai_1_1", name: "Number Skills — Approximation, Estimation & Error", courses: ["AI_HL","AI_SL"], difficulty: 1, hours: 2 },
  { id: "ai_1_3", name: "Sequences — Arithmetic Sequences & Series", courses: ["AI_HL","AI_SL"], difficulty: 1, hours: 2 },
  { id: "ai_1_4", name: "Sequences — Geometric Sequences & Series", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2 },
  { id: "ai_1_5", name: "Financial Math — Compound Interest & Depreciation", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2 },
  { id: "ai_2_1", name: "Functions — Concepts, Notation & Graphing", courses: ["AI_HL","AI_SL"], difficulty: 1, hours: 2 },
  { id: "ai_2_2", name: "Linear Models — Equations & Graphs", courses: ["AI_HL","AI_SL"], difficulty: 1, hours: 2 },
  { id: "ai_2_3", name: "Quadratic Models — Vertex, Roots & Graphs", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2 },
  { id: "ai_2_4", name: "Exponential Models — Growth & Decay", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2 },
  { id: "ai_3_1", name: "Trigonometry — Right-Angled Triangles & Exact Values", courses: ["AI_HL","AI_SL"], difficulty: 1, hours: 2 },
  { id: "ai_3_2", name: "Trigonometry — Sine Rule, Cosine Rule & Area", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2 },
  { id: "ai_4_1", name: "Statistics — Sampling & Data Collection", courses: ["AI_HL","AI_SL"], difficulty: 1, hours: 2 },
  { id: "ai_4_4", name: "Bivariate Statistics — Scatter Diagrams & Correlation", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2 },
  { id: "ai_4_8", name: "Distributions — Binomial Distribution", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2 },
  { id: "ai_4_9", name: "Distributions — Normal Distribution", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 3 },
  { id: "ai_5_1", name: "Calculus — Introduction to Derivatives", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 2 },
  { id: "ai_5_2", name: "Differentiation — Polynomials, Trig, Exp & Log", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 3 },
  { id: "ai_5_5", name: "Integration — Indefinite & Definite Integrals", courses: ["AI_HL","AI_SL"], difficulty: 2, hours: 3 },
];

export const COURSE_LABELS: Record<Course, string> = {
  AA_HL: "Math AA HL",
  AA_SL: "Math AA SL",
  AI_HL: "Math AI HL",
  AI_SL: "Math AI SL",
};

export const COURSE_COLORS: Record<Course, string> = {
  AA_HL: "bg-primary text-primary-foreground",
  AA_SL: "bg-primary/70 text-primary-foreground",
  AI_HL: "bg-success text-success-foreground",
  AI_SL: "bg-success/70 text-success-foreground",
};

export const XP_FOR_DIFFICULTY: Record<number, number> = { 1: 100, 2: 200, 3: 300 };
