/**
 * Session guides for each topic: key concepts, practice tasks, self-check, IB exam tips.
 * Used by TodayView and PlanView for expandable mini lesson plans.
 */
export type SessionGuideEntry = {
  key_concepts: string[];
  practice_tasks: string[];
  self_check: string[];
  ib_exam_tips: string[];
};

export const SESSION_GUIDES: Record<string, SessionGuideEntry> = {
  aa_1_1: {
    key_concepts: ["Arithmetic sequence: constant difference d; nth term u_n = u_1 + (n-1)d", "Sum S_n = n/2(2u_1 + (n-1)d) or S_n = n/2(first + last)", "Identify d from consecutive terms; use formulas to find unknowns"],
    practice_tasks: ["Given u_3 and u_7, find u_1 and d then S_10", "Find number of terms if first=10, last=100, d=5", "Word problem: seating in rows forming an arithmetic sequence"],
    self_check: ["Can I find any term given u_1 and d?", "Do I know when to use S_n vs u_n?", "Can I set up equations from word problems?"],
    ib_exam_tips: ["GDC: use sequence mode to verify; show formula substitution", "State 'arithmetic sequence' and quote formula when solving", "Check: d should be constant between any two consecutive terms"],
  },
  aa_1_2: {
    key_concepts: ["Geometric sequence: constant ratio r; u_n = u_1 · r^(n-1)", "Finite sum S_n = u_1(1 - r^n)/(1 - r) when r ≠ 1", "Infinite sum S_∞ = u_1/(1 - r) only when |r| < 1"],
    practice_tasks: ["Find u_10 and S_10 for a geometric sequence with u_1=2, r=3", "Determine if infinite series converges; if so find S_∞", "Compound interest: find balance after n years"],
    self_check: ["When can I use S_∞? What is the condition on r?", "Can I find r from two non-consecutive terms?", "Do I know the difference between geometric and arithmetic?"],
    ib_exam_tips: ["Always state |r| < 1 when using S_∞", "For compound interest, identify u_1 (principal) and r (1 + rate)", "GDC: sum(seq(...)) or financial app for verification"],
  },
  aa_1_3: {
    key_concepts: ["Sigma notation: ∑(k=1 to n) u_k means u_1 + u_2 + ... + u_n", "Convergence of infinite geometric series: |r| < 1 ⇒ S_∞ = u_1/(1-r)", "Express sums in sigma form; evaluate using arithmetic/geometric formulas"],
    practice_tasks: ["Write 2 + 5 + 8 + ... + 32 in sigma notation and evaluate", "Find ∑(k=0 to ∞) 3(0.5)^k", "Convert sigma to expanded form and simplify"],
    self_check: ["Can I identify the general term from sigma?", "Do I know index shifts (e.g. k=0 vs k=1)?", "When does ∑ ar^k converge?"],
    ib_exam_tips: ["Show convergence condition before using S_∞", "Use correct indexing (first term vs u_1) in sigma", "State 'infinite geometric series' and condition in working"],
  },
  aa_1_4: {
    key_concepts: ["Laws of exponents: a^m·a^n = a^(m+n), (a^m)^n = a^(mn), (ab)^n = a^n b^n", "Laws of logarithms: log(xy)=log x+log y, log(x/y)=log x−log y, log(x^p)=p log x", "Change of base: log_a(x) = ln(x)/ln(a)", "Exponential and log are inverses: a^(log_a x) = x"],
    practice_tasks: ["Simplify (2^3 · 4^2)/8 and express as single power", "Solve 2^(3x+1) = 5 using logarithms", "Write log_2(7) in terms of natural log"],
    self_check: ["Can I simplify expressions with mixed bases?", "Do I remember to take log of both sides when solving a^x = b?", "What is log_a(1) and log_a(a)?"],
    ib_exam_tips: ["GDC: use logBASE or ln for non-common logs", "Show 'taking log of both sides' step explicitly", "Check domain: log of negative or zero is undefined"],
  },
  aa_1_5: {
    key_concepts: ["Change of base: log_a(x) = ln(x)/ln(a); use for any base on GDC", "Solving a^x = b: take ln of both sides → x ln a = ln b → x = ln b/ln a", "Solving log equations: use definition to convert to exponential form", "Check solutions: argument of log must be positive"],
    practice_tasks: ["Solve 3^(2x) = 7^(x+1) giving exact answer", "Solve log_3(x) + log_3(x+2) = 1", "Find x such that log_2(x-1) = 4"],
    self_check: ["Can I solve both exponential and log equations?", "Do I always check that arguments of log are positive?", "When do I use ln vs log_10?"],
    ib_exam_tips: ["Exact form: leave as ln(7)/ln(3) unless asked for decimal", "State 'argument positive' when restricting domain", "GDC: solve( equation, x) to verify"],
  },
  aa_1_6: {
    key_concepts: ["Binomial theorem: (a+b)^n = ∑ C(n,k) a^(n-k) b^k for k=0 to n", "General term T_(k+1) = C(n,k) a^(n-k) b^k", "Pascal's triangle gives binomial coefficients; C(n,k) = n!/(k!(n-k)!)", "Finding a specific term: identify k and substitute into general term"],
    practice_tasks: ["Expand (2x - 3)^5", "Find the coefficient of x^4 in (1 + 2x)^8", "Find the constant term in (x^2 + 1/x)^6"],
    self_check: ["Do I count terms from 0 (first term is k=0)?", "Can I find the term containing x^p in (a + bx)^n?", "What is C(n,0) and C(n,n)?"],
    ib_exam_tips: ["Use GDC nCr for C(n,k); show formula in working", "For 'coefficient of x^p', set exponent of x equal to p and solve for k", "Constant term: exponent of x is 0"],
  },
  aa_1_7: {
    key_concepts: ["nCr = C(n,r) = n!/(r!(n-r)!); number of ways to choose r from n", "Properties: C(n,0)=C(n,n)=1; C(n,r)=C(n,n-r)", "Use in binomial expansion and counting problems", "GDC: nCr(n,r) or menu Probability"],
    practice_tasks: ["Calculate C(10,3) and C(10,7); verify they are equal", "Find the 5th term in (a+b)^9", "How many ways to choose 4 from 12?"],
    self_check: ["Do I know when to use nCr vs nPr?", "Can I relate term number to k in binomial expansion?", "What is 0!?"],
    ib_exam_tips: ["State 'using binomial coefficient' or 'nCr' in working", "Term number = k+1 when general term is T_(k+1)", "For counting, order doesn't matter → combination"],
  },
  aa_1_8: {
    key_concepts: ["Complex number z = a + bi; i = √(-1), i² = -1", "Add/subtract: add real and imaginary parts", "Multiply: expand and use i² = -1", "Divide: multiply numerator and denominator by conjugate of denominator; conjugate of z = a+bi is z̄ = a−bi"],
    practice_tasks: ["Simplify (3+2i)(1-4i)", "Find (2+3i)/(1-i) in a+bi form", "Solve z² + 4 = 0 in C"],
    self_check: ["Can I simplify (a+bi)(c+di) and get a+bi form?", "Do I remember to use conjugate for division?", "What is z + z̄ and z · z̄ for z = a+bi?"],
    ib_exam_tips: ["Final answer in a+bi form unless asked otherwise", "Show 'multiply by conjugate' step for division", "GDC: complex mode; verify with cSolve"],
  },
  aa_1_9: {
    key_concepts: ["Modulus |z| = √(a²+b²); argument arg(z) = θ where tan θ = b/a, with correct quadrant", "Polar form z = r(cos θ + i sin θ) = r cis θ", "Multiplication in polar: |z₁z₂| = |z₁||z₂|, arg(z₁z₂) = arg(z₁)+arg(z₂)", "Division: modulus divides, argument subtracts"],
    practice_tasks: ["Write z = 1 + i√3 in polar form", "Multiply z₁ = 2 cis(π/3) and z₂ = 3 cis(π/6); give in polar and Cartesian", "Find modulus and argument of (1+i)/(1-i)"],
    self_check: ["Do I use the correct quadrant for arg(z)?", "Can I convert between Cartesian and polar?", "Do I know cis θ notation?"],
    ib_exam_tips: ["Argument in radians; use π for exact values", "State 'r = |z|' and 'arg(z) = ...' with reasoning", "GDC: abs( ), arg( ) or convert to polar"],
  },
  aa_1_10: {
    key_concepts: ["Euler form: z = re^(iθ) where r = |z|, θ = arg(z)", "e^(iθ) = cos θ + i sin θ; e^(iπ) = -1", "De Moivre: (r e^(iθ))^n = r^n e^(i nθ); (r cis θ)^n = r^n cis(nθ)", "Use to find powers and roots; derive trig identities"],
    practice_tasks: ["Write z = 2e^(iπ/4) in Cartesian form", "Find (1+i)^10 using De Moivre", "Express cos(3θ) in terms of cos θ using De Moivre"],
    self_check: ["Can I raise a complex number to a power using De Moivre?", "Do I know e^(iθ) form?", "How do I use De Moivre for trig identities?"],
    ib_exam_tips: ["State De Moivre's theorem when using it", "For trig identities: write cos θ = (e^(iθ)+e^(-iθ))/2", "Exact values: leave in terms of π and surds"],
  },
  aa_1_11: {
    key_concepts: ["nth roots of z = r e^(iθ): n roots given by r^(1/n) e^(i(θ+2πk)/n) for k = 0,1,...,n-1", "Roots equally spaced on circle of radius r^(1/n)", "Roots of unity: solutions of z^n = 1; e^(2πik/n) for k = 0,...,n-1", "Sum of roots of unity = 0"],
    practice_tasks: ["Find all cube roots of 8i", "Find all 4th roots of unity and plot on Argand diagram", "Solve z^3 = -27"],
    self_check: ["Can I find all n roots of a complex number?", "Do I remember to add 2πk for different roots?", "Where do roots of unity lie on the Argand diagram?"],
    ib_exam_tips: ["Give all roots in exact form (e^(iθ) or cis θ)", "Sketch: roots on circle, equally spaced", "State 'n distinct roots' and show k = 0,1,...,n-1"],
  },
  aa_1_12: {
    key_concepts: ["Proof by induction: (1) Base case: show P(1) or P(n₀) true; (2) Inductive step: assume P(k) true, prove P(k+1) true; (3) Conclusion: by induction P(n) true for all n ≥ n₀", "Use for sums, divisibility, inequalities", "Inductive hypothesis must be stated clearly"],
    practice_tasks: ["Prove 1+2+...+n = n(n+1)/2 by induction", "Prove 7^n - 1 is divisible by 6 for n ≥ 1", "Prove 2^n > n² for n ≥ 5"],
    self_check: ["Do I show both base case and inductive step?", "Do I use the inductive hypothesis in the step?", "Can I set up P(k+1) from P(k)?"],
    ib_exam_tips: ["Write 'Assume P(k) true' and 'Prove P(k+1)' explicitly", "For sums: write S_(k+1) = S_k + (k+1)th term", "Conclusion: 'By PMI, P(n) holds for all n ≥ ...'"],
  },
  aa_1_13: {
    key_concepts: ["Proof by contradiction: assume negation of statement, derive false or contradiction", "Classic example: √2 irrational — assume √2 = p/q in lowest terms, derive 2|p² and 2|q²", "Counterexample: one example disproves a 'for all' statement", "Know when to use contradiction vs direct vs counterexample"],
    practice_tasks: ["Prove √3 is irrational", "Disprove: 'For all primes p, p+2 is prime'", "Prove there are infinitely many primes (by contradiction)"],
    self_check: ["Do I assume the negation of what I want to prove?", "Can I find a counterexample for a false universal claim?", "What is the contradiction in the √2 proof?"],
    ib_exam_tips: ["State 'Assume for contradiction that ...'", "For irrationality: assume in lowest terms and show both even", "Counterexample: give one explicit numerical example"],
  },
  aa_1_14: {
    key_concepts: ["System of 3 linear equations in 3 unknowns: matrix form AX = B", "Row reduction (Gaussian elimination) to REF or RREF", "Unique solution: leading 1 in each column (except last)", "Infinite solutions: free variable(s); no solution: inconsistent row (0 0 0 | c)"],
    practice_tasks: ["Solve 2x+y-z=1, x-2y+z=3, 3x-y=4 using row reduction", "Determine for which k the system has unique/infinite/no solution", "Interpret geometrically: 3 planes intersect in point/line/none"],
    self_check: ["Can I perform row operations correctly?", "Do I know how to read off solution from RREF?", "What does a row [0 0 0 | 1] mean?"],
    ib_exam_tips: ["GDC: rref(matrix) or solve( ); show matrix form", "State 'unique solution' or 'inconsistent' with reasoning", "For parameters: identify free variables and write general solution"],
  },
  aa_2_1: {
    key_concepts: ["Function: each x maps to exactly one f(x); domain and range", "Vertical line test: graph is function iff no vertical line cuts twice", "One-to-one: horizontal line test; has inverse", "Domain/range from equation or graph; restrictions (denominator ≠ 0, √ ≥ 0)"],
    practice_tasks: ["Find domain and range of f(x)=√(4-x²)", "Determine if f(x)=x²+1 is one-to-one; restrict domain so it has an inverse", "Given graph, identify domain, range, and whether function"],
    self_check: ["Can I find natural domain of rational and root functions?", "Do I know vertical vs horizontal line test?", "What makes a function have an inverse?"],
    ib_exam_tips: ["State domain when finding inverse; use correct notation (R, intervals)", "For inverse to exist, restrict domain if needed", "GDC: graph and trace to verify range"],
  },
  aa_2_2: {
    key_concepts: ["Translations: f(x-a)+b shifts right a, up b", "Stretches: af(x) vertical scale factor a; f(bx) horizontal scale 1/b", "Reflections: -f(x) in x-axis; f(-x) in y-axis", "Order: stretches/reflections then translations (or follow formula)"],
    practice_tasks: ["Describe transformations mapping y=sin x to y=3sin(2(x-π/4))+1", "Sketch y=-(x-2)²+3 from y=x²", "Find equation of parabola after reflection in x-axis and shift"],
    self_check: ["Do I know the order of transformations?", "Can I go from equation to graph and vice versa?", "What is the effect of f(2x) vs 2f(x)?"],
    ib_exam_tips: ["List transformations in logical order; state 'horizontal stretch factor 1/2'", "For trig: identify amplitude, period, phase shift, vertical shift", "Sketch key points (intercepts, max/min) after each step"],
  },
  aa_2_3: {
    key_concepts: ["Composite (f∘g)(x) = f(g(x)); domain of f∘g: x in domain of g and g(x) in domain of f", "Inverse f⁻¹: f(f⁻¹(x))=x and f⁻¹(f(x))=x; graph reflection in y=x", "Finding f⁻¹: swap x and y, solve for y", "One-to-one required for inverse"],
    practice_tasks: ["Find (f∘g)(x) and (g∘f)(x) for f(x)=√x, g(x)=x²-1; find domains", "Find f⁻¹(x) for f(x)=(2x+1)/(x-3)", "Sketch f and f⁻¹ on same axes"],
    self_check: ["Can I find domain of a composite?", "Do I swap x and y when finding inverse?", "What is the domain of f⁻¹?"],
    ib_exam_tips: ["State domain of composite explicitly", "For f⁻¹, show 'swap x,y' and 'solve for y'", "Check: f(f⁻¹(x))=x"],
  },
  aa_2_4: {
    key_concepts: ["Vertex form f(x)=a(x-h)²+k: vertex (h,k), axis x=h", "Complete the square: x²+bx+c = (x+b/2)² - (b/2)² + c", "Factored form a(x-r)(x-s): roots r, s; vertex at midpoint", "Sketch: vertex, y-intercept, roots (if real)"],
    practice_tasks: ["Write f(x)=2x²-8x+5 in vertex form", "Find roots and vertex of f(x)=x²-4x-5", "Sketch quadratic with vertex (-1,4) and y-intercept 3"],
    self_check: ["Can I complete the square for any quadratic?", "Do I know relationship between vertex and roots?", "What does 'a' tell us about the parabola?"],
    ib_exam_tips: ["Show completing the square steps", "Vertex form: state vertex (h,k) clearly", "For sketch: label vertex, intercepts, axis"],
  },
  aa_2_5: {
    key_concepts: ["Discriminant Δ = b²-4ac; nature of roots: Δ>0 two distinct real, Δ=0 one repeated, Δ<0 no real roots", "Quadratic formula x = (-b ± √Δ)/(2a)", "Sum of roots = -b/a, product = c/a", "Optimization: max/min at vertex"],
    practice_tasks: ["Find range of k for which x²+kx+4=0 has real roots", "Find quadratic with roots 2 and -3 and leading coefficient 1", "Maximum value of 5+4x-x²"],
    self_check: ["Can I use discriminant to classify roots?", "Do I know sum and product of roots?", "Where is the vertex of ax²+bx+c?"],
    ib_exam_tips: ["State 'for real roots, Δ ≥ 0' (or >0 for distinct)", "Use sum/product to form equation from roots", "Optimization: state 'maximum at vertex' and find x=-b/(2a)"],
  },
  aa_2_6: {
    key_concepts: ["y=e^x: domain R, range (0,∞), asymptote y=0", "y=ln x: domain (0,∞), range R, asymptote x=0; inverse of e^x", "Transformations apply as for other functions", "e^(ln x)=x, ln(e^x)=x"],
    practice_tasks: ["Sketch y=2-e^(-x) showing asymptote and intercepts", "Solve e^(2x)-3e^x+2=0 (substitute u=e^x)", "Find domain of ln(x²-4)"],
    self_check: ["Do I know the shape and asymptotes of e^x and ln x?", "Can I solve exponential equations by substitution?", "What is the domain of ln(f(x))?"],
    ib_exam_tips: ["Asymptote: state equation (e.g. y=0)", "For e^(2x)+... substitute u=e^x to get quadratic", "Domain: argument of ln must be > 0"],
  },
  aa_2_7: {
    key_concepts: ["Solve a^x=b: take ln of both sides; x ln a = ln b", "Exponential model y=Ae^(kt): A initial, k growth/decay rate", "Inequalities: if a>1 then a^f(x)>a^g(x) ⇔ f(x)>g(x); reverse if 0<a<1", "Log both sides for log equations; check domain"],
    practice_tasks: ["Solve 2^(x+1) = 5^(2x)", "Model: population doubles every 5 years; find formula", "Solve ln(x+1) + ln(x-1) = 1"],
    self_check: ["Do I take ln or log when solving exponentials?", "Can I set up growth/decay models?", "When do I reverse inequality for a^x > a^y?"],
    ib_exam_tips: ["Show 'taking ln of both sides'", "Exact answer: leave as ln(5)/(ln5 - ln2) if appropriate", "Check: x+1>0 and x-1>0 for ln"],
  },
  aa_2_8: {
    key_concepts: ["Reciprocal y=1/x: hyperbola; asymptotes x=0, y=0", "General rational y=a/(x-h)+k: vertical asymptote x=h, horizontal y=k", "Behaviour near asymptotes: limits as x→h± and x→±∞", "Transformations: shift then stretch"],
    practice_tasks: ["Sketch y=2/(x-1)+3 with asymptotes and intercepts", "Find equations of asymptotes of y=(3x+1)/(x+2)", "Describe transformation from y=1/x to given rational"],
    self_check: ["Can I find vertical and horizontal asymptotes?", "Do I know how to find intercepts?", "What is the behaviour as x→±∞?"],
    ib_exam_tips: ["State asymptotes as equations", "For y=a/(x-h)+k, VA: x=h, HA: y=k", "Sketch: show both branches and approach to asymptotes"],
  },
  aa_2_9: {
    key_concepts: ["Partial fractions: decompose P(x)/Q(x) into simpler fractions", "Distinct linear factors: A/(x-a) + B/(x-b)", "Repeated factor (x-a)²: A/(x-a) + B/(x-a)²", "Irreducible quadratic: (Ax+B)/(x²+cx+d)"],
    practice_tasks: ["Express (3x+1)/((x-1)(x+2)) in partial fractions", "Decompose (x²+2)/(x-1)²", "Integrate using partial fractions (later topic)"],
    self_check: ["Can I find constants A, B by substitution or equating coefficients?", "Do I know forms for repeated and quadratic factors?", "When is fraction proper vs improper?"],
    ib_exam_tips: ["Show 'multiply through by denominator' and substitute values", "For repeated factor, need two terms", "Check: recombine and verify equals original"],
  },
  aa_2_10: {
    key_concepts: ["Factor theorem: (x-a) is factor of P(x) iff P(a)=0", "Remainder theorem: remainder when P(x)÷(x-a) is P(a)", "Use to factor polynomials: find a root, then factor out (x-a)", "Polynomial long division for quotient"],
    practice_tasks: ["Show (x-2) is factor of P(x)=x³-4x²+x+6; factorise fully", "Find remainder when x^4-3x+1 is divided by (x+1)", "Find k if (x+2) is factor of x³+kx²-4x-8"],
    self_check: ["Do I use P(a)=0 for factor and remainder?", "Can I perform polynomial long division?", "How do I find all roots of a cubic?"],
    ib_exam_tips: ["State factor theorem when testing (x-a)", "Remainder: state 'by remainder theorem, R = P(a)'", "Fully factorise: show each factor and corresponding root"],
  },
  aa_2_11: {
    key_concepts: ["Polynomial of degree n: at most n real roots; end behaviour from leading term", "Multiplicity: root repeated r times → graph touches/crosses axis", "Sketch: roots, y-intercept, sign in intervals", "Turning points: at most n-1 for degree n"],
    practice_tasks: ["Sketch P(x)=(x+1)²(x-2) showing intercepts and behaviour", "Find possible equation for cubic with roots -2, 1, 3 and y-intercept 6", "Determine multiplicity from graph"],
    self_check: ["Can I sketch from factored form?", "Do I know how multiplicity affects the graph?", "What is end behaviour of -x⁴?"],
    ib_exam_tips: ["Label all intercepts and state multiplicity", "End behaviour: 'as x→±∞, P(x)→...'", "Turning points: at most n-1; don't need exact position unless asked"],
  },
  aa_2_12: {
    key_concepts: ["|x| = x if x≥0, -x if x<0; |x| = √(x²)", "|f(x)|: reflect negative part of f in x-axis", "f(|x|): even function; graph for x≥0 then reflect in y-axis", "Inequalities: |x|<a ⇔ -a<x<a; |x|>a ⇔ x<-a or x>a"],
    practice_tasks: ["Solve |2x-1| = 5", "Solve |x-3| < 2x+1", "Sketch y = |x²-4|"],
    self_check: ["Do I split into cases when solving |f(x)|=g(x)?", "Can I sketch |f(x)| from f(x)?", "For |f(x)|<k, do I use -k<f(x)<k?"],
    ib_exam_tips: ["Case work: 'Case 1: 2x-1≥0 ... Case 2: 2x-1<0'", "Inequality: consider both positive and negative regions", "Sketch: draw f(x) first, then reflect below axis"],
  },
};

