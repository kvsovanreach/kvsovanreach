/**
 * KVSOVANREACH Character Map
 */

(function() {
  'use strict';

  const CHARACTERS = {
    boxes: [
      { char: '─', name: 'Horizontal', code: 'U+2500' },
      { char: '━', name: 'Heavy Horizontal', code: 'U+2501' },
      { char: '│', name: 'Vertical', code: 'U+2502' },
      { char: '┃', name: 'Heavy Vertical', code: 'U+2503' },
      { char: '┄', name: 'Triple Dash H', code: 'U+2504' },
      { char: '┅', name: 'Heavy Triple Dash', code: 'U+2505' },
      { char: '┆', name: 'Triple Dash V', code: 'U+2506' },
      { char: '┇', name: 'Heavy Triple V', code: 'U+2507' },
      { char: '┈', name: 'Quad Dash H', code: 'U+2508' },
      { char: '┉', name: 'Heavy Quad Dash', code: 'U+2509' },
      { char: '┊', name: 'Quad Dash V', code: 'U+250A' },
      { char: '┋', name: 'Heavy Quad V', code: 'U+250B' },
      { char: '┌', name: 'Down Right', code: 'U+250C' },
      { char: '┍', name: 'Down Right Heavy', code: 'U+250D' },
      { char: '┎', name: 'Heavy Down Right', code: 'U+250E' },
      { char: '┏', name: 'Heavy Down Right', code: 'U+250F' },
      { char: '┐', name: 'Down Left', code: 'U+2510' },
      { char: '┑', name: 'Down Left Heavy', code: 'U+2511' },
      { char: '┒', name: 'Heavy Down Left', code: 'U+2512' },
      { char: '┓', name: 'Heavy Down Left', code: 'U+2513' },
      { char: '└', name: 'Up Right', code: 'U+2514' },
      { char: '┕', name: 'Up Right Heavy', code: 'U+2515' },
      { char: '┖', name: 'Heavy Up Right', code: 'U+2516' },
      { char: '┗', name: 'Heavy Up Right', code: 'U+2517' },
      { char: '┘', name: 'Up Left', code: 'U+2518' },
      { char: '┙', name: 'Up Left Heavy', code: 'U+2519' },
      { char: '┚', name: 'Heavy Up Left', code: 'U+251A' },
      { char: '┛', name: 'Heavy Up Left', code: 'U+251B' },
      { char: '├', name: 'Vertical Right', code: 'U+251C' },
      { char: '┝', name: 'Vertical Right Heavy', code: 'U+251D' },
      { char: '┞', name: 'Up Heavy Right', code: 'U+251E' },
      { char: '┟', name: 'Down Heavy Right', code: 'U+251F' },
      { char: '┠', name: 'Heavy Vertical Right', code: 'U+2520' },
      { char: '┡', name: 'Down Light Right', code: 'U+2521' },
      { char: '┢', name: 'Up Light Right', code: 'U+2522' },
      { char: '┣', name: 'Heavy Vert Right', code: 'U+2523' },
      { char: '┤', name: 'Vertical Left', code: 'U+2524' },
      { char: '┥', name: 'Vertical Left Heavy', code: 'U+2525' },
      { char: '┦', name: 'Up Heavy Left', code: 'U+2526' },
      { char: '┧', name: 'Down Heavy Left', code: 'U+2527' },
      { char: '┨', name: 'Heavy Vertical Left', code: 'U+2528' },
      { char: '┩', name: 'Down Light Left', code: 'U+2529' },
      { char: '┪', name: 'Up Light Left', code: 'U+252A' },
      { char: '┫', name: 'Heavy Vert Left', code: 'U+252B' },
      { char: '┬', name: 'Down Horizontal', code: 'U+252C' },
      { char: '┭', name: 'Left Heavy Down', code: 'U+252D' },
      { char: '┮', name: 'Right Heavy Down', code: 'U+252E' },
      { char: '┯', name: 'Down Light Horiz', code: 'U+252F' },
      { char: '┰', name: 'Down Heavy Horiz', code: 'U+2530' },
      { char: '┱', name: 'Right Light Down', code: 'U+2531' },
      { char: '┲', name: 'Left Light Down', code: 'U+2532' },
      { char: '┳', name: 'Heavy Down Horiz', code: 'U+2533' },
      { char: '┴', name: 'Up Horizontal', code: 'U+2534' },
      { char: '┵', name: 'Left Heavy Up', code: 'U+2535' },
      { char: '┶', name: 'Right Heavy Up', code: 'U+2536' },
      { char: '┷', name: 'Up Light Horiz', code: 'U+2537' },
      { char: '┸', name: 'Up Heavy Horiz', code: 'U+2538' },
      { char: '┹', name: 'Right Light Up', code: 'U+2539' },
      { char: '┺', name: 'Left Light Up', code: 'U+253A' },
      { char: '┻', name: 'Heavy Up Horiz', code: 'U+253B' },
      { char: '┼', name: 'Cross', code: 'U+253C' },
      { char: '┽', name: 'Left Heavy Cross', code: 'U+253D' },
      { char: '┾', name: 'Right Heavy Cross', code: 'U+253E' },
      { char: '┿', name: 'Vert Light Cross', code: 'U+253F' },
      { char: '╀', name: 'Up Heavy Cross', code: 'U+2540' },
      { char: '╁', name: 'Down Heavy Cross', code: 'U+2541' },
      { char: '╂', name: 'Horiz Light Cross', code: 'U+2542' },
      { char: '╃', name: 'Up Left Heavy', code: 'U+2543' },
      { char: '╄', name: 'Up Right Heavy', code: 'U+2544' },
      { char: '╅', name: 'Down Left Heavy', code: 'U+2545' },
      { char: '╆', name: 'Down Right Heavy', code: 'U+2546' },
      { char: '╇', name: 'Down Light Cross', code: 'U+2547' },
      { char: '╈', name: 'Up Light Cross', code: 'U+2548' },
      { char: '╉', name: 'Right Light Cross', code: 'U+2549' },
      { char: '╊', name: 'Left Light Cross', code: 'U+254A' },
      { char: '╋', name: 'Heavy Cross', code: 'U+254B' },
      { char: '═', name: 'Double Horizontal', code: 'U+2550' },
      { char: '║', name: 'Double Vertical', code: 'U+2551' },
      { char: '╔', name: 'Double Down Right', code: 'U+2554' },
      { char: '╗', name: 'Double Down Left', code: 'U+2557' },
      { char: '╚', name: 'Double Up Right', code: 'U+255A' },
      { char: '╝', name: 'Double Up Left', code: 'U+255D' },
      { char: '╠', name: 'Double Vert Right', code: 'U+2560' },
      { char: '╣', name: 'Double Vert Left', code: 'U+2563' },
      { char: '╦', name: 'Double Down Horiz', code: 'U+2566' },
      { char: '╩', name: 'Double Up Horiz', code: 'U+2569' },
      { char: '╬', name: 'Double Cross', code: 'U+256C' },
      { char: '╭', name: 'Arc Down Right', code: 'U+256D' },
      { char: '╮', name: 'Arc Down Left', code: 'U+256E' },
      { char: '╯', name: 'Arc Up Left', code: 'U+256F' },
      { char: '╰', name: 'Arc Up Right', code: 'U+2570' },
      { char: '▀', name: 'Upper Half', code: 'U+2580' },
      { char: '▄', name: 'Lower Half', code: 'U+2584' },
      { char: '█', name: 'Full Block', code: 'U+2588' },
      { char: '▌', name: 'Left Half', code: 'U+258C' },
      { char: '▐', name: 'Right Half', code: 'U+2590' },
      { char: '░', name: 'Light Shade', code: 'U+2591' },
      { char: '▒', name: 'Medium Shade', code: 'U+2592' },
      { char: '▓', name: 'Dark Shade', code: 'U+2593' }
    ],
    shapes: [
      { char: '■', name: 'Black Square', code: 'U+25A0' },
      { char: '□', name: 'White Square', code: 'U+25A1' },
      { char: '▢', name: 'Rounded Square', code: 'U+25A2' },
      { char: '▣', name: 'Square In Square', code: 'U+25A3' },
      { char: '▤', name: 'Square H Fill', code: 'U+25A4' },
      { char: '▥', name: 'Square V Fill', code: 'U+25A5' },
      { char: '▦', name: 'Square Cross', code: 'U+25A6' },
      { char: '▧', name: 'Square Diag Left', code: 'U+25A7' },
      { char: '▨', name: 'Square Diag Right', code: 'U+25A8' },
      { char: '▩', name: 'Square Diag Cross', code: 'U+25A9' },
      { char: '▪', name: 'Small Black Sq', code: 'U+25AA' },
      { char: '▫', name: 'Small White Sq', code: 'U+25AB' },
      { char: '▬', name: 'Black Rectangle', code: 'U+25AC' },
      { char: '▭', name: 'White Rectangle', code: 'U+25AD' },
      { char: '▮', name: 'Vertical Rect', code: 'U+25AE' },
      { char: '▯', name: 'White Vert Rect', code: 'U+25AF' },
      { char: '▰', name: 'Black Parallelogram', code: 'U+25B0' },
      { char: '▱', name: 'White Parallelogram', code: 'U+25B1' },
      { char: '▲', name: 'Black Up Triangle', code: 'U+25B2' },
      { char: '△', name: 'White Up Triangle', code: 'U+25B3' },
      { char: '▴', name: 'Small Up Triangle', code: 'U+25B4' },
      { char: '▵', name: 'Small Up White', code: 'U+25B5' },
      { char: '▶', name: 'Black Right Triangle', code: 'U+25B6' },
      { char: '▷', name: 'White Right Triangle', code: 'U+25B7' },
      { char: '▸', name: 'Small Right', code: 'U+25B8' },
      { char: '▹', name: 'Small Right White', code: 'U+25B9' },
      { char: '►', name: 'Pointer Right', code: 'U+25BA' },
      { char: '▻', name: 'Pointer Right White', code: 'U+25BB' },
      { char: '▼', name: 'Black Down Triangle', code: 'U+25BC' },
      { char: '▽', name: 'White Down Triangle', code: 'U+25BD' },
      { char: '▾', name: 'Small Down', code: 'U+25BE' },
      { char: '▿', name: 'Small Down White', code: 'U+25BF' },
      { char: '◀', name: 'Black Left Triangle', code: 'U+25C0' },
      { char: '◁', name: 'White Left Triangle', code: 'U+25C1' },
      { char: '◂', name: 'Small Left', code: 'U+25C2' },
      { char: '◃', name: 'Small Left White', code: 'U+25C3' },
      { char: '◄', name: 'Pointer Left', code: 'U+25C4' },
      { char: '◅', name: 'Pointer Left White', code: 'U+25C5' },
      { char: '◆', name: 'Black Diamond', code: 'U+25C6' },
      { char: '◇', name: 'White Diamond', code: 'U+25C7' },
      { char: '◈', name: 'Diamond In Diamond', code: 'U+25C8' },
      { char: '◉', name: 'Fisheye', code: 'U+25C9' },
      { char: '◊', name: 'Lozenge', code: 'U+25CA' },
      { char: '○', name: 'White Circle', code: 'U+25CB' },
      { char: '◌', name: 'Dotted Circle', code: 'U+25CC' },
      { char: '◍', name: 'Circle V Fill', code: 'U+25CD' },
      { char: '◎', name: 'Bullseye', code: 'U+25CE' },
      { char: '●', name: 'Black Circle', code: 'U+25CF' },
      { char: '◐', name: 'Circle Left Half', code: 'U+25D0' },
      { char: '◑', name: 'Circle Right Half', code: 'U+25D1' },
      { char: '◒', name: 'Circle Lower Half', code: 'U+25D2' },
      { char: '◓', name: 'Circle Upper Half', code: 'U+25D3' },
      { char: '◔', name: 'Circle Upper Right', code: 'U+25D4' },
      { char: '◕', name: 'Circle All But UR', code: 'U+25D5' },
      { char: '◖', name: 'Left Half Black', code: 'U+25D6' },
      { char: '◗', name: 'Right Half Black', code: 'U+25D7' },
      { char: '◘', name: 'Inverse Bullet', code: 'U+25D8' },
      { char: '◙', name: 'Inverse Circle', code: 'U+25D9' },
      { char: '◚', name: 'Upper Half Inverse', code: 'U+25DA' },
      { char: '◛', name: 'Lower Half Inverse', code: 'U+25DB' },
      { char: '◜', name: 'Upper Left Arc', code: 'U+25DC' },
      { char: '◝', name: 'Upper Right Arc', code: 'U+25DD' },
      { char: '◞', name: 'Lower Right Arc', code: 'U+25DE' },
      { char: '◟', name: 'Lower Left Arc', code: 'U+25DF' },
      { char: '◠', name: 'Upper Semicircle', code: 'U+25E0' },
      { char: '◡', name: 'Lower Semicircle', code: 'U+25E1' },
      { char: '◢', name: 'Lower Right Triangle', code: 'U+25E2' },
      { char: '◣', name: 'Lower Left Triangle', code: 'U+25E3' },
      { char: '◤', name: 'Upper Left Triangle', code: 'U+25E4' },
      { char: '◥', name: 'Upper Right Triangle', code: 'U+25E5' },
      { char: '◦', name: 'White Bullet', code: 'U+25E6' },
      { char: '◧', name: 'Square Left Black', code: 'U+25E7' },
      { char: '◨', name: 'Square Right Black', code: 'U+25E8' },
      { char: '◩', name: 'Square UL Diag', code: 'U+25E9' },
      { char: '◪', name: 'Square LR Diag', code: 'U+25EA' },
      { char: '◫', name: 'Square Vert Bisect', code: 'U+25EB' },
      { char: '◬', name: 'Triangle Up White', code: 'U+25EC' },
      { char: '◭', name: 'Triangle Up Left', code: 'U+25ED' },
      { char: '◮', name: 'Triangle Up Right', code: 'U+25EE' },
      { char: '◯', name: 'Large Circle', code: 'U+25EF' },
      { char: '◰', name: 'Square UR White', code: 'U+25F0' },
      { char: '◱', name: 'Square UL White', code: 'U+25F1' },
      { char: '◲', name: 'Square LL White', code: 'U+25F2' },
      { char: '◳', name: 'Square LR White', code: 'U+25F3' },
      { char: '◴', name: 'Circle UR White', code: 'U+25F4' },
      { char: '◵', name: 'Circle UL White', code: 'U+25F5' },
      { char: '◶', name: 'Circle LL White', code: 'U+25F6' },
      { char: '◷', name: 'Circle LR White', code: 'U+25F7' },
      { char: '★', name: 'Black Star', code: 'U+2605' },
      { char: '☆', name: 'White Star', code: 'U+2606' },
      { char: '✦', name: 'Black Four Point', code: 'U+2726' },
      { char: '✧', name: 'White Four Point', code: 'U+2727' },
      { char: '✩', name: 'Stress Star', code: 'U+2729' },
      { char: '✪', name: 'Circle Star', code: 'U+272A' },
      { char: '✫', name: 'Open Star', code: 'U+272B' },
      { char: '✬', name: 'Black Star Center', code: 'U+272C' },
      { char: '✭', name: 'Outlined Star', code: 'U+272D' },
      { char: '✮', name: 'Heavy Outlined Star', code: 'U+272E' },
      { char: '✯', name: 'Pinwheel Star', code: 'U+272F' },
      { char: '✰', name: 'Shadowed Star', code: 'U+2730' },
      { char: '✱', name: 'Heavy Asterisk', code: 'U+2731' },
      { char: '✲', name: 'Open Asterisk', code: 'U+2732' },
      { char: '✳', name: 'Eight Spoked', code: 'U+2733' },
      { char: '✴', name: 'Eight Pointed', code: 'U+2734' },
      { char: '✵', name: 'Eight Pointed Pinwheel', code: 'U+2735' },
      { char: '✶', name: 'Six Pointed', code: 'U+2736' },
      { char: '✷', name: 'Eight Pointed Rectilinear', code: 'U+2737' },
      { char: '✸', name: 'Heavy Eight Pointed', code: 'U+2738' },
      { char: '✹', name: 'Twelve Pointed', code: 'U+2739' },
      { char: '✺', name: 'Sixteen Pointed', code: 'U+273A' },
      { char: '✻', name: 'Teardrop Spoked', code: 'U+273B' },
      { char: '✼', name: 'Open Teardrop', code: 'U+273C' },
      { char: '✽', name: 'Heavy Teardrop', code: 'U+273D' },
      { char: '✾', name: 'Six Petal Florette', code: 'U+273E' },
      { char: '✿', name: 'Black Florette', code: 'U+273F' },
      { char: '❀', name: 'White Florette', code: 'U+2740' },
      { char: '❁', name: 'Eight Petal Florette', code: 'U+2741' },
      { char: '❂', name: 'Circle Florette', code: 'U+2742' },
      { char: '❃', name: 'Heavy Four Balloon', code: 'U+2743' },
      { char: '❄', name: 'Snowflake', code: 'U+2744' },
      { char: '❅', name: 'Tight Snowflake', code: 'U+2745' },
      { char: '❆', name: 'Heavy Snowflake', code: 'U+2746' },
      { char: '❇', name: 'Sparkle', code: 'U+2747' },
      { char: '❈', name: 'Heavy Sparkle', code: 'U+2748' },
      { char: '❉', name: 'Balloon Spoked', code: 'U+2749' },
      { char: '❊', name: 'Eight Teardrop', code: 'U+274A' },
      { char: '❋', name: 'Heavy Eight Teardrop', code: 'U+274B' },
      { char: '⬟', name: 'Pentagon', code: 'U+2B1F' },
      { char: '⬠', name: 'Pentagon Outline', code: 'U+2B20' },
      { char: '⬡', name: 'Hexagon', code: 'U+2B21' },
      { char: '⬢', name: 'Hexagon Fill', code: 'U+2B22' },
      { char: '⬣', name: 'Horiz Hexagon', code: 'U+2B23' }
    ],
    punctuation: [
      { char: '–', name: 'En Dash', code: 'U+2013' },
      { char: '—', name: 'Em Dash', code: 'U+2014' },
      { char: '―', name: 'Horizontal Bar', code: 'U+2015' },
      { char: '‖', name: 'Double Vertical', code: 'U+2016' },
      { char: '‗', name: 'Double Low', code: 'U+2017' },
      { char: "\u2018", name: 'Left Single Quote', code: 'U+2018' },
      { char: "\u2019", name: 'Right Single Quote', code: 'U+2019' },
      { char: "\u201A", name: 'Single Low Quote', code: 'U+201A' },
      { char: "\u201B", name: 'Single High Rev', code: 'U+201B' },
      { char: "\u201C", name: 'Left Double Quote', code: 'U+201C' },
      { char: "\u201D", name: 'Right Double Quote', code: 'U+201D' },
      { char: "\u201E", name: 'Double Low Quote', code: 'U+201E' },
      { char: "\u201F", name: 'Double High Rev', code: 'U+201F' },
      { char: '†', name: 'Dagger', code: 'U+2020' },
      { char: '‡', name: 'Double Dagger', code: 'U+2021' },
      { char: '•', name: 'Bullet', code: 'U+2022' },
      { char: '‣', name: 'Triangle Bullet', code: 'U+2023' },
      { char: '․', name: 'One Dot Leader', code: 'U+2024' },
      { char: '‥', name: 'Two Dot Leader', code: 'U+2025' },
      { char: '…', name: 'Ellipsis', code: 'U+2026' },
      { char: '‧', name: 'Hyphenation Point', code: 'U+2027' },
      { char: '‰', name: 'Per Mille', code: 'U+2030' },
      { char: '‱', name: 'Per Ten Thousand', code: 'U+2031' },
      { char: '′', name: 'Prime', code: 'U+2032' },
      { char: '″', name: 'Double Prime', code: 'U+2033' },
      { char: '‴', name: 'Triple Prime', code: 'U+2034' },
      { char: '‵', name: 'Reversed Prime', code: 'U+2035' },
      { char: '‶', name: 'Rev Double Prime', code: 'U+2036' },
      { char: '‷', name: 'Rev Triple Prime', code: 'U+2037' },
      { char: '‸', name: 'Caret', code: 'U+2038' },
      { char: '‹', name: 'Single Left Angle', code: 'U+2039' },
      { char: '›', name: 'Single Right Angle', code: 'U+203A' },
      { char: '※', name: 'Reference Mark', code: 'U+203B' },
      { char: '‼', name: 'Double Exclamation', code: 'U+203C' },
      { char: '‽', name: 'Interrobang', code: 'U+203D' },
      { char: '‾', name: 'Overline', code: 'U+203E' },
      { char: '‿', name: 'Undertie', code: 'U+203F' },
      { char: '⁀', name: 'Character Tie', code: 'U+2040' },
      { char: '⁁', name: 'Caret Insert', code: 'U+2041' },
      { char: '⁂', name: 'Asterism', code: 'U+2042' },
      { char: '⁃', name: 'Hyphen Bullet', code: 'U+2043' },
      { char: '⁄', name: 'Fraction Slash', code: 'U+2044' },
      { char: '⁅', name: 'Left Sq Bracket', code: 'U+2045' },
      { char: '⁆', name: 'Right Sq Bracket', code: 'U+2046' },
      { char: '⁇', name: 'Double Question', code: 'U+2047' },
      { char: '⁈', name: 'Question Exclamation', code: 'U+2048' },
      { char: '⁉', name: 'Exclamation Question', code: 'U+2049' },
      { char: '⁊', name: 'Tironian Et', code: 'U+204A' },
      { char: '⁋', name: 'Reversed Pilcrow', code: 'U+204B' },
      { char: '⁌', name: 'Black Leftward', code: 'U+204C' },
      { char: '⁍', name: 'Black Rightward', code: 'U+204D' },
      { char: '⁎', name: 'Low Asterisk', code: 'U+204E' },
      { char: '⁏', name: 'Reversed Semicolon', code: 'U+204F' },
      { char: '⁐', name: 'Close Up', code: 'U+2050' },
      { char: '⁑', name: 'Two Asterisks', code: 'U+2051' },
      { char: '⁒', name: 'Commercial Minus', code: 'U+2052' },
      { char: '⁓', name: 'Swung Dash', code: 'U+2053' },
      { char: '⁔', name: 'Inverted Undertie', code: 'U+2054' },
      { char: '⁕', name: 'Flower Mark', code: 'U+2055' },
      { char: '⁖', name: 'Three Dot', code: 'U+2056' },
      { char: '⁗', name: 'Quadruple Prime', code: 'U+2057' },
      { char: '⁘', name: 'Four Dot', code: 'U+2058' },
      { char: '⁙', name: 'Five Dot', code: 'U+2059' },
      { char: '⁚', name: 'Two Dot Punct', code: 'U+205A' },
      { char: '⁛', name: 'Four Dot Mark', code: 'U+205B' },
      { char: '⁜', name: 'Dotted Cross', code: 'U+205C' },
      { char: '⁝', name: 'Tricolon', code: 'U+205D' },
      { char: '⁞', name: 'Vertical Four Dots', code: 'U+205E' },
      { char: '«', name: 'Left Guillemet', code: 'U+00AB' },
      { char: '»', name: 'Right Guillemet', code: 'U+00BB' },
      { char: '¡', name: 'Inverted Exclamation', code: 'U+00A1' },
      { char: '¿', name: 'Inverted Question', code: 'U+00BF' },
      { char: '·', name: 'Middle Dot', code: 'U+00B7' },
      { char: '¨', name: 'Diaeresis', code: 'U+00A8' },
      { char: '´', name: 'Acute Accent', code: 'U+00B4' },
      { char: '¸', name: 'Cedilla', code: 'U+00B8' },
      { char: 'ˆ', name: 'Circumflex', code: 'U+02C6' },
      { char: '˜', name: 'Small Tilde', code: 'U+02DC' },
      { char: '˘', name: 'Breve', code: 'U+02D8' },
      { char: '˙', name: 'Dot Above', code: 'U+02D9' },
      { char: '˚', name: 'Ring Above', code: 'U+02DA' },
      { char: '˛', name: 'Ogonek', code: 'U+02DB' },
      { char: '˝', name: 'Double Acute', code: 'U+02DD' }
    ],
    symbols: [
      { char: '©', name: 'Copyright', code: 'U+00A9' },
      { char: '®', name: 'Registered', code: 'U+00AE' },
      { char: '™', name: 'Trademark', code: 'U+2122' },
      { char: '§', name: 'Section', code: 'U+00A7' },
      { char: '¶', name: 'Pilcrow', code: 'U+00B6' },
      { char: '†', name: 'Dagger', code: 'U+2020' },
      { char: '‡', name: 'Double Dagger', code: 'U+2021' },
      { char: '•', name: 'Bullet', code: 'U+2022' },
      { char: '◦', name: 'White Bullet', code: 'U+25E6' },
      { char: '▪', name: 'Black Square', code: 'U+25AA' },
      { char: '▫', name: 'White Square', code: 'U+25AB' },
      { char: '…', name: 'Ellipsis', code: 'U+2026' },
      { char: '°', name: 'Degree', code: 'U+00B0' },
      { char: '′', name: 'Prime', code: 'U+2032' },
      { char: '″', name: 'Double Prime', code: 'U+2033' },
      { char: '‰', name: 'Per Mille', code: 'U+2030' },
      { char: '№', name: 'Numero', code: 'U+2116' },
      { char: '¤', name: 'Currency', code: 'U+00A4' },
      { char: '¦', name: 'Broken Bar', code: 'U+00A6' },
      { char: '¬', name: 'Not', code: 'U+00AC' },
      { char: '¯', name: 'Macron', code: 'U+00AF' },
      { char: '´', name: 'Acute', code: 'U+00B4' },
      { char: '¸', name: 'Cedilla', code: 'U+00B8' },
      { char: '♠', name: 'Spade', code: 'U+2660' },
      { char: '♣', name: 'Club', code: 'U+2663' },
      { char: '♥', name: 'Heart', code: 'U+2665' },
      { char: '♦', name: 'Diamond', code: 'U+2666' },
      { char: '☆', name: 'White Star', code: 'U+2606' },
      { char: '★', name: 'Black Star', code: 'U+2605' },
      { char: '☐', name: 'Ballot Box', code: 'U+2610' },
      { char: '☑', name: 'Checked Box', code: 'U+2611' },
      { char: '☒', name: 'X Box', code: 'U+2612' },
      { char: '✓', name: 'Check Mark', code: 'U+2713' },
      { char: '✔', name: 'Heavy Check', code: 'U+2714' },
      { char: '✗', name: 'Ballot X', code: 'U+2717' },
      { char: '✘', name: 'Heavy X', code: 'U+2718' },
      { char: '✕', name: 'Multiply X', code: 'U+2715' },
      { char: '♪', name: 'Music Note', code: 'U+266A' },
      { char: '♫', name: 'Music Notes', code: 'U+266B' },
      { char: '♯', name: 'Sharp', code: 'U+266F' },
      { char: '♭', name: 'Flat', code: 'U+266D' },
      { char: '☀', name: 'Sun', code: 'U+2600' },
      { char: '☁', name: 'Cloud', code: 'U+2601' },
      { char: '☂', name: 'Umbrella', code: 'U+2602' },
      { char: '☃', name: 'Snowman', code: 'U+2603' },
      { char: '☎', name: 'Phone', code: 'U+260E' },
      { char: '☏', name: 'Phone White', code: 'U+260F' },
      { char: '✉', name: 'Envelope', code: 'U+2709' },
      { char: '✂', name: 'Scissors', code: 'U+2702' },
      { char: '✎', name: 'Pencil', code: 'U+270E' },
      { char: '✏', name: 'Pencil Alt', code: 'U+270F' },
      { char: '✐', name: 'Pencil Upper', code: 'U+2710' },
      { char: '✑', name: 'Nib', code: 'U+2711' },
      { char: '✒', name: 'Black Nib', code: 'U+2712' },
      { char: '⌘', name: 'Command', code: 'U+2318' },
      { char: '⌥', name: 'Option', code: 'U+2325' },
      { char: '⇧', name: 'Shift', code: 'U+21E7' },
      { char: '⌃', name: 'Control', code: 'U+2303' },
      { char: '⎋', name: 'Escape', code: 'U+238B' },
      { char: '⌫', name: 'Delete', code: 'U+232B' },
      { char: '⌦', name: 'Del Right', code: 'U+2326' },
      { char: '⏎', name: 'Return', code: 'U+23CE' },
      { char: '⇥', name: 'Tab', code: 'U+21E5' },
      { char: '␣', name: 'Space', code: 'U+2423' }
    ],
    math: [
      { char: '±', name: 'Plus Minus', code: 'U+00B1' },
      { char: '×', name: 'Multiply', code: 'U+00D7' },
      { char: '÷', name: 'Divide', code: 'U+00F7' },
      { char: '=', name: 'Equals', code: 'U+003D' },
      { char: '≠', name: 'Not Equal', code: 'U+2260' },
      { char: '≈', name: 'Approx', code: 'U+2248' },
      { char: '≡', name: 'Identical', code: 'U+2261' },
      { char: '≢', name: 'Not Identical', code: 'U+2262' },
      { char: '≃', name: 'Asymp Equal', code: 'U+2243' },
      { char: '≅', name: 'Congruent', code: 'U+2245' },
      { char: '<', name: 'Less Than', code: 'U+003C' },
      { char: '>', name: 'Greater Than', code: 'U+003E' },
      { char: '≤', name: 'Less Equal', code: 'U+2264' },
      { char: '≥', name: 'Greater Equal', code: 'U+2265' },
      { char: '≪', name: 'Much Less', code: 'U+226A' },
      { char: '≫', name: 'Much Greater', code: 'U+226B' },
      { char: '∞', name: 'Infinity', code: 'U+221E' },
      { char: '∑', name: 'Sum', code: 'U+2211' },
      { char: '∏', name: 'Product', code: 'U+220F' },
      { char: '√', name: 'Square Root', code: 'U+221A' },
      { char: '∛', name: 'Cube Root', code: 'U+221B' },
      { char: '∜', name: 'Fourth Root', code: 'U+221C' },
      { char: '∫', name: 'Integral', code: 'U+222B' },
      { char: '∬', name: 'Double Integral', code: 'U+222C' },
      { char: '∭', name: 'Triple Integral', code: 'U+222D' },
      { char: '∂', name: 'Partial', code: 'U+2202' },
      { char: '∆', name: 'Delta', code: 'U+2206' },
      { char: '∇', name: 'Nabla', code: 'U+2207' },
      { char: '∈', name: 'Element Of', code: 'U+2208' },
      { char: '∉', name: 'Not Element', code: 'U+2209' },
      { char: '∋', name: 'Contains', code: 'U+220B' },
      { char: '∌', name: 'Not Contains', code: 'U+220C' },
      { char: '∩', name: 'Intersection', code: 'U+2229' },
      { char: '∪', name: 'Union', code: 'U+222A' },
      { char: '⊂', name: 'Subset', code: 'U+2282' },
      { char: '⊃', name: 'Superset', code: 'U+2283' },
      { char: '⊄', name: 'Not Subset', code: 'U+2284' },
      { char: '⊆', name: 'Subset Equal', code: 'U+2286' },
      { char: '⊇', name: 'Superset Equal', code: 'U+2287' },
      { char: '∅', name: 'Empty Set', code: 'U+2205' },
      { char: '∀', name: 'For All', code: 'U+2200' },
      { char: '∃', name: 'Exists', code: 'U+2203' },
      { char: '∄', name: 'Not Exists', code: 'U+2204' },
      { char: '∧', name: 'And', code: 'U+2227' },
      { char: '∨', name: 'Or', code: 'U+2228' },
      { char: '⊕', name: 'XOR', code: 'U+2295' },
      { char: '⊗', name: 'Tensor', code: 'U+2297' },
      { char: '⊥', name: 'Perpendicular', code: 'U+22A5' },
      { char: '∥', name: 'Parallel', code: 'U+2225' },
      { char: '∠', name: 'Angle', code: 'U+2220' },
      { char: '∟', name: 'Right Angle', code: 'U+221F' },
      { char: '°', name: 'Degree', code: 'U+00B0' },
      { char: '′', name: 'Prime', code: 'U+2032' },
      { char: '″', name: 'Double Prime', code: 'U+2033' },
      { char: '‴', name: 'Triple Prime', code: 'U+2034' },
      { char: 'π', name: 'Pi', code: 'U+03C0' },
      { char: 'ℯ', name: 'Euler e', code: 'U+212F' },
      { char: 'ℕ', name: 'Natural Nums', code: 'U+2115' },
      { char: 'ℤ', name: 'Integers', code: 'U+2124' },
      { char: 'ℚ', name: 'Rationals', code: 'U+211A' },
      { char: 'ℝ', name: 'Reals', code: 'U+211D' },
      { char: 'ℂ', name: 'Complex', code: 'U+2102' },
      { char: '⁰', name: 'Super 0', code: 'U+2070' },
      { char: '¹', name: 'Super 1', code: 'U+00B9' },
      { char: '²', name: 'Super 2', code: 'U+00B2' },
      { char: '³', name: 'Super 3', code: 'U+00B3' },
      { char: '⁴', name: 'Super 4', code: 'U+2074' },
      { char: '⁵', name: 'Super 5', code: 'U+2075' },
      { char: '⁶', name: 'Super 6', code: 'U+2076' },
      { char: '⁷', name: 'Super 7', code: 'U+2077' },
      { char: '⁸', name: 'Super 8', code: 'U+2078' },
      { char: '⁹', name: 'Super 9', code: 'U+2079' },
      { char: '₀', name: 'Sub 0', code: 'U+2080' },
      { char: '₁', name: 'Sub 1', code: 'U+2081' },
      { char: '₂', name: 'Sub 2', code: 'U+2082' },
      { char: '₃', name: 'Sub 3', code: 'U+2083' },
      { char: '₄', name: 'Sub 4', code: 'U+2084' },
      { char: '₅', name: 'Sub 5', code: 'U+2085' },
      { char: '₆', name: 'Sub 6', code: 'U+2086' },
      { char: '₇', name: 'Sub 7', code: 'U+2087' },
      { char: '₈', name: 'Sub 8', code: 'U+2088' },
      { char: '₉', name: 'Sub 9', code: 'U+2089' },
      { char: '½', name: 'Half', code: 'U+00BD' },
      { char: '⅓', name: 'Third', code: 'U+2153' },
      { char: '¼', name: 'Quarter', code: 'U+00BC' },
      { char: '⅕', name: 'Fifth', code: 'U+2155' },
      { char: '⅙', name: 'Sixth', code: 'U+2159' },
      { char: '⅛', name: 'Eighth', code: 'U+215B' },
      { char: '⅔', name: 'Two Thirds', code: 'U+2154' },
      { char: '¾', name: 'Three Quarters', code: 'U+00BE' },
      { char: '⅖', name: 'Two Fifths', code: 'U+2156' },
      { char: '⅗', name: 'Three Fifths', code: 'U+2157' },
      { char: '⅘', name: 'Four Fifths', code: 'U+2158' },
      { char: '⅚', name: 'Five Sixths', code: 'U+215A' }
    ],
    arrows: [
      { char: '←', name: 'Left Arrow', code: 'U+2190' },
      { char: '→', name: 'Right Arrow', code: 'U+2192' },
      { char: '↑', name: 'Up Arrow', code: 'U+2191' },
      { char: '↓', name: 'Down Arrow', code: 'U+2193' },
      { char: '↔', name: 'Left Right', code: 'U+2194' },
      { char: '↕', name: 'Up Down', code: 'U+2195' },
      { char: '↖', name: 'NW Arrow', code: 'U+2196' },
      { char: '↗', name: 'NE Arrow', code: 'U+2197' },
      { char: '↘', name: 'SE Arrow', code: 'U+2198' },
      { char: '↙', name: 'SW Arrow', code: 'U+2199' },
      { char: '⇐', name: 'Double Left', code: 'U+21D0' },
      { char: '⇒', name: 'Double Right', code: 'U+21D2' },
      { char: '⇑', name: 'Double Up', code: 'U+21D1' },
      { char: '⇓', name: 'Double Down', code: 'U+21D3' },
      { char: '⇔', name: 'Double LR', code: 'U+21D4' },
      { char: '⇕', name: 'Double UD', code: 'U+21D5' },
      { char: '⇖', name: 'Double NW', code: 'U+21D6' },
      { char: '⇗', name: 'Double NE', code: 'U+21D7' },
      { char: '⇘', name: 'Double SE', code: 'U+21D8' },
      { char: '⇙', name: 'Double SW', code: 'U+21D9' },
      { char: '↩', name: 'Return Left', code: 'U+21A9' },
      { char: '↪', name: 'Return Right', code: 'U+21AA' },
      { char: '↫', name: 'Loop Left', code: 'U+21AB' },
      { char: '↬', name: 'Loop Right', code: 'U+21AC' },
      { char: '↯', name: 'Zigzag Down', code: 'U+21AF' },
      { char: '↰', name: 'Up Left', code: 'U+21B0' },
      { char: '↱', name: 'Up Right', code: 'U+21B1' },
      { char: '↲', name: 'Down Left', code: 'U+21B2' },
      { char: '↳', name: 'Down Right', code: 'U+21B3' },
      { char: '↴', name: 'Right Down', code: 'U+21B4' },
      { char: '↵', name: 'Enter', code: 'U+21B5' },
      { char: '↶', name: 'Undo', code: 'U+21B6' },
      { char: '↷', name: 'Redo', code: 'U+21B7' },
      { char: '↺', name: 'CCW Circle', code: 'U+21BA' },
      { char: '↻', name: 'CW Circle', code: 'U+21BB' },
      { char: '⟲', name: 'CCW Open', code: 'U+27F2' },
      { char: '⟳', name: 'CW Open', code: 'U+27F3' },
      { char: '➔', name: 'Arrow Right', code: 'U+2794' },
      { char: '➜', name: 'Arrow Bold', code: 'U+279C' },
      { char: '➝', name: 'Arrow Dashed', code: 'U+279D' },
      { char: '➞', name: 'Arrow Heavy', code: 'U+279E' },
      { char: '➟', name: 'Arrow Draft', code: 'U+279F' },
      { char: '➠', name: 'Arrow White', code: 'U+27A0' },
      { char: '➡', name: 'Arrow Black', code: 'U+27A1' },
      { char: '➢', name: 'Arrow 3D Top', code: 'U+27A2' },
      { char: '➣', name: 'Arrow 3D Bot', code: 'U+27A3' },
      { char: '➤', name: 'Arrow Point', code: 'U+27A4' },
      { char: '➥', name: 'Arrow Curved', code: 'U+27A5' },
      { char: '➦', name: 'Arrow Curved Down', code: 'U+27A6' },
      { char: '➧', name: 'Arrow Squat', code: 'U+27A7' },
      { char: '➨', name: 'Arrow Heavy Black', code: 'U+27A8' },
      { char: '➩', name: 'Arrow Drafting', code: 'U+27A9' },
      { char: '➪', name: 'Arrow Drafting Heavy', code: 'U+27AA' },
      { char: '➫', name: 'Arrow Concave', code: 'U+27AB' },
      { char: '➬', name: 'Arrow Concave Heavy', code: 'U+27AC' },
      { char: '➭', name: 'Arrow Tail', code: 'U+27AD' },
      { char: '➮', name: 'Arrow Tail Heavy', code: 'U+27AE' },
      { char: '➯', name: 'Arrow Wedge', code: 'U+27AF' },
      { char: '➱', name: 'Arrow Notched', code: 'U+27B1' },
      { char: '➲', name: 'Arrow Circle', code: 'U+27B2' },
      { char: '➳', name: 'Arrow Feathered', code: 'U+27B3' },
      { char: '➴', name: 'Arrow SE Feathered', code: 'U+27B4' },
      { char: '➵', name: 'Arrow Right Feathered', code: 'U+27B5' },
      { char: '➶', name: 'Arrow NE Feathered', code: 'U+27B6' },
      { char: '➷', name: 'Arrow SE Heavy', code: 'U+27B7' },
      { char: '➸', name: 'Arrow Right Heavy', code: 'U+27B8' },
      { char: '➹', name: 'Arrow NE Heavy', code: 'U+27B9' },
      { char: '➺', name: 'Arrow Teardrop', code: 'U+27BA' },
      { char: '➻', name: 'Arrow Triangle', code: 'U+27BB' },
      { char: '➼', name: 'Arrow Wedge Tail', code: 'U+27BC' },
      { char: '➽', name: 'Arrow Wedge Tail Heavy', code: 'U+27BD' },
      { char: '➾', name: 'Arrow Open Outline', code: 'U+27BE' },
      { char: '⬅', name: 'Left Black', code: 'U+2B05' },
      { char: '⬆', name: 'Up Black', code: 'U+2B06' },
      { char: '⬇', name: 'Down Black', code: 'U+2B07' },
      { char: '⬈', name: 'NE Black', code: 'U+2B08' },
      { char: '⬉', name: 'NW Black', code: 'U+2B09' },
      { char: '⬊', name: 'SE Black', code: 'U+2B0A' },
      { char: '⬋', name: 'SW Black', code: 'U+2B0B' },
      { char: '⬌', name: 'LR Black', code: 'U+2B0C' },
      { char: '⬍', name: 'UD Black', code: 'U+2B0D' }
    ],
    currency: [
      { char: '$', name: 'Dollar', code: 'U+0024' },
      { char: '€', name: 'Euro', code: 'U+20AC' },
      { char: '£', name: 'Pound', code: 'U+00A3' },
      { char: '¥', name: 'Yen', code: 'U+00A5' },
      { char: '¢', name: 'Cent', code: 'U+00A2' },
      { char: '₹', name: 'Rupee', code: 'U+20B9' },
      { char: '₿', name: 'Bitcoin', code: 'U+20BF' },
      { char: '₩', name: 'Won', code: 'U+20A9' },
      { char: '₽', name: 'Ruble', code: 'U+20BD' },
      { char: '₺', name: 'Lira', code: 'U+20BA' },
      { char: '฿', name: 'Baht', code: 'U+0E3F' },
      { char: '₴', name: 'Hryvnia', code: 'U+20B4' },
      { char: '₱', name: 'Peso', code: 'U+20B1' },
      { char: '₲', name: 'Guarani', code: 'U+20B2' },
      { char: '₳', name: 'Austral', code: 'U+20B3' },
      { char: '₵', name: 'Cedi', code: 'U+20B5' },
      { char: '₶', name: 'Livre', code: 'U+20B6' },
      { char: '₷', name: 'Spesmilo', code: 'U+20B7' },
      { char: '₸', name: 'Tenge', code: 'U+20B8' },
      { char: '₼', name: 'Manat', code: 'U+20BC' },
      { char: '₾', name: 'Lari', code: 'U+20BE' },
      { char: '₻', name: 'Nordic Mark', code: 'U+20BB' },
      { char: '৳', name: 'Taka', code: 'U+09F3' },
      { char: '៛', name: 'Riel', code: 'U+17DB' },
      { char: '₡', name: 'Colon', code: 'U+20A1' },
      { char: '₢', name: 'Cruzeiro', code: 'U+20A2' },
      { char: '₣', name: 'Franc', code: 'U+20A3' },
      { char: '₤', name: 'Lira Old', code: 'U+20A4' },
      { char: '₥', name: 'Mill', code: 'U+20A5' },
      { char: '₦', name: 'Naira', code: 'U+20A6' },
      { char: '₧', name: 'Peseta', code: 'U+20A7' },
      { char: '₨', name: 'Rupee Old', code: 'U+20A8' },
      { char: '₪', name: 'Shekel', code: 'U+20AA' },
      { char: '₫', name: 'Dong', code: 'U+20AB' },
      { char: '₭', name: 'Kip', code: 'U+20AD' },
      { char: '₮', name: 'Tugrik', code: 'U+20AE' },
      { char: '₯', name: 'Drachma', code: 'U+20AF' },
      { char: '₰', name: 'Pfennig', code: 'U+20B0' }
    ],
    letters: [
      { char: 'À', name: 'A Grave', code: 'U+00C0' },
      { char: 'Á', name: 'A Acute', code: 'U+00C1' },
      { char: 'Â', name: 'A Circumflex', code: 'U+00C2' },
      { char: 'Ã', name: 'A Tilde', code: 'U+00C3' },
      { char: 'Ä', name: 'A Diaeresis', code: 'U+00C4' },
      { char: 'Å', name: 'A Ring', code: 'U+00C5' },
      { char: 'Æ', name: 'AE', code: 'U+00C6' },
      { char: 'Ç', name: 'C Cedilla', code: 'U+00C7' },
      { char: 'È', name: 'E Grave', code: 'U+00C8' },
      { char: 'É', name: 'E Acute', code: 'U+00C9' },
      { char: 'Ê', name: 'E Circumflex', code: 'U+00CA' },
      { char: 'Ë', name: 'E Diaeresis', code: 'U+00CB' },
      { char: 'Ì', name: 'I Grave', code: 'U+00CC' },
      { char: 'Í', name: 'I Acute', code: 'U+00CD' },
      { char: 'Î', name: 'I Circumflex', code: 'U+00CE' },
      { char: 'Ï', name: 'I Diaeresis', code: 'U+00CF' },
      { char: 'Ð', name: 'Eth', code: 'U+00D0' },
      { char: 'Ñ', name: 'N Tilde', code: 'U+00D1' },
      { char: 'Ò', name: 'O Grave', code: 'U+00D2' },
      { char: 'Ó', name: 'O Acute', code: 'U+00D3' },
      { char: 'Ô', name: 'O Circumflex', code: 'U+00D4' },
      { char: 'Õ', name: 'O Tilde', code: 'U+00D5' },
      { char: 'Ö', name: 'O Diaeresis', code: 'U+00D6' },
      { char: 'Ø', name: 'O Stroke', code: 'U+00D8' },
      { char: 'Ù', name: 'U Grave', code: 'U+00D9' },
      { char: 'Ú', name: 'U Acute', code: 'U+00DA' },
      { char: 'Û', name: 'U Circumflex', code: 'U+00DB' },
      { char: 'Ü', name: 'U Diaeresis', code: 'U+00DC' },
      { char: 'Ý', name: 'Y Acute', code: 'U+00DD' },
      { char: 'Þ', name: 'Thorn', code: 'U+00DE' },
      { char: 'ß', name: 'Sharp S', code: 'U+00DF' },
      { char: 'à', name: 'a Grave', code: 'U+00E0' },
      { char: 'á', name: 'a Acute', code: 'U+00E1' },
      { char: 'â', name: 'a Circumflex', code: 'U+00E2' },
      { char: 'ã', name: 'a Tilde', code: 'U+00E3' },
      { char: 'ä', name: 'a Diaeresis', code: 'U+00E4' },
      { char: 'å', name: 'a Ring', code: 'U+00E5' },
      { char: 'æ', name: 'ae', code: 'U+00E6' },
      { char: 'ç', name: 'c Cedilla', code: 'U+00E7' },
      { char: 'è', name: 'e Grave', code: 'U+00E8' },
      { char: 'é', name: 'e Acute', code: 'U+00E9' },
      { char: 'ê', name: 'e Circumflex', code: 'U+00EA' },
      { char: 'ë', name: 'e Diaeresis', code: 'U+00EB' },
      { char: 'ì', name: 'i Grave', code: 'U+00EC' },
      { char: 'í', name: 'i Acute', code: 'U+00ED' },
      { char: 'î', name: 'i Circumflex', code: 'U+00EE' },
      { char: 'ï', name: 'i Diaeresis', code: 'U+00EF' },
      { char: 'ð', name: 'eth', code: 'U+00F0' },
      { char: 'ñ', name: 'n Tilde', code: 'U+00F1' },
      { char: 'ò', name: 'o Grave', code: 'U+00F2' },
      { char: 'ó', name: 'o Acute', code: 'U+00F3' },
      { char: 'ô', name: 'o Circumflex', code: 'U+00F4' },
      { char: 'õ', name: 'o Tilde', code: 'U+00F5' },
      { char: 'ö', name: 'o Diaeresis', code: 'U+00F6' },
      { char: 'ø', name: 'o Stroke', code: 'U+00F8' },
      { char: 'ù', name: 'u Grave', code: 'U+00F9' },
      { char: 'ú', name: 'u Acute', code: 'U+00FA' },
      { char: 'û', name: 'u Circumflex', code: 'U+00FB' },
      { char: 'ü', name: 'u Diaeresis', code: 'U+00FC' },
      { char: 'ý', name: 'y Acute', code: 'U+00FD' },
      { char: 'þ', name: 'thorn', code: 'U+00FE' },
      { char: 'ÿ', name: 'y Diaeresis', code: 'U+00FF' },
      { char: 'Œ', name: 'OE', code: 'U+0152' },
      { char: 'œ', name: 'oe', code: 'U+0153' },
      { char: 'Š', name: 'S Caron', code: 'U+0160' },
      { char: 'š', name: 's Caron', code: 'U+0161' },
      { char: 'Ÿ', name: 'Y Diaeresis', code: 'U+0178' },
      { char: 'Ž', name: 'Z Caron', code: 'U+017D' },
      { char: 'ž', name: 'z Caron', code: 'U+017E' },
      { char: 'ƒ', name: 'f Hook', code: 'U+0192' },
      { char: 'Ā', name: 'A Macron', code: 'U+0100' },
      { char: 'ā', name: 'a Macron', code: 'U+0101' },
      { char: 'Ă', name: 'A Breve', code: 'U+0102' },
      { char: 'ă', name: 'a Breve', code: 'U+0103' },
      { char: 'Ą', name: 'A Ogonek', code: 'U+0104' },
      { char: 'ą', name: 'a Ogonek', code: 'U+0105' },
      { char: 'Ć', name: 'C Acute', code: 'U+0106' },
      { char: 'ć', name: 'c Acute', code: 'U+0107' },
      { char: 'Ĉ', name: 'C Circumflex', code: 'U+0108' },
      { char: 'ĉ', name: 'c Circumflex', code: 'U+0109' },
      { char: 'Č', name: 'C Caron', code: 'U+010C' },
      { char: 'č', name: 'c Caron', code: 'U+010D' },
      { char: 'Ď', name: 'D Caron', code: 'U+010E' },
      { char: 'ď', name: 'd Caron', code: 'U+010F' },
      { char: 'Đ', name: 'D Stroke', code: 'U+0110' },
      { char: 'đ', name: 'd Stroke', code: 'U+0111' },
      { char: 'Ē', name: 'E Macron', code: 'U+0112' },
      { char: 'ē', name: 'e Macron', code: 'U+0113' },
      { char: 'Ė', name: 'E Dot Above', code: 'U+0116' },
      { char: 'ė', name: 'e Dot Above', code: 'U+0117' },
      { char: 'Ę', name: 'E Ogonek', code: 'U+0118' },
      { char: 'ę', name: 'e Ogonek', code: 'U+0119' },
      { char: 'Ě', name: 'E Caron', code: 'U+011A' },
      { char: 'ě', name: 'e Caron', code: 'U+011B' },
      { char: 'Ğ', name: 'G Breve', code: 'U+011E' },
      { char: 'ğ', name: 'g Breve', code: 'U+011F' },
      { char: 'İ', name: 'I Dot Above', code: 'U+0130' },
      { char: 'ı', name: 'Dotless i', code: 'U+0131' },
      { char: 'Ł', name: 'L Stroke', code: 'U+0141' },
      { char: 'ł', name: 'l Stroke', code: 'U+0142' },
      { char: 'Ń', name: 'N Acute', code: 'U+0143' },
      { char: 'ń', name: 'n Acute', code: 'U+0144' },
      { char: 'Ň', name: 'N Caron', code: 'U+0147' },
      { char: 'ň', name: 'n Caron', code: 'U+0148' },
      { char: 'Ō', name: 'O Macron', code: 'U+014C' },
      { char: 'ō', name: 'o Macron', code: 'U+014D' },
      { char: 'Ő', name: 'O Double Acute', code: 'U+0150' },
      { char: 'ő', name: 'o Double Acute', code: 'U+0151' },
      { char: 'Ř', name: 'R Caron', code: 'U+0158' },
      { char: 'ř', name: 'r Caron', code: 'U+0159' },
      { char: 'Ś', name: 'S Acute', code: 'U+015A' },
      { char: 'ś', name: 's Acute', code: 'U+015B' },
      { char: 'Ş', name: 'S Cedilla', code: 'U+015E' },
      { char: 'ş', name: 's Cedilla', code: 'U+015F' },
      { char: 'Ť', name: 'T Caron', code: 'U+0164' },
      { char: 'ť', name: 't Caron', code: 'U+0165' },
      { char: 'Ū', name: 'U Macron', code: 'U+016A' },
      { char: 'ū', name: 'u Macron', code: 'U+016B' },
      { char: 'Ů', name: 'U Ring', code: 'U+016E' },
      { char: 'ů', name: 'u Ring', code: 'U+016F' },
      { char: 'Ű', name: 'U Double Acute', code: 'U+0170' },
      { char: 'ű', name: 'u Double Acute', code: 'U+0171' },
      { char: 'Ź', name: 'Z Acute', code: 'U+0179' },
      { char: 'ź', name: 'z Acute', code: 'U+017A' },
      { char: 'Ż', name: 'Z Dot Above', code: 'U+017B' },
      { char: 'ż', name: 'z Dot Above', code: 'U+017C' }
    ],
    greek: [
      { char: 'Α', name: 'Alpha Upper', code: 'U+0391' },
      { char: 'Β', name: 'Beta Upper', code: 'U+0392' },
      { char: 'Γ', name: 'Gamma Upper', code: 'U+0393' },
      { char: 'Δ', name: 'Delta Upper', code: 'U+0394' },
      { char: 'Ε', name: 'Epsilon Upper', code: 'U+0395' },
      { char: 'Ζ', name: 'Zeta Upper', code: 'U+0396' },
      { char: 'Η', name: 'Eta Upper', code: 'U+0397' },
      { char: 'Θ', name: 'Theta Upper', code: 'U+0398' },
      { char: 'Ι', name: 'Iota Upper', code: 'U+0399' },
      { char: 'Κ', name: 'Kappa Upper', code: 'U+039A' },
      { char: 'Λ', name: 'Lambda Upper', code: 'U+039B' },
      { char: 'Μ', name: 'Mu Upper', code: 'U+039C' },
      { char: 'Ν', name: 'Nu Upper', code: 'U+039D' },
      { char: 'Ξ', name: 'Xi Upper', code: 'U+039E' },
      { char: 'Ο', name: 'Omicron Upper', code: 'U+039F' },
      { char: 'Π', name: 'Pi Upper', code: 'U+03A0' },
      { char: 'Ρ', name: 'Rho Upper', code: 'U+03A1' },
      { char: 'Σ', name: 'Sigma Upper', code: 'U+03A3' },
      { char: 'Τ', name: 'Tau Upper', code: 'U+03A4' },
      { char: 'Υ', name: 'Upsilon Upper', code: 'U+03A5' },
      { char: 'Φ', name: 'Phi Upper', code: 'U+03A6' },
      { char: 'Χ', name: 'Chi Upper', code: 'U+03A7' },
      { char: 'Ψ', name: 'Psi Upper', code: 'U+03A8' },
      { char: 'Ω', name: 'Omega Upper', code: 'U+03A9' },
      { char: 'α', name: 'Alpha', code: 'U+03B1' },
      { char: 'β', name: 'Beta', code: 'U+03B2' },
      { char: 'γ', name: 'Gamma', code: 'U+03B3' },
      { char: 'δ', name: 'Delta', code: 'U+03B4' },
      { char: 'ε', name: 'Epsilon', code: 'U+03B5' },
      { char: 'ζ', name: 'Zeta', code: 'U+03B6' },
      { char: 'η', name: 'Eta', code: 'U+03B7' },
      { char: 'θ', name: 'Theta', code: 'U+03B8' },
      { char: 'ι', name: 'Iota', code: 'U+03B9' },
      { char: 'κ', name: 'Kappa', code: 'U+03BA' },
      { char: 'λ', name: 'Lambda', code: 'U+03BB' },
      { char: 'μ', name: 'Mu', code: 'U+03BC' },
      { char: 'ν', name: 'Nu', code: 'U+03BD' },
      { char: 'ξ', name: 'Xi', code: 'U+03BE' },
      { char: 'ο', name: 'Omicron', code: 'U+03BF' },
      { char: 'π', name: 'Pi', code: 'U+03C0' },
      { char: 'ρ', name: 'Rho', code: 'U+03C1' },
      { char: 'ς', name: 'Sigma Final', code: 'U+03C2' },
      { char: 'σ', name: 'Sigma', code: 'U+03C3' },
      { char: 'τ', name: 'Tau', code: 'U+03C4' },
      { char: 'υ', name: 'Upsilon', code: 'U+03C5' },
      { char: 'φ', name: 'Phi', code: 'U+03C6' },
      { char: 'χ', name: 'Chi', code: 'U+03C7' },
      { char: 'ψ', name: 'Psi', code: 'U+03C8' },
      { char: 'ω', name: 'Omega', code: 'U+03C9' }
    ],
    emoji: [
      { char: '😀', name: 'Grinning', code: 'U+1F600' },
      { char: '😁', name: 'Beaming', code: 'U+1F601' },
      { char: '😂', name: 'Joy', code: 'U+1F602' },
      { char: '🤣', name: 'ROFL', code: 'U+1F923' },
      { char: '😃', name: 'Smiley', code: 'U+1F603' },
      { char: '😄', name: 'Smile', code: 'U+1F604' },
      { char: '😅', name: 'Sweat Smile', code: 'U+1F605' },
      { char: '😆', name: 'Laughing', code: 'U+1F606' },
      { char: '😉', name: 'Wink', code: 'U+1F609' },
      { char: '😊', name: 'Blush', code: 'U+1F60A' },
      { char: '😋', name: 'Yum', code: 'U+1F60B' },
      { char: '😎', name: 'Sunglasses', code: 'U+1F60E' },
      { char: '😍', name: 'Heart Eyes', code: 'U+1F60D' },
      { char: '🥰', name: 'Love Face', code: 'U+1F970' },
      { char: '😘', name: 'Kiss', code: 'U+1F618' },
      { char: '😗', name: 'Kissing', code: 'U+1F617' },
      { char: '😙', name: 'Kiss Smile', code: 'U+1F619' },
      { char: '😚', name: 'Kiss Closed', code: 'U+1F61A' },
      { char: '🙂', name: 'Slight Smile', code: 'U+1F642' },
      { char: '🤗', name: 'Hugging', code: 'U+1F917' },
      { char: '🤔', name: 'Thinking', code: 'U+1F914' },
      { char: '🤨', name: 'Raised Brow', code: 'U+1F928' },
      { char: '😐', name: 'Neutral', code: 'U+1F610' },
      { char: '😑', name: 'Expressionless', code: 'U+1F611' },
      { char: '😶', name: 'No Mouth', code: 'U+1F636' },
      { char: '🙄', name: 'Eye Roll', code: 'U+1F644' },
      { char: '😏', name: 'Smirk', code: 'U+1F60F' },
      { char: '😣', name: 'Persevere', code: 'U+1F623' },
      { char: '😥', name: 'Sad Relief', code: 'U+1F625' },
      { char: '😮', name: 'Open Mouth', code: 'U+1F62E' },
      { char: '🤐', name: 'Zipper', code: 'U+1F910' },
      { char: '😯', name: 'Hushed', code: 'U+1F62F' },
      { char: '😪', name: 'Sleepy', code: 'U+1F62A' },
      { char: '😫', name: 'Tired', code: 'U+1F62B' },
      { char: '😴', name: 'Sleeping', code: 'U+1F634' },
      { char: '😌', name: 'Relieved', code: 'U+1F60C' },
      { char: '😛', name: 'Tongue', code: 'U+1F61B' },
      { char: '😜', name: 'Wink Tongue', code: 'U+1F61C' },
      { char: '😝', name: 'Squint Tongue', code: 'U+1F61D' },
      { char: '🤤', name: 'Drooling', code: 'U+1F924' },
      { char: '😒', name: 'Unamused', code: 'U+1F612' },
      { char: '😓', name: 'Sweat', code: 'U+1F613' },
      { char: '😔', name: 'Pensive', code: 'U+1F614' },
      { char: '😕', name: 'Confused', code: 'U+1F615' },
      { char: '🙃', name: 'Upside Down', code: 'U+1F643' },
      { char: '🤑', name: 'Money Face', code: 'U+1F911' },
      { char: '😲', name: 'Astonished', code: 'U+1F632' },
      { char: '😱', name: 'Scream', code: 'U+1F631' },
      { char: '😨', name: 'Fearful', code: 'U+1F628' },
      { char: '😰', name: 'Anxious', code: 'U+1F630' },
      { char: '😢', name: 'Cry', code: 'U+1F622' },
      { char: '😭', name: 'Sob', code: 'U+1F62D' },
      { char: '😤', name: 'Triumph', code: 'U+1F624' },
      { char: '😡', name: 'Angry', code: 'U+1F621' },
      { char: '😠', name: 'Rage', code: 'U+1F620' },
      { char: '🤬', name: 'Cursing', code: 'U+1F92C' },
      { char: '😈', name: 'Imp Smile', code: 'U+1F608' },
      { char: '👿', name: 'Imp Angry', code: 'U+1F47F' },
      { char: '💀', name: 'Skull', code: 'U+1F480' },
      { char: '☠️', name: 'Crossbones', code: 'U+2620' },
      { char: '👍', name: 'Thumbs Up', code: 'U+1F44D' },
      { char: '👎', name: 'Thumbs Down', code: 'U+1F44E' },
      { char: '👌', name: 'OK Hand', code: 'U+1F44C' },
      { char: '✌️', name: 'Victory', code: 'U+270C' },
      { char: '🤞', name: 'Crossed Fingers', code: 'U+1F91E' },
      { char: '🤟', name: 'Love You', code: 'U+1F91F' },
      { char: '🤘', name: 'Rock On', code: 'U+1F918' },
      { char: '👋', name: 'Wave', code: 'U+1F44B' },
      { char: '🤚', name: 'Raised Back', code: 'U+1F91A' },
      { char: '✋', name: 'Raised Hand', code: 'U+270B' },
      { char: '🖐️', name: 'Splayed Hand', code: 'U+1F590' },
      { char: '👏', name: 'Clap', code: 'U+1F44F' },
      { char: '🙌', name: 'Raised Hands', code: 'U+1F64C' },
      { char: '🙏', name: 'Pray', code: 'U+1F64F' },
      { char: '💪', name: 'Muscle', code: 'U+1F4AA' },
      { char: '❤️', name: 'Red Heart', code: 'U+2764' },
      { char: '🧡', name: 'Orange Heart', code: 'U+1F9E1' },
      { char: '💛', name: 'Yellow Heart', code: 'U+1F49B' },
      { char: '💚', name: 'Green Heart', code: 'U+1F49A' },
      { char: '💙', name: 'Blue Heart', code: 'U+1F499' },
      { char: '💜', name: 'Purple Heart', code: 'U+1F49C' },
      { char: '🖤', name: 'Black Heart', code: 'U+1F5A4' },
      { char: '🤍', name: 'White Heart', code: 'U+1F90D' },
      { char: '💔', name: 'Broken Heart', code: 'U+1F494' },
      { char: '💕', name: 'Two Hearts', code: 'U+1F495' },
      { char: '💖', name: 'Sparkling Heart', code: 'U+1F496' },
      { char: '💗', name: 'Growing Heart', code: 'U+1F497' },
      { char: '💘', name: 'Cupid', code: 'U+1F498' },
      { char: '⭐', name: 'Star', code: 'U+2B50' },
      { char: '🌟', name: 'Glowing Star', code: 'U+1F31F' },
      { char: '✨', name: 'Sparkles', code: 'U+2728' },
      { char: '⚡', name: 'Lightning', code: 'U+26A1' },
      { char: '🔥', name: 'Fire', code: 'U+1F525' },
      { char: '💥', name: 'Collision', code: 'U+1F4A5' },
      { char: '🎉', name: 'Party', code: 'U+1F389' },
      { char: '🎊', name: 'Confetti', code: 'U+1F38A' },
      { char: '🎁', name: 'Gift', code: 'U+1F381' },
      { char: '🏆', name: 'Trophy', code: 'U+1F3C6' },
      { char: '🥇', name: 'Gold Medal', code: 'U+1F947' },
      { char: '🥈', name: 'Silver Medal', code: 'U+1F948' },
      { char: '🥉', name: 'Bronze Medal', code: 'U+1F949' },
      { char: '💡', name: 'Light Bulb', code: 'U+1F4A1' },
      { char: '💎', name: 'Gem', code: 'U+1F48E' },
      { char: '🔔', name: 'Bell', code: 'U+1F514' },
      { char: '🔕', name: 'No Bell', code: 'U+1F515' },
      { char: '📢', name: 'Loudspeaker', code: 'U+1F4E2' },
      { char: '📣', name: 'Megaphone', code: 'U+1F4E3' },
      { char: '💬', name: 'Speech', code: 'U+1F4AC' },
      { char: '💭', name: 'Thought', code: 'U+1F4AD' },
      { char: '🗨️', name: 'Left Speech', code: 'U+1F5E8' },
      { char: '✅', name: 'Check', code: 'U+2705' },
      { char: '❌', name: 'Cross', code: 'U+274C' },
      { char: '❓', name: 'Question', code: 'U+2753' },
      { char: '❗', name: 'Exclamation', code: 'U+2757' },
      { char: '⚠️', name: 'Warning', code: 'U+26A0' },
      { char: '🚀', name: 'Rocket', code: 'U+1F680' },
      { char: '🎯', name: 'Target', code: 'U+1F3AF' },
      { char: '📌', name: 'Pin', code: 'U+1F4CC' },
      { char: '📍', name: 'Location', code: 'U+1F4CD' },
      { char: '🔗', name: 'Link', code: 'U+1F517' },
      { char: '📧', name: 'Email', code: 'U+1F4E7' },
      { char: '📱', name: 'Phone', code: 'U+1F4F1' },
      { char: '💻', name: 'Laptop', code: 'U+1F4BB' },
      { char: '🖥️', name: 'Desktop', code: 'U+1F5A5' },
      { char: '⌨️', name: 'Keyboard', code: 'U+2328' },
      { char: '🖱️', name: 'Mouse', code: 'U+1F5B1' },
      { char: '📷', name: 'Camera', code: 'U+1F4F7' },
      { char: '🎬', name: 'Clapper', code: 'U+1F3AC' },
      { char: '🎵', name: 'Music Note', code: 'U+1F3B5' },
      { char: '🎶', name: 'Music Notes', code: 'U+1F3B6' }
    ]
  };

  const state = {
    category: 'symbols',
    selected: null,
    recent: []
  };

  const elements = {};

  function initElements() {
    elements.searchInput = document.getElementById('searchInput');
    elements.categoryTabs = document.querySelectorAll('.category-tab');
    elements.charGrid = document.getElementById('charGrid');
    elements.charPreview = document.getElementById('charPreview');
    elements.charName = document.getElementById('charName');
    elements.charUnicode = document.getElementById('charUnicode');
    elements.charHTML = document.getElementById('charHTML');
    elements.copyCharBtn = document.getElementById('copyCharBtn');
    elements.copyUnicodeBtn = document.getElementById('copyUnicodeBtn');
    elements.copyHtmlBtn = document.getElementById('copyHtmlBtn');
    elements.recentGrid = document.getElementById('recentGrid');
    elements.clearRecentBtn = document.getElementById('clearRecentBtn');
  }

  const showToast = (message, type) => ToolsCommon.showToast(message, type);

  function renderCharacters(filter = '') {
    let chars = CHARACTERS[state.category];

    if (filter) {
      const filterLower = filter.toLowerCase();
      chars = Object.values(CHARACTERS).flat().filter(c =>
        c.name.toLowerCase().includes(filterLower) ||
        c.char.includes(filter)
      );
    }

    elements.charGrid.innerHTML = chars.map(c => `
      <div class="char-item" data-char="${c.char}" data-name="${c.name}" data-code="${c.code}">
        ${c.char}
      </div>
    `).join('');

    elements.charGrid.querySelectorAll('.char-item').forEach(item => {
      item.addEventListener('click', () => selectCharacter(item));
    });
  }

  function selectCharacter(item) {
    elements.charGrid.querySelectorAll('.char-item').forEach(i => i.classList.remove('selected'));
    item.classList.add('selected');

    const char = item.dataset.char;
    const name = item.dataset.name;
    const code = item.dataset.code;

    state.selected = { char, name, code };

    elements.charPreview.textContent = char;
    elements.charName.textContent = name;
    elements.charUnicode.textContent = `Unicode: ${code}`;
    elements.charHTML.textContent = `HTML: &#${char.codePointAt(0)};`;
  }

  function fallbackCopy(text, successMsg) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(successMsg, 'success');
      return true;
    } catch (err) {
      showToast('Failed to copy', 'error');
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }

  function copyToClipboard(text, successMsg, callback) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg, 'success');
        if (callback) callback();
      }).catch(() => {
        if (fallbackCopy(text, successMsg) && callback) callback();
      });
    } else {
      if (fallbackCopy(text, successMsg) && callback) callback();
    }
  }

  function copyCharacter() {
    if (!state.selected) {
      showToast('Select a character first', 'error');
      return;
    }
    copyToClipboard(state.selected.char, `Copied: ${state.selected.char}`, () => {
      addToRecent(state.selected);
    });
  }

  function copyUnicode() {
    if (!state.selected) {
      showToast('Select a character first', 'error');
      return;
    }
    copyToClipboard(state.selected.code, `Copied: ${state.selected.code}`);
  }

  function copyHtml() {
    if (!state.selected) {
      showToast('Select a character first', 'error');
      return;
    }
    const htmlCode = `&#${state.selected.char.codePointAt(0)};`;
    copyToClipboard(htmlCode, `Copied: ${htmlCode}`);
  }

  function addToRecent(charData) {
    state.recent = state.recent.filter(c => c.char !== charData.char);
    state.recent.unshift(charData);
    if (state.recent.length > 10) state.recent.pop();
    renderRecent();
    localStorage.setItem('charmap_recent', JSON.stringify(state.recent));
  }

  function loadRecent() {
    const saved = localStorage.getItem('charmap_recent');
    if (saved) {
      state.recent = JSON.parse(saved);
      renderRecent();
    }
  }

  function renderRecent() {
    elements.recentGrid.innerHTML = state.recent.map(c => `
      <div class="char-item" data-char="${c.char}" data-name="${c.name}" data-code="${c.code}">
        ${c.char}
      </div>
    `).join('');

    elements.recentGrid.querySelectorAll('.char-item').forEach(item => {
      item.addEventListener('click', () => {
        state.selected = { char: item.dataset.char, name: item.dataset.name, code: item.dataset.code };
        elements.charPreview.textContent = item.dataset.char;
        elements.charName.textContent = item.dataset.name;
        elements.charUnicode.textContent = `Unicode: ${item.dataset.code}`;
        elements.charHTML.textContent = `HTML: &#${item.dataset.char.codePointAt(0)};`;
      });
    });
  }

  function setCategory(category) {
    state.category = category;
    elements.categoryTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === category);
    });
    elements.searchInput.value = '';
    renderCharacters();
  }

  function clearRecent() {
    state.recent = [];
    localStorage.removeItem('charmap_recent');
    renderRecent();
    showToast('Recent cleared', 'success');
  }

  function handleKeydown(e) {
    if (e.target.matches('input')) return;

    if (e.key === '/') {
      e.preventDefault();
      elements.searchInput.focus();
    }

    if (e.key.toLowerCase() === 'r') {
      e.preventDefault();
      clearRecent();
    }
  }

  function init() {
    initElements();
    loadRecent();

    elements.categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => setCategory(tab.dataset.category));
    });

    elements.searchInput.addEventListener('input', (e) => {
      renderCharacters(e.target.value);
    });

    elements.copyCharBtn.addEventListener('click', copyCharacter);
    if (elements.copyUnicodeBtn) {
      elements.copyUnicodeBtn.addEventListener('click', copyUnicode);
    }
    if (elements.copyHtmlBtn) {
      elements.copyHtmlBtn.addEventListener('click', copyHtml);
    }
    if (elements.clearRecentBtn) {
      elements.clearRecentBtn.addEventListener('click', clearRecent);
    }
    document.addEventListener('keydown', handleKeydown);

    renderCharacters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
