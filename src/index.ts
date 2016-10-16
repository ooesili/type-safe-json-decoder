export class Decoder<T> {
  private fn: (object: any) => T

  constructor (fn: (object: any) => T) {
    this.fn = fn
  }

  decodeJSON (json: string): T {
    return this.fn(JSON.parse(json))
  }

  decode (object: any) {
    return this.fn(object)
  }
}

export type EntryDecoder<T> = [string, Decoder<T>]

function prettyPrint (value: any): string {
  if (value === null) {
    return 'null'
  }
  return typeof value
}

export function string (): Decoder<string> {
  return new Decoder((json) => {
    if (typeof json !== 'string') {
      throw new Error(`expected string, got ${prettyPrint(json)}`)
    }

    return json
  })
}

export function number (): Decoder<number> {
  return new Decoder((json) => {
    if (typeof json !== 'number') {
      throw new Error(`expected number, got ${prettyPrint(json)}`)
    }

    return json
  })
}

export function boolean (): Decoder<boolean> {
  return new Decoder((json) => {
    if (typeof json !== 'boolean') {
      throw new Error(`expected boolean, got ${prettyPrint(json)}`)
    }

    return json
  })
}

export function equal <T>(value: T): Decoder<T> {
  return new Decoder((json) => {
    if (json !== value) {
      throw new Error('unexpected value')
    }

    return json
  })
}

export function list <T>(element: Decoder<T>): Decoder<T[]> {
  return new Decoder((json) => {
    if (!(json instanceof Array)) {
      throw new Error('not an array')
    }

    return json.map((e) => element.decode(e))
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
  return new Decoder((json) => {
    const cons: (...args: any[]) => T = args[args.length - 1]
    const decoders: EntryDecoder<any>[] = args.slice(0, args.length - 1)

    const missingKeys: string[] = []
    const values: any[] = []

    decoders.forEach(([key, decoder]) => {
      if (key in json) {
        try {
          values.push(decoder.decode(json[key]))
        } catch (e) {
          throw new Error(`error decoding key ${JSON.stringify(key)}: ${e.message}`)
        }
      } else {
        missingKeys.push(key)
      }
    })

    if (missingKeys.length > 0) {
      throw new Error(`missing keys: ${missingKeys.join(', ')}`)
    }

    return json
  })
}

export function map <T1, T2>(transform: (v: T1) => T2, decoder: Decoder<T1>): Decoder<T2> {
  return new Decoder((json) => {
    return transform(decoder.decode(json))
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
  return new Decoder((json) => (
    decoders.map((decoder, i) => {
      try {
        return decoder.decode(json[i])
      } catch (e) {
        throw new Error(`error decoding item ${i} of tuple: ${e.message}`)
      }
    })
  ))
}

export function at <T>(keyPath: string[], decoder: Decoder<T>): Decoder<T> {
  return new Decoder((json) => {
    const result = keyPath.reduce((obj, key) => {
      const value = obj[key]
      if (value === undefined) {
        throw new Error(`error decoding nested object: missing key: ${key}`)
      }
      return value
    }, json)

    try {
      return decoder.decode(result)
    } catch (e) {
      throw new Error(`error decoding nested object: ${e.message}`)
    }
  })
}

export function oneOf <T>(first: Decoder<T>, ...rest: Decoder<T>[]): Decoder<T> {
  return new Decoder((json) => {
    try {
      return first.decode(json)
    } catch (e) {}

    for (const decoder of rest) {
      try {
        return decoder.decode(json)
      } catch (e) {}
    }
    throw new Error()
  })
}

export function fail (message: string): Decoder<never> {
  return new Decoder(() => {
    throw new Error(message)
  })
}

export function succeed <T>(value: T): Decoder<T> {
  return new Decoder(() => {
    return value
  })
}

export function andThen <A, B>(ad: Decoder<A>, cb: (a: A) => Decoder<B>): Decoder<B> {
  return new Decoder((json) => {
    return cb(ad.decode(json)).decode(json)
  })
}
