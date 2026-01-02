/**
 * Instruction Template System
 * Multiple teaching and explanation styles for different learning needs
 * Generates contextual, educational content explaining generated code
 */

export type InstructionStyle = 'educational' | 'professional' | 'experimental' | 'defensive' | 'minimalist';

export interface InstructionTemplate {
  id: string;
  name: string;
  description: string;
  style: InstructionStyle;
  sections: InstructionSection[];
}

export interface InstructionSection {
  title: string;
  icon: string;
  content: string;
  expandByDefault: boolean;
  priority: 'high' | 'medium' | 'low';
}

// ============== TEMPLATE: EDUCATIONAL ==============
/**
 * Best for beginners and learners
 * Focus: Understand WHY, with examples and analogies
 */
export const EducationalTemplate: InstructionTemplate = {
  id: 'educational',
  name: '🎓 Educational',
  description: 'Learn the concepts behind the code with explanations and best practices',
  style: 'educational',
  sections: [
    {
      title: '💡 What This Code Does',
      icon: '💡',
      content: `This section explains the primary purpose and how it works in simple terms.

Example structure:
- What: A clear, plain-English description
- How: Step-by-step flow
- Why: The purpose and benefits`,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '🏗️ Architecture Breakdown',
      icon: '🏗️',
      content: `Component-by-component walkthrough:

Main Components:
1. [Component A] - Handles X, used for Y
2. [Component B] - Manages Z, depends on A
3. [Component C] - Connects everything together

Data Flow: Input → Component A → Component B → Output`,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '🎯 Design Patterns Used',
      icon: '🎯',
      content: `This code uses these patterns:

1. **[Pattern Name]**
   - What it does: [explanation]
   - Why we use it: [benefits]
   - Real-world analogy: [relatable example]

2. **[Pattern Name]**
   - Benefits in this context: [specific advantages]
   - Trade-offs: [what we're not doing and why]`,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '✅ Best Practices Applied',
      icon: '✅',
      content: `How this code follows industry standards:

• [Practice]: [Why it matters]
• [Practice]: [Performance impact]
• [Practice]: [Maintainability benefit]`,
      expandByDefault: true,
      priority: 'medium',
    },
    {
      title: '🔍 Key Concepts Explained',
      icon: '🔍',
      content: `Understanding the fundamental ideas:

**Concept 1: [Name]**
- Definition: [What it is]
- Usage in this code: [How it's applied]
- Further reading: [Related topics]

**Concept 2: [Name]**
- Why it matters: [Importance]`,
      expandByDefault: false,
      priority: 'medium',
    },
    {
      title: '⚠️ Common Mistakes to Avoid',
      icon: '⚠️',
      content: `Pitfalls and how this code avoids them:

❌ **Mistake**: [Common error]
   Why it's wrong: [consequences]
✅ **Our approach**: [How we do it right]

❌ **Mistake**: [Another common error]
   Why it's wrong: [consequences]
✅ **Our approach**: [How we do it right]`,
      expandByDefault: false,
      priority: 'low',
    },
    {
      title: '🚀 How to Use This Code',
      icon: '🚀',
      content: `Step-by-step integration guide:

1. Copy the files to your project
2. Import/include the necessary modules
3. Initialize with configuration
4. Call the main functions with your data
5. Handle the results

Example usage:
\`\`\`
[code example]
\`\`\``,
      expandByDefault: false,
      priority: 'high',
    },
    {
      title: '🧪 Testing This Code',
      icon: '🧪',
      content: `How to verify it works:

**Unit Tests**: Test each component individually
**Integration Tests**: Test how components work together
**Example test cases**: [specific scenarios to test]`,
      expandByDefault: false,
      priority: 'medium',
    },
    {
      title: '📚 Next Steps to Learn',
      icon: '📚',
      content: `Deepen your understanding:

1. [Related concept 1] - [Why it matters]
2. [Related concept 2] - [How it connects]
3. [Advanced topic] - [For mastery]`,
      expandByDefault: false,
      priority: 'low',
    },
  ],
};

// ============== TEMPLATE: PROFESSIONAL ==============
/**
 * For production environments and senior developers
 * Focus: Performance, scalability, requirements
 */
export const ProfessionalTemplate: InstructionTemplate = {
  id: 'professional',
  name: '💼 Professional',
  description: 'Production-ready analysis with performance metrics and scalability',
  style: 'professional',
  sections: [
    {
      title: '📋 Requirements Met',
      icon: '📋',
      content: `Specification compliance:

✅ Requirement 1: [Description] - [Implementation details]
✅ Requirement 2: [Description] - [How we address it]
⚠️ Requirement 3: [Description] - [Partial implementation, reason]

Acceptance criteria: All met
Coverage: 100%`,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '⚡ Performance Characteristics',
      icon: '⚡',
      content: `Performance analysis:

**Time Complexity**: O(n) for operation X, O(1) for operation Y
**Space Complexity**: O(n) memory usage
**Benchmarks**: 
- Operation X: ~50ms for 10k items
- Operation Y: ~2ms average

Bottlenecks: [None identified / List any potential bottlenecks]
Optimization opportunities: [If applicable]`,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '🔐 Security Considerations',
      icon: '🔐',
      content: `Security analysis:

✅ Input validation: All user inputs are sanitized
✅ Data protection: Sensitive data is encrypted
✅ Authentication: Properly implemented
✅ Authorization: Role-based access control in place

Known limitations: [Any security trade-offs]
Audit recommendations: [Areas for security review]`,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '📊 Scalability Plan',
      icon: '📊',
      content: `How this scales:

**Current capacity**: Handles 10k units efficiently
**Scaling strategy**: 
- Horizontal: Add more instances
- Vertical: Increase computational resources
- Database: Use sharding for large datasets

Limits: Beyond 1M units, requires refactoring`,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '🔧 Configuration & Deployment',
      icon: '🔧',
      content: `Production setup:

**Environment variables**:
- DATABASE_URL: [Format]
- API_KEY: [Required for X service]
- LOG_LEVEL: [Default: info]

**Infrastructure**:
- Minimum: 2GB RAM, 2 CPU cores
- Recommended: 4GB RAM, 4 CPU cores
- Database: PostgreSQL 12+

**Deployment steps**: [Step-by-step]`,
      expandByDefault: false,
      priority: 'high',
    },
    {
      title: '📈 Monitoring & Metrics',
      icon: '📈',
      content: `What to monitor:

**Key metrics**:
- Response time (p50, p95, p99)
- Error rate (target: <0.1%)
- Memory usage
- CPU utilization

**Alert thresholds**:
- Response time > 500ms
- Error rate > 1%
- Memory usage > 80%`,
      expandByDefault: false,
      priority: 'medium',
    },
    {
      title: '🛠️ Maintenance Schedule',
      icon: '🛠️',
      content: `Long-term support:

**Daily**: Monitor logs, check alerts
**Weekly**: Performance review, security patch updates
**Monthly**: Capacity planning, optimization review
**Quarterly**: Major version upgrades, architectural review`,
      expandByDefault: false,
      priority: 'medium',
    },
    {
      title: '📝 API Documentation',
      icon: '📝',
      content: `Complete API reference:

**Endpoints**: [List all endpoints with methods]
**Authentication**: [How to authenticate]
**Rate limiting**: [Limits and rules]
**Error codes**: [Comprehensive error reference]`,
      expandByDefault: false,
      priority: 'high',
    },
    {
      title: '🐛 Troubleshooting Guide',
      icon: '🐛',
      content: `Common issues and solutions:

**Issue**: [Problem] 
Solution: [Steps to resolve]
Root cause: [Why it happens]

**Issue**: [Problem]
Solution: [Steps to resolve]`,
      expandByDefault: false,
      priority: 'medium',
    },
  ],
};

// ============== TEMPLATE: EXPERIMENTAL ==============
/**
 * For cutting-edge tech and research
 * Focus: Innovation, novel approaches, trade-offs
 */
export const ExperimentalTemplate: InstructionTemplate = {
  id: 'experimental',
  name: '🔬 Experimental',
  description: 'Cutting-edge approaches with research backing and trade-offs',
  style: 'experimental',
  sections: [
    {
      title: '🚀 Novel Approach',
      icon: '🚀',
      content: `What makes this unique:

**Innovation**: [How this differs from standard approaches]
**Research backing**: [Papers, references, or case studies]
**Proof of concept**: [Evidence it works]

Compared to traditional approach:
- Traditional: [How it's usually done]
- Our approach: [Why ours is better/different]`,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '⚖️ Trade-offs & Considerations',
      icon: '⚖️',
      content: `What we're trading for innovation:

**Advantages**:
+ [Advantage 1]
+ [Advantage 2]

**Disadvantages**:
- [Disadvantage 1]
- [Disadvantage 2]

**When to use this**: [Specific scenarios]
**When NOT to use this**: [Scenarios where traditional is better]`,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '🧪 Experimental Results',
      icon: '🧪',
      content: `Testing and validation:

**Test environment**: [Setup details]
**Results**: 
- Performance improvement: 40% faster
- Resource efficiency: 30% less memory
- Reliability: 99.95% uptime

**Caveats**: [What we found]
**Further testing needed**: [Areas for improvement]`,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '📚 Related Research',
      icon: '📚',
      content: `Academic and technical references:

[Paper title] (Year) - [Author]
- Key insight: [What it teaches]
- Relevance: [How it relates to our code]

[Reference 2]
[Reference 3]`,
      expandByDefault: false,
      priority: 'medium',
    },
    {
      title: '⚠️ Maturity & Stability',
      icon: '⚠️',
      content: `Current state of this approach:

**Status**: Experimental / Beta / Production-ready
**Stability**: [Level of stability]
**Production readiness**: [Is it ready for use?]

**Known issues**:
- [Issue 1]: [Impact and workaround]
- [Issue 2]: [Impact and workaround]

**Planned improvements**: [What's coming]`,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '🔮 Future Potential',
      icon: '🔮',
      content: `Where this could go:

**Short-term** (0-6 months): [Immediate improvements]
**Medium-term** (6-18 months): [Expected evolution]
**Long-term**: [Visionary possibilities]

**Could enable**: [What becomes possible with this approach]`,
      expandByDefault: false,
      priority: 'low',
    },
  ],
};

// ============== TEMPLATE: DEFENSIVE ==============
/**
 * For security-critical and safety-critical systems
 * Focus: Edge cases, failure modes, security
 */
export const DefensiveTemplate: InstructionTemplate = {
  id: 'defensive',
  name: '🛡️ Defensive',
  description: 'Security and safety analysis with edge case coverage',
  style: 'defensive',
  sections: [
    {
      title: '🛡️ Security Threats Mitigated',
      icon: '🛡️',
      content: `Threats addressed in this code:

🔒 **SQL Injection**: Prevented by parameterized queries
🔒 **XSS Attacks**: Input sanitized before rendering
🔒 **CSRF**: CSRF tokens on all state-changing operations
🔒 **Authentication bypass**: Multi-layer verification

Remaining attack surface: [What's NOT protected and why]`,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '⚠️ Edge Cases Handled',
      icon: '⚠️',
      content: `Unusual inputs and scenarios:

✅ Null/undefined values: Handled with default values
✅ Empty collections: Works correctly
✅ Very large inputs: Gracefully degrades
✅ Invalid data types: Rejected safely
✅ Concurrent access: Thread-safe

Not handled: [Any edge cases we skip and why]`,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '💥 Failure Modes',
      icon: '💥',
      content: `What happens when things go wrong:

**Network failure**: Retries 3 times, then fails gracefully
**Database unavailable**: Returns cached data if available, else error
**Memory exhaustion**: [How we handle it]
**Timeout scenarios**: [Behavior]

Recovery mechanisms: [How system recovers]`,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '🔐 Data Protection',
      icon: '🔐',
      content: `How sensitive data is protected:

**At rest**: AES-256 encryption for sensitive fields
**In transit**: TLS 1.3 for all network communication
**In memory**: Cleared after use, not logged
**In logs**: PII stripped, never logged

Compliance: [GDPR, HIPAA, etc.]`,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '🧪 Security Testing',
      icon: '🧪',
      content: `How we validate security:

**Tests performed**:
- SQL injection attempts: [Result]
- XSS payload testing: [Result]
- Authentication bypass tests: [Result]
- Fuzzing: [Coverage]

**Tools used**: [OWASP ZAP, etc.]
**Last audit**: [Date and findings]`,
      expandByDefault: false,
      priority: 'high',
    },
    {
      title: '📋 Compliance Checklist',
      icon: '📋',
      content: `Regulatory and standard compliance:

✅ OWASP Top 10: All risks mitigated
✅ CWE/SANS Top 25: Reviewed and addressed
✅ Security headers: All set correctly
✅ SSL/TLS: Modern ciphers only

Certifications needed: [Any that apply]`,
      expandByDefault: false,
      priority: 'high',
    },
  ],
};

// ============== TEMPLATE: MINIMALIST ==============
/**
 * For experienced developers who want facts only
 * Focus: Code, structure, brief explanation
 */
export const MinimalistTemplate: InstructionTemplate = {
  id: 'minimalist',
  name: '⚡ Minimalist',
  description: 'Code-focused with minimal explanation for experienced developers',
  style: 'minimalist',
  sections: [
    {
      title: '📊 Code Stats',
      icon: '📊',
      content: `Quick metrics:
- Files: 3
- Lines of code: 427
- Functions: 12
- Classes: 2
- Test coverage: 92%`,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '🏗️ Architecture',
      icon: '🏗️',
      content: `Module structure:
\`\`\`
src/
├── core/      [Main logic]
├── types/     [Type definitions]
├── utils/     [Helpers]
└── index.ts   [Entry point]
\`\`\``,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '🔑 Key Methods',
      icon: '🔑',
      content: `Primary entry points:
- \`init(config)\` - Initialize with config
- \`process(data)\` - Main processing
- \`cleanup()\` - Resource cleanup`,
      expandByDefault: true,
      priority: 'high',
    },
    {
      title: '⚡ Performance',
      icon: '⚡',
      content: `O(n log n) average
O(n²) worst case
~2MB memory
100MB/s throughput`,
      expandByDefault: false,
      priority: 'high',
    },
    {
      title: '🔐 Security',
      icon: '🔐',
      content: `Input validated ✓
Output escaped ✓
No hardcoded secrets ✓`,
      expandByDefault: false,
      priority: 'high',
    },
  ],
};

// ============== TEMPLATE REGISTRY ==============

export const INSTRUCTION_TEMPLATES: Record<InstructionStyle, InstructionTemplate> = {
  educational: EducationalTemplate,
  professional: ProfessionalTemplate,
  experimental: ExperimentalTemplate,
  defensive: DefensiveTemplate,
  minimalist: MinimalistTemplate,
};

export function getTemplate(style: InstructionStyle): InstructionTemplate {
  return INSTRUCTION_TEMPLATES[style];
}

export function getAllTemplates(): InstructionTemplate[] {
  return Object.values(INSTRUCTION_TEMPLATES);
}

// ============== DYNAMIC INSTRUCTION GENERATOR ==============

export interface InstructionGeneratorOptions {
  codeLanguage: string;
  complexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
  style: InstructionStyle;
  codeLength: number;
  includeExamples?: boolean;
  targetAudience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export function generateInstruction(options: InstructionGeneratorOptions): InstructionTemplate {
  const baseTemplate = getTemplate(options.style);

  // Customize sections based on complexity and language
  const customizedSections = baseTemplate.sections
    .map((section) => {
      // Adjust expand-by-default based on complexity
      if (options.complexity === 'simple' && section.priority === 'low') {
        return { ...section, expandByDefault: false };
      }
      if (options.complexity === 'very-complex' && section.priority !== 'high') {
        return { ...section, expandByDefault: false };
      }
      return section;
    })
    .sort((a, b) => {
      // Sort by priority
      const priorityMap = { high: 0, medium: 1, low: 2 };
      return priorityMap[a.priority] - priorityMap[b.priority];
    });

  return {
    ...baseTemplate,
    sections: customizedSections,
  };
}
