const slices = (xs) => xs.map((x, i) => xs.slice(0, i))

const compose = (...fs) => fs.reduce((f, g) => (x) => f(g(x)))

const joinArgs = (args) => args.join(', ')

const aritiesOf = (letters) => slices(letters).slice(1)

const formatDecoderArg = (letter) => (
  `${letter.toLowerCase()}d: IDecoder<${letter}>`
)
const formatEntryDecoderArg = (letter) => (
  `${letter.toLowerCase()}d: IEntryDecoder<${letter}>`
)
const formatNormalArg = (letter) => (
  `${letter.toLowerCase()}: ${letter}`
)

const objectFormat = {
  makeArgLists: (letters) => ({
    generics: letters,
    decoders: letters.map(formatEntryDecoderArg),
    callbacks: letters.map(formatNormalArg)
  }),
  formatString: ({generics, decoders, callbacks}) => (
    `export function object <T, ${joinArgs(generics)}>(${joinArgs(decoders)}, cons: (${joinArgs(callbacks)}) => T): IDecoder<T>`
  )
}

const tupleFormat = {
  makeArgLists: (letters) => ({
    generics: letters,
    decoders: letters.map(formatDecoderArg)
  }),
  formatString: ({generics, decoders}) => (
    `export function tuple <${joinArgs(generics)}>(${joinArgs(decoders)}): IDecoder<[${joinArgs(generics)}]>`
  )
}

const toSignature = ({makeArgLists, formatString}) => compose(
  formatString,
  makeArgLists
)

const makeSignatures = (format, letters) => compose(
  (signatures) => signatures.join('\n'),
  (arities) => arities.map(toSignature(format)),
  aritiesOf
)(letters)

function main () {
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, 15).split('')

  console.log('======= OBJECT =======')
  console.log(makeSignatures(objectFormat, allLetters))
  console.log('======= TUPLE =======')
  console.log(makeSignatures(tupleFormat, allLetters))
}
main()
