// https://tartarus.org/martin/PorterStemmer/def.txt
// and some other additional 3 rules which author mentions in his web page
// you can check Points of difference from the published algorithm section on https://tartarus.org/martin/PorterStemmer/

const vowels = ['A', 'E', 'I', 'O', 'U']

const form = (word) => {
  word = word.toUpperCase()
  const letters = word.split('')
  let singleForm = ''
  let longForm = ''

  for (let i = 0; i < letters.length; i++) {
    // A consonant in a word is a letter other than A, E, I, O or U, and other than Y preceded by a consonant.
    if (!vowels.includes(letters[i]) && !(i > 0 && letters[i] === 'Y' && !vowels.includes(letters[i - 1]))) {
      // A list ccc... of length greater than 0 will be denoted by C
      longForm += 'c'
      if (singleForm.length === 0 || singleForm.substr(-1) !== 'C') {
        singleForm += 'C'
      }
    } else {
      // If a letter is not a consonant it is a vowel.
      // And a list vvv... of length greater than 0 will be denoted by V
      longForm += 'v'
      if (singleForm.length === 0 || singleForm.substr(-1) !== 'V') {
        singleForm += 'V'
      }
    }
  }
  return { singleForm, longForm }
}

const m = (word) => {
  // [C]VCVC ... [V]
  // [C](VC)m[V] we calculate the number of repetition.
  const match = /^C?((VC)*)V?$/g.exec(form(word).singleForm)
  let m = 0 // null word, or number of VC for measure
  if (match[1] !== '') {
    m = match[1].split('VC').length - 1
  }
  return m
}

const porterStemmer = (word, debug = false) => {
  // For convention we transform the word to upper case.
  word = word.toUpperCase()

  // ** leaves string 1 and 2 length unchanged, this is not in original paper added afterwards
  if (word.length <= 2) {
    return word.toLowerCase()
  }

  // (condition) S1 -> S2 form, if condition applies, the ending S1 string will be replaced with S2, S2 can be null (empty string)
  // (m > 1) EMENT ->
  // REPLACEMENT maps to REPLAC, REPLACE is checked for condition (m > 1)
  // *S - the stem ends with S (and similarly for the other letters)
  // *v* - the stem contains a vowel
  // *d - the stem ends with a double consonant (e.g. -TT, -SS)
  // *o - the stem ends cvc, where the second c is not W, X or Y (e.g. -WIL, -HOP)
  // conditions can contain other boolean operators like (*d and not (*L or *S or *Z))

  // Step 1a

  // SSES -> SS                         caresses  ->  caress
  // IES  -> I                          ponies    ->  poni
  //                                    ties      ->  ti
  // SS   -> SS                         caress    ->  caress
  // S    ->                            cats      ->  cat

  let stem = word

  if (stem.endsWith('SSES')) {
    stem = stem.slice(0, -2)
  } else if (stem.endsWith('IES')) {
    stem = stem.slice(0, -2)
  } else if (stem.endsWith('SS')) {
    // do nothing stem stays as is
  } else if (stem.endsWith('S')) {
    stem = stem.slice(0, -1)
  }

  if (debug) {
    console.log('Step 1a', stem)
  }
  // Step 1b

  // (m>0) EED -> EE                    feed      ->  feed
  //                                    agreed    ->  agree
  // (*v*) ED  ->                       plastered ->  plaster
  //                                    bled      ->  bled
  // (*v*) ING ->                       motoring  ->  motor
  //                                    sing      ->  sing

  let secondStepDone = false
  let thirdStepDone = false

  if (stem.endsWith('EED')) {
    if (m(stem.slice(0, -3)) > 0) {
      stem = stem.slice(0, -1)
    }
  } else if (stem.endsWith('ED')) {
    if (form(stem.slice(0, -2)).longForm.includes('v')) {
      stem = stem.slice(0, -2)
      secondStepDone = true
    }
  } else if (stem.endsWith('ING')) {
    if (form(stem.slice(0, -3)).longForm.includes('v')) {
      stem = stem.slice(0, -3)
      thirdStepDone = true
    }
  }

  if (debug) {
    console.log('Step 1b', stem)
  }
  // Step 1b additional
  if (secondStepDone || thirdStepDone) {
    // AT -> ATE                       conflat(ed)  ->  conflate
    if (stem.endsWith('AT')) {
      stem += 'E'
      // BL -> BLE                       troubl(ed)   ->  trouble
    } else if (stem.endsWith('BL')) {
      stem += 'E'
      // IZ -> IZE                       siz(ed)      ->  size
    } else if (stem.endsWith('IZ')) {
      stem += 'E'
      // (*d and not (*L or *S or *Z)) -> single letter
    } else if (form(stem).longForm.slice(-2) === 'cc' && stem.slice(-1) === stem.slice(-2, -1) && !['L', 'S', 'Z'].includes(stem.slice(-1))) {
      stem = stem.slice(0, -1)
      // (m=1 and *o) -> E
    } else if (m(stem) === 1 && form(stem.slice(-3)).longForm === 'cvc' && !['W', 'X', 'Y'].includes(stem.slice(-1))) {
      stem += 'E'
    }
  }
  if (debug) {
    console.log('Step 1b additional', stem)
  }
  // Step 1c

  // (*v*) Y -> I                    happy        ->  happi
  //                                 sky          ->  sky

  if (form(stem.slice(0, -1)).longForm.includes('v') && stem.slice(-1) === 'Y') {
    stem = stem.slice(0, -1) + 'I'
  }

  if (debug) {
    console.log('Step 1c', stem)
  }
  // Step 2
  // (m>0) ATIONAL ->  ATE           relational     ->  relate
  // (m>0) TIONAL  ->  TION          conditional    ->  condition
  //                                 rational       ->  rational
  // (m>0) ENCI    ->  ENCE          valenci        ->  valence
  // (m>0) ANCI    ->  ANCE          hesitanci      ->  hesitance
  // (m>0) IZER    ->  IZE           digitizer      ->  digitize
  // (m>0) BLI     ->  BLE           conformabli    ->  conformable ** in original paper it is (m>0) abli  →  able, replaced by (m>0) bli  →  ble so possibly -> possible
  // (m>0) ALLI    ->  AL            radicalli      ->  radical
  // (m>0) ENTLI   ->  ENT           differentli    ->  different
  // (m>0) ELI     ->  E             vileli         ->  vile
  // (m>0) OUSLI   ->  OUS           analogousli    ->  analogous
  // (m>0) IZATION ->  IZE           vietnamization ->  vietnamize
  // (m>0) ATION   ->  ATE           predication    ->  predicate
  // (m>0) ATOR    ->  ATE           operator       ->  operate
  // (m>0) ALISM   ->  AL            feudalism      ->  feudal
  // (m>0) IVENESS ->  IVE           decisiveness   ->  decisive
  // (m>0) FULNESS ->  FUL           hopefulness    ->  hopeful
  // (m>0) OUSNESS ->  OUS           callousness    ->  callous
  // (m>0) ALITI   ->  AL            formaliti      ->  formal
  // (m>0) IVITI   ->  IVE           sensitiviti    ->  sensitive
  // (m>0) BILITI  ->  BLE           sensibiliti    ->  sensible
  // (m>0) LOGI    ->  LOG           ** this rule is added afterwards not in original paper, So archaeology is equated with archaeological etc.

  const step2Pairs = {
    ATIONAL: 'ATE',
    TIONAL: 'TION',
    ENCI: 'ENCE',
    ANCI: 'ANCE',
    IZER: 'IZE',
    BLI: 'BLE',
    ALLI: 'AL',
    ENTLI: 'ENT',
    ELI: 'E',
    OUSLI: 'OUS',
    IZATION: 'IZE',
    ATION: 'ATE',
    ATOR: 'ATE',
    ALISM: 'AL',
    IVENESS: 'IVE',
    FULNESS: 'FUL',
    OUSNESS: 'OUS',
    ALITI: 'AL',
    IVITI: 'IVE',
    BILITI: 'BLE',
    LOGI: 'LOG'
  }

  for (const [key, value] of Object.entries(step2Pairs)) {
    if (stem.endsWith(key) && m(stem.slice(0, 0 - key.length)) > 0) {
      stem = stem.slice(0, 0 - key.length) + value
    }
  }

  if (debug) {
    console.log('Step 2', stem)
  }
  // Step 3
  // (m>0) ICATE ->  IC              triplicate     ->  triplic
  // (m>0) ATIVE ->                  formative      ->  form
  // (m>0) ALIZE ->  AL              formalize      ->  formal
  // (m>0) ICITI ->  IC              electriciti    ->  electric
  // (m>0) ICAL  ->  IC              electrical     ->  electric
  // (m>0) FUL   ->                  hopeful        ->  hope
  // (m>0) NESS  ->                  goodness       ->  good

  const step3Pairs = {
    ICATE: 'IC',
    ATIVE: '',
    ALIZE: 'AL',
    ICITI: 'IC',
    ICAL: 'IC',
    FUL: '',
    NESS: ''
  }

  for (const [key, value] of Object.entries(step3Pairs)) {
    if (stem.endsWith(key)) {
      if (m(stem.slice(0, 0 - key.length)) > 0) {
        stem = stem.slice(0, 0 - key.length) + value
      }
      break
    }
  }

  if (debug) {
    console.log('Step 3', stem)
  }
  // Step 4
  // (m>1) AL    ->                  revival        ->  reviv
  // (m>1) ANCE  ->                  allowance      ->  allow
  // (m>1) ENCE  ->                  inference      ->  infer
  // (m>1) ER    ->                  airliner       ->  airlin
  // (m>1) IC    ->                  gyroscopic     ->  gyroscop
  // (m>1) ABLE  ->                  adjustable     ->  adjust
  // (m>1) IBLE  ->                  defensible     ->  defens
  // (m>1) ANT   ->                  irritant       ->  irrit
  // (m>1) EMENT ->                  replacement    ->  replac
  // (m>1) MENT  ->                  adjustment     ->  adjust
  // (m>1) ENT   ->                  dependent      ->  depend
  // (m>1 and (*S or *T)) ION ->     adoption       ->  adopt
  // (m>1) OU    ->                  homologou      ->  homolog
  // (m>1) ISM   ->                  communism      ->  commun
  // (m>1) ATE   ->                  activate       ->  activ
  // (m>1) ITI   ->                  angulariti     ->  angular
  // (m>1) OUS   ->                  homologous     ->  homolog
  // (m>1) IVE   ->                  effective      ->  effect
  // (m>1) IZE   ->                  bowdlerize     ->  bowdler

  const step4Pairs = {
    AL: '',
    ANCE: '',
    ENCE: '',
    ER: '',
    IC: '',
    ABLE: '',
    IBLE: '',
    ANT: '',
    EMENT: '',
    MENT: '',
    ENT: '',
    ION: '',
    OU: '',
    ISM: '',
    ATE: '',
    ITI: '',
    OUS: '',
    IVE: '',
    IZE: ''
  }

  for (const [key, value] of Object.entries(step4Pairs)) {
    if (stem.endsWith(key)) {
      if (m(stem.slice(0, 0 - key.length)) > 1) {
        if (key !== 'ION') {
          stem = stem.slice(0, 0 - key.length) + value
        } else if (['S', 'T'].includes(stem.slice(0, 0 - key.length).slice(-1))) {
          stem = stem.slice(0, 0 - key.length) + value
        }
      }
      break
    }
  }

  if (debug) {
    console.log('Step 4', stem)
  }
  // Step 5a
  // (m>1) E     ->                  probate        ->  probat
  //                                 rate           ->  rate
  // (m=1 and not *o) E ->           cease          ->  ceas

  if (stem.endsWith('E') && m(stem.slice(0, -1)) > 1) {
    stem = stem.slice(0, -1)
  } else if (stem.endsWith('E') && m(stem.slice(0, -1)) === 1 && !(form(stem.slice(-4, -1)).longForm === 'cvc' && !['W', 'X', 'Y'].includes(stem.slice(-2, -1)))) {
    stem = stem.slice(0, -1)
  }

  if (debug) {
    console.log('Step 5a', stem)
  }

  // Step 5b
  // (m > 1 and *d and *L) -> single letter
  //                                 controll       ->  control
  //                                 roll           ->  roll
  if (m(stem) > 1 && form(stem).longForm.slice(-2) === 'cc' && stem.slice(-1) === stem.slice(-2, -1) && stem.endsWith('L')) {
    stem = stem.slice(0, -1)
  }

  if (debug) {
    console.log('Step 5b', stem)
  }

  return stem.toLowerCase()
}

module.exports = porterStemmer
