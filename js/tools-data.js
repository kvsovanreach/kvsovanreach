/**
 * Tools Data
 * JSON-based metadata for all tools
 *
 * Status options:
 * - "active": Tool is shown on tools.html and fully functional (clickable)
 * - "inactive": Tool is hidden from tools.html completely
 * - "inactive": Tool is shown on tools.html but disabled with "Coming Soon" badge
 */

const toolsData = [
  // ==================== GENERAL TOOLS ====================
  {
    id: "calculator",
    name: "Calculator",
    description: "A powerful calculator with scientific functions, unit conversion, and calculation history.",
    category: "general",
    icon: "fa-solid fa-calculator",
    url: "/tools/calculator/",
    tags: ["math", "calculate", "scientific", "convert", "unit", "numbers"],
    status: "inactive"
  },
  {
    id: "colorpicker",
    name: "Color Picker",
    description: "Create color palettes, extract colors from images, and check color accessibility.",
    category: "general",
    icon: "fa-solid fa-palette",
    url: "/tools/colorpicker/",
    tags: ["color", "palette", "design", "hex", "rgb", "hsl", "accessibility"],
    status: "active"
  },
  {
    id: "qrcode",
    name: "QR Code Tool",
    description: "Generate, scan, and manage QR codes with customization options and batch processing.",
    category: "general",
    icon: "fa-solid fa-qrcode",
    url: "/tools/qrcode/",
    tags: ["qr", "barcode", "scan", "generate", "link"],
    status: "active"
  },
  {
    id: "luckydraw",
    name: "Lucky Draw",
    description: "Create custom spinning wheels for random selection, giveaways, and decision making.",
    category: "general",
    icon: "fa-solid fa-dharmachakra",
    url: "/tools/luckydraw/",
    tags: ["wheel", "spin", "random", "picker", "lottery", "giveaway"],
    status: "inactive"
  },
  {
    id: "password-generator",
    name: "Password Generator",
    description: "Generate secure, random passwords with customizable length and character options.",
    category: "general",
    icon: "fa-solid fa-key",
    url: "/tools/password/",
    tags: ["password", "security", "generate", "random", "strong"],
    status: "inactive"
  },
  {
    id: "timer-stopwatch",
    name: "Timer & Stopwatch",
    description: "Track time with countdown timers, stopwatch, and lap recording features.",
    category: "general",
    icon: "fa-solid fa-stopwatch",
    url: "/tools/timer/",
    tags: ["timer", "stopwatch", "countdown", "time", "clock"],
    status: "inactive"
  },
  {
    id: "notes",
    name: "Quick Notes",
    description: "Take quick notes with markdown support and local storage persistence.",
    category: "general",
    icon: "fa-solid fa-note-sticky",
    url: "/tools/quicknote/",
    tags: ["notes", "markdown", "text", "write", "memo"],
    status: "inactive"
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    description: "Convert between various units of measurement including length, weight, and temperature.",
    category: "general",
    icon: "fa-solid fa-arrows-rotate",
    url: "/tools/unitconverter/",
    tags: ["convert", "unit", "length", "weight", "temperature", "measurement"],
    status: "inactive"
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    description: "Compress and optimize images while maintaining quality for faster web loading.",
    category: "general",
    icon: "fa-solid fa-file-zipper",
    url: "/tools/image/",
    tags: ["image", "compress", "optimize", "resize", "photo"],
    status: "inactive"
  },
  {
    id: "text-cleaner",
    name: "Text Cleaner",
    description: "Clean and transform text with operations like removing duplicates, sorting, and case conversion.",
    category: "general",
    icon: "fa-solid fa-broom",
    url: "/tools/textcleaner/",
    tags: ["text", "clean", "sort", "duplicate", "trim", "case", "transform"],
    status: "inactive"
  },
  {
    id: "emoji-picker",
    name: "Emoji Picker",
    description: "Search and copy emojis with categories, skin tone variants, and recent history.",
    category: "general",
    icon: "fa-solid fa-face-smile",
    url: "/tools/emoji/",
    tags: ["emoji", "emoticon", "smiley", "copy", "unicode", "symbol"],
    status: "inactive"
  },
  {
    id: "checklist-maker",
    name: "Checklist Maker",
    description: "Create, manage, and export checklists with drag-and-drop reordering and local storage.",
    category: "general",
    icon: "fa-solid fa-list-check",
    url: "/tools/checklist/",
    tags: ["checklist", "todo", "task", "list", "organize", "productivity"],
    status: "inactive"
  },
  {
    id: "case-converter",
    name: "Case Converter",
    description: "Convert text between different cases: uppercase, lowercase, title case, camelCase, and more.",
    category: "general",
    icon: "fa-solid fa-font",
    url: "/tools/caseconverter/",
    tags: ["case", "convert", "uppercase", "lowercase", "camel", "snake", "title"],
    status: "inactive"
  },
  {
    id: "morse-code",
    name: "Morse Code",
    description: "Encode and decode Morse code with audio playback and visual representation.",
    category: "general",
    icon: "fa-solid fa-signal",
    url: "/tools/morse/",
    tags: ["morse", "code", "encode", "decode", "audio", "signal"],
    status: "inactive"
  },
  {
    id: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder text in paragraphs, sentences, or words with various styles.",
    category: "general",
    icon: "fa-solid fa-paragraph",
    url: "/tools/loremipsum/",
    tags: ["lorem", "ipsum", "placeholder", "text", "generate", "dummy"],
    status: "inactive"
  },
  {
    id: "browser-info",
    name: "Browser Info",
    description: "View detailed information about your browser, device, screen, and network.",
    category: "general",
    icon: "fa-solid fa-globe",
    url: "/tools/browserinfo/",
    tags: ["browser", "info", "device", "screen", "network", "user-agent"],
    status: "inactive"
  },
  {
    id: "whitespace-stripper",
    name: "Whitespace Stripper",
    description: "Remove extra whitespace, trim lines, and clean up text formatting.",
    category: "general",
    icon: "fa-solid fa-eraser",
    url: "/tools/whitespace/",
    tags: ["whitespace", "strip", "trim", "clean", "space", "text"],
    status: "inactive"
  },
  {
    id: "bmi-calculator",
    name: "BMI Calculator",
    description: "Calculate Body Mass Index with health recommendations and weight categories.",
    category: "general",
    icon: "fa-solid fa-weight-scale",
    url: "/tools/bmi/",
    tags: ["bmi", "body", "mass", "index", "health", "weight", "calculator"],
    status: "inactive"
  },
  {
    id: "days-between",
    name: "Days Between Dates",
    description: "Calculate the number of days, weeks, months, and years between two dates.",
    category: "general",
    icon: "fa-solid fa-calendar-days",
    url: "/tools/datesbetween/",
    tags: ["days", "between", "dates", "calendar", "difference", "calculate"],
    status: "inactive"
  },
  {
    id: "time-since",
    name: "Time Since Calculator",
    description: "Calculate how much time has passed since or until a specific date with live updates.",
    category: "general",
    icon: "fa-solid fa-hourglass-half",
    url: "/tools/timesince/",
    tags: ["time", "since", "until", "countdown", "elapsed", "date", "calculator"],
    status: "inactive"
  },
  {
    id: "word-cloud",
    name: "Word Cloud Generator",
    description: "Generate beautiful word clouds from text with customizable colors and layouts.",
    category: "general",
    icon: "fa-solid fa-cloud",
    url: "/tools/wordcloud/",
    tags: ["word", "cloud", "generate", "visualize", "frequency", "text"],
    status: "inactive"
  },
  {
    id: "alphabetizer",
    name: "Alphabetizer",
    description: "Sort lists alphabetically A-Z, Z-A, by length, remove duplicates, and customize separators.",
    category: "general",
    icon: "fa-solid fa-arrow-down-a-z",
    url: "/tools/alphabetizer/",
    tags: ["sort", "alphabetize", "list", "order", "organize", "text"],
    status: "inactive"
  },
  {
    id: "reverse-text",
    name: "Reverse Text",
    description: "Reverse text by characters, words, or lines. Create mirror text and upside-down text.",
    category: "general",
    icon: "fa-solid fa-repeat",
    url: "/tools/reversetext/",
    tags: ["reverse", "text", "mirror", "flip", "backwards", "upside-down"],
    status: "inactive"
  },
  {
    id: "smart-quote",
    name: "Smart Quote Fixer",
    description: "Convert straight quotes to curly quotes, fix apostrophes, em dashes, and ellipsis.",
    category: "general",
    icon: "fa-solid fa-quote-left",
    url: "/tools/smartquote/",
    tags: ["quote", "typography", "curly", "apostrophe", "dash", "ellipsis"],
    status: "inactive"
  },
  {
    id: "aspect-ratio",
    name: "Aspect Ratio Visualizer",
    description: "Calculate and visualize aspect ratios. Compare common ratios like 16:9, 4:3, and 1:1.",
    category: "general",
    icon: "fa-solid fa-crop",
    url: "/tools/aspectratio/",
    tags: ["aspect", "ratio", "dimension", "width", "height", "video", "image"],
    status: "inactive"
  },
  {
    id: "grayscale-tester",
    name: "Grayscale Tester",
    description: "Test images in grayscale to check contrast and accessibility.",
    category: "general",
    icon: "fa-solid fa-circle-half-stroke",
    url: "/tools/grayscale/",
    tags: ["grayscale", "image", "contrast", "accessibility", "black", "white"],
    status: "inactive"
  },
  {
    id: "discount-calculator",
    name: "Discount Calculator",
    description: "Calculate discounted prices, savings, and final amounts with optional tax.",
    category: "general",
    icon: "fa-solid fa-percent",
    url: "/tools/discount/",
    tags: ["discount", "price", "sale", "percent", "savings", "calculator"],
    status: "inactive"
  },
  {
    id: "duration-adder",
    name: "Time Duration Adder",
    description: "Add and subtract time durations in hours, minutes, and seconds format.",
    category: "general",
    icon: "fa-solid fa-hourglass",
    url: "/tools/duration/",
    tags: ["time", "duration", "add", "subtract", "hours", "minutes", "seconds"],
    status: "inactive"
  },
  {
    id: "percent-change",
    name: "Percentage Change",
    description: "Calculate percentage increase or decrease between two values.",
    category: "general",
    icon: "fa-solid fa-chart-line",
    url: "/tools/percentchange/",
    tags: ["percent", "change", "increase", "decrease", "difference", "calculator"],
    status: "inactive"
  },
  {
    id: "interest-calculator",
    name: "Interest Calculator",
    description: "Calculate simple interest on principal amount over time.",
    category: "general",
    icon: "fa-solid fa-coins",
    url: "/tools/interest/",
    tags: ["interest", "simple", "principal", "rate", "time", "finance", "calculator"],
    status: "inactive"
  },
  {
    id: "roman-numeral",
    name: "Roman Numeral Converter",
    description: "Convert between Roman numerals and Arabic numbers (1-3999).",
    category: "general",
    icon: "fa-solid fa-landmark",
    url: "/tools/romannumeral/",
    tags: ["roman", "numeral", "convert", "number", "arabic", "ancient"],
    status: "inactive"
  },
  {
    id: "hydration-log",
    name: "Hydration Log",
    description: "Track daily water intake with visual progress and customizable goals.",
    category: "general",
    icon: "fa-solid fa-droplet",
    url: "/tools/hydration/",
    tags: ["water", "hydration", "drink", "health", "tracker", "daily"],
    status: "inactive"
  },
  {
    id: "dead-pixel-test",
    name: "Dead Pixel Test",
    description: "Test your monitor for dead or stuck pixels with fullscreen color cycling.",
    category: "general",
    icon: "fa-solid fa-display",
    url: "/tools/deadpixel/",
    tags: ["pixel", "dead", "stuck", "monitor", "screen", "test", "display"],
    status: "inactive"
  },
  {
    id: "coin-toss",
    name: "Coin Toss",
    description: "Virtual coin flip with 3D animation, statistics, and history tracking.",
    category: "general",
    icon: "fa-solid fa-coins",
    url: "/tools/cointoss/",
    tags: ["coin", "flip", "toss", "random", "heads", "tails", "decision"],
    status: "inactive"
  },
  {
    id: "pali-glossary",
    name: "Pali Glossary",
    description: "Buddhist terminology reference with Pali-English translations and definitions.",
    category: "general",
    icon: "fa-solid fa-om",
    url: "/tools/paliglossary/",
    tags: ["pali", "buddhist", "glossary", "terminology", "dharma", "meditation"],
    status: "inactive"
  },
  {
    id: "prime-checker",
    name: "Prime Number Checker",
    description: "Check if a number is prime, find factors, and get step-by-step explanations.",
    category: "general",
    icon: "fa-solid fa-hashtag",
    url: "/tools/primechecker/",
    tags: ["prime", "number", "math", "factors", "divisibility", "check"],
    status: "inactive"
  },
  {
    id: "stopword-remover",
    name: "Stopword Remover",
    description: "Remove common stopwords from text with custom word list support.",
    category: "general",
    icon: "fa-solid fa-filter",
    url: "/tools/stopword/",
    tags: ["stopword", "text", "filter", "remove", "nlp", "clean"],
    status: "inactive"
  },
  {
    id: "random-generator",
    name: "Random Number Generator",
    description: "Generate crypto-secure random numbers with advanced options and statistics.",
    category: "general",
    icon: "fa-solid fa-shuffle",
    url: "/tools/randomgen/",
    tags: ["random", "number", "generate", "dice", "lottery", "crypto"],
    status: "inactive"
  },
  {
    id: "glassmorphism",
    name: "Glassmorphism Generator",
    description: "Create glassmorphism UI effects with live preview and CSS code output.",
    category: "general",
    icon: "fa-solid fa-window-restore",
    url: "/tools/glassmorphism/",
    tags: ["glass", "morphism", "ui", "css", "design", "blur", "transparent"],
    status: "inactive"
  },

  // ==================== DEVELOPER TOOLS ====================
  {
    id: "encoder",
    name: "Encoder & Decoder",
    description: "Encode and decode text with Base64, URL encoding, hash functions, and JWT decoder.",
    category: "developer",
    icon: "fa-solid fa-code",
    url: "/tools/encoder/",
    tags: ["encode", "decode", "base64", "url", "hash", "jwt", "md5", "sha"],
    status: "inactive"
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and beautify JSON data with syntax highlighting.",
    category: "developer",
    icon: "fa-solid fa-file-code",
    url: "/tools/json/",
    tags: ["json", "format", "validate", "beautify", "data"],
    status: "inactive"
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    description: "Test and debug regular expressions with real-time matching and explanation.",
    category: "developer",
    icon: "fa-solid fa-asterisk",
    url: "/tools/regex/",
    tags: ["regex", "regular", "expression", "pattern", "match", "test"],
    status: "inactive"
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    description: "Generate unique identifiers in various formats including UUID v1, v4, and v7.",
    category: "developer",
    icon: "fa-solid fa-fingerprint",
    url: "/tools/uuid/",
    tags: ["uuid", "guid", "unique", "identifier", "generate"],
    status: "inactive"
  },
  {
    id: "diff-checker",
    name: "Diff Checker",
    description: "Compare two texts and highlight differences with side-by-side view.",
    category: "developer",
    icon: "fa-solid fa-code-compare",
    url: "/tools/diff/",
    tags: ["diff", "compare", "text", "difference", "merge"],
    status: "inactive"
  },
  {
    id: "markdown-editor",
    name: "Markdown Editor",
    description: "Write and preview markdown with live rendering and export options.",
    category: "developer",
    icon: "fa-brands fa-markdown",
    url: "/tools/markdown/",
    tags: ["markdown", "editor", "preview", "write", "document"],
    status: "inactive"
  },
  {
    id: "cron-parser",
    name: "Cron Parser",
    description: "Parse and generate cron expressions with human-readable explanations.",
    category: "developer",
    icon: "fa-solid fa-clock",
    url: "/tools/cron/",
    tags: ["cron", "schedule", "parse", "job", "time"],
    status: "inactive"
  },
  {
    id: "css-generator",
    name: "CSS Generator",
    description: "Generate CSS for gradients, shadows, borders, flexbox, and grid layouts with live preview.",
    category: "developer",
    icon: "fa-brands fa-css3-alt",
    url: "/tools/css/",
    tags: ["css", "gradient", "shadow", "border", "flexbox", "grid", "generator"],
    status: "inactive"
  },
  {
    id: "code-formatter",
    name: "Code Formatter",
    description: "Beautify and minify HTML, CSS, JavaScript, and JSON code with syntax options.",
    category: "developer",
    icon: "fa-solid fa-wand-magic-sparkles",
    url: "/tools/formatter/",
    tags: ["format", "beautify", "minify", "html", "css", "javascript", "json", "prettier"],
    status: "inactive"
  },
  {
    id: "favicon-generator",
    name: "Favicon Generator",
    description: "Generate favicons from images with multiple sizes, shapes, and download as ICO or PNG package.",
    category: "developer",
    icon: "fa-solid fa-icons",
    url: "/tools/favicon/",
    tags: ["favicon", "icon", "website", "generate", "ico", "png", "apple-touch"],
    status: "inactive"
  },
  {
    id: "token-counter",
    name: "Token Counter",
    description: "Count tokens for GPT, Claude, and other LLMs with character and word statistics.",
    category: "developer",
    icon: "fa-solid fa-hashtag",
    url: "/tools/tokencount/",
    tags: ["token", "count", "gpt", "claude", "llm", "ai", "openai", "anthropic"],
    status: "inactive"
  },
  {
    id: "json-to-table",
    name: "JSON to Table",
    description: "Convert JSON data to HTML tables with sorting, filtering, and export to CSV.",
    category: "developer",
    icon: "fa-solid fa-table",
    url: "/tools/jsontable/",
    tags: ["json", "table", "convert", "csv", "data", "export"],
    status: "inactive"
  },
  {
    id: "unix-timestamp",
    name: "Unix Timestamp",
    description: "Convert between Unix timestamps and human-readable dates with timezone support.",
    category: "developer",
    icon: "fa-solid fa-clock-rotate-left",
    url: "/tools/timestamp/",
    tags: ["unix", "timestamp", "epoch", "date", "time", "convert", "timezone"],
    status: "inactive"
  },
  {
    id: "binary-text",
    name: "Binary to Text",
    description: "Convert between binary, text, hexadecimal, and other number systems.",
    category: "developer",
    icon: "fa-solid fa-arrow-right-arrow-left",
    url: "/tools/binarytext/",
    tags: ["binary", "text", "hex", "convert", "decimal", "octal", "ascii"],
    status: "inactive"
  },
  {
    id: "http-status",
    name: "HTTP Status Reference",
    description: "Complete reference for HTTP status codes with descriptions and examples.",
    category: "developer",
    icon: "fa-solid fa-server",
    url: "/tools/httpstatus/",
    tags: ["http", "status", "code", "reference", "api", "web", "error"],
    status: "inactive"
  },
  {
    id: "meta-tag",
    name: "Meta Tag Previewer",
    description: "Preview and generate meta tags for SEO with Google, Facebook, Twitter, and LinkedIn previews.",
    category: "developer",
    icon: "fa-solid fa-tags",
    url: "/tools/metatag/",
    tags: ["meta", "tag", "seo", "preview", "og", "twitter", "social"],
    status: "inactive"
  },
  {
    id: "placeholder-image",
    name: "Placeholder Image",
    description: "Generate SVG placeholder images with custom dimensions, colors, and text.",
    category: "developer",
    icon: "fa-solid fa-image",
    url: "/tools/placeholder/",
    tags: ["placeholder", "image", "svg", "dummy", "mockup", "generate"],
    status: "inactive"
  },
  {
    id: "font-pairing",
    name: "Font Pairing Playground",
    description: "Test Google Font combinations for headings and body text with live preview.",
    category: "developer",
    icon: "fa-solid fa-font",
    url: "/tools/fontpair/",
    tags: ["font", "pairing", "typography", "google", "heading", "body", "design"],
    status: "inactive"
  },
  {
    id: "base-converter",
    name: "Number Base Visualizer",
    description: "Convert between binary, octal, decimal, and hex with step-by-step visualization.",
    category: "developer",
    icon: "fa-solid fa-calculator",
    url: "/tools/baseconverter/",
    tags: ["binary", "octal", "decimal", "hex", "convert", "base", "visualize"],
    status: "inactive"
  },
  {
    id: "matrix-calculator",
    name: "Matrix Calculator",
    description: "Add, subtract, multiply matrices with transpose, determinant, and inverse operations.",
    category: "developer",
    icon: "fa-solid fa-grip",
    url: "/tools/matrixcalc/",
    tags: ["matrix", "calculate", "linear", "algebra", "math", "determinant"],
    status: "inactive"
  },
  {
    id: "linear-solver",
    name: "Linear Equation Solver",
    description: "Solve systems of linear equations with 1-3 variables using Gaussian elimination.",
    category: "developer",
    icon: "fa-solid fa-superscript",
    url: "/tools/linearsolver/",
    tags: ["linear", "equation", "solve", "algebra", "math", "system"],
    status: "inactive"
  },
  {
    id: "url-cleaner",
    name: "URL Parameter Cleaner",
    description: "Remove tracking parameters (utm_*, fbclid, gclid) from URLs for cleaner links.",
    category: "developer",
    icon: "fa-solid fa-link-slash",
    url: "/tools/urlcleaner/",
    tags: ["url", "clean", "utm", "tracking", "parameter", "privacy"],
    status: "inactive"
  },
  {
    id: "header-generator",
    name: "HTTP Header Generator",
    description: "Generate HTTP security headers (CSP, HSTS, X-Frame-Options) with presets.",
    category: "developer",
    icon: "fa-solid fa-shield-halved",
    url: "/tools/headergenerator/",
    tags: ["http", "header", "security", "csp", "hsts", "cors"],
    status: "inactive"
  },
  {
    id: "cookie-policy",
    name: "Cookie Policy Generator",
    description: "Generate GDPR-compliant cookie policies with customizable templates.",
    category: "developer",
    icon: "fa-solid fa-cookie-bite",
    url: "/tools/cookiepolicy/",
    tags: ["cookie", "policy", "gdpr", "privacy", "legal", "generator"],
    status: "inactive"
  },
  {
    id: "sentence-length",
    name: "Sentence Length Analyzer",
    description: "Visualize sentence length distribution in text with charts and statistics.",
    category: "developer",
    icon: "fa-solid fa-chart-simple",
    url: "/tools/sentencelength/",
    tags: ["sentence", "length", "analyze", "text", "distribution", "writing"],
    status: "inactive"
  },
  {
    id: "repetition-heatmap",
    name: "Repetition Heatmap",
    description: "Visualize repeated words and phrases in text using heat colors.",
    category: "developer",
    icon: "fa-solid fa-fire",
    url: "/tools/repetitionheatmap/",
    tags: ["repetition", "heatmap", "words", "phrases", "text", "analysis"],
    status: "inactive"
  },
  {
    id: "api-request-flow",
    name: "API Request Flow Builder",
    description: "Draw and visualize client-side API request sequences with interactive diagrams.",
    category: "developer",
    icon: "fa-solid fa-diagram-project",
    url: "/tools/apirequestflow/",
    tags: ["api", "request", "flow", "diagram", "sequence", "http"],
    status: "inactive"
  },
  {
    id: "json-schema-viz",
    name: "JSON Schema Visualizer",
    description: "Convert JSON schemas into expandable visual trees for easy exploration.",
    category: "developer",
    icon: "fa-solid fa-sitemap",
    url: "/tools/jsonschema/",
    tags: ["json", "schema", "visualize", "tree", "structure", "data"],
    status: "inactive"
  },
  {
    id: "http-lifecycle",
    name: "HTTP Lifecycle Visualizer",
    description: "Visualize each stage of an HTTP request flow from DNS to response.",
    category: "developer",
    icon: "fa-solid fa-arrows-spin",
    url: "/tools/httplifecycle/",
    tags: ["http", "request", "lifecycle", "dns", "tcp", "tls", "response"],
    status: "inactive"
  },
  {
    id: "naming-convention",
    name: "Naming Convention Checker",
    description: "Validate variable and function naming consistency across different conventions.",
    category: "developer",
    icon: "fa-solid fa-spell-check",
    url: "/tools/namingconvention/",
    tags: ["naming", "convention", "camelCase", "snake_case", "validate", "code"],
    status: "inactive"
  },
  {
    id: "file-metadata",
    name: "File Metadata Viewer",
    description: "Inspect file metadata like size, type, and dates directly in the browser.",
    category: "developer",
    icon: "fa-solid fa-file-lines",
    url: "/tools/filemetadata/",
    tags: ["file", "metadata", "inspect", "size", "type", "properties"],
    status: "inactive"
  },
  {
    id: "filename-normalizer",
    name: "Filename Normalizer",
    description: "Preview and standardize filenames before renaming with custom rules.",
    category: "developer",
    icon: "fa-solid fa-file-signature",
    url: "/tools/filenamenormalizer/",
    tags: ["filename", "normalize", "rename", "batch", "standardize"],
    status: "inactive"
  },
  {
    id: "csv-schema",
    name: "CSV Schema Explorer",
    description: "Explore column types, structure, and statistics of CSV files.",
    category: "developer",
    icon: "fa-solid fa-file-csv",
    url: "/tools/csvschema/",
    tags: ["csv", "schema", "columns", "data", "explore", "structure"],
    status: "inactive"
  },
  {
    id: "data-structure",
    name: "Data Structure Playground",
    description: "Interactively visualize stacks, queues, trees, and graphs with operations.",
    category: "developer",
    icon: "fa-solid fa-layer-group",
    url: "/tools/datastructure/",
    tags: ["data", "structure", "stack", "queue", "tree", "graph", "visualize"],
    status: "inactive"
  },
  {
    id: "sorting-visualizer",
    name: "Sorting Algorithm Visualizer",
    description: "Watch how different sorting algorithms rearrange elements over time.",
    category: "developer",
    icon: "fa-solid fa-sort",
    url: "/tools/sortingvisualizer/",
    tags: ["sorting", "algorithm", "bubble", "quick", "merge", "visualize"],
    status: "inactive"
  },
  {
    id: "search-explorer",
    name: "Search Algorithm Explorer",
    description: "Visualize linear, binary, and graph search processes step by step.",
    category: "developer",
    icon: "fa-solid fa-magnifying-glass-chart",
    url: "/tools/searchexplorer/",
    tags: ["search", "algorithm", "binary", "linear", "graph", "visualize"],
    status: "inactive"
  },
  {
    id: "graph-traversal",
    name: "Graph Traversal Visualizer",
    description: "Animate DFS, BFS, and shortest-path traversals on interactive graphs.",
    category: "developer",
    icon: "fa-solid fa-share-nodes",
    url: "/tools/graphtraversal/",
    tags: ["graph", "traversal", "dfs", "bfs", "dijkstra", "algorithm"],
    status: "inactive"
  },
  {
    id: "memory-visualizer",
    name: "Memory Allocation Visualizer",
    description: "Illustrate stack vs heap memory usage with interactive concepts.",
    category: "developer",
    icon: "fa-solid fa-memory",
    url: "/tools/memoryvisualizer/",
    tags: ["memory", "stack", "heap", "allocation", "visualize", "pointer"],
    status: "inactive"
  },
  {
    id: "git-graph",
    name: "Git Graph Explorer",
    description: "Visualize git branches, merges, and commits with interactive graphs.",
    category: "developer",
    icon: "fa-brands fa-git-alt",
    url: "/tools/gitgraph/",
    tags: ["git", "graph", "branch", "merge", "commit", "version-control"],
    status: "inactive"
  },
  {
    id: "protocol-handshake",
    name: "Protocol Handshake Visualizer",
    description: "Animate TCP, TLS, and authentication handshake sequences.",
    category: "developer",
    icon: "fa-solid fa-handshake",
    url: "/tools/protocolhandshake/",
    tags: ["protocol", "handshake", "tcp", "tls", "ssl", "network"],
    status: "inactive"
  },
  {
    id: "load-balancer",
    name: "Load Balancer Visualizer",
    description: "Visualize request distribution strategies like round-robin and least connections.",
    category: "developer",
    icon: "fa-solid fa-scale-balanced",
    url: "/tools/loadbalancer/",
    tags: ["load", "balancer", "distribution", "round-robin", "server", "network"],
    status: "inactive"
  },

  // ==================== AI & ML TOOLS ====================
  {
    id: "algorithm-visualizer",
    name: "Algorithm Visualizer",
    description: "Visualize sorting algorithms step-by-step with playback controls and statistics.",
    category: "ai",
    icon: "fa-solid fa-chart-bar",
    url: "/tools/algorithmviz/",
    tags: ["algorithm", "sorting", "visualize", "bubble", "quick", "merge", "heap"],
    status: "inactive"
  },
  {
    id: "bigo-cheatsheet",
    name: "Big-O Cheat Sheet",
    description: "Interactive complexity reference with visual charts and data structure comparisons.",
    category: "ai",
    icon: "fa-solid fa-chart-line",
    url: "/tools/bigocheat/",
    tags: ["bigo", "complexity", "algorithm", "time", "space", "reference"],
    status: "inactive"
  },
  {
    id: "neural-activation",
    name: "Neural Activation Visualizer",
    description: "Explore activation functions (ReLU, Sigmoid, Tanh, GELU) with interactive charts.",
    category: "ai",
    icon: "fa-solid fa-brain",
    url: "/tools/neuralviz/",
    tags: ["neural", "activation", "relu", "sigmoid", "machine-learning", "deep-learning"],
    status: "inactive"
  },
  {
    id: "mind-reader",
    name: "Mind Reader",
    description: "Play Rock-Paper-Scissors against an AI that learns your patterns using Markov chains.",
    category: "ai",
    icon: "fa-solid fa-brain",
    url: "/tools/mindreader/",
    tags: ["game", "rps", "ai", "markov", "prediction", "machine-learning"],
    status: "inactive"
  },
  {
    id: "hill-climber",
    name: "Hill Climber",
    description: "Guide a ball to the lowest point using gradient descent principles. Learn optimization through gameplay!",
    category: "ai",
    icon: "fa-solid fa-mountain",
    url: "/tools/hillclimber/",
    tags: ["game", "physics", "gradient", "descent", "optimization", "machine-learning"],
    status: "inactive"
  },
  {
    id: "word-association",
    name: "Word Association",
    description: "Guess words semantically related to the target. How close can you get to the meaning?",
    category: "ai",
    icon: "fa-solid fa-spell-check",
    url: "/tools/wordassociation/",
    tags: ["game", "words", "semantic", "similarity", "embedding", "nlp"],
    status: "inactive"
  },
  {
    id: "kernel-painter",
    name: "Kernel Painter",
    description: "Visualize how convolutional neural networks process images. Draw and apply filters in real-time!",
    category: "ai",
    icon: "fa-solid fa-paintbrush",
    url: "/tools/kernelpainter/",
    tags: ["game", "cnn", "convolution", "filter", "image", "machine-learning"],
    status: "inactive"
  },
  {
    id: "critter-evolution",
    name: "Critter Evolution",
    description: "Watch creatures evolve through natural selection. Guide evolution by changing the environment!",
    category: "ai",
    icon: "fa-solid fa-dna",
    url: "/tools/evolution/",
    tags: ["game", "evolution", "genetic", "algorithm", "simulation", "biology"],
    status: "inactive"
  },
  {
    id: "cot-mapper",
    name: "Chain-of-Thought Mapper",
    description: "Map reasoning steps as a visual flow diagram for AI thought processes.",
    category: "ai",
    icon: "fa-solid fa-route",
    url: "/tools/cotmapper/",
    tags: ["chain-of-thought", "reasoning", "flow", "diagram", "ai", "llm"],
    status: "inactive"
  },
  {
    id: "rag-pipeline",
    name: "RAG Pipeline Builder",
    description: "Visualize retrieval-augmented generation pipelines with interactive components.",
    category: "ai",
    icon: "fa-solid fa-diagram-next",
    url: "/tools/ragpipeline/",
    tags: ["rag", "retrieval", "augmented", "generation", "pipeline", "ai"],
    status: "inactive"
  },
  {
    id: "metric-selector",
    name: "Evaluation Metric Selector",
    description: "Guide metric selection based on ML task type with recommendations.",
    category: "ai",
    icon: "fa-solid fa-bullseye",
    url: "/tools/metricselector/",
    tags: ["metric", "evaluation", "accuracy", "precision", "recall", "f1", "ml"],
    status: "inactive"
  },
  {
    id: "nn-layer",
    name: "Neural Network Layer Visualizer",
    description: "Display neural network layers, weights, and activations with interactive diagrams.",
    category: "ai",
    icon: "fa-solid fa-network-wired",
    url: "/tools/nnlayer/",
    tags: ["neural", "network", "layer", "weights", "activations", "deep-learning"],
    status: "inactive"
  },
  {
    id: "backprop-viz",
    name: "Backpropagation Visualizer",
    description: "Illustrate gradient flow through network layers with step-by-step animation.",
    category: "ai",
    icon: "fa-solid fa-arrows-left-right",
    url: "/tools/backpropviz/",
    tags: ["backpropagation", "gradient", "neural", "network", "training", "ml"],
    status: "inactive"
  },
  {
    id: "attention-viz",
    name: "Attention Mechanism Visualizer",
    description: "Visualize transformer attention matrices and token relationships.",
    category: "ai",
    icon: "fa-solid fa-eye",
    url: "/tools/attentionviz/",
    tags: ["attention", "transformer", "tokens", "matrix", "nlp", "gpt"],
    status: "inactive"
  },
  {
    id: "embedding-space",
    name: "Embedding Space Explorer",
    description: "Plot word vectors in 2D/3D to illustrate semantic similarity relationships.",
    category: "ai",
    icon: "fa-solid fa-cube",
    url: "/tools/embeddingspace/",
    tags: ["embedding", "vector", "semantic", "similarity", "nlp", "word2vec"],
    status: "inactive"
  },
  {
    id: "dim-reduction",
    name: "Dimensionality Reduction Visualizer",
    description: "Visualize PCA and t-SNE concepts with animated projections.",
    category: "ai",
    icon: "fa-solid fa-compress",
    url: "/tools/dimreduction/",
    tags: ["dimensionality", "reduction", "pca", "tsne", "umap", "ml"],
    status: "inactive"
  },
  {
    id: "class-imbalance",
    name: "Class Imbalance Simulator",
    description: "Explore effects of skewed class distributions on ML model performance.",
    category: "ai",
    icon: "fa-solid fa-scale-unbalanced",
    url: "/tools/classimbalance/",
    tags: ["class", "imbalance", "sampling", "smote", "classification", "ml"],
    status: "inactive"
  },

  // ==================== FOR FUN ====================
  {
    id: "typing-test",
    name: "Typing Speed Test",
    description: "Measure your typing speed in WPM with accuracy tracking and difficulty levels.",
    category: "fun",
    icon: "fa-solid fa-keyboard",
    url: "/tools/typingtest/",
    tags: ["typing", "speed", "wpm", "test", "accuracy", "practice"],
    status: "inactive"
  },
  {
    id: "memory-match",
    name: "Memory Card Match",
    description: "Classic card matching game with multiple themes, scoring, and best times.",
    category: "fun",
    icon: "fa-solid fa-clone",
    url: "/tools/memorymatch/",
    tags: ["memory", "game", "cards", "match", "puzzle", "brain"],
    status: "inactive"
  },
  {
    id: "reaction-time",
    name: "Reaction Time Tester",
    description: "Test your reaction speed with visual and audio cues. Compare against averages!",
    category: "fun",
    icon: "fa-solid fa-bolt",
    url: "/tools/reactiontest/",
    tags: ["reaction", "time", "speed", "test", "reflex", "game"],
    status: "inactive"
  },
  {
    id: "game-2048",
    name: "2048 Game",
    description: "Classic sliding puzzle game with variable grid sizes (3x3 to 6x6) and undo support.",
    category: "fun",
    icon: "fa-solid fa-gamepad",
    url: "/tools/game2048/",
    tags: ["2048", "game", "puzzle", "numbers", "slide", "merge"],
    status: "inactive"
  },
  {
    id: "logic-puzzle",
    name: "Logic Grid Puzzle",
    description: "Solve classic logic puzzles using deduction and elimination on a grid.",
    category: "fun",
    icon: "fa-solid fa-puzzle-piece",
    url: "/tools/logicgrid/",
    tags: ["logic", "puzzle", "grid", "deduction", "brain", "game"],
    status: "inactive"
  },
  {
    id: "entanglement",
    name: "Entanglement Puzzle",
    description: "Toggle tiles and their entangled partners to solve quantum-inspired puzzles.",
    category: "fun",
    icon: "fa-solid fa-atom",
    url: "/tools/entanglement/",
    tags: ["game", "puzzle", "quantum", "tiles", "logic", "strategy"],
    status: "inactive"
  },
  {
    id: "maze-runner",
    name: "Maze Runner",
    description: "Navigate through a 3D maze using CSS transforms. Find the exit before time runs out!",
    category: "fun",
    icon: "fa-solid fa-cube",
    url: "/tools/mazerunner/",
    tags: ["game", "maze", "3d", "css", "navigation", "puzzle"],
    status: "inactive"
  },
  {
    id: "ascii-dungeon",
    name: "ASCII Dungeon",
    description: "Explore procedurally generated dungeons in this text-based roguelike adventure.",
    category: "fun",
    icon: "fa-solid fa-dungeon",
    url: "/tools/asciidungeon/",
    tags: ["game", "roguelike", "ascii", "dungeon", "adventure", "rpg"],
    status: "inactive"
  },
  {
    id: "color-hunter",
    name: "Color Hunter",
    description: "Guess the hexadecimal color code! Test your color perception and hex knowledge.",
    category: "fun",
    icon: "fa-solid fa-palette",
    url: "/tools/colorhunter/",
    tags: ["game", "color", "hex", "rgb", "guess", "perception"],
    status: "inactive"
  },
  {
    id: "bit-shift-defuser",
    name: "Bit-Shift Defuser",
    description: "Defuse the binary bomb using bitwise operations! Learn bit manipulation through gameplay.",
    category: "fun",
    icon: "fa-solid fa-bomb",
    url: "/tools/bitshift/",
    tags: ["game", "binary", "bitwise", "puzzle", "programming", "logic"],
    status: "inactive"
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
