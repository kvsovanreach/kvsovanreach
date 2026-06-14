/**
 * ASCII Art Generator
 * KVSOVANREACH Tools
 *
 * Pure JS figlet-like renderer with multiple font styles + image-to-ASCII converter.
 */
(function () {
  'use strict';

  /* ==================================================================
   * FONT DEFINITIONS
   * Each character maps to an array of strings (lines).
   * We define A-Z, 0-9, space, and common punctuation for each font.
   * ================================================================== */

  function makeFont(height, charMap) {
    return { height: height, chars: charMap };
  }

  // Helper: create a character map from a compact definition
  // Letters are defined as template strings split by \n

  /* ---------- Standard (5 high) ---------- */
  const STANDARD = makeFont(5, {
    'A': [' ___ ', '|   |', '|___|', '|   |', '|   |'],
    'B': ['___ ', '|  \\', '|__/', '|  \\', '|__/'],
    'C': [' ___', '|   ', '|   ', '|   ', ' ___'],
    'D': ['___ ', '|  \\', '|   |', '|  /', '|_/ '],
    'E': ['____', '|   ', '|__ ', '|   ', '____'],
    'F': ['____', '|   ', '|__ ', '|   ', '|   '],
    'G': [' ____', '|    ', '| __ ', '|   |', ' ___|'],
    'H': ['|   |', '|   |', '|___|', '|   |', '|   |'],
    'I': ['___', ' | ', ' | ', ' | ', '___'],
    'J': ['  __|', '    |', '    |', '|   |', ' __ '],
    'K': ['|  /', '| / ', '|/  ', '|\\ ', '| \\'],
    'L': ['|   ', '|   ', '|   ', '|   ', '|___'],
    'M': ['|   |', '|\\./|', '| V |', '|   |', '|   |'],
    'N': ['|\\  |', '| \\ |', '|  \\|', '|   |', '|   |'],
    'O': [' ___ ', '|   |', '|   |', '|   |', ' ___ '],
    'P': ['___ ', '|  |', '|__|', '|   ', '|   '],
    'Q': [' ___ ', '|   |', '|   |', '| \\ |', ' __\\|'],
    'R': ['___ ', '|  |', '|_/ ', '| \\ ', '|  \\'],
    'S': [' ___', '|   ', ' __ ', '   |', '___'],
    'T': ['_____', '  |  ', '  |  ', '  |  ', '  |  '],
    'U': ['|   |', '|   |', '|   |', '|   |', ' ___ '],
    'V': ['|   |', '|   |', ' \\ / ', '  V  ', '     '],
    'W': ['|   |', '|   |', '| ^ |', '|/ \\|', '|   |'],
    'X': ['\\   /', ' \\ / ', '  X  ', ' / \\ ', '/   \\'],
    'Y': ['\\   /', ' \\ / ', '  |  ', '  |  ', '  |  '],
    'Z': ['____', '   /', '  / ', ' /  ', '____'],
    '0': [' ___ ', '| / |', '|   |', '|\\ / |', ' ___ '],
    '1': [' /| ', '  | ', '  | ', '  | ', ' _|_'],
    '2': [' __ ', '   |', ' __ ', '|   ', ' ___'],
    '3': [' __ ', '   |', ' __ ', '   |', ' __ '],
    '4': ['|  |', '|  |', '|__|', '   |', '   |'],
    '5': [' ___', '|   ', ' __ ', '   |', '___'],
    '6': [' ___', '|   ', '|__ ', '|  |', ' __ '],
    '7': ['____', '   /', '  / ', ' /  ', '/   '],
    '8': [' __ ', '|  |', ' __ ', '|  |', ' __ '],
    '9': [' __ ', '|  |', ' __|', '   |', ' __ '],
    ' ': ['   ', '   ', '   ', '   ', '   '],
    '.': ['  ', '  ', '  ', '  ', '. '],
    ',': ['  ', '  ', '  ', '  ', ', '],
    '!': ['| ', '| ', '| ', '  ', '! '],
    '?': [' __ ', '   |', ' __|', '    ', ' ?  '],
    '-': ['    ', '    ', '----', '    ', '    '],
    '_': ['    ', '    ', '    ', '    ', '____'],
    ':': ['  ', 'o ', '  ', 'o ', '  '],
    '/': ['   /', '  / ', ' /  ', '/   ', '    '],
    '@': [' ___ ', '| _ |', '||_||', '|___|', '     '],
    '#': [' # # ', '#####', ' # # ', '#####', ' # # '],
    '+': ['     ', '  +  ', '+++++', '  +  ', '     '],
    '=': ['     ', '=====', '     ', '=====', '     ']
  });

  /* ---------- Big (6 high) ---------- */
  const BIG = makeFont(6, buildBigFont());

  function buildBigFont() {
    const m = {};
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // Simplified big font using block chars
    const defs = {
      'A': ['  ___  ', ' / _ \\ ', '/ /_\\ \\', '|  _  |', '|_| |_|', '       '],
      'B': ['____  ', '| _ \\ ', '| |_) |', '|  _ < ', '|_|_\\_\\', '       '],
      'C': ['  ____ ', ' / ___|', '| |    ', '| |___ ', ' \\____|', '       '],
      'D': [' ____  ', '|  _ \\ ', '| | | |', '| |_| |', '|____/ ', '       '],
      'E': [' _____ ', '| ____|', '|  _|  ', '| |___ ', '|_____|', '       '],
      'F': [' _____ ', '|  ___|', '| |_   ', '|  _|  ', '|_|    ', '       '],
      'G': ['  ____ ', ' / ___|', '| |  _ ', '| |_| |', ' \\____|', '       '],
      'H': [' _   _ ', '| | | |', '| |_| |', '|  _  |', '|_| |_|', '       '],
      'I': [' ___ ', '|_ _|', ' | | ', ' | | ', '|___|', '     '],
      'J': ['     _ ', '    | |', '    | |', '|_  | |', ' |__/ ', '       '],
      'K': [' _  __', '| |/ /', '| \' / ', '| . \\ ', '|_|\\_\\', '      '],
      'L': [' _    ', '| |   ', '| |   ', '| |__ ', '|____|', '      '],
      'M': [' __  __ ', '|  \\/  |', '| |\\/| |', '| |  | |', '|_|  |_|', '        '],
      'N': [' _   _ ', '| \\ | |', '|  \\| |', '| |\\  |', '|_| \\_|', '       '],
      'O': ['  ___  ', ' / _ \\ ', '| | | |', '| |_| |', ' \\___/ ', '       '],
      'P': [' ____  ', '|  _ \\ ', '| |_) |', '|  __/ ', '|_|    ', '       '],
      'Q': ['  ___  ', ' / _ \\ ', '| | | |', '| |_| |', ' \\__\\_\\', '       '],
      'R': [' ____  ', '|  _ \\ ', '| |_) |', '|  _ < ', '|_| \\_\\', '       '],
      'S': ['  ____', ' / ___|', ' \\___ \\', '  ___) |', ' |____/', '       '],
      'T': [' _____ ', '|_   _|', '  | |  ', '  | |  ', '  |_|  ', '       '],
      'U': [' _   _ ', '| | | |', '| | | |', '| |_| |', ' \\___/ ', '       '],
      'V': ['__     __', '\\ \\   / /', ' \\ \\ / / ', '  \\ V /  ', '   \\_/   ', '         '],
      'W': ['__      __', '\\ \\    / / ', ' \\ \\/\\/ /  ', '  \\    /   ', '   \\__/    ', '           '],
      'X': ['__  __', '\\ \\/ /', ' \\  / ', ' /  \\ ', '/_/\\_\\', '      '],
      'Y': ['__   __', '\\ \\ / /', ' \\ V / ', '  | |  ', '  |_|  ', '       '],
      'Z': [' _____', '|__  /', '  / / ', ' / /_ ', '/____|', '      ']
    };

    for (var i = 0; i < letters.length; i++) {
      m[letters[i]] = defs[letters[i]] || STANDARD.chars[letters[i]] || ['     ', '     ', '     ', '     ', '     ', '     '];
    }
    // digits and specials fallback to standard padded to 6
    '0123456789 .!?-_:/@#+=,'.split('').forEach(function (ch) {
      if (STANDARD.chars[ch]) {
        var padded = STANDARD.chars[ch].slice();
        while (padded.length < 6) padded.push(' '.repeat(padded[0].length));
        m[ch] = padded;
      }
    });
    return m;
  }

  /* ---------- Block (5 high, uses block characters) ---------- */
  const BLOCK = makeFont(5, buildBlockFont());

  function buildBlockFont() {
    const m = {};
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
    const blockDefs = {
      'A': [' ███ ', '█   █', '█████', '█   █', '█   █'],
      'B': ['████ ', '█   █', '████ ', '█   █', '████ '],
      'C': [' ████', '█    ', '█    ', '█    ', ' ████'],
      'D': ['████ ', '█   █', '█   █', '█   █', '████ '],
      'E': ['█████', '█    ', '███  ', '█    ', '█████'],
      'F': ['█████', '█    ', '███  ', '█    ', '█    '],
      'G': [' ████', '█    ', '█  ██', '█   █', ' ████'],
      'H': ['█   █', '█   █', '█████', '█   █', '█   █'],
      'I': ['█████', '  █  ', '  █  ', '  █  ', '█████'],
      'J': ['█████', '   █ ', '   █ ', '█  █ ', ' ██  '],
      'K': ['█  █ ', '█ █  ', '██   ', '█ █  ', '█  █ '],
      'L': ['█    ', '█    ', '█    ', '█    ', '█████'],
      'M': ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
      'N': ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
      'O': [' ███ ', '█   █', '█   █', '█   █', ' ███ '],
      'P': ['████ ', '█   █', '████ ', '█    ', '█    '],
      'Q': [' ███ ', '█   █', '█ █ █', '█  █ ', ' ██ █'],
      'R': ['████ ', '█   █', '████ ', '█  █ ', '█   █'],
      'S': [' ████', '█    ', ' ███ ', '    █', '████ '],
      'T': ['█████', '  █  ', '  █  ', '  █  ', '  █  '],
      'U': ['█   █', '█   █', '█   █', '█   █', ' ███ '],
      'V': ['█   █', '█   █', '█   █', ' █ █ ', '  █  '],
      'W': ['█   █', '█   █', '█ █ █', '██ ██', '█   █'],
      'X': ['█   █', ' █ █ ', '  █  ', ' █ █ ', '█   █'],
      'Y': ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  '],
      'Z': ['█████', '   █ ', '  █  ', ' █   ', '█████'],
      '0': [' ███ ', '█  ██', '█ █ █', '██  █', ' ███ '],
      '1': ['  █  ', ' ██  ', '  █  ', '  █  ', '█████'],
      '2': [' ███ ', '█   █', '  ██ ', ' █   ', '█████'],
      '3': [' ███ ', '█   █', '  ██ ', '█   █', ' ███ '],
      '4': ['█   █', '█   █', '█████', '    █', '    █'],
      '5': ['█████', '█    ', '████ ', '    █', '████ '],
      '6': [' ███ ', '█    ', '████ ', '█   █', ' ███ '],
      '7': ['█████', '    █', '   █ ', '  █  ', ' █   '],
      '8': [' ███ ', '█   █', ' ███ ', '█   █', ' ███ '],
      '9': [' ███ ', '█   █', ' ████', '    █', ' ███ '],
      ' ': ['     ', '     ', '     ', '     ', '     ']
    };

    for (var i = 0; i < alphabet.length; i++) {
      var ch = alphabet[i];
      m[ch] = blockDefs[ch] || ['     ', '     ', '     ', '     ', '     '];
    }
    // extra chars
    '.!?-_:,'.split('').forEach(function (ch) {
      if (STANDARD.chars[ch]) m[ch] = STANDARD.chars[ch];
    });
    return m;
  }

  /* ---------- Slant (5 high) ---------- */
  const SLANT = makeFont(5, buildSlantFont());

  function buildSlantFont() {
    const m = {};
    const defs = {
      'A': ['   ___ ', '  /   |', ' / /| |', '/ ___ |', '/_/  |_|'],
      'B': ['   ___ ', '  / _ )', ' / _  |', '/ /_) /', '\\____/ '],
      'C': ['  ______', ' / ___/ ', '/ /     ', '\\ \\___  ', ' \\____/ '],
      'D': ['   ___ ', '  / _ \\', ' / // /', '/ /_/ /', '\\____/ '],
      'E': ['   _____', '  / __/ ', ' / _/   ', '/ /__   ', '\\___/   '],
      'F': ['   ____', '  / __/', ' / _/  ', '/ /    ', '/_/    '],
      'G': ['  _____', ' / ___/', '/ (_ < ', '\\___/ /', ' /___/ '],
      'H': ['   __ __', '  / // /', ' / _  / ', '/_//_/  ', '        '],
      'I': ['   ____', '  /  _/', ' _/ /  ', '/___/  ', '       '],
      'J': ['     __', '  _ / /', ' / / / ', '/_/_/  ', '       '],
      'K': ['   __ __', '  / //_/', ' / ,<   ', '/_/|_|  ', '        '],
      'L': ['   __ ', '  / / ', ' / /  ', '/ /__ ', '/____/'],
      'M': ['   __  __', '  /  |/  /', ' / /|_/ / ', '/_/  /_/  ', '          '],
      'N': ['   _  __', '  / |/ /', ' /    / ', '/_/|_/  ', '        '],
      'O': ['  ____ ', ' / __ \\', '/ /_/ /', '\\____/ ', '       '],
      'P': ['   ___ ', '  / _ )', ' / ___/ ', '/ /     ', '/_/     '],
      'Q': ['  ____ ', ' / __ \\', '/ /_/ /', '\\___\\_\\', '       '],
      'R': ['   ___ ', '  / _ \\', ' / , _/', '/_/|_| ', '       '],
      'S': ['  ____', ' / __/', ' \\__ \\', '/___/ ', '      '],
      'T': ['  ______', ' /_  __/', '  / /   ', ' /_/    ', '        '],
      'U': ['  __  __', ' / / / /', '/ /_/ / ', '\\____/  ', '        '],
      'V': ['  _   __', ' | | / /', ' | |/ / ', ' |___/  ', '        '],
      'W': [' _      __', '| | /| / /', '| |/ |/ / ', '|__/|__/  ', '          '],
      'X': ['   _  __', '  | |/_/', ' _>  <  ', '/_/|_|  ', '        '],
      'Y': ['  __  __', '  \\ \\/ /', '   \\  / ', '   / /  ', '  /_/   '],
      'Z': ['  _____', ' /_  _/', '  / /  ', ' /_/__ ', '/____/ ']
    };
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (ch) {
      m[ch] = defs[ch] || STANDARD.chars[ch] || ['     ', '     ', '     ', '     ', '     '];
    });
    '0123456789 .!?-_:/@#+=,'.split('').forEach(function (ch) {
      if (STANDARD.chars[ch]) m[ch] = STANDARD.chars[ch];
    });
    return m;
  }

  /* ---------- Banner (5 high, uses # characters) ---------- */
  const BANNER = makeFont(5, buildBannerFont());

  function buildBannerFont() {
    const m = {};
    // Simple banner style using # chars
    const defs = {
      'A': [' ## ', '#  #', '####', '#  #', '#  #'],
      'B': ['### ', '#  #', '### ', '#  #', '### '],
      'C': [' ###', '#   ', '#   ', '#   ', ' ###'],
      'D': ['### ', '#  #', '#  #', '#  #', '### '],
      'E': ['####', '#   ', '### ', '#   ', '####'],
      'F': ['####', '#   ', '### ', '#   ', '#   '],
      'G': [' ###', '#   ', '# ##', '#  #', ' ## '],
      'H': ['#  #', '#  #', '####', '#  #', '#  #'],
      'I': ['###', ' # ', ' # ', ' # ', '###'],
      'J': ['  ##', '   #', '   #', '#  #', ' ## '],
      'K': ['#  #', '# # ', '##  ', '# # ', '#  #'],
      'L': ['#   ', '#   ', '#   ', '#   ', '####'],
      'M': ['#   #', '## ##', '# # #', '#   #', '#   #'],
      'N': ['#   #', '##  #', '# # #', '#  ##', '#   #'],
      'O': [' ## ', '#  #', '#  #', '#  #', ' ## '],
      'P': ['### ', '#  #', '### ', '#   ', '#   '],
      'Q': [' ## ', '#  #', '# ##', '#  #', ' ## #'],
      'R': ['### ', '#  #', '### ', '# # ', '#  #'],
      'S': [' ###', '#   ', ' ## ', '   #', '### '],
      'T': ['#####', '  #  ', '  #  ', '  #  ', '  #  '],
      'U': ['#  #', '#  #', '#  #', '#  #', ' ## '],
      'V': ['#   #', '#   #', ' # # ', ' # # ', '  #  '],
      'W': ['#   #', '#   #', '# # #', '## ##', '#   #'],
      'X': ['#   #', ' # # ', '  #  ', ' # # ', '#   #'],
      'Y': ['#   #', ' # # ', '  #  ', '  #  ', '  #  '],
      'Z': ['#####', '   # ', '  #  ', ' #   ', '#####'],
      '0': [' ## ', '#  #', '#  #', '#  #', ' ## '],
      '1': [' # ', '## ', ' # ', ' # ', '###'],
      '2': [' ## ', '#  #', '  # ', ' #  ', '####'],
      '3': ['### ', '   #', ' ## ', '   #', '### '],
      '4': ['#  #', '#  #', '####', '   #', '   #'],
      '5': ['####', '#   ', '### ', '   #', '### '],
      '6': [' ## ', '#   ', '### ', '#  #', ' ## '],
      '7': ['####', '   #', '  # ', ' #  ', '#   '],
      '8': [' ## ', '#  #', ' ## ', '#  #', ' ## '],
      '9': [' ## ', '#  #', ' ###', '   #', ' ## '],
      ' ': ['    ', '    ', '    ', '    ', '    '],
      '.': ['  ', '  ', '  ', '  ', '# '],
      '!': ['# ', '# ', '# ', '  ', '# '],
      '?': [' ## ', '#  #', '  # ', '    ', '  # '],
      '-': ['    ', '    ', '####', '    ', '    '],
      ',': ['  ', '  ', '  ', '  ', '# ']
    };
    for (var ch in defs) {
      m[ch] = defs[ch];
    }
    return m;
  }

  /* ---------- Digital (5 high, 7-segment style) ---------- */
  const DIGITAL = makeFont(5, buildDigitalFont());

  function buildDigitalFont() {
    const m = {};
    const defs = {
      'A': [' _  ', '|_| ', '| | ', '    ', '    '],
      'B': ['    ', '|_  ', '|_) ', '    ', '    '],
      'C': [' __ ', '|   ', '|__ ', '    ', '    '],
      'D': ['    ', ' _| ', '|_| ', '    ', '    '],
      'E': [' __ ', '|_  ', '|__ ', '    ', '    '],
      'F': [' __ ', '|_  ', '|   ', '    ', '    '],
      'G': [' __ ', '|   ', '|_| ', '    ', '    '],
      'H': ['    ', '|_| ', '| | ', '    ', '    '],
      'I': ['  ', '| ', '| ', '  ', '  '],
      'J': ['    ', '  | ', '|_| ', '    ', '    '],
      'K': ['    ', '|/ ', '|\\ ', '    ', '    '],
      'L': ['    ', '|   ', '|__ ', '    ', '    '],
      'M': ['      ', '|\\/| ', '|  | ', '      ', '      '],
      'N': ['     ', '|\\ | ', '| \\| ', '     ', '     '],
      'O': [' __ ', '|  |', '|__|', '    ', '    '],
      'P': [' __ ', '|_| ', '|   ', '    ', '    '],
      'Q': [' __ ', '|  |', '|_\\|', '    ', '    '],
      'R': [' __ ', '|_| ', '| \\ ', '    ', '    '],
      'S': [' __ ', ' _| ', '|_  ', '    ', '    '],
      'T': ['___', ' | ', ' | ', '   ', '   '],
      'U': ['    ', '|  |', '|__|', '    ', '    '],
      'V': ['     ', '\\  / ', ' \\/  ', '     ', '     '],
      'W': ['      ', '|  | ', '|/\\| ', '      ', '      '],
      'X': ['     ', '\\ /  ', '/ \\  ', '     ', '     '],
      'Y': ['    ', '\\/ ', ' | ', '    ', '    '],
      'Z': ['__ ', ' / ', '/_ ', '   ', '   '],
      '0': [' __ ', '|  |', '|__|', '    ', '    '],
      '1': ['  ', ' |', ' |', '  ', '  '],
      '2': [' _ ', ' _|', '|_ ', '   ', '   '],
      '3': [' _ ', ' _|', ' _|', '   ', '   '],
      '4': ['    ', '|_| ', '  | ', '    ', '    '],
      '5': [' _ ', '|_ ', ' _|', '   ', '   '],
      '6': [' _ ', '|_ ', '|_|', '   ', '   '],
      '7': [' _ ', '  |', '  |', '   ', '   '],
      '8': [' _ ', '|_|', '|_|', '   ', '   '],
      '9': [' _ ', '|_|', ' _|', '   ', '   '],
      ' ': ['   ', '   ', '   ', '   ', '   '],
      '.': [' ', ' ', '.', ' ', ' '],
      '!': ['|', '|', '!', ' ', ' '],
      '-': ['   ', '   ', '---', '   ', '   '],
      ':': [' ', 'o', ' ', 'o', ' '],
      ',': [' ', ' ', ',', ' ', ' ']
    };
    for (var ch in defs) m[ch] = defs[ch];
    return m;
  }

  /* ---------- Mini (3 high) ---------- */
  const MINI = makeFont(3, buildMiniFont());

  function buildMiniFont() {
    const m = {};
    const defs = {
      'A': ['/_\\', '| |', '   '],
      'B': ['|_ ', '|_)', '   '],
      'C': ['/`', '\\,', '  '],
      'D': ['|\\ ', '|/', '  '],
      'E': ['|_ ', '|_', '  '],
      'F': ['|_ ', '|', ' '],
      'G': ['/_ ', '\\_|', '   '],
      'H': ['|_|', '| |', '   '],
      'I': ['|', '|', ' '],
      'J': [' |', '_|', '  '],
      'K': ['|/', '|\\', '  '],
      'L': ['|  ', '|_', '  '],
      'M': ['|\\/|', '|  |', '    '],
      'N': ['|\\ |', '| \\|', '    '],
      'O': ['/ \\', '\\_/', '   '],
      'P': ['|`\\', '|  ', '   '],
      'Q': ['/ \\', '\\_\\', '   '],
      'R': ['|`\\', '| \\', '   '],
      'S': ['/`', '\\_', '  '],
      'T': ['_|_', ' | ', '   '],
      'U': ['| |', '\\_/', '   '],
      'V': ['\\ /', ' V ', '   '],
      'W': ['|  |', '|/\\|', '    '],
      'X': ['\\ /', '/ \\', '   '],
      'Y': ['\\/ ', ' | ', '   '],
      'Z': ['_/', '/_', '  '],
      '0': ['()', '()', '  '],
      '1': ['/|', ' |', '  '],
      '2': ['_)', '/_', '  '],
      '3': ['_)', '_)', '  '],
      '4': ['|_|', '  |', '   '],
      '5': ['|_ ', ' _)', '   '],
      '6': ['|_ ', '|_)', '   '],
      '7': ['_|', ' |', '  '],
      '8': ['(_)', '(_)', '   '],
      '9': ['(_|', ' _|', '   '],
      ' ': ['  ', '  ', '  '],
      '.': [' ', '.', ' '],
      '!': ['!', '!', ' '],
      '-': ['  ', '--', '  '],
      ',': [' ', ',', ' '],
      '?': ['?)', ' ! ', '   ']
    };
    for (var ch in defs) m[ch] = defs[ch];
    return m;
  }

  /* ==================== Font map ==================== */
  const FONTS = {
    standard: STANDARD,
    big: BIG,
    block: BLOCK,
    slant: SLANT,
    banner: BANNER,
    digital: DIGITAL,
    mini: MINI
  };

  /* ==================== Render text to ASCII art ==================== */
  function renderText(text, fontName, fullWidth) {
    var font = FONTS[fontName] || FONTS.standard;
    var chars = font.chars;
    var height = font.height;
    var upper = text.toUpperCase();
    var lines = [];
    for (var i = 0; i < height; i++) lines.push('');

    for (var j = 0; j < upper.length; j++) {
      var ch = upper[j];
      var glyph = chars[ch];
      if (!glyph) {
        // Unknown char: use space-width placeholder
        for (var k = 0; k < height; k++) lines[k] += '  ';
        continue;
      }
      for (var k = 0; k < height; k++) {
        lines[k] += (glyph[k] || '') + (fullWidth ? '  ' : ' ');
      }
    }

    // Trim trailing spaces on each line but keep structure
    return lines.map(function (l) { return l.replace(/\s+$/, ''); }).join('\n');
  }

  /* ==================== DOM refs ==================== */
  var textInput = document.getElementById('textInput');
  var fontSelect = document.getElementById('fontSelect');
  var textOutput = document.getElementById('textOutput');
  var copyTextBtn = document.getElementById('copyTextBtn');
  var widthBtns = document.querySelectorAll('.toggle-btn[data-width]');
  var currentWidth = 'fitted';

  /* ==================== Text tab logic ==================== */
  function update() {
    var text = textInput.value || '';
    if (!text.trim()) {
      textOutput.textContent = '';
      return;
    }
    textOutput.textContent = renderText(text, fontSelect.value, currentWidth === 'full');
  }

  textInput.addEventListener('input', update);
  fontSelect.addEventListener('change', update);

  widthBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      widthBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentWidth = btn.dataset.width;
      update();
    });
  });

  copyTextBtn.addEventListener('click', function () {
    var text = textOutput.textContent;
    if (!text) return ToolsCommon.showToast('Nothing to copy');
    ToolsCommon.copyWithToast(text, 'ASCII art copied!');
  });

  /* ==================== Tabs ==================== */
  document.querySelectorAll('.ascii-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.ascii-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var target = tab.dataset.tab;
      document.getElementById('textPanel').style.display = target === 'text' ? 'block' : 'none';
      document.getElementById('textPanel').classList.toggle('active', target === 'text');
      document.getElementById('imagePanel').style.display = target === 'image' ? 'block' : 'none';
      document.getElementById('imagePanel').classList.toggle('active', target === 'image');
    });
  });

  /* ==================== Image to ASCII ==================== */
  var imageInput = document.getElementById('imageInput');
  var uploadZone = document.getElementById('uploadZone');
  var imgWidthRange = document.getElementById('imgWidthRange');
  var imgWidthValue = document.getElementById('imgWidthValue');
  var imageOutput = document.getElementById('imageOutput');
  var imageOutputCard = document.getElementById('imageOutputCard');
  var copyImgBtn = document.getElementById('copyImgBtn');
  var hiddenCanvas = document.getElementById('hiddenCanvas');
  var ctx = hiddenCanvas.getContext('2d');
  var loadedImage = null;

  var ASCII_RAMP = ' .:-=+*#%@';

  imgWidthRange.addEventListener('input', function () {
    imgWidthValue.textContent = imgWidthRange.value;
    if (loadedImage) convertImage();
  });

  imageInput.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (file) loadImageFile(file);
  });

  // Drag and drop
  uploadZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });

  uploadZone.addEventListener('dragleave', function () {
    uploadZone.classList.remove('drag-over');
  });

  uploadZone.addEventListener('drop', function (e) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    var file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadImageFile(file);
  });

  function loadImageFile(file) {
    var reader = new FileReader();
    reader.onload = function (ev) {
      var img = new Image();
      img.onload = function () {
        loadedImage = img;
        convertImage();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function convertImage() {
    if (!loadedImage) return;

    var targetWidth = parseInt(imgWidthRange.value, 10);
    var aspect = loadedImage.height / loadedImage.width;
    // Characters are ~2x tall as wide, so halve the height
    var targetHeight = Math.round(targetWidth * aspect * 0.5);

    hiddenCanvas.width = targetWidth;
    hiddenCanvas.height = targetHeight;
    ctx.drawImage(loadedImage, 0, 0, targetWidth, targetHeight);

    var imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    var pixels = imageData.data;
    var output = '';

    for (var y = 0; y < targetHeight; y++) {
      for (var x = 0; x < targetWidth; x++) {
        var idx = (y * targetWidth + x) * 4;
        var r = pixels[idx];
        var g = pixels[idx + 1];
        var b = pixels[idx + 2];
        var a = pixels[idx + 3];
        // Luminance
        var brightness = (0.299 * r + 0.587 * g + 0.114 * b) * (a / 255);
        var charIdx = Math.round((brightness / 255) * (ASCII_RAMP.length - 1));
        output += ASCII_RAMP[charIdx];
      }
      output += '\n';
    }

    imageOutput.textContent = output;
    imageOutputCard.style.display = 'block';
    ToolsCommon.showToast('Image converted to ASCII');
  }

  copyImgBtn.addEventListener('click', function () {
    var text = imageOutput.textContent;
    if (!text) return ToolsCommon.showToast('Nothing to copy');
    ToolsCommon.copyWithToast(text, 'ASCII art copied!');
  });

  /* ==================== Init ==================== */
  update();
})();
