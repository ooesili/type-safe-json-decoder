/**
 * This module can be used to safely decode JSON into a typed value. All of the
 * decoders in this module are pure and reusable.
 */

/**
 */
interface ErrorInfo {
  at: string
  expected: string
  got?: any
}

function decoderError ({at, expected, got}: ErrorInfo): Error {
  if (typeof got === 'undefined') {
    return new Error(`error at ${at}: expected ${expected}`)
  }

  return new Error(`error at ${at}: expected ${expected}, got ${prettyPrint(got)}`)
}

interface DecoderFunc<T> {
  (object: any, at: string): T
}

let decode: <T>(decoder: Decoder<T>, object: any, at: string) => T
let createDecoder: <T>(fn: DecoderFunc<T>) => Decoder<T>

/**
 * A Decoder represents a way to decode JSON into type T. Provided in this
 * module are Decoders for primitive JSON types, as well as a set of
 * higher-order Decoders that can be composed together to decode complex nested
 * objects.
 */
export class Decoder<T> {
  private fn: DecoderFunc<T>

  private constructor (fn: (object: any, at: string) => T) {
    this.fn = fn
  }

  // tricky way to get a package-private constructor
  private static _ignore = (() => {
    // compiler will complain about unused var without this
    Decoder._ignore

    decode = <T>(decoder: Decoder<T>, object: any, at: string): T => {
      return decoder.fn(object, at)
    }

    createDecoder = <T>(fn: DecoderFunc<T>) => {
      return new Decoder(fn)
    }
  })()

  /**
   * Attempt to decode some JSON input into a value of type T. Throws a
   * descriptive error if the JSON input does not match the structure described
   * by the Decoder.
   * @param json A JSON encoded string.
   * @returns A value of the type described by the Decoder.
   */
  decodeJSON (json: string): T {
    return this.decodeAny(JSON.parse(json))
  }

  /**
   * Attempt to decode a plain object into a value of type T. Throws a
   * descriptive error if the object does not match the structure described
   * by the decoder.
   * @param object Any object.
   * @returns A value of the type described by the Decoder.
   */
  decodeAny (object: any): T {
    return this.fn(object, 'root')
  }
}

/**
 * Represents the property of an object to decode. See [object](#object) for
 * more details.
 */
export type EntryDecoder<T> = [string, Decoder<T>]

function prettyPrint (value: any): string {
  if (value === null) {
    return 'null'
  }

  if (value instanceof Array) {
    return 'array'
  }

  return typeof value
}

function escapeKey (key: string): string {
  if (/^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(key)) {
    return key
  }

  return JSON.stringify(key)
}

function pushLocation (at: string, key: string | number): string {
  if (at === 'root') {
    at = ''
  }

  if (typeof key === 'number') {
    return `${at}[${key}]`
  }

  if (/^[$_a-zA-Z][$_a-zA-Z0-9]+$/.test(key)) {
    return `${at}.${key}`
  }

  return `${at}[${JSON.stringify(key)}]`
}

/**
 * @returns A Decoder that decodes a string.
 */
export function string (): Decoder<string> {
  return createDecoder((obj, at) => {
    if (typeof obj !== 'string') {
      throw decoderError({
        at,
        expected: 'string',
        got: obj
      })
    }

    return obj
  })
}

/**
 * @returns A Decoder that decodes a number.
 */
export function number (): Decoder<number> {
  return createDecoder((obj, at) => {
    if (typeof obj !== 'number') {
      throw decoderError({
        at,
        expected: 'number',
        got: obj
      })
    }

    return obj
  })
}

/**
 * @returns A Decoder that decodes a boolean.
 */
export function boolean (): Decoder<boolean> {
  return createDecoder((obj, at) => {
    if (typeof obj !== 'boolean') {
      throw decoderError({
        at,
        expected: 'boolean',
        got: obj
      })
    }

    return obj
  })
}

/**
 * Decode a value and make sure the result equals another value. Useful for
 * checking for `null`.
 * ```typescript
 * const decoder = object(
 *   ['shouldBeNull', equal(null)],
 *   (shouldBeNull) => ({shouldBeNull})
 * )
 * decoder.decodeJSON('{"shouldBeNull": null}')
 * ```
 * @param value Value that the input must equal (`===`).
 * @returns A Decoder that decodes a value that equals the given value.
 */
export function equal <T>(value: T): Decoder<T> {
  return createDecoder((obj, at) => {
    if (obj !== value) {
      throw decoderError({
        at,
        expected: JSON.stringify(value),
        got: obj
      })
    }

    return obj
  })
}

/**
 * Decode an array using another decoder for each element. Can only decode
 * arrays of a single type. If this feels like a limitation, you may be looking
 * for [tuple](#tuple), or perhaps [andThen](#andthen) paired with TypeScript's
 * union types.
 * @param element A Decoder that decodes the element type of an array.
 * @returns A Decoder that will decode an array of elements of the given type.
 */
export function array <T>(element: Decoder<T>): Decoder<T[]> {
  return createDecoder((obj, at) => {
    if (!(obj instanceof Array)) {
      throw decoderError({
        at,
        expected: 'array',
        got: obj
      })
    }

    return obj.map((e, i) => decode(element, e, pushLocation(at, i)))
  })
}

/**
 * Decode an object with the given fields and types.
 * @param ad One or more EntryDecoders describing the object's fields.
 * @param cons Constructor that uses the results from the given EntryDecoders.
 * @returns A Decoder that will decode an object of the given type.
 */
export function object <T, A>(ad: EntryDecoder<A>, cons: (a: A) => T): Decoder<T>
export function object <T, A, B>(ad: EntryDecoder<A>, bd: EntryDecoder<B>, cons: (a: A, b: B) => T): Decoder<T>
export function object <T, A, B, C>(ad: EntryDecoder<A>, bd: EntryDecoder<B>, cd: EntryDecoder<C>, cons: (a: A, b: B, c: C) => T): Decoder<T>
export function object <T, A, B, C, D>(ad: EntryDecoder<A>, bd: EntryDecoder<B>, cd: EntryDecoder<C>, dd: EntryDecoder<D>, cons: (a: A, b: B, c: C, d: D) => T): Decoder<T>
export function object <T, A, B, C, D, E>(ad: EntryDecoder<A>, bd: EntryDecoder<B>, cd: EntryDecoder<C>, dd: EntryDecoder<D>, ed: EntryDecoder<E>, cons: (a: A, b: B, c: C, d: D, e: E) => T): Decoder<T>
export function object <T, A, B, C, D, E, F>(ad: EntryDecoder<A>, bd: EntryDecoder<B>, cd: EntryDecoder<C>, dd: EntryDecoder<D>, ed: EntryDecoder<E>, fd: EntryDecoder<F>, cons: (a: A, b: B, c: C, d: D, e: E, f: F) => T): Decoder<T>
export function object <T, A, B, C, D, E, F, G>(ad: EntryDecoder<A>, bd: EntryDecoder<B>, cd: EntryDecoder<C>, dd: EntryDecoder<D>, ed: EntryDecoder<E>, fd: EntryDecoder<F>, gd: EntryDecoder<G>, cons: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => T): Decoder<T>
export function object <T, A, B, C, D, E, F, G, H>(ad: EntryDecoder<A>, bd: EntryDecoder<B>, cd: EntryDecoder<C>, dd: EntryDecoder<D>, ed: EntryDecoder<E>, fd: EntryDecoder<F>, gd: EntryDecoder<G>, hd: EntryDecoder<H>, cons: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => T): Decoder<T>
export function object <T, A, B, C, D, E, F, G, H, I>(ad: EntryDecoder<A>, bd: EntryDecoder<B>, cd: EntryDecoder<C>, dd: EntryDecoder<D>, ed: EntryDecoder<E>, fd: EntryDecoder<F>, gd: EntryDecoder<G>, hd: EntryDecoder<H>, id: EntryDecoder<I>, cons: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => T): Decoder<T>
export function object <T, A, B, C, D, E, F, G, H, I, J>(ad: EntryDecoder<A>, bd: EntryDecoder<B>, cd: EntryDecoder<C>, dd: EntryDecoder<D>, ed: EntryDecoder<E>, fd: EntryDecoder<F>, gd: EntryDecoder<G>, hd: EntryDecoder<H>, id: EntryDecoder<I>, jd: EntryDecoder<J>, cons: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => T): Decoder<T>
export function object <T, A, B, C, D, E, F, G, H, I, J, K>(ad: EntryDecoder<A>, bd: EntryDecoder<B>, cd: EntryDecoder<C>, dd: EntryDecoder<D>, ed: EntryDecoder<E>, fd: EntryDecoder<F>, gd: EntryDecoder<G>, hd: EntryDecoder<H>, id: EntryDecoder<I>, jd: EntryDecoder<J>, kd: EntryDecoder<K>, cons: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J, k: K) => T): Decoder<T>
export function object <T, A, B, C, D, E, F, G, H, I, J, K, L>(ad: EntryDecoder<A>, bd: EntryDecoder<B>, cd: EntryDecoder<C>, dd: EntryDecoder<D>, ed: EntryDecoder<E>, fd: EntryDecoder<F>, gd: EntryDecoder<G>, hd: EntryDecoder<H>, id: EntryDecoder<I>, jd: EntryDecoder<J>, kd: EntryDecoder<K>, ld: EntryDecoder<L>, cons: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J, k: K, l: L) => T): Decoder<T>
export function object <T, A, B, C, D, E, F, G, H, I, J, K, L, M>(ad: EntryDecoder<A>, bd: EntryDecoder<B>, cd: EntryDecoder<C>, dd: EntryDecoder<D>, ed: EntryDecoder<E>, fd: EntryDecoder<F>, gd: EntryDecoder<G>, hd: EntryDecoder<H>, id: EntryDecoder<I>, jd: EntryDecoder<J>, kd: EntryDecoder<K>, ld: EntryDecoder<L>, md: EntryDecoder<M>, cons: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J, k: K, l: L, m: M) => T): Decoder<T>
export function object <T, A, B, C, D, E, F, G, H, I, J, K, L, M, N>(ad: EntryDecoder<A>, bd: EntryDecoder<B>, cd: EntryDecoder<C>, dd: EntryDecoder<D>, ed: EntryDecoder<E>, fd: EntryDecoder<F>, gd: EntryDecoder<G>, hd: EntryDecoder<H>, id: EntryDecoder<I>, jd: EntryDecoder<J>, kd: EntryDecoder<K>, ld: EntryDecoder<L>, md: EntryDecoder<M>, nd: EntryDecoder<N>, cons: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J, k: K, l: L, m: M, n: N) => T): Decoder<T>
export function object <T>(...args: any[]): Decoder<T> {
  const cons: (...args: any[]) => T = args[args.length - 1]
  const decoders: EntryDecoder<any>[] = args.slice(0, args.length - 1)

  return createDecoder((obj, at) => {
    const missingKeys: string[] = []
    const values: any[] = []

    if (typeof obj !== 'object') {
      throw decoderError({
        at,
        expected: 'object',
        got: obj
      })
    }

    decoders.forEach(([key, decoder]) => {
      let value

      try {
        value = decode(decoder, obj[key], pushLocation(at, key))
      } catch (err) {
        if (!(key in obj)) {
          missingKeys.push(key)
        } else {
          throw err
        }
      }

      values.push(value)
    })

    if (missingKeys.length > 0) {
      const keys = missingKeys
        .sort()
        .map(escapeKey)
        .join(', ')

      throw decoderError({
        at,
        expected: `object with keys: ${keys}`,
      })
    }

    return cons(...values)
  })
}

/**
 * Maps a function over the value returned by a decoder. Useful for creating
 * fancier objects from builtin types.
 *
 * ```typescript
 * import Immutable from 'immutable'
 *
 * const decoder = map(
 *   Immutable.List,
 *   array(number())
 * )
 * ```
 * @param tranform A function to apply to the decoded value.
 * @returns A decoder that will apply the function after decoding the input.
 */
export function map <T1, T2>(transform: (v: T1) => T2, decoder: Decoder<T1>): Decoder<T2> {
  return createDecoder((obj, at) => {
    return transform(decode(decoder, obj, at))
  })
}

/**
 * Decodes a tuple from an array.  If the length of the array is not known at
 * compile time, you're probably looking for [array](#array).
 * @param ad One or more decoders for each element of the array.
 * @returns A decoder return a tuple containing each decoded element.
 */
export function tuple <A>(ad: Decoder<A>): Decoder<[A]>
export function tuple <A, B>(ad: Decoder<A>, bd: Decoder<B>): Decoder<[A, B]>
export function tuple <A, B, C>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>): Decoder<[A, B, C]>
export function tuple <A, B, C, D>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>): Decoder<[A, B, C, D]>
export function tuple <A, B, C, D, E>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>): Decoder<[A, B, C, D, E]>
export function tuple <A, B, C, D, E, F>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>): Decoder<[A, B, C, D, E, F]>
export function tuple <A, B, C, D, E, F, G>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>, gd: Decoder<G>): Decoder<[A, B, C, D, E, F, G]>
export function tuple <A, B, C, D, E, F, G, H>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>, gd: Decoder<G>, hd: Decoder<H>): Decoder<[A, B, C, D, E, F, G, H]>
export function tuple <A, B, C, D, E, F, G, H, I>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>, gd: Decoder<G>, hd: Decoder<H>, id: Decoder<I>): Decoder<[A, B, C, D, E, F, G, H, I]>
export function tuple <A, B, C, D, E, F, G, H, I, J>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>, gd: Decoder<G>, hd: Decoder<H>, id: Decoder<I>, jd: Decoder<J>): Decoder<[A, B, C, D, E, F, G, H, I, J]>
export function tuple <A, B, C, D, E, F, G, H, I, J, K>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>, gd: Decoder<G>, hd: Decoder<H>, id: Decoder<I>, jd: Decoder<J>, kd: Decoder<K>): Decoder<[A, B, C, D, E, F, G, H, I, J, K]>
export function tuple <A, B, C, D, E, F, G, H, I, J, K, L>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>, gd: Decoder<G>, hd: Decoder<H>, id: Decoder<I>, jd: Decoder<J>, kd: Decoder<K>, ld: Decoder<L>): Decoder<[A, B, C, D, E, F, G, H, I, J, K, L]>
export function tuple <A, B, C, D, E, F, G, H, I, J, K, L, M>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>, gd: Decoder<G>, hd: Decoder<H>, id: Decoder<I>, jd: Decoder<J>, kd: Decoder<K>, ld: Decoder<L>, md: Decoder<M>): Decoder<[A, B, C, D, E, F, G, H, I, J, K, L, M]>
export function tuple <A, B, C, D, E, F, G, H, I, J, K, L, M, N>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>, gd: Decoder<G>, hd: Decoder<H>, id: Decoder<I>, jd: Decoder<J>, kd: Decoder<K>, ld: Decoder<L>, md: Decoder<M>, nd: Decoder<N>): Decoder<[A, B, C, D, E, F, G, H, I, J, K, L, M, N]>
export function tuple (...decoders: Decoder<any>[]): Decoder<any> {
  return createDecoder((obj, at) => (
    decoders.map((decoder, i) => {
      return decode(decoder, obj[i], pushLocation(at, i))
    })
  ))
}

/**
 * Reaches into a nested data structure and decodes the value there. Useful if
 * you only care about a single value in a nested data structure, or if you
 * want to skip past a top level data key. Can perform lookups on nested arrays
 * and objects.
 * @param keyPath Path of key lookups into a nested object.
 * @param decoder Decoder to use on the nested value.
 * @returns A decoder that decodes the value of the nested object.
 */
export function at <T>(keyPath: Array<string|number>, decoder: Decoder<T>): Decoder<T> {
  return createDecoder((obj, at) => {
    const {result, resultAt} = keyPath.reduce(({result, resultAt}, key) => {
      const value = result[key]
      if (value === undefined) {
        if (typeof key === 'number') {
          if (result instanceof Array) {
            throw decoderError({
              at,
              expected: `array: index out of range: ${key} > ${result.length - 1}`
            })
          }

          throw decoderError({
            at,
            expected: `array with index ${key}`,
            got: obj
          })
        }

        throw decoderError({
          at,
          expected: `object with key ${escapeKey(key)}`,
          got: result
        })
      }

      return {result: value, resultAt: pushLocation(resultAt, key)}
    }, {result: obj, resultAt: at})

    return decode(decoder, result, resultAt)
  })
}

/**
 * Try multiple decoders on a value. Useful when paired with union types, or as
 * a way to provide a default value if something goes wrong. No decoders after
 * the first successful one will be tried. In that way `oneOf` can be thought
 * of a short circuit `OR` operator for decoders.
 *
 * The `first`/`rest` split is to make sure at least one decoder is specified.
 * @param first First decoder to try.
 * @param rest Fallback decoders to try in order if the first fails.
 * @returns A decoder or throws an Error of no decoders succeeded.
 */
export function oneOf <T>(first: Decoder<T>, ...rest: Decoder<T>[]): Decoder<T> {
  return createDecoder((obj, at) => {
    try {
      return decode(first, obj, at)
    } catch (e) {}

    for (const decoder of rest) {
      try {
        return decode(decoder, obj, at)
      } catch (e) {}
    }
    throw new Error(`error at ${at}: unexpected ${prettyPrint(obj)}`)
  })
}

/**
 * A decoder that always fails with the given error message.
 * @param message Message to throw when this decoder is used.
 * @returns Never since it always throws an error.
 */
export function fail (message: string): Decoder<never> {
  return createDecoder((_json, at) => {
    throw new Error(`error at ${at}: ${message}`)
  })
}

/**
 * A decoder that always succeeds with the given value.
 * @param value Value that always gets returned when this decoder is used.
 * @returns A decoder that always returns the given value.
 */
export function succeed <T>(value: T): Decoder<T> {
  return createDecoder(() => {
    return value
  })
}

/**
 * Intelligently decode a value based on the result of another decoder. Useful
 * decoding on object whose type or structure is not immediately known. The
 * first decoder can be used to look at part of the object, then the second one
 * can can use the result of that decoder to decide on how to actually decode
 * the object.
 * @param ad First decoder to run against the value.
 * @param cb Callback that receives the previous result and returns a decoder.
 * @returns The decoder returned by from the callback function.
*/

export function andThen <A, B>(ad: Decoder<A>, cb: (a: A) => Decoder<B>): Decoder<B> {
  return createDecoder((obj, at) => {
    return decode(cb(decode(ad, obj, at)), obj, at)
  })
}

/**
 * Decode a union type. Given multiple decoders whose result type is a member
 * of the union, try each one in order until one succeeds. Works similarly to
 * [oneOf](#oneof), except that instead of the result being of single type, the
 * result is the union of all given decoder types.
 * @param ad A decoder for a member of the union.
 * @param bd A decoder for another member of the union.
 * @returns A decoder or throws an Error of no decoders succeeded.
 */

export function union <A, B>(ad: Decoder<A>, bd: Decoder<B>): Decoder<A | B>
export function union <A, B, C>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>): Decoder<A | B | C>
export function union <A, B, C, D>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>): Decoder<A | B | C | D>
export function union <A, B, C, D, E>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>): Decoder<A | B | C | D | E>
export function union <A, B, C, D, E, F>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>): Decoder<A | B | C | D | E | F>
export function union <A, B, C, D, E, F, G>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>, gd: Decoder<G>): Decoder<A | B | C | D | E | F | G>
export function union <A, B, C, D, E, F, G, H>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>, gd: Decoder<G>, hd: Decoder<H>): Decoder<A | B | C | D | E | F | G | H>
export function union <A, B, C, D, E, F, G, H, I>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>, gd: Decoder<G>, hd: Decoder<H>, id: Decoder<I>): Decoder<A | B | C | D | E | F | G | H | I>
export function union <A, B, C, D, E, F, G, H, I, J>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>, gd: Decoder<G>, hd: Decoder<H>, id: Decoder<I>, jd: Decoder<J>): Decoder<A | B | C | D | E | F | G | H | I | J>
export function union <A, B, C, D, E, F, G, H, I, J, K>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>, gd: Decoder<G>, hd: Decoder<H>, id: Decoder<I>, jd: Decoder<J>, kd: Decoder<K>): Decoder<A | B | C | D | E | F | G | H | I | J | K>
export function union <A, B, C, D, E, F, G, H, I, J, K, L>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>, gd: Decoder<G>, hd: Decoder<H>, id: Decoder<I>, jd: Decoder<J>, kd: Decoder<K>, ld: Decoder<L>): Decoder<A | B | C | D | E | F | G | H | I | J | K | L>
export function union <A, B, C, D, E, F, G, H, I, J, K, L, M>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>, gd: Decoder<G>, hd: Decoder<H>, id: Decoder<I>, jd: Decoder<J>, kd: Decoder<K>, ld: Decoder<L>, md: Decoder<M>): Decoder<A | B | C | D | E | F | G | H | I | J | K | L | M>
export function union <A, B, C, D, E, F, G, H, I, J, K, L, M, N>(ad: Decoder<A>, bd: Decoder<B>, cd: Decoder<C>, dd: Decoder<D>, ed: Decoder<E>, fd: Decoder<F>, gd: Decoder<G>, hd: Decoder<H>, id: Decoder<I>, jd: Decoder<J>, kd: Decoder<K>, ld: Decoder<L>, md: Decoder<M>, nd: Decoder<N>): Decoder<A | B | C | D | E | F | G | H | I | J | K | L | M | N>
export function union (...decoders: Decoder<any>[]): Decoder<any> {
  return createDecoder((obj, at) => {
    for (const decoder of decoders) {
      try {
        return decode(decoder, obj, at)
      } catch (e) {}
    }
    throw new Error(`error at ${at}: unexpected ${prettyPrint(obj)}`)
  })
}

/**
 * Decode a value with the decoder returned by the given function. This is
 * useful if you need to decode a recursive data structure. TypeScript does not
 * allow the direct use of variables within their definition:
 * ```typescript
 * interface Comment {
 *   msg: string
 *   replies: Comment[]
 * }
 * const decoder: Decoder<Comment> = object(
 *   ['msg', string()],
 *   ['replies', array(decoder)],
 *   (msg, replies) => ({msg, replies})
 * )
// Block-scoped variable 'decoder' used before its declaration.
// Variable 'decoder' is used before being assigned.
 * ```
 * However, a variable can be used within its definition if it is not
 * immediately evaluated, or in other words, wrapped in an anonymous function:
 * ```typescript
 * const decoder: Decoder<Comment> = object(
 *   ['msg', string()],
 *   ['replies', array(lazy(() => decoder))],
 *   (msg, replies) => ({msg, replies})
 * )
 * ```
 * @param thunk A function that will return the decoder.
 * @returns A decoder that lazily calls thunk to get the decoder when needed.
 */
export function lazy <T>(thunk: () => Decoder<T>): Decoder<T> {
  return createDecoder((obj, at) => {
    return decode(thunk(), obj, at)
  })
}

/** Object with arbitrary keys and a single value type. Used by [dict](#dict).
 */
export type Dict<T> = {[index: string]: T}

/**
 * Decode an object with arbitrary keys. Values must be of the same type.
 * @param value A Decoder that will be used to decode each value.
 * @returns A Decoder will decode an object with arbitrary keys.
 */
export function dict <T>(value: Decoder<T>): Decoder<Dict<T>> {
  return createDecoder((obj, at) => {
    if (!(obj instanceof Object) || (obj instanceof Array)) {
      throw decoderError({
        at,
        expected: 'object',
        got: obj
      })
    }

    const result: Dict<T> = {}
    for (const key in obj) {
      result[key] = decode(value, obj[key], pushLocation(at, key))
    }
    return result
  })
}
