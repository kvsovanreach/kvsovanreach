/**
 * Tools Data
 * JSON-based metadata for all tools
 */

const toolsData = [
  // ==================== GENERAL TOOLS ====================
  {
    id: "calculator",
    name: "Calculator",
    description: "A powerful calculator with scientific functions, unit conversion, and calculation history.",
    category: "general",
    icon: "fa-solid fa-calculator",
    url: "/v2/tools/calculator/",
    tags: ["math", "calculate", "scientific", "convert", "unit", "numbers"],
    status: "active"
  },
  {
    id: "colorpicker",
    name: "Color Picker",
    description: "Create color palettes, extract colors from images, and check color accessibility.",
    category: "general",
    icon: "fa-solid fa-palette",
    url: "/v2/tools/colorpicker/",
    tags: ["color", "palette", "design", "hex", "rgb", "hsl", "accessibility"],
    status: "active"
  },
  {
    id: "qrcode",
    name: "QR Code Tool",
    description: "Generate, scan, and manage QR codes with customization options and batch processing.",
    category: "general",
    icon: "fa-solid fa-qrcode",
    url: "/v2/tools/qrcode/",
    tags: ["qr", "barcode", "scan", "generate", "link"],
    status: "active"
  },
  {
    id: "luckydraw",
    name: "Lucky Draw",
    description: "Create custom spinning wheels for random selection, giveaways, and decision making.",
    category: "general",
    icon: "fa-solid fa-dharmachakra",
    url: "/v2/tools/luckydraw/",
    tags: ["wheel", "spin", "random", "picker", "lottery", "giveaway"],
    status: "active"
  },
  {
    id: "password-generator",
    name: "Password Generator",
    description: "Generate secure, random passwords with customizable length and character options.",
    category: "general",
    icon: "fa-solid fa-key",
    url: "/v2/tools/password/",
    tags: ["password", "security", "generate", "random", "strong"],
    status: "active"
  },
  {
    id: "timer-stopwatch",
    name: "Timer & Stopwatch",
    description: "Track time with countdown timers, stopwatch, and lap recording features.",
    category: "general",
    icon: "fa-solid fa-stopwatch",
    url: "/v2/tools/timer/",
    tags: ["timer", "stopwatch", "countdown", "time", "clock"],
    status: "active"
  },
  {
    id: "notes",
    name: "Quick Notes",
    description: "Take quick notes with markdown support and local storage persistence.",
    category: "general",
    icon: "fa-solid fa-note-sticky",
    url: "/v2/tools/quicknote/",
    tags: ["notes", "markdown", "text", "write", "memo"],
    status: "active"
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    description: "Convert between various units of measurement including length, weight, and temperature.",
    category: "general",
    icon: "fa-solid fa-arrows-rotate",
    url: "/v2/tools/unitconverter/",
    tags: ["convert", "unit", "length", "weight", "temperature", "measurement"],
    status: "active"
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    description: "Compress and optimize images while maintaining quality for faster web loading.",
    category: "general",
    icon: "fa-solid fa-file-zipper",
    url: "/v2/tools/image/",
    tags: ["image", "compress", "optimize", "resize", "photo"],
    status: "active"
  },
  {
    id: "text-cleaner",
    name: "Text Cleaner",
    description: "Clean and transform text with operations like removing duplicates, sorting, and case conversion.",
    category: "general",
    icon: "fa-solid fa-broom",
    url: "/v2/tools/textcleaner/",
    tags: ["text", "clean", "sort", "duplicate", "trim", "case", "transform"],
    status: "active"
  },
  {
    id: "emoji-picker",
    name: "Emoji Picker",
    description: "Search and copy emojis with categories, skin tone variants, and recent history.",
    category: "general",
    icon: "fa-solid fa-face-smile",
    url: "/v2/tools/emoji/",
    tags: ["emoji", "emoticon", "smiley", "copy", "unicode", "symbol"],
    status: "active"
  },
  {
    id: "checklist-maker",
    name: "Checklist Maker",
    description: "Create, manage, and export checklists with drag-and-drop reordering and local storage.",
    category: "general",
    icon: "fa-solid fa-list-check",
    url: "/v2/tools/checklist/",
    tags: ["checklist", "todo", "task", "list", "organize", "productivity"],
    status: "active"
  },
  {
    id: "case-converter",
    name: "Case Converter",
    description: "Convert text between different cases: uppercase, lowercase, title case, camelCase, and more.",
    category: "general",
    icon: "fa-solid fa-font",
    url: "/v2/tools/caseconverter/",
    tags: ["case", "convert", "uppercase", "lowercase", "camel", "snake", "title"],
    status: "active"
  },
  {
    id: "morse-code",
    name: "Morse Code",
    description: "Encode and decode Morse code with audio playback and visual representation.",
    category: "general",
    icon: "fa-solid fa-signal",
    url: "/v2/tools/morse/",
    tags: ["morse", "code", "encode", "decode", "audio", "signal"],
    status: "active"
  },
  {
    id: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder text in paragraphs, sentences, or words with various styles.",
    category: "general",
    icon: "fa-solid fa-paragraph",
    url: "/v2/tools/loremipsum/",
    tags: ["lorem", "ipsum", "placeholder", "text", "generate", "dummy"],
    status: "active"
  },
  {
    id: "browser-info",
    name: "Browser Info",
    description: "View detailed information about your browser, device, screen, and network.",
    category: "general",
    icon: "fa-solid fa-globe",
    url: "/v2/tools/browserinfo/",
    tags: ["browser", "info", "device", "screen", "network", "user-agent"],
    status: "active"
  },
  {
    id: "whitespace-stripper",
    name: "Whitespace Stripper",
    description: "Remove extra whitespace, trim lines, and clean up text formatting.",
    category: "general",
    icon: "fa-solid fa-eraser",
    url: "/v2/tools/whitespace/",
    tags: ["whitespace", "strip", "trim", "clean", "space", "text"],
    status: "active"
  },
  {
    id: "bmi-calculator",
    name: "BMI Calculator",
    description: "Calculate Body Mass Index with health recommendations and weight categories.",
    category: "general",
    icon: "fa-solid fa-weight-scale",
    url: "/v2/tools/bmi/",
    tags: ["bmi", "body", "mass", "index", "health", "weight", "calculator"],
    status: "active"
  },
  {
    id: "days-between",
    name: "Days Between Dates",
    description: "Calculate the number of days, weeks, months, and years between two dates.",
    category: "general",
    icon: "fa-solid fa-calendar-days",
    url: "/v2/tools/datesbetween/",
    tags: ["days", "between", "dates", "calendar", "difference", "calculate"],
    status: "active"
  },
  {
    id: "time-since",
    name: "Time Since Calculator",
    description: "Calculate how much time has passed since or until a specific date with live updates.",
    category: "general",
    icon: "fa-solid fa-hourglass-half",
    url: "/v2/tools/timesince/",
    tags: ["time", "since", "until", "countdown", "elapsed", "date", "calculator"],
    status: "active"
  },
  {
    id: "word-cloud",
    name: "Word Cloud Generator",
    description: "Generate beautiful word clouds from text with customizable colors and layouts.",
    category: "general",
    icon: "fa-solid fa-cloud",
    url: "/v2/tools/wordcloud/",
    tags: ["word", "cloud", "generate", "visualize", "frequency", "text"],
    status: "active"
  },
  {
    id: "alphabetizer",
    name: "Alphabetizer",
    description: "Sort lists alphabetically A-Z, Z-A, by length, remove duplicates, and customize separators.",
    category: "general",
    icon: "fa-solid fa-arrow-down-a-z",
    url: "/v2/tools/alphabetizer/",
    tags: ["sort", "alphabetize", "list", "order", "organize", "text"],
    status: "active"
  },
  {
    id: "reverse-text",
    name: "Reverse Text",
    description: "Reverse text by characters, words, or lines. Create mirror text and upside-down text.",
    category: "general",
    icon: "fa-solid fa-repeat",
    url: "/v2/tools/reversetext/",
    tags: ["reverse", "text", "mirror", "flip", "backwards", "upside-down"],
    status: "active"
  },
  {
    id: "smart-quote",
    name: "Smart Quote Fixer",
    description: "Convert straight quotes to curly quotes, fix apostrophes, em dashes, and ellipsis.",
    category: "general",
    icon: "fa-solid fa-quote-left",
    url: "/v2/tools/smartquote/",
    tags: ["quote", "typography", "curly", "apostrophe", "dash", "ellipsis"],
    status: "active"
  },
  {
    id: "aspect-ratio",
    name: "Aspect Ratio Visualizer",
    description: "Calculate and visualize aspect ratios. Compare common ratios like 16:9, 4:3, and 1:1.",
    category: "general",
    icon: "fa-solid fa-crop",
    url: "/v2/tools/aspectratio/",
    tags: ["aspect", "ratio", "dimension", "width", "height", "video", "image"],
    status: "active"
  },
  {
    id: "grayscale-tester",
    name: "Grayscale Tester",
    description: "Test images in grayscale to check contrast and accessibility.",
    category: "general",
    icon: "fa-solid fa-circle-half-stroke",
    url: "/v2/tools/grayscale/",
    tags: ["grayscale", "image", "contrast", "accessibility", "black", "white"],
    status: "active"
  },
  {
    id: "discount-calculator",
    name: "Discount Calculator",
    description: "Calculate discounted prices, savings, and final amounts with optional tax.",
    category: "general",
    icon: "fa-solid fa-percent",
    url: "/v2/tools/discount/",
    tags: ["discount", "price", "sale", "percent", "savings", "calculator"],
    status: "active"
  },
  {
    id: "duration-adder",
    name: "Time Duration Adder",
    description: "Add and subtract time durations in hours, minutes, and seconds format.",
    category: "general",
    icon: "fa-solid fa-hourglass",
    url: "/v2/tools/duration/",
    tags: ["time", "duration", "add", "subtract", "hours", "minutes", "seconds"],
    status: "active"
  },
  {
    id: "percent-change",
    name: "Percentage Change",
    description: "Calculate percentage increase or decrease between two values.",
    category: "general",
    icon: "fa-solid fa-chart-line",
    url: "/v2/tools/percentchange/",
    tags: ["percent", "change", "increase", "decrease", "difference", "calculator"],
    status: "active"
  },
  {
    id: "interest-calculator",
    name: "Interest Calculator",
    description: "Calculate simple interest on principal amount over time.",
    category: "general",
    icon: "fa-solid fa-coins",
    url: "/v2/tools/interest/",
    tags: ["interest", "simple", "principal", "rate", "time", "finance", "calculator"],
    status: "active"
  },
  {
    id: "roman-numeral",
    name: "Roman Numeral Converter",
    description: "Convert between Roman numerals and Arabic numbers (1-3999).",
    category: "general",
    icon: "fa-solid fa-landmark",
    url: "/v2/tools/romannumeral/",
    tags: ["roman", "numeral", "convert", "number", "arabic", "ancient"],
    status: "active"
  },
  {
    id: "hydration-log",
    name: "Hydration Log",
    description: "Track daily water intake with visual progress and customizable goals.",
    category: "general",
    icon: "fa-solid fa-droplet",
    url: "/v2/tools/hydration/",
    tags: ["water", "hydration", "drink", "health", "tracker", "daily"],
    status: "active"
  },
  {
    id: "dead-pixel-test",
    name: "Dead Pixel Test",
    description: "Test your monitor for dead or stuck pixels with fullscreen color cycling.",
    category: "general",
    icon: "fa-solid fa-display",
    url: "/v2/tools/deadpixel/",
    tags: ["pixel", "dead", "stuck", "monitor", "screen", "test", "display"],
    status: "active"
  },
  {
    id: "coin-toss",
    name: "Coin Toss",
    description: "Virtual coin flip with 3D animation, statistics, and history tracking.",
    category: "general",
    icon: "fa-solid fa-coins",
    url: "/v2/tools/cointoss/",
    tags: ["coin", "flip", "toss", "random", "heads", "tails", "decision"],
    status: "active"
  },
  {
    id: "pali-glossary",
    name: "Pali Glossary",
    description: "Buddhist terminology reference with Pali-English translations and definitions.",
    category: "general",
    icon: "fa-solid fa-om",
    url: "/v2/tools/paliglossary/",
    tags: ["pali", "buddhist", "glossary", "terminology", "dharma", "meditation"],
    status: "active"
  },
  {
    id: "prime-checker",
    name: "Prime Number Checker",
    description: "Check if a number is prime, find factors, and get step-by-step explanations.",
    category: "general",
    icon: "fa-solid fa-hashtag",
    url: "/v2/tools/primechecker/",
    tags: ["prime", "number", "math", "factors", "divisibility", "check"],
    status: "active"
  },
  {
    id: "stopword-remover",
    name: "Stopword Remover",
    description: "Remove common stopwords from text with custom word list support.",
    category: "general",
    icon: "fa-solid fa-filter",
    url: "/v2/tools/stopword/",
    tags: ["stopword", "text", "filter", "remove", "nlp", "clean"],
    status: "active"
  },
  {
    id: "random-generator",
    name: "Random Number Generator",
    description: "Generate crypto-secure random numbers with advanced options and statistics.",
    category: "general",
    icon: "fa-solid fa-shuffle",
    url: "/v2/tools/randomgen/",
    tags: ["random", "number", "generate", "dice", "lottery", "crypto"],
    status: "active"
  },
  {
    id: "glassmorphism",
    name: "Glassmorphism Generator",
    description: "Create glassmorphism UI effects with live preview and CSS code output.",
    category: "general",
    icon: "fa-solid fa-window-restore",
    url: "/v2/tools/glassmorphism/",
    tags: ["glass", "morphism", "ui", "css", "design", "blur", "transparent"],
    status: "active"
  },

  // ==================== DEVELOPER TOOLS ====================
  {
    id: "encoder",
    name: "Encoder & Decoder",
    description: "Encode and decode text with Base64, URL encoding, hash functions, and JWT decoder.",
    category: "developer",
    icon: "fa-solid fa-code",
    url: "/v2/tools/encoder/",
    tags: ["encode", "decode", "base64", "url", "hash", "jwt", "md5", "sha"],
    status: "active"
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and beautify JSON data with syntax highlighting.",
    category: "developer",
    icon: "fa-solid fa-file-code",
    url: "/v2/tools/json/",
    tags: ["json", "format", "validate", "beautify", "data"],
    status: "active"
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    description: "Test and debug regular expressions with real-time matching and explanation.",
    category: "developer",
    icon: "fa-solid fa-asterisk",
    url: "/v2/tools/regex/",
    tags: ["regex", "regular", "expression", "pattern", "match", "test"],
    status: "active"
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    description: "Generate unique identifiers in various formats including UUID v1, v4, and v7.",
    category: "developer",
    icon: "fa-solid fa-fingerprint",
    url: "/v2/tools/uuid/",
    tags: ["uuid", "guid", "unique", "identifier", "generate"],
    status: "active"
  },
  {
    id: "diff-checker",
    name: "Diff Checker",
    description: "Compare two texts and highlight differences with side-by-side view.",
    category: "developer",
    icon: "fa-solid fa-code-compare",
    url: "/v2/tools/diff/",
    tags: ["diff", "compare", "text", "difference", "merge"],
    status: "active"
  },
  {
    id: "markdown-editor",
    name: "Markdown Editor",
    description: "Write and preview markdown with live rendering and export options.",
    category: "developer",
    icon: "fa-brands fa-markdown",
    url: "/v2/tools/markdown/",
    tags: ["markdown", "editor", "preview", "write", "document"],
    status: "active"
  },
  {
    id: "cron-parser",
    name: "Cron Parser",
    description: "Parse and generate cron expressions with human-readable explanations.",
    category: "developer",
    icon: "fa-solid fa-clock",
    url: "/v2/tools/cron/",
    tags: ["cron", "schedule", "parse", "job", "time"],
    status: "active"
  },
  {
    id: "css-generator",
    name: "CSS Generator",
    description: "Generate CSS for gradients, shadows, borders, flexbox, and grid layouts with live preview.",
    category: "developer",
    icon: "fa-brands fa-css3-alt",
    url: "/v2/tools/css/",
    tags: ["css", "gradient", "shadow", "border", "flexbox", "grid", "generator"],
    status: "active"
  },
  {
    id: "code-formatter",
    name: "Code Formatter",
    description: "Beautify and minify HTML, CSS, JavaScript, and JSON code with syntax options.",
    category: "developer",
    icon: "fa-solid fa-wand-magic-sparkles",
    url: "/v2/tools/formatter/",
    tags: ["format", "beautify", "minify", "html", "css", "javascript", "json", "prettier"],
    status: "active"
  },
  {
    id: "favicon-generator",
    name: "Favicon Generator",
    description: "Generate favicons from images with multiple sizes, shapes, and download as ICO or PNG package.",
    category: "developer",
    icon: "fa-solid fa-icons",
    url: "/v2/tools/favicon/",
    tags: ["favicon", "icon", "website", "generate", "ico", "png", "apple-touch"],
    status: "active"
  },
  {
    id: "token-counter",
    name: "Token Counter",
    description: "Count tokens for GPT, Claude, and other LLMs with character and word statistics.",
    category: "developer",
    icon: "fa-solid fa-hashtag",
    url: "/v2/tools/tokencount/",
    tags: ["token", "count", "gpt", "claude", "llm", "ai", "openai", "anthropic"],
    status: "active"
  },
  {
    id: "json-to-table",
    name: "JSON to Table",
    description: "Convert JSON data to HTML tables with sorting, filtering, and export to CSV.",
    category: "developer",
    icon: "fa-solid fa-table",
    url: "/v2/tools/jsontable/",
    tags: ["json", "table", "convert", "csv", "data", "export"],
    status: "active"
  },
  {
    id: "unix-timestamp",
    name: "Unix Timestamp",
    description: "Convert between Unix timestamps and human-readable dates with timezone support.",
    category: "developer",
    icon: "fa-solid fa-clock-rotate-left",
    url: "/v2/tools/timestamp/",
    tags: ["unix", "timestamp", "epoch", "date", "time", "convert", "timezone"],
    status: "active"
  },
  {
    id: "binary-text",
    name: "Binary to Text",
    description: "Convert between binary, text, hexadecimal, and other number systems.",
    category: "developer",
    icon: "fa-solid fa-arrow-right-arrow-left",
    url: "/v2/tools/binarytext/",
    tags: ["binary", "text", "hex", "convert", "decimal", "octal", "ascii"],
    status: "active"
  },
  {
    id: "http-status",
    name: "HTTP Status Reference",
    description: "Complete reference for HTTP status codes with descriptions and examples.",
    category: "developer",
    icon: "fa-solid fa-server",
    url: "/v2/tools/httpstatus/",
    tags: ["http", "status", "code", "reference", "api", "web", "error"],
    status: "active"
  },
  {
    id: "meta-tag",
    name: "Meta Tag Previewer",
    description: "Preview and generate meta tags for SEO with Google, Facebook, Twitter, and LinkedIn previews.",
    category: "developer",
    icon: "fa-solid fa-tags",
    url: "/v2/tools/metatag/",
    tags: ["meta", "tag", "seo", "preview", "og", "twitter", "social"],
    status: "active"
  },
  {
    id: "placeholder-image",
    name: "Placeholder Image",
    description: "Generate SVG placeholder images with custom dimensions, colors, and text.",
    category: "developer",
    icon: "fa-solid fa-image",
    url: "/v2/tools/placeholder/",
    tags: ["placeholder", "image", "svg", "dummy", "mockup", "generate"],
    status: "active"
  },
  {
    id: "font-pairing",
    name: "Font Pairing Playground",
    description: "Test Google Font combinations for headings and body text with live preview.",
    category: "developer",
    icon: "fa-solid fa-font",
    url: "/v2/tools/fontpair/",
    tags: ["font", "pairing", "typography", "google", "heading", "body", "design"],
    status: "active"
  },
  {
    id: "base-converter",
    name: "Number Base Visualizer",
    description: "Convert between binary, octal, decimal, and hex with step-by-step visualization.",
    category: "developer",
    icon: "fa-solid fa-calculator",
    url: "/v2/tools/baseconverter/",
    tags: ["binary", "octal", "decimal", "hex", "convert", "base", "visualize"],
    status: "active"
  },
  {
    id: "matrix-calculator",
    name: "Matrix Calculator",
    description: "Add, subtract, multiply matrices with transpose, determinant, and inverse operations.",
    category: "developer",
    icon: "fa-solid fa-grip",
    url: "/v2/tools/matrixcalc/",
    tags: ["matrix", "calculate", "linear", "algebra", "math", "determinant"],
    status: "active"
  },
  {
    id: "linear-solver",
    name: "Linear Equation Solver",
    description: "Solve systems of linear equations with 1-3 variables using Gaussian elimination.",
    category: "developer",
    icon: "fa-solid fa-superscript",
    url: "/v2/tools/linearsolver/",
    tags: ["linear", "equation", "solve", "algebra", "math", "system"],
    status: "active"
  },
  {
    id: "url-cleaner",
    name: "URL Parameter Cleaner",
    description: "Remove tracking parameters (utm_*, fbclid, gclid) from URLs for cleaner links.",
    category: "developer",
    icon: "fa-solid fa-link-slash",
    url: "/v2/tools/urlcleaner/",
    tags: ["url", "clean", "utm", "tracking", "parameter", "privacy"],
    status: "active"
  },
  {
    id: "header-generator",
    name: "HTTP Header Generator",
    description: "Generate HTTP security headers (CSP, HSTS, X-Frame-Options) with presets.",
    category: "developer",
    icon: "fa-solid fa-shield-halved",
    url: "/v2/tools/headergenerator/",
    tags: ["http", "header", "security", "csp", "hsts", "cors"],
    status: "active"
  },
  {
    id: "cookie-policy",
    name: "Cookie Policy Generator",
    description: "Generate GDPR-compliant cookie policies with customizable templates.",
    category: "developer",
    icon: "fa-solid fa-cookie-bite",
    url: "/v2/tools/cookiepolicy/",
    tags: ["cookie", "policy", "gdpr", "privacy", "legal", "generator"],
    status: "active"
  },

  // ==================== AI & ML TOOLS ====================
  {
    id: "algorithm-visualizer",
    name: "Algorithm Visualizer",
    description: "Visualize sorting algorithms step-by-step with playback controls and statistics.",
    category: "ai",
    icon: "fa-solid fa-chart-bar",
    url: "/v2/tools/algorithmviz/",
    tags: ["algorithm", "sorting", "visualize", "bubble", "quick", "merge", "heap"],
    status: "active"
  },
  {
    id: "bigo-cheatsheet",
    name: "Big-O Cheat Sheet",
    description: "Interactive complexity reference with visual charts and data structure comparisons.",
    category: "ai",
    icon: "fa-solid fa-chart-line",
    url: "/v2/tools/bigocheat/",
    tags: ["bigo", "complexity", "algorithm", "time", "space", "reference"],
    status: "active"
  },
  {
    id: "neural-activation",
    name: "Neural Activation Visualizer",
    description: "Explore activation functions (ReLU, Sigmoid, Tanh, GELU) with interactive charts.",
    category: "ai",
    icon: "fa-solid fa-brain",
    url: "/v2/tools/neuralviz/",
    tags: ["neural", "activation", "relu", "sigmoid", "machine-learning", "deep-learning"],
    status: "active"
  },
  {
    id: "mind-reader",
    name: "Mind Reader",
    description: "Play Rock-Paper-Scissors against an AI that learns your patterns using Markov chains.",
    category: "ai",
    icon: "fa-solid fa-brain",
    url: "/v2/tools/mindreader/",
    tags: ["game", "rps", "ai", "markov", "prediction", "machine-learning"],
    status: "active"
  },
  {
    id: "hill-climber",
    name: "Hill Climber",
    description: "Guide a ball to the lowest point using gradient descent principles. Learn optimization through gameplay!",
    category: "ai",
    icon: "fa-solid fa-mountain",
    url: "/v2/tools/hillclimber/",
    tags: ["game", "physics", "gradient", "descent", "optimization", "machine-learning"],
    status: "active"
  },
  {
    id: "word-association",
    name: "Word Association",
    description: "Guess words semantically related to the target. How close can you get to the meaning?",
    category: "ai",
    icon: "fa-solid fa-spell-check",
    url: "/v2/tools/wordassociation/",
    tags: ["game", "words", "semantic", "similarity", "embedding", "nlp"],
    status: "active"
  },
  {
    id: "kernel-painter",
    name: "Kernel Painter",
    description: "Visualize how convolutional neural networks process images. Draw and apply filters in real-time!",
    category: "ai",
    icon: "fa-solid fa-paintbrush",
    url: "/v2/tools/kernelpainter/",
    tags: ["game", "cnn", "convolution", "filter", "image", "machine-learning"],
    status: "active"
  },
  {
    id: "critter-evolution",
    name: "Critter Evolution",
    description: "Watch creatures evolve through natural selection. Guide evolution by changing the environment!",
    category: "ai",
    icon: "fa-solid fa-dna",
    url: "/v2/tools/evolution/",
    tags: ["game", "evolution", "genetic", "algorithm", "simulation", "biology"],
    status: "active"
  },

  // ==================== FOR FUN ====================
  {
    id: "typing-test",
    name: "Typing Speed Test",
    description: "Measure your typing speed in WPM with accuracy tracking and difficulty levels.",
    category: "fun",
    icon: "fa-solid fa-keyboard",
    url: "/v2/tools/typingtest/",
    tags: ["typing", "speed", "wpm", "test", "accuracy", "practice"],
    status: "active"
  },
  {
    id: "memory-match",
    name: "Memory Card Match",
    description: "Classic card matching game with multiple themes, scoring, and best times.",
    category: "fun",
    icon: "fa-solid fa-clone",
    url: "/v2/tools/memorymatch/",
    tags: ["memory", "game", "cards", "match", "puzzle", "brain"],
    status: "active"
  },
  {
    id: "reaction-time",
    name: "Reaction Time Tester",
    description: "Test your reaction speed with visual and audio cues. Compare against averages!",
    category: "fun",
    icon: "fa-solid fa-bolt",
    url: "/v2/tools/reactiontest/",
    tags: ["reaction", "time", "speed", "test", "reflex", "game"],
    status: "active"
  },
  {
    id: "game-2048",
    name: "2048 Game",
    description: "Classic sliding puzzle game with variable grid sizes (3x3 to 6x6) and undo support.",
    category: "fun",
    icon: "fa-solid fa-gamepad",
    url: "/v2/tools/game2048/",
    tags: ["2048", "game", "puzzle", "numbers", "slide", "merge"],
    status: "active"
  },
  {
    id: "logic-puzzle",
    name: "Logic Grid Puzzle",
    description: "Solve classic logic puzzles using deduction and elimination on a grid.",
    category: "fun",
    icon: "fa-solid fa-puzzle-piece",
    url: "/v2/tools/logicgrid/",
    tags: ["logic", "puzzle", "grid", "deduction", "brain", "game"],
    status: "active"
  },
  {
    id: "entanglement",
    name: "Entanglement Puzzle",
    description: "Toggle tiles and their entangled partners to solve quantum-inspired puzzles.",
    category: "fun",
    icon: "fa-solid fa-atom",
    url: "/v2/tools/entanglement/",
    tags: ["game", "puzzle", "quantum", "tiles", "logic", "strategy"],
    status: "active"
  },
  {
    id: "maze-runner",
    name: "Maze Runner",
    description: "Navigate through a 3D maze using CSS transforms. Find the exit before time runs out!",
    category: "fun",
    icon: "fa-solid fa-cube",
    url: "/v2/tools/mazerunner/",
    tags: ["game", "maze", "3d", "css", "navigation", "puzzle"],
    status: "active"
  },
  {
    id: "ascii-dungeon",
    name: "ASCII Dungeon",
    description: "Explore procedurally generated dungeons in this text-based roguelike adventure.",
    category: "fun",
    icon: "fa-solid fa-dungeon",
    url: "/v2/tools/asciidungeon/",
    tags: ["game", "roguelike", "ascii", "dungeon", "adventure", "rpg"],
    status: "active"
  },
  {
    id: "color-hunter",
    name: "Color Hunter",
    description: "Guess the hexadecimal color code! Test your color perception and hex knowledge.",
    category: "fun",
    icon: "fa-solid fa-palette",
    url: "/v2/tools/colorhunter/",
    tags: ["game", "color", "hex", "rgb", "guess", "perception"],
    status: "active"
  },
  {
    id: "bit-shift-defuser",
    name: "Bit-Shift Defuser",
    description: "Defuse the binary bomb using bitwise operations! Learn bit manipulation through gameplay.",
    category: "fun",
    icon: "fa-solid fa-bomb",
    url: "/v2/tools/bitshift/",
    tags: ["game", "binary", "bitwise", "puzzle", "programming", "logic"],
    status: "active"
  }
];

// Category labels
const categoryLabels = {
  'all': 'All Tools',
  'general': 'General',
  'developer': 'Developer',
  'ai': 'AI & ML',
  'fun': 'For Fun'
};
