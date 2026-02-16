/**
 * Emoji Picker Tool
 * Search and copy emojis with categories
 */

(function() {
  'use strict';

  // ============================================
  // Emoji Data
  // ============================================
  const emojiData = {
    smileys: [
      { emoji: '😀', name: 'grinning face', code: ':grinning:' },
      { emoji: '😃', name: 'grinning face with big eyes', code: ':smiley:' },
      { emoji: '😄', name: 'grinning face with smiling eyes', code: ':smile:' },
      { emoji: '😁', name: 'beaming face with smiling eyes', code: ':grin:' },
      { emoji: '😆', name: 'grinning squinting face', code: ':laughing:' },
      { emoji: '😅', name: 'grinning face with sweat', code: ':sweat_smile:' },
      { emoji: '🤣', name: 'rolling on the floor laughing', code: ':rofl:' },
      { emoji: '😂', name: 'face with tears of joy', code: ':joy:' },
      { emoji: '🙂', name: 'slightly smiling face', code: ':slightly_smiling_face:' },
      { emoji: '😊', name: 'smiling face with smiling eyes', code: ':blush:' },
      { emoji: '😇', name: 'smiling face with halo', code: ':innocent:' },
      { emoji: '🥰', name: 'smiling face with hearts', code: ':smiling_face_with_hearts:' },
      { emoji: '😍', name: 'smiling face with heart-eyes', code: ':heart_eyes:' },
      { emoji: '🤩', name: 'star-struck', code: ':star_struck:' },
      { emoji: '😘', name: 'face blowing a kiss', code: ':kissing_heart:' },
      { emoji: '😗', name: 'kissing face', code: ':kissing:' },
      { emoji: '😚', name: 'kissing face with closed eyes', code: ':kissing_closed_eyes:' },
      { emoji: '😙', name: 'kissing face with smiling eyes', code: ':kissing_smiling_eyes:' },
      { emoji: '🥲', name: 'smiling face with tear', code: ':smiling_face_with_tear:' },
      { emoji: '😋', name: 'face savoring food', code: ':yum:' },
      { emoji: '😛', name: 'face with tongue', code: ':stuck_out_tongue:' },
      { emoji: '😜', name: 'winking face with tongue', code: ':stuck_out_tongue_winking_eye:' },
      { emoji: '🤪', name: 'zany face', code: ':zany_face:' },
      { emoji: '😝', name: 'squinting face with tongue', code: ':stuck_out_tongue_closed_eyes:' },
      { emoji: '🤑', name: 'money-mouth face', code: ':money_mouth_face:' },
      { emoji: '🤗', name: 'hugging face', code: ':hugs:' },
      { emoji: '🤭', name: 'face with hand over mouth', code: ':hand_over_mouth:' },
      { emoji: '🤫', name: 'shushing face', code: ':shushing_face:' },
      { emoji: '🤔', name: 'thinking face', code: ':thinking:' },
      { emoji: '🤐', name: 'zipper-mouth face', code: ':zipper_mouth_face:' },
      { emoji: '🤨', name: 'face with raised eyebrow', code: ':raised_eyebrow:' },
      { emoji: '😐', name: 'neutral face', code: ':neutral_face:' },
      { emoji: '😑', name: 'expressionless face', code: ':expressionless:' },
      { emoji: '😶', name: 'face without mouth', code: ':no_mouth:' },
      { emoji: '😏', name: 'smirking face', code: ':smirk:' },
      { emoji: '😒', name: 'unamused face', code: ':unamused:' },
      { emoji: '🙄', name: 'face with rolling eyes', code: ':roll_eyes:' },
      { emoji: '😬', name: 'grimacing face', code: ':grimacing:' },
      { emoji: '🤥', name: 'lying face', code: ':lying_face:' },
      { emoji: '😌', name: 'relieved face', code: ':relieved:' },
      { emoji: '😔', name: 'pensive face', code: ':pensive:' },
      { emoji: '😪', name: 'sleepy face', code: ':sleepy:' },
      { emoji: '🤤', name: 'drooling face', code: ':drooling_face:' },
      { emoji: '😴', name: 'sleeping face', code: ':sleeping:' },
      { emoji: '😷', name: 'face with medical mask', code: ':mask:' },
      { emoji: '🤒', name: 'face with thermometer', code: ':face_with_thermometer:' },
      { emoji: '🤕', name: 'face with head-bandage', code: ':face_with_head_bandage:' },
      { emoji: '🤢', name: 'nauseated face', code: ':nauseated_face:' },
      { emoji: '🤮', name: 'face vomiting', code: ':vomiting_face:' },
      { emoji: '🤧', name: 'sneezing face', code: ':sneezing_face:' },
      { emoji: '🥵', name: 'hot face', code: ':hot_face:' },
      { emoji: '🥶', name: 'cold face', code: ':cold_face:' },
      { emoji: '🥴', name: 'woozy face', code: ':woozy_face:' },
      { emoji: '😵', name: 'dizzy face', code: ':dizzy_face:' },
      { emoji: '🤯', name: 'exploding head', code: ':exploding_head:' },
      { emoji: '🤠', name: 'cowboy hat face', code: ':cowboy_hat_face:' },
      { emoji: '🥳', name: 'partying face', code: ':partying_face:' },
      { emoji: '🥸', name: 'disguised face', code: ':disguised_face:' },
      { emoji: '😎', name: 'smiling face with sunglasses', code: ':sunglasses:' },
      { emoji: '🤓', name: 'nerd face', code: ':nerd_face:' },
      { emoji: '🧐', name: 'face with monocle', code: ':monocle_face:' },
      { emoji: '😕', name: 'confused face', code: ':confused:' },
      { emoji: '😟', name: 'worried face', code: ':worried:' },
      { emoji: '🙁', name: 'slightly frowning face', code: ':slightly_frowning_face:' },
      { emoji: '😮', name: 'face with open mouth', code: ':open_mouth:' },
      { emoji: '😯', name: 'hushed face', code: ':hushed:' },
      { emoji: '😲', name: 'astonished face', code: ':astonished:' },
      { emoji: '😳', name: 'flushed face', code: ':flushed:' },
      { emoji: '🥺', name: 'pleading face', code: ':pleading_face:' },
      { emoji: '😦', name: 'frowning face with open mouth', code: ':frowning:' },
      { emoji: '😧', name: 'anguished face', code: ':anguished:' },
      { emoji: '😨', name: 'fearful face', code: ':fearful:' },
      { emoji: '😰', name: 'anxious face with sweat', code: ':cold_sweat:' },
      { emoji: '😥', name: 'sad but relieved face', code: ':disappointed_relieved:' },
      { emoji: '😢', name: 'crying face', code: ':cry:' },
      { emoji: '😭', name: 'loudly crying face', code: ':sob:' },
      { emoji: '😱', name: 'face screaming in fear', code: ':scream:' },
      { emoji: '😖', name: 'confounded face', code: ':confounded:' },
      { emoji: '😣', name: 'persevering face', code: ':persevere:' },
      { emoji: '😞', name: 'disappointed face', code: ':disappointed:' },
      { emoji: '😓', name: 'downcast face with sweat', code: ':sweat:' },
      { emoji: '😩', name: 'weary face', code: ':weary:' },
      { emoji: '😫', name: 'tired face', code: ':tired_face:' },
      { emoji: '🥱', name: 'yawning face', code: ':yawning_face:' },
      { emoji: '😤', name: 'face with steam from nose', code: ':triumph:' },
      { emoji: '😡', name: 'pouting face', code: ':rage:' },
      { emoji: '😠', name: 'angry face', code: ':angry:' },
      { emoji: '🤬', name: 'face with symbols on mouth', code: ':cursing_face:' },
      { emoji: '😈', name: 'smiling face with horns', code: ':smiling_imp:' },
      { emoji: '👿', name: 'angry face with horns', code: ':imp:' },
      { emoji: '💀', name: 'skull', code: ':skull:' },
      { emoji: '☠️', name: 'skull and crossbones', code: ':skull_and_crossbones:' },
      { emoji: '💩', name: 'pile of poo', code: ':poop:' },
      { emoji: '🤡', name: 'clown face', code: ':clown_face:' },
      { emoji: '👹', name: 'ogre', code: ':japanese_ogre:' },
      { emoji: '👺', name: 'goblin', code: ':japanese_goblin:' },
      { emoji: '👻', name: 'ghost', code: ':ghost:' },
      { emoji: '👽', name: 'alien', code: ':alien:' },
      { emoji: '👾', name: 'alien monster', code: ':space_invader:' },
      { emoji: '🤖', name: 'robot', code: ':robot:' }
    ],
    people: [
      { emoji: '👋', name: 'waving hand', code: ':wave:' },
      { emoji: '🤚', name: 'raised back of hand', code: ':raised_back_of_hand:' },
      { emoji: '🖐️', name: 'hand with fingers splayed', code: ':raised_hand_with_fingers_splayed:' },
      { emoji: '✋', name: 'raised hand', code: ':hand:' },
      { emoji: '🖖', name: 'vulcan salute', code: ':vulcan_salute:' },
      { emoji: '👌', name: 'OK hand', code: ':ok_hand:' },
      { emoji: '🤌', name: 'pinched fingers', code: ':pinched_fingers:' },
      { emoji: '🤏', name: 'pinching hand', code: ':pinching_hand:' },
      { emoji: '✌️', name: 'victory hand', code: ':v:' },
      { emoji: '🤞', name: 'crossed fingers', code: ':crossed_fingers:' },
      { emoji: '🤟', name: 'love-you gesture', code: ':love_you_gesture:' },
      { emoji: '🤘', name: 'sign of the horns', code: ':metal:' },
      { emoji: '🤙', name: 'call me hand', code: ':call_me_hand:' },
      { emoji: '👈', name: 'backhand index pointing left', code: ':point_left:' },
      { emoji: '👉', name: 'backhand index pointing right', code: ':point_right:' },
      { emoji: '👆', name: 'backhand index pointing up', code: ':point_up_2:' },
      { emoji: '🖕', name: 'middle finger', code: ':middle_finger:' },
      { emoji: '👇', name: 'backhand index pointing down', code: ':point_down:' },
      { emoji: '☝️', name: 'index pointing up', code: ':point_up:' },
      { emoji: '👍', name: 'thumbs up', code: ':+1:' },
      { emoji: '👎', name: 'thumbs down', code: ':-1:' },
      { emoji: '✊', name: 'raised fist', code: ':fist:' },
      { emoji: '👊', name: 'oncoming fist', code: ':punch:' },
      { emoji: '🤛', name: 'left-facing fist', code: ':fist_left:' },
      { emoji: '🤜', name: 'right-facing fist', code: ':fist_right:' },
      { emoji: '👏', name: 'clapping hands', code: ':clap:' },
      { emoji: '🙌', name: 'raising hands', code: ':raised_hands:' },
      { emoji: '👐', name: 'open hands', code: ':open_hands:' },
      { emoji: '🤲', name: 'palms up together', code: ':palms_up_together:' },
      { emoji: '🤝', name: 'handshake', code: ':handshake:' },
      { emoji: '🙏', name: 'folded hands', code: ':pray:' },
      { emoji: '✍️', name: 'writing hand', code: ':writing_hand:' },
      { emoji: '💪', name: 'flexed biceps', code: ':muscle:' },
      { emoji: '🦵', name: 'leg', code: ':leg:' },
      { emoji: '🦶', name: 'foot', code: ':foot:' },
      { emoji: '👂', name: 'ear', code: ':ear:' },
      { emoji: '👃', name: 'nose', code: ':nose:' },
      { emoji: '🧠', name: 'brain', code: ':brain:' },
      { emoji: '👀', name: 'eyes', code: ':eyes:' },
      { emoji: '👁️', name: 'eye', code: ':eye:' },
      { emoji: '👅', name: 'tongue', code: ':tongue:' },
      { emoji: '👄', name: 'mouth', code: ':lips:' },
      { emoji: '👶', name: 'baby', code: ':baby:' },
      { emoji: '🧒', name: 'child', code: ':child:' },
      { emoji: '👦', name: 'boy', code: ':boy:' },
      { emoji: '👧', name: 'girl', code: ':girl:' },
      { emoji: '🧑', name: 'person', code: ':adult:' },
      { emoji: '👱', name: 'person: blond hair', code: ':blond_haired_person:' },
      { emoji: '👨', name: 'man', code: ':man:' },
      { emoji: '👩', name: 'woman', code: ':woman:' },
      { emoji: '🧓', name: 'older person', code: ':older_adult:' },
      { emoji: '👴', name: 'old man', code: ':older_man:' },
      { emoji: '👵', name: 'old woman', code: ':older_woman:' }
    ],
    animals: [
      { emoji: '🐶', name: 'dog face', code: ':dog:' },
      { emoji: '🐱', name: 'cat face', code: ':cat:' },
      { emoji: '🐭', name: 'mouse face', code: ':mouse:' },
      { emoji: '🐹', name: 'hamster', code: ':hamster:' },
      { emoji: '🐰', name: 'rabbit face', code: ':rabbit:' },
      { emoji: '🦊', name: 'fox', code: ':fox_face:' },
      { emoji: '🐻', name: 'bear', code: ':bear:' },
      { emoji: '🐼', name: 'panda', code: ':panda_face:' },
      { emoji: '🐨', name: 'koala', code: ':koala:' },
      { emoji: '🐯', name: 'tiger face', code: ':tiger:' },
      { emoji: '🦁', name: 'lion', code: ':lion:' },
      { emoji: '🐮', name: 'cow face', code: ':cow:' },
      { emoji: '🐷', name: 'pig face', code: ':pig:' },
      { emoji: '🐸', name: 'frog', code: ':frog:' },
      { emoji: '🐵', name: 'monkey face', code: ':monkey_face:' },
      { emoji: '🙈', name: 'see-no-evil monkey', code: ':see_no_evil:' },
      { emoji: '🙉', name: 'hear-no-evil monkey', code: ':hear_no_evil:' },
      { emoji: '🙊', name: 'speak-no-evil monkey', code: ':speak_no_evil:' },
      { emoji: '🐒', name: 'monkey', code: ':monkey:' },
      { emoji: '🐔', name: 'chicken', code: ':chicken:' },
      { emoji: '🐧', name: 'penguin', code: ':penguin:' },
      { emoji: '🐦', name: 'bird', code: ':bird:' },
      { emoji: '🐤', name: 'baby chick', code: ':baby_chick:' },
      { emoji: '🐣', name: 'hatching chick', code: ':hatching_chick:' },
      { emoji: '🐥', name: 'front-facing baby chick', code: ':hatched_chick:' },
      { emoji: '🦆', name: 'duck', code: ':duck:' },
      { emoji: '🦅', name: 'eagle', code: ':eagle:' },
      { emoji: '🦉', name: 'owl', code: ':owl:' },
      { emoji: '🦇', name: 'bat', code: ':bat:' },
      { emoji: '🐺', name: 'wolf', code: ':wolf:' },
      { emoji: '🐗', name: 'boar', code: ':boar:' },
      { emoji: '🐴', name: 'horse face', code: ':horse:' },
      { emoji: '🦄', name: 'unicorn', code: ':unicorn:' },
      { emoji: '🐝', name: 'honeybee', code: ':bee:' },
      { emoji: '🐛', name: 'bug', code: ':bug:' },
      { emoji: '🦋', name: 'butterfly', code: ':butterfly:' },
      { emoji: '🐌', name: 'snail', code: ':snail:' },
      { emoji: '🐞', name: 'lady beetle', code: ':ladybug:' },
      { emoji: '🐜', name: 'ant', code: ':ant:' },
      { emoji: '🦟', name: 'mosquito', code: ':mosquito:' },
      { emoji: '🐢', name: 'turtle', code: ':turtle:' },
      { emoji: '🐍', name: 'snake', code: ':snake:' },
      { emoji: '🦎', name: 'lizard', code: ':lizard:' },
      { emoji: '🦖', name: 't-rex', code: ':t_rex:' },
      { emoji: '🦕', name: 'sauropod', code: ':sauropod:' },
      { emoji: '🐙', name: 'octopus', code: ':octopus:' },
      { emoji: '🦑', name: 'squid', code: ':squid:' },
      { emoji: '🦐', name: 'shrimp', code: ':shrimp:' },
      { emoji: '🦞', name: 'lobster', code: ':lobster:' },
      { emoji: '🦀', name: 'crab', code: ':crab:' },
      { emoji: '🐡', name: 'blowfish', code: ':blowfish:' },
      { emoji: '🐠', name: 'tropical fish', code: ':tropical_fish:' },
      { emoji: '🐟', name: 'fish', code: ':fish:' },
      { emoji: '🐬', name: 'dolphin', code: ':dolphin:' },
      { emoji: '🐳', name: 'spouting whale', code: ':whale:' },
      { emoji: '🐋', name: 'whale', code: ':whale2:' },
      { emoji: '🦈', name: 'shark', code: ':shark:' },
      { emoji: '🐊', name: 'crocodile', code: ':crocodile:' },
      { emoji: '🐅', name: 'tiger', code: ':tiger2:' },
      { emoji: '🐆', name: 'leopard', code: ':leopard:' },
      { emoji: '🦓', name: 'zebra', code: ':zebra:' },
      { emoji: '🦍', name: 'gorilla', code: ':gorilla:' },
      { emoji: '🦧', name: 'orangutan', code: ':orangutan:' },
      { emoji: '🐘', name: 'elephant', code: ':elephant:' },
      { emoji: '🦛', name: 'hippopotamus', code: ':hippopotamus:' },
      { emoji: '🦏', name: 'rhinoceros', code: ':rhinoceros:' },
      { emoji: '🐪', name: 'camel', code: ':dromedary_camel:' },
      { emoji: '🐫', name: 'two-hump camel', code: ':camel:' },
      { emoji: '🦒', name: 'giraffe', code: ':giraffe:' },
      { emoji: '🦘', name: 'kangaroo', code: ':kangaroo:' },
      { emoji: '🐃', name: 'water buffalo', code: ':water_buffalo:' },
      { emoji: '🐂', name: 'ox', code: ':ox:' },
      { emoji: '🐄', name: 'cow', code: ':cow2:' },
      { emoji: '🌸', name: 'cherry blossom', code: ':cherry_blossom:' },
      { emoji: '🌹', name: 'rose', code: ':rose:' },
      { emoji: '🌺', name: 'hibiscus', code: ':hibiscus:' },
      { emoji: '🌻', name: 'sunflower', code: ':sunflower:' },
      { emoji: '🌼', name: 'blossom', code: ':blossom:' },
      { emoji: '🌷', name: 'tulip', code: ':tulip:' },
      { emoji: '🌱', name: 'seedling', code: ':seedling:' },
      { emoji: '🌲', name: 'evergreen tree', code: ':evergreen_tree:' },
      { emoji: '🌳', name: 'deciduous tree', code: ':deciduous_tree:' },
      { emoji: '🌴', name: 'palm tree', code: ':palm_tree:' },
      { emoji: '🌵', name: 'cactus', code: ':cactus:' },
      { emoji: '🌾', name: 'sheaf of rice', code: ':ear_of_rice:' },
      { emoji: '🌿', name: 'herb', code: ':herb:' },
      { emoji: '🍀', name: 'four leaf clover', code: ':four_leaf_clover:' },
      { emoji: '🍁', name: 'maple leaf', code: ':maple_leaf:' },
      { emoji: '🍂', name: 'fallen leaf', code: ':fallen_leaf:' },
      { emoji: '🍃', name: 'leaf fluttering in wind', code: ':leaves:' }
    ],
    food: [
      { emoji: '🍎', name: 'red apple', code: ':apple:' },
      { emoji: '🍐', name: 'pear', code: ':pear:' },
      { emoji: '🍊', name: 'tangerine', code: ':tangerine:' },
      { emoji: '🍋', name: 'lemon', code: ':lemon:' },
      { emoji: '🍌', name: 'banana', code: ':banana:' },
      { emoji: '🍉', name: 'watermelon', code: ':watermelon:' },
      { emoji: '🍇', name: 'grapes', code: ':grapes:' },
      { emoji: '🍓', name: 'strawberry', code: ':strawberry:' },
      { emoji: '🫐', name: 'blueberries', code: ':blueberries:' },
      { emoji: '🍈', name: 'melon', code: ':melon:' },
      { emoji: '🍒', name: 'cherries', code: ':cherries:' },
      { emoji: '🍑', name: 'peach', code: ':peach:' },
      { emoji: '🥭', name: 'mango', code: ':mango:' },
      { emoji: '🍍', name: 'pineapple', code: ':pineapple:' },
      { emoji: '🥥', name: 'coconut', code: ':coconut:' },
      { emoji: '🥝', name: 'kiwi fruit', code: ':kiwi_fruit:' },
      { emoji: '🍅', name: 'tomato', code: ':tomato:' },
      { emoji: '🥑', name: 'avocado', code: ':avocado:' },
      { emoji: '🍆', name: 'eggplant', code: ':eggplant:' },
      { emoji: '🥔', name: 'potato', code: ':potato:' },
      { emoji: '🥕', name: 'carrot', code: ':carrot:' },
      { emoji: '🌽', name: 'ear of corn', code: ':corn:' },
      { emoji: '🌶️', name: 'hot pepper', code: ':hot_pepper:' },
      { emoji: '🫑', name: 'bell pepper', code: ':bell_pepper:' },
      { emoji: '🥒', name: 'cucumber', code: ':cucumber:' },
      { emoji: '🥬', name: 'leafy green', code: ':leafy_green:' },
      { emoji: '🥦', name: 'broccoli', code: ':broccoli:' },
      { emoji: '🧄', name: 'garlic', code: ':garlic:' },
      { emoji: '🧅', name: 'onion', code: ':onion:' },
      { emoji: '🍄', name: 'mushroom', code: ':mushroom:' },
      { emoji: '🥜', name: 'peanuts', code: ':peanuts:' },
      { emoji: '🌰', name: 'chestnut', code: ':chestnut:' },
      { emoji: '🍞', name: 'bread', code: ':bread:' },
      { emoji: '🥐', name: 'croissant', code: ':croissant:' },
      { emoji: '🥖', name: 'baguette bread', code: ':baguette_bread:' },
      { emoji: '🥨', name: 'pretzel', code: ':pretzel:' },
      { emoji: '🥯', name: 'bagel', code: ':bagel:' },
      { emoji: '🥞', name: 'pancakes', code: ':pancakes:' },
      { emoji: '🧇', name: 'waffle', code: ':waffle:' },
      { emoji: '🧀', name: 'cheese wedge', code: ':cheese:' },
      { emoji: '🍖', name: 'meat on bone', code: ':meat_on_bone:' },
      { emoji: '🍗', name: 'poultry leg', code: ':poultry_leg:' },
      { emoji: '🥩', name: 'cut of meat', code: ':cut_of_meat:' },
      { emoji: '🥓', name: 'bacon', code: ':bacon:' },
      { emoji: '🍔', name: 'hamburger', code: ':hamburger:' },
      { emoji: '🍟', name: 'french fries', code: ':fries:' },
      { emoji: '🍕', name: 'pizza', code: ':pizza:' },
      { emoji: '🌭', name: 'hot dog', code: ':hotdog:' },
      { emoji: '🥪', name: 'sandwich', code: ':sandwich:' },
      { emoji: '🌮', name: 'taco', code: ':taco:' },
      { emoji: '🌯', name: 'burrito', code: ':burrito:' },
      { emoji: '🥙', name: 'stuffed flatbread', code: ':stuffed_flatbread:' },
      { emoji: '🧆', name: 'falafel', code: ':falafel:' },
      { emoji: '🥚', name: 'egg', code: ':egg:' },
      { emoji: '🍳', name: 'cooking', code: ':fried_egg:' },
      { emoji: '🥘', name: 'shallow pan of food', code: ':shallow_pan_of_food:' },
      { emoji: '🍲', name: 'pot of food', code: ':stew:' },
      { emoji: '🥣', name: 'bowl with spoon', code: ':bowl_with_spoon:' },
      { emoji: '🥗', name: 'green salad', code: ':green_salad:' },
      { emoji: '🍿', name: 'popcorn', code: ':popcorn:' },
      { emoji: '🧈', name: 'butter', code: ':butter:' },
      { emoji: '🧂', name: 'salt', code: ':salt:' },
      { emoji: '🥫', name: 'canned food', code: ':canned_food:' },
      { emoji: '🍱', name: 'bento box', code: ':bento:' },
      { emoji: '🍘', name: 'rice cracker', code: ':rice_cracker:' },
      { emoji: '🍙', name: 'rice ball', code: ':rice_ball:' },
      { emoji: '🍚', name: 'cooked rice', code: ':rice:' },
      { emoji: '🍛', name: 'curry rice', code: ':curry:' },
      { emoji: '🍜', name: 'steaming bowl', code: ':ramen:' },
      { emoji: '🍝', name: 'spaghetti', code: ':spaghetti:' },
      { emoji: '🍠', name: 'roasted sweet potato', code: ':sweet_potato:' },
      { emoji: '🍢', name: 'oden', code: ':oden:' },
      { emoji: '🍣', name: 'sushi', code: ':sushi:' },
      { emoji: '🍤', name: 'fried shrimp', code: ':fried_shrimp:' },
      { emoji: '🍥', name: 'fish cake with swirl', code: ':fish_cake:' },
      { emoji: '🥮', name: 'moon cake', code: ':moon_cake:' },
      { emoji: '🍡', name: 'dango', code: ':dango:' },
      { emoji: '🥟', name: 'dumpling', code: ':dumpling:' },
      { emoji: '🥠', name: 'fortune cookie', code: ':fortune_cookie:' },
      { emoji: '🥡', name: 'takeout box', code: ':takeout_box:' },
      { emoji: '🦀', name: 'crab', code: ':crab:' },
      { emoji: '🍦', name: 'soft ice cream', code: ':icecream:' },
      { emoji: '🍧', name: 'shaved ice', code: ':shaved_ice:' },
      { emoji: '🍨', name: 'ice cream', code: ':ice_cream:' },
      { emoji: '🍩', name: 'doughnut', code: ':doughnut:' },
      { emoji: '🍪', name: 'cookie', code: ':cookie:' },
      { emoji: '🎂', name: 'birthday cake', code: ':birthday:' },
      { emoji: '🍰', name: 'shortcake', code: ':cake:' },
      { emoji: '🧁', name: 'cupcake', code: ':cupcake:' },
      { emoji: '🥧', name: 'pie', code: ':pie:' },
      { emoji: '🍫', name: 'chocolate bar', code: ':chocolate_bar:' },
      { emoji: '🍬', name: 'candy', code: ':candy:' },
      { emoji: '🍭', name: 'lollipop', code: ':lollipop:' },
      { emoji: '🍮', name: 'custard', code: ':custard:' },
      { emoji: '🍯', name: 'honey pot', code: ':honey_pot:' },
      { emoji: '🍼', name: 'baby bottle', code: ':baby_bottle:' },
      { emoji: '🥛', name: 'glass of milk', code: ':milk_glass:' },
      { emoji: '☕', name: 'hot beverage', code: ':coffee:' },
      { emoji: '🍵', name: 'teacup without handle', code: ':tea:' },
      { emoji: '🧃', name: 'beverage box', code: ':beverage_box:' },
      { emoji: '🥤', name: 'cup with straw', code: ':cup_with_straw:' },
      { emoji: '🧋', name: 'bubble tea', code: ':bubble_tea:' },
      { emoji: '🍶', name: 'sake', code: ':sake:' },
      { emoji: '🍺', name: 'beer mug', code: ':beer:' },
      { emoji: '🍻', name: 'clinking beer mugs', code: ':beers:' },
      { emoji: '🥂', name: 'clinking glasses', code: ':clinking_glasses:' },
      { emoji: '🍷', name: 'wine glass', code: ':wine_glass:' },
      { emoji: '🥃', name: 'tumbler glass', code: ':tumbler_glass:' },
      { emoji: '🍸', name: 'cocktail glass', code: ':cocktail:' },
      { emoji: '🍹', name: 'tropical drink', code: ':tropical_drink:' },
      { emoji: '🧊', name: 'ice', code: ':ice_cube:' }
    ],
    travel: [
      { emoji: '🚗', name: 'automobile', code: ':car:' },
      { emoji: '🚕', name: 'taxi', code: ':taxi:' },
      { emoji: '🚙', name: 'sport utility vehicle', code: ':blue_car:' },
      { emoji: '🚌', name: 'bus', code: ':bus:' },
      { emoji: '🚎', name: 'trolleybus', code: ':trolleybus:' },
      { emoji: '🏎️', name: 'racing car', code: ':racing_car:' },
      { emoji: '🚓', name: 'police car', code: ':police_car:' },
      { emoji: '🚑', name: 'ambulance', code: ':ambulance:' },
      { emoji: '🚒', name: 'fire engine', code: ':fire_engine:' },
      { emoji: '🚐', name: 'minibus', code: ':minibus:' },
      { emoji: '🚚', name: 'delivery truck', code: ':truck:' },
      { emoji: '🚛', name: 'articulated lorry', code: ':articulated_lorry:' },
      { emoji: '🚜', name: 'tractor', code: ':tractor:' },
      { emoji: '🏍️', name: 'motorcycle', code: ':motorcycle:' },
      { emoji: '🚲', name: 'bicycle', code: ':bike:' },
      { emoji: '🛴', name: 'kick scooter', code: ':kick_scooter:' },
      { emoji: '🚨', name: 'police car light', code: ':rotating_light:' },
      { emoji: '🚔', name: 'oncoming police car', code: ':oncoming_police_car:' },
      { emoji: '🚍', name: 'oncoming bus', code: ':oncoming_bus:' },
      { emoji: '🚘', name: 'oncoming automobile', code: ':oncoming_automobile:' },
      { emoji: '🚖', name: 'oncoming taxi', code: ':oncoming_taxi:' },
      { emoji: '✈️', name: 'airplane', code: ':airplane:' },
      { emoji: '🛫', name: 'airplane departure', code: ':flight_departure:' },
      { emoji: '🛬', name: 'airplane arrival', code: ':flight_arrival:' },
      { emoji: '🚀', name: 'rocket', code: ':rocket:' },
      { emoji: '🛸', name: 'flying saucer', code: ':flying_saucer:' },
      { emoji: '🚁', name: 'helicopter', code: ':helicopter:' },
      { emoji: '🛶', name: 'canoe', code: ':canoe:' },
      { emoji: '⛵', name: 'sailboat', code: ':sailboat:' },
      { emoji: '🚤', name: 'speedboat', code: ':speedboat:' },
      { emoji: '🛥️', name: 'motor boat', code: ':motor_boat:' },
      { emoji: '🛳️', name: 'passenger ship', code: ':passenger_ship:' },
      { emoji: '⛴️', name: 'ferry', code: ':ferry:' },
      { emoji: '🚢', name: 'ship', code: ':ship:' },
      { emoji: '🚂', name: 'locomotive', code: ':steam_locomotive:' },
      { emoji: '🚃', name: 'railway car', code: ':railway_car:' },
      { emoji: '🚄', name: 'high-speed train', code: ':bullettrain_side:' },
      { emoji: '🚅', name: 'bullet train', code: ':bullettrain_front:' },
      { emoji: '🚆', name: 'train', code: ':train2:' },
      { emoji: '🚇', name: 'metro', code: ':metro:' },
      { emoji: '🚈', name: 'light rail', code: ':light_rail:' },
      { emoji: '🚉', name: 'station', code: ':station:' },
      { emoji: '🚊', name: 'tram', code: ':tram:' },
      { emoji: '🗺️', name: 'world map', code: ':world_map:' },
      { emoji: '🗿', name: 'moai', code: ':moyai:' },
      { emoji: '🗽', name: 'Statue of Liberty', code: ':statue_of_liberty:' },
      { emoji: '🗼', name: 'Tokyo tower', code: ':tokyo_tower:' },
      { emoji: '🏰', name: 'castle', code: ':european_castle:' },
      { emoji: '🏯', name: 'Japanese castle', code: ':japanese_castle:' },
      { emoji: '🏟️', name: 'stadium', code: ':stadium:' },
      { emoji: '🎡', name: 'ferris wheel', code: ':ferris_wheel:' },
      { emoji: '🎢', name: 'roller coaster', code: ':roller_coaster:' },
      { emoji: '🎠', name: 'carousel horse', code: ':carousel_horse:' },
      { emoji: '⛲', name: 'fountain', code: ':fountain:' },
      { emoji: '⛱️', name: 'umbrella on ground', code: ':parasol_on_ground:' },
      { emoji: '🏖️', name: 'beach with umbrella', code: ':beach_umbrella:' },
      { emoji: '🏝️', name: 'desert island', code: ':desert_island:' },
      { emoji: '🏜️', name: 'desert', code: ':desert:' },
      { emoji: '🌋', name: 'volcano', code: ':volcano:' },
      { emoji: '⛰️', name: 'mountain', code: ':mountain:' },
      { emoji: '🏔️', name: 'snow-capped mountain', code: ':mountain_snow:' },
      { emoji: '🗻', name: 'mount fuji', code: ':mount_fuji:' },
      { emoji: '🏕️', name: 'camping', code: ':camping:' },
      { emoji: '⛺', name: 'tent', code: ':tent:' },
      { emoji: '🏠', name: 'house', code: ':house:' },
      { emoji: '🏡', name: 'house with garden', code: ':house_with_garden:' },
      { emoji: '🏢', name: 'office building', code: ':office:' },
      { emoji: '🏣', name: 'Japanese post office', code: ':post_office:' },
      { emoji: '🏤', name: 'post office', code: ':european_post_office:' },
      { emoji: '🏥', name: 'hospital', code: ':hospital:' },
      { emoji: '🏦', name: 'bank', code: ':bank:' },
      { emoji: '🏨', name: 'hotel', code: ':hotel:' },
      { emoji: '🏩', name: 'love hotel', code: ':love_hotel:' },
      { emoji: '🏪', name: 'convenience store', code: ':convenience_store:' },
      { emoji: '🏫', name: 'school', code: ':school:' },
      { emoji: '🏬', name: 'department store', code: ':department_store:' },
      { emoji: '🏭', name: 'factory', code: ':factory:' },
      { emoji: '🌃', name: 'night with stars', code: ':night_with_stars:' },
      { emoji: '🌉', name: 'bridge at night', code: ':bridge_at_night:' },
      { emoji: '🌁', name: 'foggy', code: ':foggy:' }
    ],
    activities: [
      { emoji: '⚽', name: 'soccer ball', code: ':soccer:' },
      { emoji: '🏀', name: 'basketball', code: ':basketball:' },
      { emoji: '🏈', name: 'american football', code: ':football:' },
      { emoji: '⚾', name: 'baseball', code: ':baseball:' },
      { emoji: '🥎', name: 'softball', code: ':softball:' },
      { emoji: '🎾', name: 'tennis', code: ':tennis:' },
      { emoji: '🏐', name: 'volleyball', code: ':volleyball:' },
      { emoji: '🏉', name: 'rugby football', code: ':rugby_football:' },
      { emoji: '🥏', name: 'flying disc', code: ':flying_disc:' },
      { emoji: '🎱', name: 'pool 8 ball', code: ':8ball:' },
      { emoji: '🪀', name: 'yo-yo', code: ':yo_yo:' },
      { emoji: '🏓', name: 'ping pong', code: ':ping_pong:' },
      { emoji: '🏸', name: 'badminton', code: ':badminton:' },
      { emoji: '🏒', name: 'ice hockey', code: ':ice_hockey:' },
      { emoji: '🏑', name: 'field hockey', code: ':field_hockey:' },
      { emoji: '🥍', name: 'lacrosse', code: ':lacrosse:' },
      { emoji: '🏏', name: 'cricket game', code: ':cricket_game:' },
      { emoji: '🪃', name: 'boomerang', code: ':boomerang:' },
      { emoji: '🥅', name: 'goal net', code: ':goal_net:' },
      { emoji: '⛳', name: 'flag in hole', code: ':golf:' },
      { emoji: '🪁', name: 'kite', code: ':kite:' },
      { emoji: '🏹', name: 'bow and arrow', code: ':bow_and_arrow:' },
      { emoji: '🎣', name: 'fishing pole', code: ':fishing_pole_and_fish:' },
      { emoji: '🤿', name: 'diving mask', code: ':diving_mask:' },
      { emoji: '🥊', name: 'boxing glove', code: ':boxing_glove:' },
      { emoji: '🥋', name: 'martial arts uniform', code: ':martial_arts_uniform:' },
      { emoji: '🎽', name: 'running shirt', code: ':running_shirt_with_sash:' },
      { emoji: '🛹', name: 'skateboard', code: ':skateboard:' },
      { emoji: '🛼', name: 'roller skate', code: ':roller_skate:' },
      { emoji: '🛷', name: 'sled', code: ':sled:' },
      { emoji: '⛸️', name: 'ice skate', code: ':ice_skate:' },
      { emoji: '🥌', name: 'curling stone', code: ':curling_stone:' },
      { emoji: '🎿', name: 'skis', code: ':ski:' },
      { emoji: '⛷️', name: 'skier', code: ':skier:' },
      { emoji: '🏂', name: 'snowboarder', code: ':snowboarder:' },
      { emoji: '🪂', name: 'parachute', code: ':parachute:' },
      { emoji: '🏋️', name: 'person lifting weights', code: ':weight_lifting:' },
      { emoji: '🤸', name: 'person cartwheeling', code: ':cartwheeling:' },
      { emoji: '⛹️', name: 'person bouncing ball', code: ':bouncing_ball_person:' },
      { emoji: '🏊', name: 'person swimming', code: ':swimming:' },
      { emoji: '🚴', name: 'person biking', code: ':biking:' },
      { emoji: '🧘', name: 'person in lotus position', code: ':lotus_position:' },
      { emoji: '🎪', name: 'circus tent', code: ':circus_tent:' },
      { emoji: '🎭', name: 'performing arts', code: ':performing_arts:' },
      { emoji: '🎨', name: 'artist palette', code: ':art:' },
      { emoji: '🎬', name: 'clapper board', code: ':clapper:' },
      { emoji: '🎤', name: 'microphone', code: ':microphone:' },
      { emoji: '🎧', name: 'headphone', code: ':headphones:' },
      { emoji: '🎼', name: 'musical score', code: ':musical_score:' },
      { emoji: '🎹', name: 'musical keyboard', code: ':musical_keyboard:' },
      { emoji: '🥁', name: 'drum', code: ':drum:' },
      { emoji: '🪘', name: 'long drum', code: ':long_drum:' },
      { emoji: '🎷', name: 'saxophone', code: ':saxophone:' },
      { emoji: '🎺', name: 'trumpet', code: ':trumpet:' },
      { emoji: '🎸', name: 'guitar', code: ':guitar:' },
      { emoji: '🪕', name: 'banjo', code: ':banjo:' },
      { emoji: '🎻', name: 'violin', code: ':violin:' },
      { emoji: '🎲', name: 'game die', code: ':game_die:' },
      { emoji: '♟️', name: 'chess pawn', code: ':chess_pawn:' },
      { emoji: '🎯', name: 'direct hit', code: ':dart:' },
      { emoji: '🎳', name: 'bowling', code: ':bowling:' },
      { emoji: '🎮', name: 'video game', code: ':video_game:' },
      { emoji: '🎰', name: 'slot machine', code: ':slot_machine:' },
      { emoji: '🧩', name: 'puzzle piece', code: ':jigsaw:' }
    ],
    objects: [
      { emoji: '⌚', name: 'watch', code: ':watch:' },
      { emoji: '📱', name: 'mobile phone', code: ':iphone:' },
      { emoji: '📲', name: 'mobile phone with arrow', code: ':calling:' },
      { emoji: '💻', name: 'laptop', code: ':computer:' },
      { emoji: '⌨️', name: 'keyboard', code: ':keyboard:' },
      { emoji: '🖥️', name: 'desktop computer', code: ':desktop_computer:' },
      { emoji: '🖨️', name: 'printer', code: ':printer:' },
      { emoji: '🖱️', name: 'computer mouse', code: ':computer_mouse:' },
      { emoji: '💾', name: 'floppy disk', code: ':floppy_disk:' },
      { emoji: '💿', name: 'optical disk', code: ':cd:' },
      { emoji: '📀', name: 'dvd', code: ':dvd:' },
      { emoji: '📷', name: 'camera', code: ':camera:' },
      { emoji: '📹', name: 'video camera', code: ':video_camera:' },
      { emoji: '🎥', name: 'movie camera', code: ':movie_camera:' },
      { emoji: '📞', name: 'telephone receiver', code: ':telephone_receiver:' },
      { emoji: '☎️', name: 'telephone', code: ':phone:' },
      { emoji: '📺', name: 'television', code: ':tv:' },
      { emoji: '📻', name: 'radio', code: ':radio:' },
      { emoji: '🔋', name: 'battery', code: ':battery:' },
      { emoji: '🔌', name: 'electric plug', code: ':electric_plug:' },
      { emoji: '💡', name: 'light bulb', code: ':bulb:' },
      { emoji: '🔦', name: 'flashlight', code: ':flashlight:' },
      { emoji: '🕯️', name: 'candle', code: ':candle:' },
      { emoji: '💰', name: 'money bag', code: ':moneybag:' },
      { emoji: '💵', name: 'dollar banknote', code: ':dollar:' },
      { emoji: '💴', name: 'yen banknote', code: ':yen:' },
      { emoji: '💶', name: 'euro banknote', code: ':euro:' },
      { emoji: '💷', name: 'pound banknote', code: ':pound:' },
      { emoji: '💳', name: 'credit card', code: ':credit_card:' },
      { emoji: '💎', name: 'gem stone', code: ':gem:' },
      { emoji: '🔧', name: 'wrench', code: ':wrench:' },
      { emoji: '🔨', name: 'hammer', code: ':hammer:' },
      { emoji: '🔩', name: 'nut and bolt', code: ':nut_and_bolt:' },
      { emoji: '⚙️', name: 'gear', code: ':gear:' },
      { emoji: '🔗', name: 'link', code: ':link:' },
      { emoji: '📎', name: 'paperclip', code: ':paperclip:' },
      { emoji: '📏', name: 'straight ruler', code: ':straight_ruler:' },
      { emoji: '📐', name: 'triangular ruler', code: ':triangular_ruler:' },
      { emoji: '✂️', name: 'scissors', code: ':scissors:' },
      { emoji: '📌', name: 'pushpin', code: ':pushpin:' },
      { emoji: '📍', name: 'round pushpin', code: ':round_pushpin:' },
      { emoji: '🔒', name: 'locked', code: ':lock:' },
      { emoji: '🔓', name: 'unlocked', code: ':unlock:' },
      { emoji: '🔑', name: 'key', code: ':key:' },
      { emoji: '📝', name: 'memo', code: ':memo:' },
      { emoji: '📁', name: 'file folder', code: ':file_folder:' },
      { emoji: '📂', name: 'open file folder', code: ':open_file_folder:' },
      { emoji: '📅', name: 'calendar', code: ':date:' },
      { emoji: '📆', name: 'tear-off calendar', code: ':calendar:' },
      { emoji: '📊', name: 'bar chart', code: ':bar_chart:' },
      { emoji: '📈', name: 'chart increasing', code: ':chart_with_upwards_trend:' },
      { emoji: '📉', name: 'chart decreasing', code: ':chart_with_downwards_trend:' },
      { emoji: '📋', name: 'clipboard', code: ':clipboard:' },
      { emoji: '📌', name: 'pushpin', code: ':pushpin:' },
      { emoji: '📧', name: 'e-mail', code: ':e-mail:' },
      { emoji: '✉️', name: 'envelope', code: ':envelope:' },
      { emoji: '📦', name: 'package', code: ':package:' },
      { emoji: '📫', name: 'closed mailbox with raised flag', code: ':mailbox:' },
      { emoji: '📪', name: 'closed mailbox with lowered flag', code: ':mailbox_closed:' },
      { emoji: '📬', name: 'open mailbox with raised flag', code: ':mailbox_with_mail:' },
      { emoji: '📭', name: 'open mailbox with lowered flag', code: ':mailbox_with_no_mail:' },
      { emoji: '📮', name: 'postbox', code: ':postbox:' },
      { emoji: '🗳️', name: 'ballot box with ballot', code: ':ballot_box:' },
      { emoji: '✏️', name: 'pencil', code: ':pencil2:' },
      { emoji: '🖊️', name: 'pen', code: ':pen:' },
      { emoji: '🖋️', name: 'fountain pen', code: ':fountain_pen:' },
      { emoji: '🖌️', name: 'paintbrush', code: ':paintbrush:' },
      { emoji: '🖍️', name: 'crayon', code: ':crayon:' },
      { emoji: '📚', name: 'books', code: ':books:' },
      { emoji: '📖', name: 'open book', code: ':book:' },
      { emoji: '📰', name: 'newspaper', code: ':newspaper:' },
      { emoji: '🗞️', name: 'rolled-up newspaper', code: ':newspaper_roll:' },
      { emoji: '🔖', name: 'bookmark', code: ':bookmark:' },
      { emoji: '🏷️', name: 'label', code: ':label:' }
    ],
    symbols: [
      { emoji: '❤️', name: 'red heart', code: ':heart:' },
      { emoji: '🧡', name: 'orange heart', code: ':orange_heart:' },
      { emoji: '💛', name: 'yellow heart', code: ':yellow_heart:' },
      { emoji: '💚', name: 'green heart', code: ':green_heart:' },
      { emoji: '💙', name: 'blue heart', code: ':blue_heart:' },
      { emoji: '💜', name: 'purple heart', code: ':purple_heart:' },
      { emoji: '🖤', name: 'black heart', code: ':black_heart:' },
      { emoji: '🤍', name: 'white heart', code: ':white_heart:' },
      { emoji: '🤎', name: 'brown heart', code: ':brown_heart:' },
      { emoji: '💔', name: 'broken heart', code: ':broken_heart:' },
      { emoji: '💕', name: 'two hearts', code: ':two_hearts:' },
      { emoji: '💞', name: 'revolving hearts', code: ':revolving_hearts:' },
      { emoji: '💓', name: 'beating heart', code: ':heartbeat:' },
      { emoji: '💗', name: 'growing heart', code: ':heartpulse:' },
      { emoji: '💖', name: 'sparkling heart', code: ':sparkling_heart:' },
      { emoji: '💘', name: 'heart with arrow', code: ':cupid:' },
      { emoji: '💝', name: 'heart with ribbon', code: ':gift_heart:' },
      { emoji: '💟', name: 'heart decoration', code: ':heart_decoration:' },
      { emoji: '☮️', name: 'peace symbol', code: ':peace_symbol:' },
      { emoji: '✝️', name: 'latin cross', code: ':latin_cross:' },
      { emoji: '☪️', name: 'star and crescent', code: ':star_and_crescent:' },
      { emoji: '🕉️', name: 'om', code: ':om:' },
      { emoji: '☸️', name: 'wheel of dharma', code: ':wheel_of_dharma:' },
      { emoji: '✡️', name: 'star of David', code: ':star_of_david:' },
      { emoji: '🔯', name: 'dotted six-pointed star', code: ':six_pointed_star:' },
      { emoji: '🕎', name: 'menorah', code: ':menorah:' },
      { emoji: '☯️', name: 'yin yang', code: ':yin_yang:' },
      { emoji: '☦️', name: 'orthodox cross', code: ':orthodox_cross:' },
      { emoji: '🛐', name: 'place of worship', code: ':place_of_worship:' },
      { emoji: '⛎', name: 'Ophiuchus', code: ':ophiuchus:' },
      { emoji: '♈', name: 'Aries', code: ':aries:' },
      { emoji: '♉', name: 'Taurus', code: ':taurus:' },
      { emoji: '♊', name: 'Gemini', code: ':gemini:' },
      { emoji: '♋', name: 'Cancer', code: ':cancer:' },
      { emoji: '♌', name: 'Leo', code: ':leo:' },
      { emoji: '♍', name: 'Virgo', code: ':virgo:' },
      { emoji: '♎', name: 'Libra', code: ':libra:' },
      { emoji: '♏', name: 'Scorpio', code: ':scorpius:' },
      { emoji: '♐', name: 'Sagittarius', code: ':sagittarius:' },
      { emoji: '♑', name: 'Capricorn', code: ':capricorn:' },
      { emoji: '♒', name: 'Aquarius', code: ':aquarius:' },
      { emoji: '♓', name: 'Pisces', code: ':pisces:' },
      { emoji: '🆔', name: 'ID button', code: ':id:' },
      { emoji: '⚛️', name: 'atom symbol', code: ':atom_symbol:' },
      { emoji: '🈳', name: 'Japanese vacancy button', code: ':u7a7a:' },
      { emoji: '🈹', name: 'Japanese discount button', code: ':u5272:' },
      { emoji: '☢️', name: 'radioactive', code: ':radioactive:' },
      { emoji: '☣️', name: 'biohazard', code: ':biohazard:' },
      { emoji: '📴', name: 'mobile phone off', code: ':mobile_phone_off:' },
      { emoji: '📳', name: 'vibration mode', code: ':vibration_mode:' },
      { emoji: '🈶', name: 'Japanese "not free of charge" button', code: ':u6709:' },
      { emoji: '🈚', name: 'Japanese "free of charge" button', code: ':u7121:' },
      { emoji: '🈸', name: 'Japanese "application" button', code: ':u7533:' },
      { emoji: '🈺', name: 'Japanese "open for business" button', code: ':u55b6:' },
      { emoji: '🈷️', name: 'Japanese "monthly amount" button', code: ':u6708:' },
      { emoji: '✴️', name: 'eight-pointed star', code: ':eight_pointed_black_star:' },
      { emoji: '🆚', name: 'VS button', code: ':vs:' },
      { emoji: '💮', name: 'white flower', code: ':white_flower:' },
      { emoji: '🉐', name: 'Japanese "bargain" button', code: ':ideograph_advantage:' },
      { emoji: '㊙️', name: 'Japanese "secret" button', code: ':secret:' },
      { emoji: '㊗️', name: 'Japanese "congratulations" button', code: ':congratulations:' },
      { emoji: '🈴', name: 'Japanese "passing grade" button', code: ':u5408:' },
      { emoji: '🈵', name: 'Japanese "no vacancy" button', code: ':u6e80:' },
      { emoji: '🈲', name: 'Japanese "prohibited" button', code: ':u7981:' },
      { emoji: '🅰️', name: 'A button', code: ':a:' },
      { emoji: '🅱️', name: 'B button', code: ':b:' },
      { emoji: '🆎', name: 'AB button', code: ':ab:' },
      { emoji: '🆑', name: 'CL button', code: ':cl:' },
      { emoji: '🅾️', name: 'O button', code: ':o2:' },
      { emoji: '🆘', name: 'SOS button', code: ':sos:' },
      { emoji: '❌', name: 'cross mark', code: ':x:' },
      { emoji: '⭕', name: 'hollow red circle', code: ':o:' },
      { emoji: '🛑', name: 'stop sign', code: ':stop_sign:' },
      { emoji: '⛔', name: 'no entry', code: ':no_entry:' },
      { emoji: '📛', name: 'name badge', code: ':name_badge:' },
      { emoji: '🚫', name: 'prohibited', code: ':no_entry_sign:' },
      { emoji: '💯', name: 'hundred points', code: ':100:' },
      { emoji: '💢', name: 'anger symbol', code: ':anger:' },
      { emoji: '♨️', name: 'hot springs', code: ':hotsprings:' },
      { emoji: '🚷', name: 'no pedestrians', code: ':no_pedestrians:' },
      { emoji: '🚯', name: 'no littering', code: ':do_not_litter:' },
      { emoji: '🚳', name: 'no bicycles', code: ':no_bicycles:' },
      { emoji: '🚱', name: 'non-potable water', code: ':non-potable_water:' },
      { emoji: '🔞', name: 'no one under eighteen', code: ':underage:' },
      { emoji: '📵', name: 'no mobile phones', code: ':no_mobile_phones:' },
      { emoji: '🔃', name: 'clockwise vertical arrows', code: ':arrows_clockwise:' },
      { emoji: '🔄', name: 'counterclockwise arrows button', code: ':arrows_counterclockwise:' },
      { emoji: '🔙', name: 'BACK arrow', code: ':back:' },
      { emoji: '🔚', name: 'END arrow', code: ':end:' },
      { emoji: '🔛', name: 'ON! arrow', code: ':on:' },
      { emoji: '🔜', name: 'SOON arrow', code: ':soon:' },
      { emoji: '🔝', name: 'TOP arrow', code: ':top:' },
      { emoji: '✅', name: 'check mark button', code: ':white_check_mark:' },
      { emoji: '☑️', name: 'check box with check', code: ':ballot_box_with_check:' },
      { emoji: '✔️', name: 'check mark', code: ':heavy_check_mark:' },
      { emoji: '❎', name: 'cross mark button', code: ':negative_squared_cross_mark:' },
      { emoji: '➕', name: 'plus', code: ':heavy_plus_sign:' },
      { emoji: '➖', name: 'minus', code: ':heavy_minus_sign:' },
      { emoji: '➗', name: 'divide', code: ':heavy_division_sign:' },
      { emoji: '✖️', name: 'multiply', code: ':heavy_multiplication_x:' },
      { emoji: '♾️', name: 'infinity', code: ':infinity:' },
      { emoji: '💲', name: 'heavy dollar sign', code: ':heavy_dollar_sign:' },
      { emoji: '💱', name: 'currency exchange', code: ':currency_exchange:' },
      { emoji: '™️', name: 'trade mark', code: ':tm:' },
      { emoji: '©️', name: 'copyright', code: ':copyright:' },
      { emoji: '®️', name: 'registered', code: ':registered:' },
      { emoji: '〰️', name: 'wavy dash', code: ':wavy_dash:' },
      { emoji: '➰', name: 'curly loop', code: ':curly_loop:' },
      { emoji: '➿', name: 'double curly loop', code: ':loop:' },
      { emoji: '🔚', name: 'END arrow', code: ':end:' },
      { emoji: '🔙', name: 'BACK arrow', code: ':back:' },
      { emoji: '🔛', name: 'ON! arrow', code: ':on:' },
      { emoji: '🔝', name: 'TOP arrow', code: ':top:' },
      { emoji: '🔜', name: 'SOON arrow', code: ':soon:' },
      { emoji: '✳️', name: 'eight-spoked asterisk', code: ':eight_spoked_asterisk:' },
      { emoji: '❇️', name: 'sparkle', code: ':sparkle:' },
      { emoji: '❓', name: 'question mark', code: ':question:' },
      { emoji: '❔', name: 'white question mark', code: ':grey_question:' },
      { emoji: '❕', name: 'white exclamation mark', code: ':grey_exclamation:' },
      { emoji: '❗', name: 'exclamation mark', code: ':exclamation:' },
      { emoji: '〽️', name: 'part alternation mark', code: ':part_alternation_mark:' },
      { emoji: '⚠️', name: 'warning', code: ':warning:' },
      { emoji: '🚸', name: 'children crossing', code: ':children_crossing:' },
      { emoji: '🔱', name: 'trident emblem', code: ':trident:' },
      { emoji: '⚜️', name: 'fleur-de-lis', code: ':fleur_de_lis:' },
      { emoji: '🔰', name: 'Japanese symbol for beginner', code: ':beginner:' },
      { emoji: '♻️', name: 'recycling symbol', code: ':recycle:' },
      { emoji: '🔆', name: 'bright button', code: ':high_brightness:' },
      { emoji: '🔅', name: 'dim button', code: ':low_brightness:' },
      { emoji: '⚡', name: 'high voltage', code: ':zap:' },
      { emoji: '⭐', name: 'star', code: ':star:' },
      { emoji: '🌟', name: 'glowing star', code: ':star2:' },
      { emoji: '💫', name: 'dizzy', code: ':dizzy:' },
      { emoji: '✨', name: 'sparkles', code: ':sparkles:' },
      { emoji: '🔥', name: 'fire', code: ':fire:' }
    ],
    flags: [
      { emoji: '🏳️', name: 'white flag', code: ':white_flag:' },
      { emoji: '🏴', name: 'black flag', code: ':black_flag:' },
      { emoji: '🏁', name: 'chequered flag', code: ':checkered_flag:' },
      { emoji: '🚩', name: 'triangular flag', code: ':triangular_flag_on_post:' },
      { emoji: '🏳️‍🌈', name: 'rainbow flag', code: ':rainbow_flag:' },
      { emoji: '🇺🇸', name: 'flag: United States', code: ':us:' },
      { emoji: '🇬🇧', name: 'flag: United Kingdom', code: ':gb:' },
      { emoji: '🇯🇵', name: 'flag: Japan', code: ':jp:' },
      { emoji: '🇰🇷', name: 'flag: South Korea', code: ':kr:' },
      { emoji: '🇨🇳', name: 'flag: China', code: ':cn:' },
      { emoji: '🇩🇪', name: 'flag: Germany', code: ':de:' },
      { emoji: '🇫🇷', name: 'flag: France', code: ':fr:' },
      { emoji: '🇮🇹', name: 'flag: Italy', code: ':it:' },
      { emoji: '🇪🇸', name: 'flag: Spain', code: ':es:' },
      { emoji: '🇷🇺', name: 'flag: Russia', code: ':ru:' },
      { emoji: '🇧🇷', name: 'flag: Brazil', code: ':brazil:' },
      { emoji: '🇮🇳', name: 'flag: India', code: ':india:' },
      { emoji: '🇦🇺', name: 'flag: Australia', code: ':australia:' },
      { emoji: '🇨🇦', name: 'flag: Canada', code: ':canada:' },
      { emoji: '🇲🇽', name: 'flag: Mexico', code: ':mexico:' },
      { emoji: '🇹🇭', name: 'flag: Thailand', code: ':thailand:' },
      { emoji: '🇻🇳', name: 'flag: Vietnam', code: ':vietnam:' },
      { emoji: '🇵🇭', name: 'flag: Philippines', code: ':philippines:' },
      { emoji: '🇮🇩', name: 'flag: Indonesia', code: ':indonesia:' },
      { emoji: '🇲🇾', name: 'flag: Malaysia', code: ':malaysia:' },
      { emoji: '🇸🇬', name: 'flag: Singapore', code: ':singapore:' },
      { emoji: '🇳🇱', name: 'flag: Netherlands', code: ':netherlands:' },
      { emoji: '🇧🇪', name: 'flag: Belgium', code: ':belgium:' },
      { emoji: '🇨🇭', name: 'flag: Switzerland', code: ':switzerland:' },
      { emoji: '🇦🇹', name: 'flag: Austria', code: ':austria:' },
      { emoji: '🇸🇪', name: 'flag: Sweden', code: ':sweden:' },
      { emoji: '🇳🇴', name: 'flag: Norway', code: ':norway:' },
      { emoji: '🇩🇰', name: 'flag: Denmark', code: ':denmark:' },
      { emoji: '🇫🇮', name: 'flag: Finland', code: ':finland:' },
      { emoji: '🇵🇱', name: 'flag: Poland', code: ':poland:' },
      { emoji: '🇹🇷', name: 'flag: Turkey', code: ':tr:' },
      { emoji: '🇬🇷', name: 'flag: Greece', code: ':greece:' },
      { emoji: '🇵🇹', name: 'flag: Portugal', code: ':portugal:' },
      { emoji: '🇦🇷', name: 'flag: Argentina', code: ':argentina:' },
      { emoji: '🇨🇴', name: 'flag: Colombia', code: ':colombia:' },
      { emoji: '🇨🇱', name: 'flag: Chile', code: ':chile:' },
      { emoji: '🇵🇪', name: 'flag: Peru', code: ':peru:' },
      { emoji: '🇪🇬', name: 'flag: Egypt', code: ':egypt:' },
      { emoji: '🇿🇦', name: 'flag: South Africa', code: ':south_africa:' },
      { emoji: '🇳🇬', name: 'flag: Nigeria', code: ':nigeria:' },
      { emoji: '🇰🇪', name: 'flag: Kenya', code: ':kenya:' },
      { emoji: '🇮🇱', name: 'flag: Israel', code: ':israel:' },
      { emoji: '🇸🇦', name: 'flag: Saudi Arabia', code: ':saudi_arabia:' },
      { emoji: '🇦🇪', name: 'flag: United Arab Emirates', code: ':united_arab_emirates:' },
      { emoji: '🇳🇿', name: 'flag: New Zealand', code: ':new_zealand:' },
      { emoji: '🇮🇪', name: 'flag: Ireland', code: ':ireland:' },
      { emoji: '🇭🇰', name: 'flag: Hong Kong', code: ':hong_kong:' },
      { emoji: '🇹🇼', name: 'flag: Taiwan', code: ':taiwan:' },
      { emoji: '🇰🇭', name: 'flag: Cambodia', code: ':cambodia:' }
    ]
  };

  // ============================================
  // State
  // ============================================
  const state = {
    isDarkMode: localStorage.getItem('theme') === 'dark',
    currentCategory: 'recent',
    recentEmojis: JSON.parse(localStorage.getItem('recentEmojis') || '[]'),
    copiedEmojis: [],
    selectedEmoji: null
  };

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    searchInput: document.getElementById('searchInput'),
    clearSearch: document.getElementById('clearSearch'),
    categoryBtns: document.querySelectorAll('.category-btn'),
    categoryTitle: document.getElementById('categoryTitle'),
    emojiGrid: document.getElementById('emojiGrid'),
    noResults: document.getElementById('noResults'),
    previewEmoji: document.getElementById('previewEmoji'),
    previewName: document.getElementById('previewName'),
    previewCode: document.getElementById('previewCode'),
    copyEmojiBtn: document.getElementById('copyEmojiBtn'),
    copiedList: document.getElementById('copiedList'),
    clearCopiedBtn: document.getElementById('clearCopiedBtn'),
    toast: document.getElementById('toast')
  };

  // ============================================
  // Initialization
  // ============================================
  function init() {
    initEventListeners();
    renderEmojis('recent');
  }

  function initEventListeners() {
    // Search
    elements.searchInput?.addEventListener('input', handleSearch);
    elements.clearSearch?.addEventListener('click', clearSearch);

    // Categories
    elements.categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        switchCategory(btn.dataset.category);
      });
    });

    // Emoji grid
    elements.emojiGrid?.addEventListener('click', handleEmojiClick);
    elements.emojiGrid?.addEventListener('mouseover', handleEmojiHover);

    // Copy button
    elements.copyEmojiBtn?.addEventListener('click', copySelectedEmoji);

    // Copied list
    elements.copiedList?.addEventListener('click', handleCopiedClick);
    elements.clearCopiedBtn?.addEventListener('click', clearCopied);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
  }

  // ============================================
  // Category Switching
  // ============================================
  function switchCategory(category) {
    state.currentCategory = category;

    elements.categoryBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });

    clearSearch();
    renderEmojis(category);
  }

  // ============================================
  // Emoji Rendering
  // ============================================
  function renderEmojis(category) {
    let emojis;

    if (category === 'recent') {
      elements.categoryTitle.textContent = 'Recent';
      emojis = state.recentEmojis;
    } else {
      const categoryNames = {
        smileys: 'Smileys & Emotion',
        people: 'People & Body',
        animals: 'Animals & Nature',
        food: 'Food & Drink',
        travel: 'Travel & Places',
        activities: 'Activities',
        objects: 'Objects',
        symbols: 'Symbols',
        flags: 'Flags'
      };
      elements.categoryTitle.textContent = categoryNames[category] || category;
      emojis = emojiData[category] || [];
    }

    if (emojis.length === 0) {
      elements.emojiGrid.innerHTML = '';
      elements.noResults.style.display = 'flex';
      elements.noResults.querySelector('p').textContent = category === 'recent' ? 'No recent emojis' : 'No emojis found';
      return;
    }

    elements.noResults.style.display = 'none';
    elements.emojiGrid.innerHTML = emojis.map(e =>
      `<button class="emoji-btn" data-emoji="${e.emoji}" data-name="${e.name}" data-code="${e.code}">${e.emoji}</button>`
    ).join('');
  }

  // ============================================
  // Search
  // ============================================
  function handleSearch() {
    const query = elements.searchInput.value.toLowerCase().trim();

    elements.clearSearch.style.display = query ? 'flex' : 'none';

    if (!query) {
      renderEmojis(state.currentCategory);
      return;
    }

    // Search all categories
    const results = [];
    Object.values(emojiData).forEach(category => {
      category.forEach(e => {
        if (e.name.toLowerCase().includes(query) || e.code.toLowerCase().includes(query)) {
          results.push(e);
        }
      });
    });

    elements.categoryTitle.textContent = `Search: "${query}"`;

    if (results.length === 0) {
      elements.emojiGrid.innerHTML = '';
      elements.noResults.style.display = 'flex';
      elements.noResults.querySelector('p').textContent = 'No emojis found';
      return;
    }

    elements.noResults.style.display = 'none';
    elements.emojiGrid.innerHTML = results.map(e =>
      `<button class="emoji-btn" data-emoji="${e.emoji}" data-name="${e.name}" data-code="${e.code}">${e.emoji}</button>`
    ).join('');
  }

  function clearSearch() {
    elements.searchInput.value = '';
    elements.clearSearch.style.display = 'none';
    renderEmojis(state.currentCategory);
  }

  // ============================================
  // Emoji Interactions
  // ============================================
  function handleEmojiClick(e) {
    const btn = e.target.closest('.emoji-btn');
    if (!btn) return;

    const emoji = btn.dataset.emoji;
    const name = btn.dataset.name;
    const code = btn.dataset.code;

    copyEmoji(emoji, name, code);
  }

  function handleEmojiHover(e) {
    const btn = e.target.closest('.emoji-btn');
    if (!btn) return;

    state.selectedEmoji = {
      emoji: btn.dataset.emoji,
      name: btn.dataset.name,
      code: btn.dataset.code
    };

    elements.previewEmoji.textContent = btn.dataset.emoji;
    elements.previewName.textContent = btn.dataset.name;
    elements.previewCode.textContent = btn.dataset.code;
  }

  function copyEmoji(emoji, name, code) {
    navigator.clipboard.writeText(emoji).then(() => {
      showToast(`Copied ${emoji}`, 'success');

      // Add to recent
      addToRecent({ emoji, name, code });

      // Add to copied list
      addToCopied(emoji);
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
  }

  function copySelectedEmoji() {
    if (state.selectedEmoji) {
      copyEmoji(state.selectedEmoji.emoji, state.selectedEmoji.name, state.selectedEmoji.code);
    }
  }

  function addToRecent(emojiData) {
    // Remove if exists
    state.recentEmojis = state.recentEmojis.filter(e => e.emoji !== emojiData.emoji);

    // Add to beginning
    state.recentEmojis.unshift(emojiData);

    // Limit to 50
    state.recentEmojis = state.recentEmojis.slice(0, 50);

    // Save
    localStorage.setItem('recentEmojis', JSON.stringify(state.recentEmojis));
  }

  function addToCopied(emoji) {
    if (!state.copiedEmojis.includes(emoji)) {
      state.copiedEmojis.push(emoji);
    }

    renderCopiedList();
  }

  function renderCopiedList() {
    if (state.copiedEmojis.length === 0) {
      elements.copiedList.innerHTML = '<span class="copied-placeholder">Click an emoji to copy</span>';
      return;
    }

    elements.copiedList.innerHTML = state.copiedEmojis.map(e =>
      `<span class="copied-emoji" data-emoji="${e}">${e}</span>`
    ).join('');
  }

  function handleCopiedClick(e) {
    const emojiEl = e.target.closest('.copied-emoji');
    if (!emojiEl) return;

    const emoji = emojiEl.dataset.emoji;
    navigator.clipboard.writeText(emoji).then(() => {
      showToast(`Copied ${emoji}`, 'success');
    });
  }

  function clearCopied() {
    state.copiedEmojis = [];
    renderCopiedList();
    showToast('Cleared copied emojis', 'success');
  }

  // ============================================
  // Keyboard Handler
  // ============================================
  function handleKeyboard(e) {
    if (e.target === elements.searchInput) {
      if (e.key === 'Escape') {
        clearSearch();
        elements.searchInput.blur();
      }
      return;
    }

    const categories = ['recent', 'smileys', 'people', 'animals', 'food', 'travel', 'activities', 'objects', 'symbols', 'flags'];

    switch (e.key) {
      case '/':
        e.preventDefault();
        elements.searchInput.focus();
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '0':
        e.preventDefault();
        const index = e.key === '0' ? 9 : parseInt(e.key) - 1;
        if (categories[index]) {
          switchCategory(categories[index]);
        }
        break;
    }
  }

  // ============================================
  // Toast
  // ============================================
  function showToast(message, type = 'info') {
    if (!elements.toast) return;

    elements.toast.textContent = message;
    elements.toast.className = 'toast show ' + type;

    setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 2000);
  }

  // ============================================
  // Initialize
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
