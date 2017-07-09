import * as module from '../src/index'

describe('string', () => {
  const decoder = module.string()

  it('succeeds when given a string', () => {
    expect(decoder.decodeJSON('"hey"')).toBe('hey')
  })

  it('fails when given a number', () => {
    expect(() => decoder.decodeJSON('1')).toThrowError(
      'error at root: expected string, got number'
    )
  })

  it('fails when given null', () => {
    expect(() => decoder.decodeJSON('null')).toThrowError(
      'error at root: expected string, got null'
    )
  })

  it('fails when given a boolean', () => {
    expect(() => decoder.decodeJSON('true')).toThrowError(
      'error at root: expected string, got boolean'
    )
  })
})

describe('number', () => {
  const decoder = module.number()

  it('succeeds when given a number', () => {
    expect(decoder.decodeJSON('5')).toBe(5)
  })

  it('fails when given a string', () => {
    expect(() => decoder.decodeJSON('"hey"')).toThrowError(
      'error at root: expected number, got string'
    )
  })

  it('fails when given boolean', () => {
    expect(() => decoder.decodeJSON('true')).toThrowError(
      'error at root: expected number, got boolean'
    )
  })
})

describe('boolean', () => {
  const decoder = module.boolean()

  it('succeeds when given a boolean', () => {
    expect(decoder.decodeJSON('true')).toBe(true)
  })

  it('fails when given a string', () => {
    expect(() => decoder.decodeJSON('"hey"')).toThrowError(
      'error at root: expected boolean, got string'
    )
  })

  it('fails when given a number', () => {
    expect(() => decoder.decodeJSON('1')).toThrowError(
      'error at root: expected boolean, got number'
    )
  })
})

describe('equal', () => {
  it('works when given null', () => {
    const decoder = module.equal(null)
    expect(decoder.decodeJSON('null')).toBe(null)
  })

  it('fails when given two different values', () => {
    const decoder = module.equal(42)
    expect(() => decoder.decodeJSON('true')).toThrowError(
      'error at root: expected 42, got boolean'
    )
  })
})

describe('array', () => {
  const decoder = module.array(module.number())

  it('works when given an array',() => {
    expect(decoder.decodeJSON('[1, 2, 3]')).toEqual([1, 2, 3])
  })

  it('fails when given something other than a array', () => {
    expect(() => decoder.decodeJSON('"oops"')).toThrowError(
      'error at root: expected array, got string'
    )
  })

  describe("when given something other than an array", () => {
    it('fails when the elements are of the wrong type', () => {
      expect(() => decoder.decodeJSON('["dang"]')).toThrowError(
        'error at [0]: expected number, got string'
      )
    })

    it('properly displays nested errors', () => {
      const decoder = module.array(
        module.array(
          module.array(module.number())
        )
      )
      expect(() => decoder.decodeJSON('[[], [], [[1,2,3,false]]]')).toThrowError(
        'error at [2][0][3]: expected number, got boolean'
      )
    })
  })
})

describe('object', () => {
  describe('when given valid JSON', () => {
    it('can decode a simple object', () => {
      const decoder = module.object(
        ['x', module.number()],
        (x) => ({x})
      )
      expect(decoder.decodeJSON('{"x": 5}')).toEqual({x: 5})
    })

    it('can decode a nested object', () => {
      const decoder = module.object(
        ['payload', module.object(
          ['x', module.number()],
          ['y', module.number()],
          (x, y) => ({x, y})
        )],
        ['error', module.equal(false)],
        (payload, error) => ({payload, error})
      )
      const json = '{"payload": {"x": 5, "y": 2}, "error": false}'
      expect(decoder.decodeJSON(json)).toEqual({
        payload: {x: 5, y: 2},
        error: false
      })
    })

    it('can decode into something other than an object', () => {
      const decoder = module.object(
        ['x', module.number()],
        ['y', module.number()],
        (x, y) => [x, y]
      )
      expect(decoder.decodeJSON('{"x":3,"y":4}')).toEqual([3, 4])
    })

    it('can decode an object with optional keys', () => {
      interface User {
        name?: string
      }

      const decoder: module.Decoder<User> = module.object(
        ['name', module.oneOf(module.string(), module.succeed(undefined))],
        (name) => ({name})
      )

      expect(decoder.decodeJSON(`{}`)).toEqual({name: undefined})
    })
  })

  describe('when given incorrect JSON', () => {
    it('fails when not given an object', () => {
      const decoder = module.object(
        ['x', module.number()],
        (x: number) => ({x})
      )
      expect(() => decoder.decodeJSON('true')).toThrowError(
        `error at root: expected object, got boolean`
      )
    })

    it('reports a missing key', () => {
      const decoder = module.object(
        ['x', module.number()],
        (x: number) => ({x})
      )
      expect(() => decoder.decodeJSON('{}')).toThrowError(
        `error at root: expected object with keys: x`
      )
    })

    it('reports multiple missing keys in alphabetical order', () => {
      const decoder = module.object(
        ['x', module.number()],
        ['y', module.number()],
        ['?', module.string()],
        (x: number, y: number, huh: string) => ({x, y, huh})
      )
      expect(() => decoder.decodeJSON('{"x": 5}')).toThrowError(
        `error at root: expected object with keys: "?", y`
      )
    })

    it('reports invalid values', () => {
      const decoder = module.object(
        ['name', module.string()],
        (name: string) => {name}
      )
      expect(() => decoder.decodeJSON('{"name": 5}')).toThrowError(
        `error at .name: expected string, got number`
      )
    })

    it('properly displays nested errors', () => {
      const id: <A>(x: A) => A = (x: any) => x
      const decoder = module.object(
        ['hello', module.object(
          ['hey', module.object(
            ['Howdy!', module.string()
            ], id
          )], id
        )], id
      )
      expect(() => decoder.decodeJSON(
        '{"hello":{"hey":{"Howdy!":{}}}}'
      )).toThrowError(
        `error at .hello.hey["Howdy!"]: expected string, got object`
      )
    })
  })
})

describe('map', () => {
  it('can apply the identity function to the decoder', () => {
    const decoder = module.map((x) => x, module.string())
    expect(decoder.decodeJSON('"hey there"')).toBe('hey there')
  })

  it('can apply an endomorphic function to the decoder', () => {
    const decoder = module.map((x) => x * 5, module.number())
    expect(decoder.decodeJSON('10')).toBe(50)
  })

  it('can apply a function that transforms the type', () => {
    const decoder = module.map((x) => x.length, module.string())
    expect(decoder.decodeJSON('"hey"')).toEqual(3)
  })

  it('reports exceptions in the callback', () => {
    const error = new Error('gosh')
    const decoder = module.map(() => { throw error }, module.string())
    expect(() => decoder.decodeJSON('error at root: error performing map: ${error.message}'))
  })
})

describe('tuple', () => {
  describe('when given valid JSON', () => {
    it('decodes an 2 value tuple', () => {
      const decoder = module.tuple(
        module.string(),
        module.number(),
      )
      expect(decoder.decodeJSON('["Dale Gribble", 47]'))
    })

    it('decodes a 3 value tuple', () => {
      const decoder = module.tuple(
        module.string(),
        module.string(),
        module.number(),
      )
      expect(decoder.decodeJSON('["Rusty", "Shackleford", 47]')).toEqual([
        "Rusty",
        "Shackleford",
        47
      ])
    })
  })

  describe('when given incorrect JSON', () => {
    it('throws an error', () => {
      const decoder = module.tuple(
        module.number(),
        module.string()
      )
      expect(() => decoder.decodeJSON('[54, 84]')).toThrowError(
        'error at [1]: expected string, got number'
      )
    })
  })
})

describe('at', () => {
  describe('when given a valid object', () => {
    it('can look up a value in nested objects', () => {
      const decoder = module.at(
        ['a', 'b', 'c'],
        module.number()
      )
      expect(decoder.decodeJSON('{"a":{"b":{"c":123}}}')).toEqual(123)
    })

    it('can look up a value in nested arrays', () => {
      const decoder = module.at(
        [2, 1, 0],
        module.string()
      )
      expect(decoder.decodeJSON('[1,2,[3,["blastoff"]]]')).toEqual('blastoff')
    })

    it('can look up a value in mixed nested arrays and object', () => {
      const decoder = module.at(
        [0, 'value'],
        module.number()
      )
      expect(decoder.decodeJSON('[{"value":7}]')).toEqual(7)
    })
  })

  describe('when the given value is missing a key', () => {
    describe('when given a string key', () => {
      const decoder = module.at(
        ['yes'],
        module.string()
      )

      it('throws an error when decoding an object', () => {
        expect(() => decoder.decodeJSON('{"no":false}')).toThrowError(
          'error at root: expected object with key yes, got object'
        )
      })

      it('throws an error when decoding an array', () => {
        expect(() => decoder.decodeJSON('[1,2,3]')).toThrowError(
          'error at root: expected object with key yes, got array'
        )
      })
    })

    describe('when given a number key', () => {
      const decoder = module.at(
        [2],
        module.string()
      )

      it('throws an error when decoding an array', () => {
        expect(() => decoder.decodeJSON('[0,1]')).toThrowError(
          'error at root: expected array: index out of range: 2 > 1'
        )
      })

      it('throws an error when decoding an object', () => {
        expect(() => decoder.decodeJSON('{"hey":"there"}')).toThrowError(
          `error at root: expected array with index 2, got object`
        )
      })
    })
  })

  describe('when the value has the wrong type', () => {
    it('throws an error', () => {
      const decoder = module.at(
        ['hello', 'world'],
        module.string()
      )
      expect(() => decoder.decodeJSON('{"hello":{"world":null}}')).toThrowError(
        'error at .hello.world: expected string, got null'
      )
    })
  })
})

describe('oneOf', () => {
  describe('when given valid input', () => {
    it('decodes an value with a single alternative', () => {
      const decoder = module.oneOf(
        module.string()
      )
      expect(decoder.decodeJSON('"yo"')).toEqual('yo')
    })

    it('decodes a value with multiple alternatives', () => {
      const decoder = module.array(
        module.oneOf(
          module.map((s) => s.length, module.string()),
          module.number()
        )
      )
      expect(decoder.decodeJSON('["hey", 10]')).toEqual([3, 10])
    })
  })

  describe('when a value that does not fit any decoder', () => {
    it('throws an error', () => {
      const decoder = module.oneOf(
        module.string(),
        module.map(String, module.number())
      )
      expect(() => decoder.decodeJSON('[]')).toThrowError(
        `error at root: unexpected array`
      )
    })
  })
})

describe('fail', () => {
  it('fails by itself', () => {
    const decoder = module.fail('dang')
    expect(() => decoder.decodeJSON('{"hey":"there"}')).toThrowError(
      'error at root: dang'
    )
  })

  it('does not fail when not used during decoding', () => {
    const decoder = module.oneOf(
      module.number(),
      module.fail('dang')
    )
    expect(decoder.decodeJSON('3')).toEqual(3)
  })
})

describe('succeed', () => {
  it('returns the value given', () => {
    const decoder = module.succeed('woohoo!')
    expect(decoder.decodeJSON('[]')).toEqual('woohoo!')
  })

  it('acts as the default clause with oneOf', () => {
    const decoder = module.oneOf(
      module.string(),
      module.succeed('(nothing)')
    )
    expect(decoder.decodeJSON('[]')).toEqual('(nothing)')
  })
})

describe('andThen', () => {
  const vehicle = (t: string): module.Decoder<string> => {
    switch (t) {
      case 'train':
        return module.map(
          (color) => `${color} line`,
            module.at(['color'], module.string())
      )
      case 'plane':
        return module.map(
          (airline) => `${airline} airlines`,
            module.at(['airline'], module.string())
      )
    }
    return module.succeed("you're walkin', pal")
  }
  const decoder = module.andThen(
    module.at(['type'], module.string()),
    vehicle
  )

  it('performs conditional decoding based on field', () => {
    const blueLine = `{"type":"train","color":"blue"}`
    const lambaAirlines = `{"type":"plane","airline":"lambda"}`
    const foot = `{"type":"Ehh"}`
    expect(decoder.decodeJSON(blueLine)).toEqual('blue line')
    expect(decoder.decodeJSON(lambaAirlines)).toEqual('lambda airlines')
    expect(decoder.decodeJSON(foot)).toEqual("you're walkin', pal")
  })

  describe('when the first decoder fails', () => {
    it('throws an error', () => {
      expect(() => decoder.decodeJSON('{"type":null}')).toThrowError(
        `error at .type: expected string, got null`
      )
    })
  })

  describe('when the second decoder fails', () => {
    it('throws an error', () => {
      expect(() => decoder.decodeJSON('{"type":"train","color":false}')).toThrowError(
        `error at .color: expected string, got boolean`
      )
    })
  })
})

describe('union', () => {
  describe('decoding a union string of string literals', () => {
    type Easing = 'ease-in' | 'ease-out' | 'ease-in-out'
    const decoder: module.Decoder<Easing> = module.union(
      module.equal('ease-in' as 'ease-in'),
      module.equal('ease-out' as 'ease-out'),
      module.equal('ease-in-out' as 'ease-in-out')
    )

    it('can decode each alterantive', () => {
      expect(decoder.decodeJSON(`"ease-in"`)).toEqual('ease-in')
      expect(decoder.decodeJSON(`"ease-out"`)).toEqual('ease-out')
      expect(decoder.decodeJSON(`"ease-in-out"`)).toEqual('ease-in-out')
    })

    it('fails to decode anything else', () => {
      expect(() => decoder.decodeJSON(`"heck"`)).toThrowError(
        `error at root: unexpected string`
      )
    })
  })

  describe('decoding a union of arbitrary types', () => {
    const decoder: module.Decoder<number[] | boolean> = module.union(
      module.array(module.number()),
      module.boolean()
    )

    it('can decode each alternative', () => {
      expect(decoder.decodeJSON(`[1, 2, 3]`)).toEqual([1, 2, 3])
      expect(decoder.decodeJSON(`true`)).toEqual(true)
    })

    it('fails to decode anythign else', () => {
      expect(() => decoder.decodeJSON(`{}`)).toThrowError(
        `error at root: unexpected object`
      )
    })
  })
})

describe('lazy', () => {
  describe('decoding a primitive data type', () => {
    const decoder = module.lazy(() => module.string())

    it('can decode type as normal', () => {
      expect(decoder.decodeJSON(`"hello"`)).toEqual('hello')
    })

    it('does not alter the error message', () => {
      expect(() => decoder.decodeJSON(`5`)).toThrowError(
        `error at root: expected string, got number`
      )
    })
  })

  describe('decoding a recursive data structure', () => {
    interface Comment {
      msg: string
      replies: Comment[]
    }
    const decoder: module.Decoder<Comment> = module.object(
      ['msg', module.string()],
      ['replies', module.array(
        module.lazy(() => decoder)
      )],
      (msg, replies) => ({msg, replies})
    )

    it('can decode the data structure', () => {
      const tree = `{"msg":"hey","replies":[{"msg":"hi","replies":[]}]}`
      expect(decoder.decodeJSON(tree)).toEqual({
        msg: 'hey',
        replies: [
          {msg: 'hi', replies: []}
        ]
      })
    })

    it('throws the correct error when a nested value is invalid', () => {
      const badTree = `{"msg":"hey","replies":[{"msg":"hi","replies":[0]}]}`
      expect(() => decoder.decodeJSON(badTree)).toThrowError(
        `error at .replies[0].replies[0]: expected object, got number`
      )
    })
  })
})

describe('dict', () => {
  describe('with a simple value decoder', () => {
    const decoder = module.dict(module.number())

    it('can decode an empty object', () => {
      expect(decoder.decodeJSON('{}')).toEqual({})
    })

    it('can decode an object of with arbitrary keys', () => {
      expect(decoder.decodeJSON('{"a":1,"b":2}')).toEqual({a: 1, b: 2})
    })

    it('throws an error if a value cannot be decoded', () => {
      expect(() => decoder.decodeJSON('{"oh":"no"}')).toThrowError(
        `error at .oh: expected number, got string`
      )
    })

    it('throws an error if given an array', () => {
      expect(() => decoder.decodeJSON(`[]`)).toThrowError(
        `error at root: expected object, got array`
      )
    })

    it('throws an error if given a primitive', () => {
      expect(() => decoder.decodeJSON(`5`)).toThrowError(
        `error at root: expected object, got number`
      )
    })
  })

  describe('given a transformative value decoder', () => {
    const decoder = module.dict(
      module.map((str) => str + '!', module.string())
    )

    it('transforms the values', () => {
      expect(decoder.decodeJSON(`{"hey":"there","yo":"dude"}`)).toEqual(
        {hey: 'there!', yo: 'dude!'}
      )
    })
  })
})

describe('Decoder.decodeAny', () => {
  const decoder = module.object(
    ['id', module.number()],
    ['name', module.string()],
    (id, name) => ({id, name})
  )

  it('can decode an normal object', () => {
    const decoder = module.object(
      ['id', module.number()],
      ['name', module.string()],
      (id, name) => ({id, name})
    )
    const input = {
      id: 7,
      name: 'Bob'
    }
    expect(decoder.decodeAny(input)).toEqual(input)
  })

  it('throws an error when the structure does not match the decoder', () => {
    const input = {
      id: '7',
      name: 'Bob'
    }
    expect(() => decoder.decodeAny(input)).toThrowError(
      `error at .id: expected number, got string`
    )
  })
})
