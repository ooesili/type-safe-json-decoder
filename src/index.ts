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

let decode: <T>(decoder: Decoder<T>, object: any, at: string) => T

export class Decoder<T> {
  private fn: (object: any, at: string) => T

  private static _ignore = (() => {
    decode = <T>(decoder: Decoder<T>, object: any, at: string): T => {
      return decoder.fn(object, at)
    }
  })()

  constructor (fn: (object: any, at: string) => T) {
    this.fn = fn
  }

  decodeJSON (json: string): T {
    return this.fn(JSON.parse(json), 'root')
  }
}

export type EntryDecoder<T> = [string, Decoder<T>]

function prettyPrint (value: any): string {
  if (value === null) {
    return 'null'
  }

  if (value instanceof Array) {
    return 'list'
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

export function string (): Decoder<string> {
  return new Decoder((json, at) => {
    if (typeof json !== 'string') {
      throw decoderError({
        at,
        expected: 'string',
        got: json
      })
    }

    return json
  })
}

export function number (): Decoder<number> {
  return new Decoder((json, at) => {
    if (typeof json !== 'number') {
      throw decoderError({
        at,
        expected: 'number',
        got: json
      })
    }

    return json
  })
}

export function boolean (): Decoder<boolean> {
  return new Decoder((json, at) => {
    if (typeof json !== 'boolean') {
      throw decoderError({
        at,
        expected: 'boolean',
        got: json
      })
    }

    return json
  })
}

export function equal <T>(value: T): Decoder<T> {
  return new Decoder((json, at) => {
    if (json !== value) {
      throw decoderError({
        at,
        expected: JSON.stringify(value),
        got: json
      })
    }

    return json
  })
}

export function list <T>(element: Decoder<T>): Decoder<T[]> {
  return new Decoder((json, at) => {
    if (!(json instanceof Array)) {
      throw decoderError({
        at,
        expected: 'list',
        got: json
      })
    }

    return json.map((e, i) => decode(element, e, pushLocation(at, i)))
  })
}

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

  return new Decoder((json, at) => {
    const missingKeys: string[] = []
    const values: any[] = []

    if (typeof json !== 'object') {
      throw decoderError({
        at,
        expected: 'object',
        got: json
      })
    }

    decoders.forEach(([key, decoder]) => {
      if (key in json) {
        values.push(decode(decoder, json[key], pushLocation(at, key)))
      } else {
        missingKeys.push(key)
      }
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

    return json
  })
}

export function map <T1, T2>(transform: (v: T1) => T2, decoder: Decoder<T1>): Decoder<T2> {
  return new Decoder((json, at) => {
    return transform(decode(decoder, json, at))
  })
}

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
  return new Decoder((json, at) => (
    decoders.map((decoder, i) => {
      return decode(decoder, json[i], pushLocation(at, i))
    })
  ))
}

export function at <T>(keyPath: string[], decoder: Decoder<T>): Decoder<T> {
  return new Decoder((json, at) => {
    const {result, resultAt} = keyPath.reduce(({result, resultAt}, key) => {
      const value = result[key]
      if (value === undefined) {
        throw decoderError({
          at,
          expected: `object with key: ${key}`
        })
      }

      return {result: value, resultAt: pushLocation(resultAt, key)}
    }, {result: json, resultAt: at})

    return decode(decoder, result, resultAt)
  })
}

export function oneOf <T>(first: Decoder<T>, ...rest: Decoder<T>[]): Decoder<T> {
  return new Decoder((json, at) => {
    try {
      return decode(first, json, at)
    } catch (e) {}

    for (const decoder of rest) {
      try {
        return decode(decoder, json, at)
      } catch (e) {}
    }
    throw new Error(`error at ${at}: unexpected ${prettyPrint(json)}`)
  })
}

export function fail (message: string): Decoder<never> {
  return new Decoder((json, at) => {
    throw new Error(`error at ${at}: ${message}`)
  })
}

export function succeed <T>(value: T): Decoder<T> {
  return new Decoder(() => {
    return value
  })
}

export function andThen <A, B>(ad: Decoder<A>, cb: (a: A) => Decoder<B>): Decoder<B> {
  return new Decoder((json, at) => {
    return decode(cb(decode(ad, json, at)), json, at)
  })
}
