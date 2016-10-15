export interface IDecoder<T> {
  (json: any): T
}

export type IEntryDecoder<T> = [string, IDecoder<T>]

function prettyPrint (value: any): string {
  if (value === null) {
    return 'null'
  }
  return typeof value
}

export function decode <T>(decoder: IDecoder<T>, json: string): T {
  return decoder(JSON.parse(json))
}

export function string (): IDecoder<string> {
  return (json) => {
    if (typeof json !== 'string') {
      throw new Error(`expected string, got ${prettyPrint(json)}`)
    }

    return json
  }
}

export function number (): IDecoder<number> {
  return (json) => {
    if (typeof json !== 'number') {
      throw new Error(`expected number, got ${prettyPrint(json)}`)
    }

    return json
  }
}

export function boolean (): IDecoder<boolean> {
  return (json) => {
    if (typeof json !== 'boolean') {
      throw new Error(`expected boolean, got ${prettyPrint(json)}`)
    }

    return json
  }
}

export function equal <T>(value: T): IDecoder<T> {
  return (json) => {
    if (json !== value) {
      throw new Error('unexpected value')
    }

    return json
  }
}

export function list <T>(element: IDecoder<T>): IDecoder<T[]> {
  return (json) => {
    if (!(json instanceof Array)) {
      throw new Error('not an array')
    }

    return json.map(element)
  }
}

export function object <T, A>(ad: IEntryDecoder<A>, cons: (a: A) => T): IDecoder<T>
export function object <T, A, B>(ad: IEntryDecoder<A>, bd: IEntryDecoder<B>, cons: (a: A, b: B) => T): IDecoder<T>
export function object <T, A, B, C>(ad: IEntryDecoder<A>, bd: IEntryDecoder<B>, cd: IEntryDecoder<C>, cons: (a: A, b: B, c: C) => T): IDecoder<T>
export function object <T, A, B, C, D>(ad: IEntryDecoder<A>, bd: IEntryDecoder<B>, cd: IEntryDecoder<C>, dd: IEntryDecoder<D>, cons: (a: A, b: B, c: C, d: D) => T): IDecoder<T>
export function object <T, A, B, C, D, E>(ad: IEntryDecoder<A>, bd: IEntryDecoder<B>, cd: IEntryDecoder<C>, dd: IEntryDecoder<D>, ed: IEntryDecoder<E>, cons: (a: A, b: B, c: C, d: D, e: E) => T): IDecoder<T>
export function object <T, A, B, C, D, E, F>(ad: IEntryDecoder<A>, bd: IEntryDecoder<B>, cd: IEntryDecoder<C>, dd: IEntryDecoder<D>, ed: IEntryDecoder<E>, fd: IEntryDecoder<F>, cons: (a: A, b: B, c: C, d: D, e: E, f: F) => T): IDecoder<T>
export function object <T, A, B, C, D, E, F, G>(ad: IEntryDecoder<A>, bd: IEntryDecoder<B>, cd: IEntryDecoder<C>, dd: IEntryDecoder<D>, ed: IEntryDecoder<E>, fd: IEntryDecoder<F>, gd: IEntryDecoder<G>, cons: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => T): IDecoder<T>
export function object <T, A, B, C, D, E, F, G, H>(ad: IEntryDecoder<A>, bd: IEntryDecoder<B>, cd: IEntryDecoder<C>, dd: IEntryDecoder<D>, ed: IEntryDecoder<E>, fd: IEntryDecoder<F>, gd: IEntryDecoder<G>, hd: IEntryDecoder<H>, cons: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => T): IDecoder<T>
export function object <T, A, B, C, D, E, F, G, H, I>(ad: IEntryDecoder<A>, bd: IEntryDecoder<B>, cd: IEntryDecoder<C>, dd: IEntryDecoder<D>, ed: IEntryDecoder<E>, fd: IEntryDecoder<F>, gd: IEntryDecoder<G>, hd: IEntryDecoder<H>, id: IEntryDecoder<I>, cons: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => T): IDecoder<T>
export function object <T, A, B, C, D, E, F, G, H, I, J>(ad: IEntryDecoder<A>, bd: IEntryDecoder<B>, cd: IEntryDecoder<C>, dd: IEntryDecoder<D>, ed: IEntryDecoder<E>, fd: IEntryDecoder<F>, gd: IEntryDecoder<G>, hd: IEntryDecoder<H>, id: IEntryDecoder<I>, jd: IEntryDecoder<J>, cons: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => T): IDecoder<T>
export function object <T, A, B, C, D, E, F, G, H, I, J, K>(ad: IEntryDecoder<A>, bd: IEntryDecoder<B>, cd: IEntryDecoder<C>, dd: IEntryDecoder<D>, ed: IEntryDecoder<E>, fd: IEntryDecoder<F>, gd: IEntryDecoder<G>, hd: IEntryDecoder<H>, id: IEntryDecoder<I>, jd: IEntryDecoder<J>, kd: IEntryDecoder<K>, cons: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J, k: K) => T): IDecoder<T>
export function object <T, A, B, C, D, E, F, G, H, I, J, K, L>(ad: IEntryDecoder<A>, bd: IEntryDecoder<B>, cd: IEntryDecoder<C>, dd: IEntryDecoder<D>, ed: IEntryDecoder<E>, fd: IEntryDecoder<F>, gd: IEntryDecoder<G>, hd: IEntryDecoder<H>, id: IEntryDecoder<I>, jd: IEntryDecoder<J>, kd: IEntryDecoder<K>, ld: IEntryDecoder<L>, cons: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J, k: K, l: L) => T): IDecoder<T>
export function object <T, A, B, C, D, E, F, G, H, I, J, K, L, M>(ad: IEntryDecoder<A>, bd: IEntryDecoder<B>, cd: IEntryDecoder<C>, dd: IEntryDecoder<D>, ed: IEntryDecoder<E>, fd: IEntryDecoder<F>, gd: IEntryDecoder<G>, hd: IEntryDecoder<H>, id: IEntryDecoder<I>, jd: IEntryDecoder<J>, kd: IEntryDecoder<K>, ld: IEntryDecoder<L>, md: IEntryDecoder<M>, cons: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J, k: K, l: L, m: M) => T): IDecoder<T>
export function object <T, A, B, C, D, E, F, G, H, I, J, K, L, M, N>(ad: IEntryDecoder<A>, bd: IEntryDecoder<B>, cd: IEntryDecoder<C>, dd: IEntryDecoder<D>, ed: IEntryDecoder<E>, fd: IEntryDecoder<F>, gd: IEntryDecoder<G>, hd: IEntryDecoder<H>, id: IEntryDecoder<I>, jd: IEntryDecoder<J>, kd: IEntryDecoder<K>, ld: IEntryDecoder<L>, md: IEntryDecoder<M>, nd: IEntryDecoder<N>, cons: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J, k: K, l: L, m: M, n: N) => T): IDecoder<T>
export function object <T>(...args: any[]): IDecoder<T> {
  return (json) => {
    const cons: (...args: any[]) => T = args[args.length - 1]
    const decoders: IEntryDecoder<any>[] = args.slice(0, args.length - 1)

    const missingKeys: string[] = []
    const values: any[] = []

    decoders.forEach(([key, decoder]) => {
      if (key in json) {
        try {
          values.push(decoder(json[key]))
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
  }
}

export function map <T1, T2>(transform: (v: T1) => T2, decoder: IDecoder<T1>): IDecoder<T2> {
  return (json) => {
    return transform(decoder(json))
  }
}

export function tuple <A>(ad: IDecoder<A>): IDecoder<[A]>
export function tuple <A, B>(ad: IDecoder<A>, bd: IDecoder<B>): IDecoder<[A, B]>
export function tuple <A, B, C>(ad: IDecoder<A>, bd: IDecoder<B>, cd: IDecoder<C>): IDecoder<[A, B, C]>
export function tuple <A, B, C, D>(ad: IDecoder<A>, bd: IDecoder<B>, cd: IDecoder<C>, dd: IDecoder<D>): IDecoder<[A, B, C, D]>
export function tuple <A, B, C, D, E>(ad: IDecoder<A>, bd: IDecoder<B>, cd: IDecoder<C>, dd: IDecoder<D>, ed: IDecoder<E>): IDecoder<[A, B, C, D, E]>
export function tuple <A, B, C, D, E, F>(ad: IDecoder<A>, bd: IDecoder<B>, cd: IDecoder<C>, dd: IDecoder<D>, ed: IDecoder<E>, fd: IDecoder<F>): IDecoder<[A, B, C, D, E, F]>
export function tuple <A, B, C, D, E, F, G>(ad: IDecoder<A>, bd: IDecoder<B>, cd: IDecoder<C>, dd: IDecoder<D>, ed: IDecoder<E>, fd: IDecoder<F>, gd: IDecoder<G>): IDecoder<[A, B, C, D, E, F, G]>
export function tuple <A, B, C, D, E, F, G, H>(ad: IDecoder<A>, bd: IDecoder<B>, cd: IDecoder<C>, dd: IDecoder<D>, ed: IDecoder<E>, fd: IDecoder<F>, gd: IDecoder<G>, hd: IDecoder<H>): IDecoder<[A, B, C, D, E, F, G, H]>
export function tuple <A, B, C, D, E, F, G, H, I>(ad: IDecoder<A>, bd: IDecoder<B>, cd: IDecoder<C>, dd: IDecoder<D>, ed: IDecoder<E>, fd: IDecoder<F>, gd: IDecoder<G>, hd: IDecoder<H>, id: IDecoder<I>): IDecoder<[A, B, C, D, E, F, G, H, I]>
export function tuple <A, B, C, D, E, F, G, H, I, J>(ad: IDecoder<A>, bd: IDecoder<B>, cd: IDecoder<C>, dd: IDecoder<D>, ed: IDecoder<E>, fd: IDecoder<F>, gd: IDecoder<G>, hd: IDecoder<H>, id: IDecoder<I>, jd: IDecoder<J>): IDecoder<[A, B, C, D, E, F, G, H, I, J]>
export function tuple <A, B, C, D, E, F, G, H, I, J, K>(ad: IDecoder<A>, bd: IDecoder<B>, cd: IDecoder<C>, dd: IDecoder<D>, ed: IDecoder<E>, fd: IDecoder<F>, gd: IDecoder<G>, hd: IDecoder<H>, id: IDecoder<I>, jd: IDecoder<J>, kd: IDecoder<K>): IDecoder<[A, B, C, D, E, F, G, H, I, J, K]>
export function tuple <A, B, C, D, E, F, G, H, I, J, K, L>(ad: IDecoder<A>, bd: IDecoder<B>, cd: IDecoder<C>, dd: IDecoder<D>, ed: IDecoder<E>, fd: IDecoder<F>, gd: IDecoder<G>, hd: IDecoder<H>, id: IDecoder<I>, jd: IDecoder<J>, kd: IDecoder<K>, ld: IDecoder<L>): IDecoder<[A, B, C, D, E, F, G, H, I, J, K, L]>
export function tuple <A, B, C, D, E, F, G, H, I, J, K, L, M>(ad: IDecoder<A>, bd: IDecoder<B>, cd: IDecoder<C>, dd: IDecoder<D>, ed: IDecoder<E>, fd: IDecoder<F>, gd: IDecoder<G>, hd: IDecoder<H>, id: IDecoder<I>, jd: IDecoder<J>, kd: IDecoder<K>, ld: IDecoder<L>, md: IDecoder<M>): IDecoder<[A, B, C, D, E, F, G, H, I, J, K, L, M]>
export function tuple <A, B, C, D, E, F, G, H, I, J, K, L, M, N>(ad: IDecoder<A>, bd: IDecoder<B>, cd: IDecoder<C>, dd: IDecoder<D>, ed: IDecoder<E>, fd: IDecoder<F>, gd: IDecoder<G>, hd: IDecoder<H>, id: IDecoder<I>, jd: IDecoder<J>, kd: IDecoder<K>, ld: IDecoder<L>, md: IDecoder<M>, nd: IDecoder<N>): IDecoder<[A, B, C, D, E, F, G, H, I, J, K, L, M, N]>
export function tuple (...decoders: IDecoder<any>[]): IDecoder<any> {
  return (json) => (
    decoders.map((decoder, i) => {
      try {
        return decoder(json[i])
      } catch (e) {
        throw new Error(`error decoding item ${i} of tuple: ${e.message}`)
      }
    })
  )
}

export function at <T>(keyPath: string[], decoder: IDecoder<T>): IDecoder<T> {
  return (json) => {
    const result = keyPath.reduce((obj, key) => {
      const value = obj[key]
      if (value === undefined) {
        throw new Error(`error decoding nested object: missing key: ${key}`)
      }
      return value
    }, json)

    try {
      return decoder(result)
    } catch (e) {
      throw new Error(`error decoding nested object: ${e.message}`)
    }
  }
}

export function oneOf <T>(first: IDecoder<T>, ...rest: IDecoder<T>[]): IDecoder<T> {
  return (json) => {
    try {
      return first(json)
    } catch (e) {}

    for (const decoder of rest) {
      try {
        return decoder(json)
      } catch (e) {}
    }
    throw new Error()
  }
}

export function fail (message: string): IDecoder<never> {
  return () => {
    throw new Error(message)
  }
}

export function succeed <T>(value: T): IDecoder<T> {
  return () => {
    return value
  }
}

export function andThen <A, B>(ad: IDecoder<A>, cb: (a: A) => IDecoder<B>): IDecoder<B> {
  return (json) => cb(ad(json))(json)
}
