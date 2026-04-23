import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Atom, Calculator, FlaskConical, PlayCircle, ChevronRight, Search, CheckCircle2, HelpCircle, Send, X, MessageCircle, Sparkles, RefreshCw, ArrowLeft, Youtube, ExternalLink, Loader2, Trophy, XCircle, ChevronDown, ChevronUp, Dna, Zap, Globe, PenTool, Coins, Brain, Leaf, Languages, Music } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/study';

const SUBJECTS = [
  {
    id: 'all',
    name: 'All Subjects',
    icon: BookOpen,
    color: 'from-slate-600 via-slate-500 to-slate-400',
    bgColor: 'theme-bg-elevated',
    textColor: 'theme-text-muted',
    glowClass: 'subject-glow-amber',
    units: []
  },
  {
    id: 'math',
    name: 'Mathematics',
    icon: Calculator,
    color: 'from-blue-600 via-cyan-500 to-indigo-600',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500 dark:text-blue-400',
    glowClass: 'subject-glow-blue',
    units: [
      {
        unitTitle: 'Algebra',
        unitNumber: 1,
        lessons: [
          { title: 'Linear Equations & Inequalities', duration: '35 min' },
          { title: 'Systems of Equations', duration: '40 min' },
          { title: 'Quadratic Functions & Equations', duration: '50 min' },
          { title: 'Polynomials: Addition & Multiplication', duration: '30 min' },
          { title: 'Rational Expressions', duration: '45 min' },
        ]
      },
      {
        unitTitle: 'Calculus 1',
        unitNumber: 2,
        lessons: [
          { title: 'Limits & Continuity', duration: '45 min' },
          { title: 'Derivatives: Definition & Rules', duration: '55 min' },
          { title: 'Chain Rule & Implicit Differentiation', duration: '50 min' },
          { title: 'Applications of Derivatives', duration: '1h' },
          { title: 'Integrals & The Fundamental Theorem', duration: '1h 10m' },
          { title: 'Integration Techniques', duration: '55 min' },
        ]
      },
      {
        unitTitle: 'Calculus 2',
        unitNumber: 3,
        lessons: [
          { title: 'Sequences & Series', duration: '50 min' },
          { title: 'Taylor & Maclaurin Series', duration: '1h' },
          { title: 'Parametric Equations & Polar Coordinates', duration: '45 min' },
          { title: 'Improper Integrals', duration: '40 min' },
        ]
      },
      {
        unitTitle: 'Linear Algebra',
        unitNumber: 4,
        lessons: [
          { title: 'Vectors & Spaces', duration: '1h' },
          { title: 'Matrix Operations & Transformations', duration: '1h 10m' },
          { title: 'Eigenvalues & Eigenvectors', duration: '55 min' },
          { title: 'Determinants & Inverses', duration: '45 min' },
        ]
      },
      {
        unitTitle: 'Differential Equations',
        unitNumber: 5,
        lessons: [
          { title: 'First Order Differential Equations', duration: '50 min' },
          { title: 'Second Order Linear Equations', duration: '1h' },
          { title: 'Laplace Transforms', duration: '1h 15m' },
          { title: 'Systems of Differential Equations', duration: '55 min' },
        ]
      },
      {
        unitTitle: 'Statistics & Probability',
        unitNumber: 6,
        lessons: [
          { title: 'Probability Distributions', duration: '40 min' },
          { title: 'Hypothesis Testing', duration: '50 min' },
          { title: 'Confidence Intervals', duration: '35 min' },
          { title: 'Regression Analysis', duration: '45 min' },
          { title: 'Bayesian Statistics', duration: '55 min' },
        ]
      }
    ]
  },
  {
    id: 'physics',
    name: 'Physics',
    icon: Atom,
    color: 'from-purple-600 via-indigo-500 to-violet-600',
    bgColor: 'bg-indigo-500/10',
    textColor: 'text-indigo-500 dark:text-indigo-400',
    glowClass: 'subject-glow-purple',
    units: [
      {
        unitTitle: 'Classical Mechanics',
        unitNumber: 1,
        lessons: [
          { title: 'Kinematics: Motion in 1D & 2D', duration: '50 min' },
          { title: 'Newton\'s Laws of Motion', duration: '45 min' },
          { title: 'Work, Energy & Power', duration: '55 min' },
          { title: 'Momentum & Collisions', duration: '40 min' },
          { title: 'Rotational Dynamics & Torque', duration: '1h' },
          { title: 'Gravitation & Orbits', duration: '50 min' },
        ]
      },
      {
        unitTitle: 'Electromagnetism',
        unitNumber: 2,
        lessons: [
          { title: 'Electric Charge & Coulomb\'s Law', duration: '40 min' },
          { title: 'Electric Fields & Gauss\'s Law', duration: '55 min' },
          { title: 'Circuits: Resistance, Capacitance & Kirchhoff', duration: '1h' },
          { title: 'Magnetic Fields & Ampère\'s Law', duration: '50 min' },
          { title: 'Electromagnetic Induction & Faraday\'s Law', duration: '55 min' },
        ]
      },
      {
        unitTitle: 'Waves & Optics',
        unitNumber: 3,
        lessons: [
          { title: 'Simple Harmonic Motion', duration: '35 min' },
          { title: 'Wave Interference & Diffraction', duration: '45 min' },
          { title: 'Sound Waves & the Doppler Effect', duration: '40 min' },
          { title: 'Reflection, Refraction & Snell\'s Law', duration: '50 min' },
          { title: 'Lenses, Mirrors & Ray Diagrams', duration: '45 min' },
        ]
      },
      {
        unitTitle: 'Thermodynamics',
        unitNumber: 4,
        lessons: [
          { title: 'Temperature, Heat & Thermal Expansion', duration: '35 min' },
          { title: 'Laws of Thermodynamics', duration: '55 min' },
          { title: 'Heat Engines & Entropy', duration: '50 min' },
          { title: 'Kinetic Theory of Gases', duration: '40 min' },
        ]
      },
      {
        unitTitle: 'Modern Physics',
        unitNumber: 5,
        lessons: [
          { title: 'Special Relativity & Time Dilation', duration: '1h' },
          { title: 'Quantum Mechanics: Wave-Particle Duality', duration: '55 min' },
          { title: 'Atomic Models & Spectral Lines', duration: '45 min' },
          { title: 'Nuclear Physics & Radioactivity', duration: '50 min' },
        ]
      }
    ]
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: FlaskConical,
    color: 'from-emerald-500 via-teal-500 to-cyan-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500 dark:text-emerald-400',
    glowClass: 'subject-glow-emerald',
    units: [
      {
        unitTitle: 'Atomic Structure & Periodicity',
        unitNumber: 1,
        lessons: [
          { title: 'Atomic Models & Electron Configuration', duration: '45 min' },
          { title: 'Periodic Trends: Radius, EN, IE', duration: '40 min' },
          { title: 'Quantum Numbers & Orbitals', duration: '50 min' },
        ]
      },
      {
        unitTitle: 'Chemical Bonding',
        unitNumber: 2,
        lessons: [
          { title: 'Ionic & Covalent Bonds', duration: '35 min' },
          { title: 'Lewis Structures & VSEPR Theory', duration: '50 min' },
          { title: 'Molecular Orbital Theory', duration: '55 min' },
          { title: 'Intermolecular Forces', duration: '40 min' },
        ]
      },
      {
        unitTitle: 'Stoichiometry & Reactions',
        unitNumber: 3,
        lessons: [
          { title: 'Mole Concept & Molar Mass', duration: '30 min' },
          { title: 'Balancing Equations & Reaction Types', duration: '40 min' },
          { title: 'Limiting Reagents & Percent Yield', duration: '45 min' },
          { title: 'Solution Stoichiometry & Dilutions', duration: '35 min' },
        ]
      },
      {
        unitTitle: 'Thermochemistry & Kinetics',
        unitNumber: 4,
        lessons: [
          { title: 'Enthalpy & Hess\'s Law', duration: '50 min' },
          { title: 'Reaction Rates & Rate Laws', duration: '45 min' },
          { title: 'Activation Energy & Catalysts', duration: '40 min' },
          { title: 'Gibbs Free Energy & Spontaneity', duration: '55 min' },
        ]
      },
      {
        unitTitle: 'Equilibrium & Acids-Bases',
        unitNumber: 5,
        lessons: [
          { title: 'Chemical Equilibrium & Le Chatelier\'s Principle', duration: '50 min' },
          { title: 'Acid-Base Theories: Arrhenius, Brønsted, Lewis', duration: '45 min' },
          { title: 'pH, pOH & Buffer Solutions', duration: '40 min' },
          { title: 'Titration Curves & Indicators', duration: '35 min' },
        ]
      },
      {
        unitTitle: 'Organic Chemistry',
        unitNumber: 6,
        lessons: [
          { title: 'Hydrocarbons: Alkanes, Alkenes, Alkynes', duration: '50 min' },
          { title: 'Functional Groups & Nomenclature', duration: '45 min' },
          { title: 'Isomerism & Stereochemistry', duration: '55 min' },
          { title: 'Organic Reactions: Substitution & Elimination', duration: '1h' },
        ]
      }
    ]
  },
  {
    id: 'biology',
    name: 'Biology',
    icon: Dna,
    color: 'from-rose-600 via-pink-500 to-fuchsia-600',
    bgColor: 'bg-rose-500/10',
    textColor: 'text-rose-500 dark:text-rose-400',
    glowClass: 'subject-glow-rose',
    units: [
      {
        unitTitle: 'Cell Biology',
        unitNumber: 1,
        lessons: [
          { title: 'Cell Structure: Organelles & Functions', duration: '40 min' },
          { title: 'Cell Membrane & Transport', duration: '35 min' },
          { title: 'Cell Division: Mitosis & Meiosis', duration: '50 min' },
          { title: 'Cell Signaling & Communication', duration: '45 min' },
        ]
      },
      {
        unitTitle: 'Molecular Biology & Genetics',
        unitNumber: 2,
        lessons: [
          { title: 'DNA Structure & Replication', duration: '45 min' },
          { title: 'Transcription & Translation', duration: '50 min' },
          { title: 'Gene Regulation & Epigenetics', duration: '55 min' },
          { title: 'Mendelian Genetics & Punnett Squares', duration: '40 min' },
          { title: 'Mutations & Genetic Disorders', duration: '35 min' },
        ]
      },
      {
        unitTitle: 'Evolution & Ecology',
        unitNumber: 3,
        lessons: [
          { title: 'Natural Selection & Adaptation', duration: '40 min' },
          { title: 'Speciation & Phylogenetics', duration: '45 min' },
          { title: 'Population Ecology & Growth Models', duration: '50 min' },
          { title: 'Ecosystems: Energy Flow & Nutrient Cycles', duration: '55 min' },
        ]
      },
      {
        unitTitle: 'Human Physiology',
        unitNumber: 4,
        lessons: [
          { title: 'Nervous System & Neurotransmission', duration: '50 min' },
          { title: 'Cardiovascular System & Blood', duration: '45 min' },
          { title: 'Immune System: Innate & Adaptive', duration: '55 min' },
          { title: 'Endocrine System & Hormones', duration: '40 min' },
          { title: 'Respiratory & Digestive Systems', duration: '50 min' },
        ]
      }
    ]
  },
  {
    id: 'cs',
    name: 'Computer Science & AI',
    icon: Zap,
    color: 'from-cyan-500 via-sky-500 to-blue-600',
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-500 dark:text-cyan-400',
    glowClass: 'subject-glow-cyan',
    units: [
      {
        unitTitle: 'Programming Fundamentals',
        unitNumber: 1,
        lessons: [
          { title: 'Python Basics: Variables & Control Flow', duration: '35 min' },
          { title: 'Data Structures: Lists, Sets, Dicts', duration: '40 min' },
          { title: 'Functions, Recursion, and Algorithms', duration: '45 min' },
          { title: 'Object-Oriented Programming', duration: '50 min' },
        ]
      },
      {
        unitTitle: 'AI & Machine Learning',
        unitNumber: 2,
        lessons: [
          { title: 'Regression & Classification', duration: '40 min' },
          { title: 'Neural Networks Overview', duration: '45 min' },
          { title: 'Model Evaluation & Cross-Validation', duration: '35 min' },
          { title: 'Ethics in AI', duration: '30 min' },
        ]
      },
      {
        unitTitle: 'Web Development',
        unitNumber: 3,
        lessons: [
          { title: 'HTML & CSS Fundamentals', duration: '35 min' },
          { title: 'JavaScript & the DOM', duration: '45 min' },
          { title: 'React: Components & State', duration: '50 min' },
          { title: 'APIs & Asynchronous Programming', duration: '40 min' },
          { title: 'Databases: SQL vs NoSQL', duration: '45 min' },
        ]
      },
      {
        unitTitle: 'Data Structures & Algorithms',
        unitNumber: 4,
        lessons: [
          { title: 'Arrays, Linked Lists & Stacks', duration: '40 min' },
          { title: 'Trees & Graphs', duration: '50 min' },
          { title: 'Sorting Algorithms: Quick, Merge, Heap', duration: '45 min' },
          { title: 'Dynamic Programming', duration: '55 min' },
          { title: 'Big-O Notation & Complexity Analysis', duration: '35 min' },
        ]
      },
      {
        unitTitle: 'Cybersecurity Basics',
        unitNumber: 5,
        lessons: [
          { title: 'Encryption & Cryptography', duration: '40 min' },
          { title: 'Network Security & Firewalls', duration: '35 min' },
          { title: 'Common Attacks: SQL Injection, XSS, Phishing', duration: '45 min' },
          { title: 'Authentication & Authorization', duration: '35 min' },
        ]
      }
    ]
  },
  {
    id: 'history',
    name: 'World History',
    icon: Globe,
    color: 'from-amber-600 via-yellow-500 to-orange-600',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500 dark:text-amber-400',
    glowClass: 'subject-glow-amber',
    units: [
      {
        unitTitle: 'Ancient Civilizations',
        unitNumber: 1,
        lessons: [
          { title: 'Mesopotamia & the Fertile Crescent', duration: '35 min' },
          { title: 'Ancient Egypt: Pharaohs & Pyramids', duration: '40 min' },
          { title: 'Ancient Greece: Democracy & Philosophy', duration: '45 min' },
          { title: 'The Roman Republic & Empire', duration: '50 min' },
          { title: 'Ancient China: Dynasties & Innovations', duration: '40 min' },
          { title: 'Ancient India: Maurya & Gupta Empires', duration: '35 min' },
        ]
      },
      {
        unitTitle: 'Medieval & Renaissance',
        unitNumber: 2,
        lessons: [
          { title: 'The Fall of Rome & Rise of Byzantium', duration: '40 min' },
          { title: 'Feudalism & Medieval Society', duration: '35 min' },
          { title: 'The Crusades & Their Impact', duration: '40 min' },
          { title: 'The Black Death & Social Change', duration: '35 min' },
          { title: 'The Renaissance: Art, Science & Humanism', duration: '50 min' },
          { title: 'The Reformation & Religious Wars', duration: '45 min' },
        ]
      },
      {
        unitTitle: 'Age of Exploration & Revolution',
        unitNumber: 3,
        lessons: [
          { title: 'European Exploration & Colonialism', duration: '45 min' },
          { title: 'The Scientific Revolution', duration: '40 min' },
          { title: 'The Enlightenment: Ideas That Changed the World', duration: '45 min' },
          { title: 'The American Revolution', duration: '40 min' },
          { title: 'The French Revolution & Napoleon', duration: '50 min' },
        ]
      },
      {
        unitTitle: 'Modern World History',
        unitNumber: 4,
        lessons: [
          { title: 'The Industrial Revolution', duration: '45 min' },
          { title: 'World War I: Causes & Consequences', duration: '50 min' },
          { title: 'World War II & The Holocaust', duration: '55 min' },
          { title: 'The Cold War: NATO, USSR & Proxy Wars', duration: '50 min' },
          { title: 'Decolonization & Independence Movements', duration: '40 min' },
          { title: 'Globalization & the Modern Era', duration: '35 min' },
        ]
      },
      {
        unitTitle: 'US History',
        unitNumber: 5,
        lessons: [
          { title: 'Colonial America & the Constitution', duration: '45 min' },
          { title: 'Westward Expansion & Manifest Destiny', duration: '40 min' },
          { title: 'The Civil War & Reconstruction', duration: '50 min' },
          { title: 'The Civil Rights Movement', duration: '45 min' },
          { title: 'Post-9/11 America & Modern Politics', duration: '40 min' },
        ]
      }
    ]
  },
  {
    id: 'english',
    name: 'English & Literature',
    icon: PenTool,
    color: 'from-fuchsia-600 via-purple-500 to-violet-600',
    bgColor: 'bg-fuchsia-500/10',
    textColor: 'text-fuchsia-500 dark:text-fuchsia-400',
    glowClass: 'subject-glow-purple',
    units: [
      {
        unitTitle: 'Grammar & Writing',
        unitNumber: 1,
        lessons: [
          { title: 'Parts of Speech & Sentence Structure', duration: '30 min' },
          { title: 'Punctuation & Common Errors', duration: '25 min' },
          { title: 'Essay Structure: Thesis, Body & Conclusion', duration: '40 min' },
          { title: 'Argumentative & Persuasive Writing', duration: '45 min' },
          { title: 'Research Papers & MLA/APA Citation', duration: '35 min' },
        ]
      },
      {
        unitTitle: 'Literary Analysis',
        unitNumber: 2,
        lessons: [
          { title: 'Theme, Symbolism & Motif', duration: '40 min' },
          { title: 'Character Development & Archetypes', duration: '35 min' },
          { title: 'Point of View & Narrative Structure', duration: '35 min' },
          { title: 'Figurative Language: Metaphor, Simile, Irony', duration: '30 min' },
          { title: 'Tone, Mood & Author\'s Purpose', duration: '35 min' },
        ]
      },
      {
        unitTitle: 'Classic Literature',
        unitNumber: 3,
        lessons: [
          { title: 'Shakespeare: Romeo & Juliet, Hamlet, Macbeth', duration: '50 min' },
          { title: 'The Great Gatsby — F. Scott Fitzgerald', duration: '40 min' },
          { title: 'To Kill a Mockingbird — Harper Lee', duration: '40 min' },
          { title: '1984 & Brave New World — Dystopian Fiction', duration: '45 min' },
          { title: 'The Odyssey & Greek Epic Poetry', duration: '45 min' },
        ]
      },
      {
        unitTitle: 'Poetry',
        unitNumber: 4,
        lessons: [
          { title: 'Poetic Forms: Sonnet, Haiku, Free Verse', duration: '30 min' },
          { title: 'Analyzing Rhythm, Meter & Rhyme', duration: '35 min' },
          { title: 'Famous Poets: Frost, Dickinson, Poe, Angelou', duration: '40 min' },
          { title: 'Writing Your Own Poetry', duration: '30 min' },
        ]
      },
      {
        unitTitle: 'SAT/ACT Reading & Writing',
        unitNumber: 5,
        lessons: [
          { title: 'Reading Comprehension Strategies', duration: '40 min' },
          { title: 'Evidence-Based Questions', duration: '35 min' },
          { title: 'Vocabulary in Context', duration: '30 min' },
          { title: 'Grammar Rules for Standardized Tests', duration: '35 min' },
        ]
      }
    ]
  },
  {
    id: 'economics',
    name: 'Economics',
    icon: Coins,
    color: 'from-lime-600 via-green-500 to-emerald-600',
    bgColor: 'bg-lime-500/10',
    textColor: 'text-lime-500 dark:text-lime-400',
    glowClass: 'subject-glow-emerald',
    units: [
      {
        unitTitle: 'Microeconomics',
        unitNumber: 1,
        lessons: [
          { title: 'Supply & Demand: Equilibrium & Shifts', duration: '40 min' },
          { title: 'Elasticity: Price, Income & Cross', duration: '35 min' },
          { title: 'Consumer Choice & Utility Theory', duration: '40 min' },
          { title: 'Production Costs & Profit Maximization', duration: '45 min' },
          { title: 'Market Structures: Perfect Competition to Monopoly', duration: '50 min' },
          { title: 'Market Failures & Externalities', duration: '40 min' },
        ]
      },
      {
        unitTitle: 'Macroeconomics',
        unitNumber: 2,
        lessons: [
          { title: 'GDP, GNP & National Income Accounting', duration: '40 min' },
          { title: 'Inflation, Deflation & the CPI', duration: '35 min' },
          { title: 'Unemployment Types & the Phillips Curve', duration: '40 min' },
          { title: 'Aggregate Supply & Aggregate Demand', duration: '45 min' },
          { title: 'Fiscal Policy: Government Spending & Taxation', duration: '45 min' },
          { title: 'Monetary Policy: The Fed & Interest Rates', duration: '50 min' },
        ]
      },
      {
        unitTitle: 'International Economics',
        unitNumber: 3,
        lessons: [
          { title: 'Comparative Advantage & Trade', duration: '40 min' },
          { title: 'Exchange Rates & Balance of Payments', duration: '45 min' },
          { title: 'Tariffs, Quotas & Trade Agreements', duration: '35 min' },
          { title: 'Globalization: Winners & Losers', duration: '40 min' },
        ]
      },
      {
        unitTitle: 'Personal Finance',
        unitNumber: 4,
        lessons: [
          { title: 'Budgeting & Saving Strategies', duration: '30 min' },
          { title: 'Credit, Loans & Interest Rates', duration: '35 min' },
          { title: 'Investing: Stocks, Bonds & Mutual Funds', duration: '45 min' },
          { title: 'Taxes: Income Tax & Filing Basics', duration: '35 min' },
          { title: 'Compound Interest & Time Value of Money', duration: '40 min' },
        ]
      }
    ]
  },
  {
    id: 'psychology',
    name: 'Psychology',
    icon: Brain,
    color: 'from-pink-600 via-rose-500 to-red-600',
    bgColor: 'bg-pink-500/10',
    textColor: 'text-pink-500 dark:text-pink-400',
    glowClass: 'subject-glow-rose',
    units: [
      {
        unitTitle: 'Foundations of Psychology',
        unitNumber: 1,
        lessons: [
          { title: 'History of Psychology: Freud to Modern Day', duration: '40 min' },
          { title: 'Research Methods & Experimental Design', duration: '35 min' },
          { title: 'Nature vs. Nurture Debate', duration: '30 min' },
          { title: 'Ethical Issues in Psychological Research', duration: '30 min' },
        ]
      },
      {
        unitTitle: 'Biological Bases of Behavior',
        unitNumber: 2,
        lessons: [
          { title: 'Neurons, Synapses & Neurotransmitters', duration: '45 min' },
          { title: 'Brain Structure & Function', duration: '50 min' },
          { title: 'The Endocrine System & Hormones', duration: '35 min' },
          { title: 'Sleep, Dreams & Consciousness', duration: '40 min' },
        ]
      },
      {
        unitTitle: 'Learning & Memory',
        unitNumber: 3,
        lessons: [
          { title: 'Classical Conditioning: Pavlov & Watson', duration: '35 min' },
          { title: 'Operant Conditioning: Skinner & Reinforcement', duration: '40 min' },
          { title: 'Memory Models: Encoding, Storage & Retrieval', duration: '45 min' },
          { title: 'Forgetting: Interference & Decay', duration: '30 min' },
          { title: 'Observational Learning & Bandura', duration: '35 min' },
        ]
      },
      {
        unitTitle: 'Developmental Psychology',
        unitNumber: 4,
        lessons: [
          { title: 'Piaget\'s Stages of Cognitive Development', duration: '40 min' },
          { title: 'Erikson\'s Psychosocial Stages', duration: '35 min' },
          { title: 'Attachment Theory: Bowlby & Ainsworth', duration: '35 min' },
          { title: 'Kohlberg\'s Moral Development', duration: '30 min' },
          { title: 'Adolescence & Identity Formation', duration: '35 min' },
        ]
      },
      {
        unitTitle: 'Abnormal Psychology',
        unitNumber: 5,
        lessons: [
          { title: 'Anxiety Disorders & Phobias', duration: '40 min' },
          { title: 'Mood Disorders: Depression & Bipolar', duration: '45 min' },
          { title: 'Schizophrenia & Psychotic Disorders', duration: '40 min' },
          { title: 'Personality Disorders', duration: '35 min' },
          { title: 'Therapy Approaches: CBT, Psychoanalysis, Humanistic', duration: '50 min' },
        ]
      },
      {
        unitTitle: 'Social Psychology',
        unitNumber: 6,
        lessons: [
          { title: 'Conformity, Obedience & Groupthink', duration: '40 min' },
          { title: 'Attitudes, Persuasion & Cognitive Dissonance', duration: '35 min' },
          { title: 'Stereotypes, Prejudice & Discrimination', duration: '40 min' },
          { title: 'Bystander Effect & Prosocial Behavior', duration: '30 min' },
        ]
      }
    ]
  },
  {
    id: 'envsci',
    name: 'Environmental Science',
    icon: Leaf,
    color: 'from-teal-600 via-green-500 to-lime-500',
    bgColor: 'bg-teal-500/10',
    textColor: 'text-teal-500 dark:text-teal-400',
    glowClass: 'subject-glow-emerald',
    units: [
      {
        unitTitle: 'Earth Systems & Resources',
        unitNumber: 1,
        lessons: [
          { title: 'Plate Tectonics & Geological Processes', duration: '40 min' },
          { title: 'The Atmosphere & Climate Systems', duration: '45 min' },
          { title: 'The Water Cycle & Freshwater Resources', duration: '35 min' },
          { title: 'Soil Formation & Land Use', duration: '30 min' },
        ]
      },
      {
        unitTitle: 'Ecosystems & Biodiversity',
        unitNumber: 2,
        lessons: [
          { title: 'Biomes: Terrestrial & Aquatic', duration: '45 min' },
          { title: 'Food Webs, Trophic Levels & Energy Flow', duration: '40 min' },
          { title: 'Biodiversity & Ecosystem Services', duration: '35 min' },
          { title: 'Invasive Species & Habitat Loss', duration: '35 min' },
          { title: 'Conservation Biology & Protected Areas', duration: '40 min' },
        ]
      },
      {
        unitTitle: 'Pollution & Human Impact',
        unitNumber: 3,
        lessons: [
          { title: 'Air Pollution: Sources, Effects & Clean Air Act', duration: '40 min' },
          { title: 'Water Pollution & Eutrophication', duration: '35 min' },
          { title: 'Solid & Hazardous Waste Management', duration: '35 min' },
          { title: 'Ozone Depletion & Acid Rain', duration: '30 min' },
          { title: 'Noise & Light Pollution', duration: '25 min' },
        ]
      },
      {
        unitTitle: 'Climate Change & Energy',
        unitNumber: 4,
        lessons: [
          { title: 'The Greenhouse Effect & Global Warming', duration: '45 min' },
          { title: 'Evidence for Climate Change: Ice Cores & Sea Level', duration: '40 min' },
          { title: 'Fossil Fuels: Coal, Oil & Natural Gas', duration: '35 min' },
          { title: 'Renewable Energy: Solar, Wind, Hydro & Geothermal', duration: '50 min' },
          { title: 'Nuclear Energy: Fission, Fusion & Waste', duration: '40 min' },
          { title: 'Sustainability & Carbon Footprint', duration: '35 min' },
        ]
      }
    ]
  },
  {
    id: 'spanish',
    name: 'Spanish',
    icon: Languages,
    color: 'from-red-600 via-orange-500 to-yellow-500',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-500 dark:text-red-400',
    glowClass: 'subject-glow-amber',
    units: [
      {
        unitTitle: 'Spanish 1: Basics',
        unitNumber: 1,
        lessons: [
          { title: 'Greetings, Introductions & Pronunciation', duration: '30 min' },
          { title: 'Numbers, Days & Months', duration: '25 min' },
          { title: 'Ser vs. Estar (To Be)', duration: '35 min' },
          { title: 'Articles, Gender & Plurals', duration: '30 min' },
          { title: 'Common Vocabulary: Family, Food, Colors', duration: '35 min' },
        ]
      },
      {
        unitTitle: 'Spanish 2: Present Tense',
        unitNumber: 2,
        lessons: [
          { title: 'Regular -AR, -ER, -IR Verb Conjugation', duration: '40 min' },
          { title: 'Stem-Changing Verbs (e→ie, o→ue)', duration: '35 min' },
          { title: 'Irregular Verbs: Ir, Tener, Hacer, Decir', duration: '40 min' },
          { title: 'Reflexive Verbs & Daily Routines', duration: '35 min' },
          { title: 'Question Words: Qué, Cómo, Dónde, Cuándo', duration: '30 min' },
        ]
      },
      {
        unitTitle: 'Spanish 3: Past Tense',
        unitNumber: 3,
        lessons: [
          { title: 'Preterite Tense: Regular Verbs', duration: '40 min' },
          { title: 'Preterite Tense: Irregular Verbs', duration: '40 min' },
          { title: 'Imperfect Tense & When to Use It', duration: '45 min' },
          { title: 'Preterite vs. Imperfect: Choosing Correctly', duration: '50 min' },
        ]
      },
      {
        unitTitle: 'Spanish 4: Advanced Grammar',
        unitNumber: 4,
        lessons: [
          { title: 'Subjunctive Mood: Formation & Triggers', duration: '50 min' },
          { title: 'Commands: Tú, Usted & Nosotros', duration: '40 min' },
          { title: 'Future & Conditional Tense', duration: '45 min' },
          { title: 'Direct & Indirect Object Pronouns', duration: '40 min' },
          { title: 'Por vs. Para', duration: '35 min' },
        ]
      }
    ]
  },
  {
    id: 'music',
    name: 'Music Theory',
    icon: Music,
    color: 'from-violet-600 via-purple-500 to-pink-500',
    bgColor: 'bg-violet-500/10',
    textColor: 'text-violet-500 dark:text-violet-400',
    glowClass: 'subject-glow-purple',
    units: [
      {
        unitTitle: 'Fundamentals',
        unitNumber: 1,
        lessons: [
          { title: 'Reading Sheet Music: Notes, Clefs & Staves', duration: '35 min' },
          { title: 'Rhythm: Time Signatures, Tempo & Beat', duration: '30 min' },
          { title: 'Scales: Major & Minor', duration: '40 min' },
          { title: 'Intervals & Ear Training', duration: '35 min' },
          { title: 'Key Signatures & the Circle of Fifths', duration: '40 min' },
        ]
      },
      {
        unitTitle: 'Chords & Harmony',
        unitNumber: 2,
        lessons: [
          { title: 'Triads: Major, Minor, Augmented, Diminished', duration: '35 min' },
          { title: 'Seventh Chords & Extended Harmony', duration: '40 min' },
          { title: 'Chord Progressions: I-IV-V, ii-V-I', duration: '40 min' },
          { title: 'Voice Leading & Part Writing', duration: '45 min' },
        ]
      },
      {
        unitTitle: 'Music History',
        unitNumber: 3,
        lessons: [
          { title: 'Baroque Period: Bach, Handel, Vivaldi', duration: '35 min' },
          { title: 'Classical Period: Mozart, Haydn, Beethoven', duration: '40 min' },
          { title: 'Romantic Period: Chopin, Liszt, Tchaikovsky', duration: '40 min' },
          { title: '20th Century: Jazz, Blues & Modern Genres', duration: '45 min' },
        ]
      }
    ]
  }
];

// ─── Quiz View Component (30 Questions Per Topic) ───────────────────
function QuizView({ lesson, subject, onBack, onOpenDoubt, onScoreUpdate, currentProgress, unitTitle }) {
  const TOTAL_QUESTIONS = 30;
  const BATCH_SIZE = 5;

  const [allQuestions, setAllQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(currentProgress || { correct: 0, total: 0 });
  const [quizFinished, setQuizFinished] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  const fetchBatch = async (batchNumber, existingQuestions = []) => {
    const questionsGenerated = existingQuestions.length;
    const remaining = TOTAL_QUESTIONS - questionsGenerated;
    const batchCount = Math.min(BATCH_SIZE, remaining);
    if (batchCount <= 0) return existingQuestions;

    const existingSummary = existingQuestions.length > 0
      ? `\n\nIMPORTANT: You already generated these questions, so make NEW ones that are COMPLETELY DIFFERENT:\n${existingQuestions.map((q, i) => `${i + 1}. ${q.question.substring(0, 80)}...`).join('\n')}`
      : '';

    const prompt = `You are an expert quiz generator creating challenging AP/college-level questions.

Subject: ${subject.name}
Unit: ${unitTitle}
Topic: ${lesson.title}

Generate exactly ${batchCount} hard multiple-choice questions that test deep understanding.
Each question should:
- Require multi-step reasoning, calculation, or application of concepts
- Include specific numbers, formulas, equations, or real scenarios when applicable
- Have plausible distractors (wrong answers that represent common mistakes)
- Be at the AP exam or college intro course difficulty level
- Test conceptual understanding, not just recall
- Be completely unique from every other question
${existingSummary}

IMPORTANT: Respond in EXACTLY this JSON format with no extra text:
{
  "questions": [
    {
      "question": "Your challenging question here.",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "• Answer: The correct answer is [X] because...\n• Step 1: First, we...\n• Step 2: Then, we...\n• Why not [wrong answer]: Because...\n• Key takeaway: Remember that..."
    }
  ]
}

For the explanation field, ALWAYS format as bullet points using • at the start of each line. Keep each bullet short and clear. Include:
• The correct answer and why
• Key steps or reasoning (1-3 bullets)
• Why the most tempting wrong answer is wrong (1 bullet)
• A short takeaway or tip (1 bullet)

Vary between: calculation problems, conceptual analysis, application scenarios, and multi-concept synthesis. Make each question test a DIFFERENT aspect of the topic.`;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      const resultText = data.result || '';
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const newQuestions = parsed.questions || [parsed];
        return [...existingQuestions, ...newQuestions.filter(q => q.question && q.options)];
      }
      throw new Error('No JSON found');
    } catch (err) {
      console.error('Quiz batch error:', err);
      const fallbacks = Array.from({ length: batchCount }, (_, i) => ({
        question: `Question about ${lesson.title} (${questionsGenerated + i + 1}): What is a key concept?`,
        options: ['Understanding core principles', 'Memorizing formulas only', 'Skipping practice', 'Ignoring prerequisites'],
        correctIndex: 0,
        explanation: 'Understanding core principles is essential. The AI quiz service may be temporarily unavailable — try again later!'
      }));
      return [...existingQuestions, ...fallbacks];
    }
  };

  const fetchVideoSuggestions = async (questionText, explanationText) => {
    setLoadingVideos(true);
    setVideos([]);

    const prompt = `Based on this quiz question and its explanation, suggest 3 specific YouTube videos that would help a student understand this concept better.

Question: ${questionText}
Explanation: ${explanationText}
Subject: ${subject.name}
Topic: ${lesson.title}

Return ONLY this JSON format, no extra text:
{
  "videos": [
    {"title": "Specific descriptive video title", "searchQuery": "exact youtube search query to find this video"},
    {"title": "Specific descriptive video title", "searchQuery": "exact youtube search query to find this video"},
    {"title": "Specific descriptive video title", "searchQuery": "exact youtube search query to find this video"}
  ]
}

Make the search queries specific enough to find high-quality educational videos. Prefer channels like Khan Academy, 3Blue1Brown, Organic Chemistry Tutor, Professor Dave, CrashCourse, etc.`;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      const resultText = data.result || '';
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setVideos(parsed.videos || []);
      }
    } catch (err) {
      console.error('Video suggestion error:', err);
    } finally {
      setLoadingVideos(false);
    }
  };

  // Load initial batch
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setAllQuestions([]);
      setCurrentIndex(0);
      setScore(currentProgress || { correct: 0, total: 0 });
      setQuizFinished(false);
      const questions = await fetchBatch(1, []);
      setAllQuestions(questions);
      setLoading(false);
    };
    loadInitial();
  }, [lesson.title]);

  // Pre-fetch next batch when nearing the end of current batch
  useEffect(() => {
    const fetchNextIfNeeded = async () => {
      if (allQuestions.length < TOTAL_QUESTIONS && currentIndex >= allQuestions.length - 2 && !loadingMore) {
        setLoadingMore(true);
        const more = await fetchBatch(Math.floor(allQuestions.length / BATCH_SIZE) + 1, allQuestions);
        setAllQuestions(more);
        setLoadingMore(false);
      }
    };
    if (allQuestions.length > 0) fetchNextIfNeeded();
  }, [currentIndex, allQuestions.length]);

  const currentQuiz = allQuestions[currentIndex];

  const handleAnswer = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    const isCorrect = index === currentQuiz.correctIndex;
    const newScore = { correct: score.correct + (isCorrect ? 1 : 0), total: score.total + 1 };
    setScore(newScore);
    if (onScoreUpdate) onScoreUpdate(lesson.title, newScore);
    // Auto-fetch videos for this question
    fetchVideoSuggestions(currentQuiz.question, currentQuiz.explanation);
  };

  const goToNext = () => {
    if (currentIndex + 1 >= TOTAL_QUESTIONS || currentIndex + 1 >= allQuestions.length) {
      setQuizFinished(true);
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    setVideos([]);
  };

  const restartQuiz = async () => {
    setLoading(true);
    setAllQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore({ correct: 0, total: 0 });
    setQuizFinished(false);
    setVideos([]);
    if (onScoreUpdate) onScoreUpdate(lesson.title, { correct: 0, total: 0 });
    const questions = await fetchBatch(1, []);
    setAllQuestions(questions);
    setLoading(false);
  };

  const optionLetters = ['A', 'B', 'C', 'D'];
  const progressPercent = Math.round(((currentIndex + (showResult ? 1 : 0)) / TOTAL_QUESTIONS) * 100);

  // --- FINISHED SCREEN ---
  if (quizFinished) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '💪' : '📚';
    const msg = pct >= 90 ? 'Outstanding! You\'ve mastered this topic!' : pct >= 70 ? 'Great job! You have a strong grasp!' : pct >= 50 ? 'Good effort! Review the tricky ones.' : 'Keep practicing — you\'ll get there!';

    return (
      <div className="min-h-screen theme-bg theme-text p-6 md:p-12 font-sans">
        <div className="max-w-2xl mx-auto">
          <div className="theme-bg-secondary border theme-border rounded-3xl p-10 md:p-14 text-center theme-glass shadow-2xl">
            <div className="text-7xl mb-6">{emoji}</div>
            <h1 className="text-4xl font-black theme-text mb-2">Quiz Complete!</h1>
            <p className="theme-text-secondary text-lg mb-8">{lesson.title}</p>

            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-green-500/15 border border-emerald-500/30 mb-6">
              <Trophy className="w-8 h-8 text-emerald-400" />
              <div className="text-left">
                <div className="text-3xl font-black text-emerald-400">{score.correct} / {score.total}</div>
                <div className="text-sm font-bold text-emerald-400/70">{pct}% accuracy</div>
              </div>
            </div>

            <p className="theme-text-secondary font-medium mb-10 text-lg">{msg}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={restartQuiz}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r ${subject.color} text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105`}
              >
                <RefreshCw className="w-5 h-5" />
                Retry (30 New Questions)
              </button>
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-8 py-4 rounded-xl theme-bg-elevated border theme-border theme-text font-bold hover:theme-bg-secondary transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Lessons
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg theme-text p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Back & Score Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl theme-bg-secondary border theme-border hover:theme-bg group transition-all theme-text-secondary hover:theme-text font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold text-sm">{score.correct}/{score.total}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold theme-text">Question {currentIndex + 1} of {TOTAL_QUESTIONS}</span>
            <span className="text-sm font-bold theme-text-muted">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 theme-bg-elevated rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${subject.color} transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Lesson Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className={`p-1.5 rounded-lg ${subject.bgColor}`}>
              <subject.icon className={`w-4 h-4 ${subject.textColor}`} />
            </div>
            <span className={`text-xs font-semibold ${subject.textColor}`}>{subject.name}</span>
            <ChevronRight className="w-3 h-3 text-gray-600" />
            <span className="text-xs font-semibold text-gray-400">{unitTitle}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight theme-text">{lesson.title}</h1>
        </div>

        {/* Quiz Card */}
        <div className="theme-bg-secondary border theme-border rounded-3xl p-6 md:p-10 relative overflow-hidden theme-glass shadow-2xl">
          <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${subject.color} opacity-5 blur-3xl rounded-full`} />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className={`w-12 h-12 ${subject.textColor} animate-spin`} />
              <p className="text-gray-400 font-medium text-lg">Generating 30 questions with AI...</p>
              <p className="text-gray-500 text-sm">This may take a moment ✨</p>
            </div>
          ) : currentQuiz ? (
            <div className="relative z-10 space-y-6">
              {/* Question */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className={`w-4 h-4 ${subject.textColor}`} />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Question {currentIndex + 1}</span>
                  {loadingMore && <Loader2 className="w-3 h-3 text-gray-500 animate-spin" />}
                </div>
                <h2 className="text-lg md:text-xl font-bold leading-relaxed text-gray-100">
                  {currentQuiz.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuiz.options.map((option, idx) => {
                  let borderColor = 'theme-border hover:border-white/20';
                  let bgColor = 'theme-bg-elevated hover:theme-bg-secondary';
                  let letterBg = 'theme-bg-secondary';
                  let letterColor = 'theme-text-muted';

                  if (showResult) {
                    if (idx === currentQuiz.correctIndex) {
                      borderColor = 'border-emerald-500/50';
                      bgColor = 'bg-emerald-500/10';
                      letterBg = 'bg-emerald-500';
                      letterColor = 'text-white';
                    } else if (idx === selectedAnswer && idx !== currentQuiz.correctIndex) {
                      borderColor = 'border-red-500/50';
                      bgColor = 'bg-red-500/10';
                      letterBg = 'bg-red-500';
                      letterColor = 'text-white';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={showResult}
                      className={`w-full text-left p-4 rounded-2xl border ${borderColor} ${bgColor} transition-all duration-300 flex items-center gap-4 group ${!showResult ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <span className={`w-10 h-10 rounded-xl ${letterBg} ${letterColor} flex items-center justify-center font-black text-sm flex-shrink-0 transition-all`}>
                        {showResult && idx === currentQuiz.correctIndex ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : showResult && idx === selectedAnswer ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          optionLetters[idx]
                        )}
                      </span>
                      <span className="font-medium theme-text text-sm md:text-base">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Result & Explanation */}
              {showResult && (
                <div className={`p-5 rounded-2xl border ${selectedAnswer === currentQuiz.correctIndex ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'} space-y-3 animate-fadeIn`}>
                  <div className="flex items-center gap-2">
                    {selectedAnswer === currentQuiz.correctIndex ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="font-black text-emerald-400">Correct! 🎉</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-400" />
                        <span className="font-black text-red-400">Not quite! 🤔</span>
                      </>
                    )}
                  </div>
                  <div className="space-y-2 mt-1">
                    {currentQuiz.explanation.split('\n').filter(line => line.trim()).map((line, i) => {
                      const trimmed = line.trim();
                      const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*');
                      const bulletText = isBullet ? trimmed.replace(/^[•\-*]\s*/, '') : trimmed;

                      // Bold text between ** **
                      const renderText = (text) => {
                        return text.split(/(\*\*.*?\*\*)/).map((part, j) =>
                          part.startsWith('**') && part.endsWith('**')
                            ? <strong key={j} className="text-white font-bold">{part.slice(2, -2)}</strong>
                            : part
                        );
                      };

                      if (isBullet) {
                        return (
                          <div key={i} className="flex items-start gap-3 pl-1">
                            <span className="text-orange-400 mt-0.5 text-xs">●</span>
                            <span className="text-gray-300 text-sm leading-relaxed">{renderText(bulletText)}</span>
                          </div>
                        );
                      }
                      return <p key={i} className="text-gray-300 leading-relaxed text-sm">{renderText(trimmed)}</p>;
                    })}
                  </div>
                </div>
              )}

              {/* YouTube Video Suggestions */}
              {showResult && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-bold theme-text">Learn More — YouTube Videos</span>
                  </div>
                  {loadingVideos ? (
                    <div className="flex items-center gap-3 px-4 py-4 rounded-xl theme-bg-elevated border theme-border">
                      <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                      <span className="text-sm text-gray-400">Finding the best videos for you...</span>
                    </div>
                  ) : videos.length > 0 ? (
                    <div className="space-y-2">
                      {videos.map((video, vIdx) => (
                        <a
                          key={vIdx}
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-all group no-underline"
                        >
                          <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/30 transition-colors">
                            <PlayCircle className="w-5 h-5 text-red-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors flex-1">{video.title}</span>
                          <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                {showResult && (
                  <button
                    onClick={goToNext}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${subject.color} text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105`}
                  >
                    {currentIndex + 1 >= TOTAL_QUESTIONS ? (
                      <>
                        <Trophy className="w-4 h-4" />
                        See Results
                      </>
                    ) : (
                      <>
                        <ChevronRight className="w-4 h-4" />
                        Next Question ({currentIndex + 2}/{TOTAL_QUESTIONS})
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => onOpenDoubt(lesson.title, subject.name)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold hover:bg-amber-500/20 transition-all hover:scale-105"
                >
                  <HelpCircle className="w-4 h-4" />
                  I Have a Doubt
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
}


// ─── Doubt Chatbox Component ────────────────────────────────────────
function DoubtChatbox({ isOpen, onClose, lessonTitle, subjectName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'ai',
        content: `Hey there! 👋 I'm your AI study buddy for **${lessonTitle}**.\n\nAsk me anything you're confused about — I'll explain it in simple terms and find you helpful videos! 🎬`,
        videos: []
      }]);
    }
  }, [isOpen, lessonTitle]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const prompt = `You are a friendly and helpful AI tutor helping a student with "${lessonTitle}" in ${subjectName}.

The student has this doubt: "${text}"

Please do the following:
1. Explain the concept in simple, clear language. Use analogies when helpful.
2. If applicable, show a quick example or formula.
3. Suggest 2-3 relevant YouTube search queries that would help the student learn this topic visually.

IMPORTANT: Format your response as JSON like this (no extra text before or after):
{
  "explanation": "Your clear explanation here. Use markdown for formatting: **bold**, *italic*, etc.",
  "videos": [
    {"title": "Video title suggestion 1", "searchQuery": "youtube search query 1"},
    {"title": "Video title suggestion 2", "searchQuery": "youtube search query 2"},
    {"title": "Video title suggestion 3", "searchQuery": "youtube search query 3"}
  ]
}`;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      const resultText = data.result || '';

      let parsed;
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = { explanation: resultText, videos: [] };
      }

      setMessages(prev => [...prev, {
        role: 'ai',
        content: parsed.explanation,
        videos: parsed.videos || []
      }]);
    } catch (err) {
      console.error('Doubt chat error:', err);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: "I'm having trouble connecting right now. Please try again in a moment! 🔄",
        videos: []
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-2xl h-[80vh] theme-bg-secondary border theme-border rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-slideUp theme-glass">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Doubt Solver</h3>
              <p className="text-xs text-gray-400 truncate max-w-[250px]">{lessonTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-1' : 'order-1'}`}>
                <div className={`px-5 py-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-br-md shadow-lg shadow-amber-500/20'
                    : 'theme-bg-elevated border theme-border theme-text rounded-bl-md'
                }`}>
                  {msg.role === 'ai' ? (
                    <div className="space-y-2">
                      {msg.content.split('\n').map((line, i) => (
                        <p key={i} className={line === '' ? 'h-2' : ''}>
                          {line.split(/(\*\*.*?\*\*)/).map((part, j) => 
                            part.startsWith('**') && part.endsWith('**') 
                              ? <strong key={j} className="text-white font-bold">{part.slice(2, -2)}</strong>
                              : part
                          )}
                        </p>
                      ))}
                    </div>
                  ) : msg.content}
                </div>

                {/* Video Suggestions */}
                {msg.videos && msg.videos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <Youtube className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recommended Videos</span>
                    </div>
                    {msg.videos.map((video, vIdx) => (
                      <a
                        key={vIdx}
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-all group no-underline"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/30 transition-colors">
                          <PlayCircle className="w-4 h-4 text-red-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors flex-1">{video.title}</span>
                        <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="px-5 py-4 rounded-2xl rounded-bl-md theme-bg-elevated border theme-border">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-xs theme-text-muted ml-1">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t theme-border theme-bg-elevated">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your doubt here..."
              className="flex-1 bg-transparent border theme-border rounded-xl px-4 py-3 theme-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all text-sm font-medium"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="w-11 h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-gray-600 mt-2 text-center">Powered by Gemini AI ✨ • Videos from YouTube</p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slideUp { animation: slideUp 0.35s ease-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}


// ─── Main Khan Component ─────────────────────────────────────────────
export default function Khan() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [doubtChat, setDoubtChat] = useState({ open: false, lessonTitle: '', subjectName: '' });
  const [expandedUnits, setExpandedUnits] = useState({});

  const [progressMap, setProgressMap] = useState(() => {
    try {
      const saved = localStorage.getItem('malum-khan-progress');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const updateProgress = (lessonTitle, newScore) => {
    setProgressMap(prev => {
      const updated = { ...prev, [lessonTitle]: newScore };
      localStorage.setItem('malum-khan-progress', JSON.stringify(updated));
      return updated;
    });
  };

  const getProgressPercent = (lessonTitle) => {
    const p = progressMap[lessonTitle];
    if (!p || p.total === 0) return 0;
    return Math.round((p.correct / p.total) * 100);
  };

  const getUnitProgress = (unit) => {
    if (!unit.lessons || unit.lessons.length === 0) return 0;
    const percents = unit.lessons.map(l => getProgressPercent(l.title));
    return Math.round(percents.reduce((a, b) => a + b, 0) / percents.length);
  };

  const displaySubjects = SUBJECTS.slice(1);

  const filteredSubjects = displaySubjects
    .filter(subject => activeTab === 'all' || activeTab === subject.id)
    .map(subject => ({
      ...subject,
      units: (subject.units || []).map(unit => ({
        ...unit,
        lessons: unit.lessons.filter(lesson =>
          searchQuery === '' || lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || unit.unitTitle.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(unit => unit.lessons.length > 0)
    }))
    .filter(subject => subject.units.length > 0);

  const toggleUnit = (key) => {
    setExpandedUnits(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openQuiz = (lesson, subject, unitTitle) => {
    setActiveQuiz({ lesson, subject, unitTitle });
  };

  const openDoubt = (lessonTitle, subjectName) => {
    setDoubtChat({ open: true, lessonTitle, subjectName });
  };

  const closeDoubt = () => {
    setDoubtChat({ open: false, lessonTitle: '', subjectName: '' });
  };

  if (activeQuiz) {
    return (
      <>
        <QuizView
          lesson={activeQuiz.lesson}
          subject={activeQuiz.subject}
          unitTitle={activeQuiz.unitTitle}
          onBack={() => setActiveQuiz(null)}
          onOpenDoubt={openDoubt}
          onScoreUpdate={updateProgress}
          currentProgress={progressMap[activeQuiz.lesson.title] || { correct: 0, total: 0 }}
        />
        <DoubtChatbox
          isOpen={doubtChat.open}
          onClose={closeDoubt}
          lessonTitle={doubtChat.lessonTitle}
          subjectName={doubtChat.subjectName}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen theme-bg theme-text p-6 md:p-12 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight malum-text-gradient">
              Learning Corner
            </h1>
            <p className="mt-2 theme-text-secondary text-lg max-w-2xl">
              Master any topic with AI-powered quizzes. Click a lesson to start! 🧠
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 theme-text-muted" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full theme-bg-secondary border theme-border rounded-2xl py-3 pl-11 pr-4 theme-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium shadow-sm"
            />
          </div>
        </header>

        {/* Subject Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
          {SUBJECTS.map((subject) => {
            const Icon = subject.icon;
            const isActive = activeTab === subject.id;
            return (
              <button
                key={subject.id}
                onClick={() => setActiveTab(subject.id)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? `bg-gradient-to-r ${subject.color} text-white shadow-lg shadow-black/20 scale-105`
                    : 'theme-bg-secondary theme-text-muted hover:theme-bg-elevated hover:theme-text'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                {subject.name}
              </button>
            );
          })}
        </div>

        {/* Subjects → Units → Lessons */}
        <div className="space-y-12 mt-8">
          {filteredSubjects.map((subject) => (
            <div key={subject.id} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${subject.bgColor}`}>
                  <subject.icon className={`w-7 h-7 ${subject.textColor}`} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight theme-text">{subject.name}</h2>
                  <p className="text-sm font-medium theme-text-secondary">{subject.units.reduce((a, u) => a + u.lessons.length, 0)} lessons across {subject.units.length} units</p>
                </div>
              </div>

              <div className="space-y-4">
                {subject.units.map((unit) => {
                  const unitKey = `${subject.id}-${unit.unitNumber}`;
                  const isExpanded = expandedUnits[unitKey] !== false;
                  const unitPct = getUnitProgress(unit);

                  return (
                    <div key={unitKey} className="theme-bg-elevated border theme-border rounded-2xl overflow-hidden transition-all duration-300">
                      <button
                        onClick={() => toggleUnit(unitKey)}
                        className="w-full flex items-center justify-between px-6 py-5 bg-transparent hover:bg-white/[0.04] transition-colors text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-white font-black text-sm shadow-lg`}>
                            {unit.unitNumber}
                          </div>
                          <div>
                            <h3 className="text-lg md:text-xl font-bold theme-text">{unit.unitTitle}</h3>
                            <p className="text-sm font-medium theme-text-secondary mt-0.5">{unit.lessons.length} lessons</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="hidden sm:flex items-center gap-3 mr-2">
                            <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${unitPct >= 70 ? 'from-emerald-400 to-green-500' : unitPct >= 40 ? subject.color : unitPct > 0 ? 'from-red-400 to-orange-500' : 'from-gray-700 to-gray-700'} transition-all duration-500`}
                                style={{ width: `${unitPct}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold ${unitPct >= 70 ? 'text-emerald-400' : unitPct >= 40 ? 'text-amber-400' : unitPct > 0 ? 'text-red-400' : 'text-gray-600'}`}>
                              {unitPct}%
                            </span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-6 pb-6 pt-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {unit.lessons.map((lesson, idx) => {
                              const pct = getProgressPercent(lesson.title);
                              const p = progressMap[lesson.title];
                              return (
                                <div
                                  key={idx}
                                  onClick={() => openQuiz(lesson, subject, unit.unitTitle)}
                                  className={`group relative theme-bg-secondary border theme-border rounded-2xl p-5 hover:theme-bg-elevated transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-black/20 cursor-pointer overflow-hidden ${subject.glowClass}`}
                                >
                                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${subject.color} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 rounded-full`} />

                                  <div className="flex justify-between items-start mb-3 relative z-10">
                                    <div className={`p-2 rounded-xl ${pct >= 70 ? 'bg-green-500/20' : 'bg-white/5'} transition-transform duration-300 group-hover:scale-110`}>
                                      {pct >= 70
                                        ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        : <PlayCircle className="w-5 h-5 text-white" />
                                      }
                                    </div>
                                    <span className="text-xs font-semibold px-2.5 py-1 bg-black/40 rounded-full text-gray-300 border border-white/10">
                                      {lesson.duration}
                                    </span>
                                  </div>

                                  <div className="relative z-10">
                                  <h4 className="text-base font-bold mb-2 theme-text group-hover:theme-text transition-colors line-clamp-2 leading-snug">
                                    {lesson.title}
                                  </h4>

                                    <div className="flex items-center gap-1.5 mt-2 mb-3">
                                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Quiz
                                      </span>
                                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center gap-1">
                                        <HelpCircle className="w-3 h-3" /> Doubt
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full bg-gradient-to-r ${pct >= 70 ? 'from-emerald-400 to-green-500' : pct >= 40 ? subject.color : pct > 0 ? 'from-red-400 to-orange-500' : 'from-gray-700 to-gray-700'} rounded-full transition-all duration-500`}
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                      <span className={`text-xs font-bold min-w-[3ch] ${pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-amber-400' : pct > 0 ? 'text-red-400' : 'text-gray-600'}`}>
                                        {pct}%
                                      </span>
                                    </div>
                                    {p && p.total > 0 && (
                                      <span className="text-xs text-gray-400 font-medium mt-1 block">{p.correct}/{p.total} correct</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredSubjects.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                <Search className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-300 mb-2">No lessons found</h3>
              <p className="text-gray-500">Try adjusting your search query or selecting a different subject.</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => openDoubt('General', filteredSubjects[0]?.name || 'General')}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-110 transition-all z-40 group animate-vibrant-pulse"
        title="Ask a Doubt"
      >
        <HelpCircle className="w-6 h-6 group-hover:hidden" />
        <MessageCircle className="w-6 h-6 hidden group-hover:block" />
      </button>

      <DoubtChatbox
        isOpen={doubtChat.open}
        onClose={closeDoubt}
        lessonTitle={doubtChat.lessonTitle}
        subjectName={doubtChat.subjectName}
      />
    </div>
  );
}

