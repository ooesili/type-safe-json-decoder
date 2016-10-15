import * as module from '../src/index'

describe('string', () => {
  const decoder = module.string()

  it('succeeds when given a string', () => {
    expect(module.decode(decoder, '"hey"')).toBe('hey')
  })

  it('fails when given a number', () => {
    expect(() => module.decode(decoder, '1')).toThrowError('expected string, got number')
  })

  it('fails when given null', () => {
    expect(() => module.decode(decoder, 'null')).toThrowError('expected string, got null')
  })

  it('fails when given a boolean', () => {
    expect(() => module.decode(decoder, 'true')).toThrowError('expected string, got boolean')
  })
})

describe('number', () => {
  const decoder = module.number()

  it('succeeds when given a number', () => {
    expect(module.decode(decoder, '5')).toBe(5)
  })

  it('fails when given a string', () => {
    expect(() => module.decode(decoder, '"hey"')).toThrowError('expected number, got string')
  })

  it('fails when given boolean', () => {
    expect(() => module.decode(decoder, 'true')).toThrowError('expected number, got boolean')
  })
})

describe('boolean', () => {
  const decoder = module.boolean()

  it('succeeds when given a boolean', () => {
    expect(module.decode(decoder, 'true')).toBe(true)
  })

  it('fails when given a string', () => {
    expect(() => module.decode(decoder, '"hey"')).toThrowError('expected boolean, got string')
  })

  it('fails when given a number', () => {
    expect(() => module.decode(decoder, '1')).toThrowError('expected boolean, got number')
  })
})

describe('list', () => {
  const decoder = module.list(module.number())

  it('works when given an array',() => {
    expect(module.decode(decoder, '[1, 2, 3]')).toEqual([1, 2, 3])
  })

  it('fails when given something else', () => {
    expect(() => module.decode(decoder, '"oops"')).toThrow()
  })

  it('fails when the elements are of the wrong type', () => {
    expect(() => module.decode(decoder, '["dang"]')).toThrow()
  })
})

describe('equal', () => {
  it('works when given null', () => {
    const decoder = module.equal(null)
    expect(module.decode(decoder, 'null')).toBe(null)
  })

  it('fails when given two different values', () => {
    const decoder = module.equal(42)
    expect(() => module.decode(decoder, 'true')).toThrow()
  })
})

describe('object', () => {
  describe('when given valid JSON', () => {
    it('can decode a simple object', () => {
      const decoder = module.object(
        ['x', module.number()],
        (x) => ({x})
      )
      expect(module.decode(decoder, '{"x": 5}')).toEqual({x: 5})
    })

    it('can decode a nested object', () => {
      const decoder = module.object(
        ['payload', module.object(
          ['x', module.number()],
          ['y', module.number()],
          (x, y) => {x, y}
        )],
        ['error', module.equal(false)],
        (payload, error) => ({payload, error})
      )
      const json = '{"payload": {"x": 5, "y": 2}, "error": false}'
      expect(module.decode(decoder, json)).toEqual({
        payload: {x: 5, y: 2},
        error: false
      })
    })
  })

  describe('when incorrect JSON', () => {
    it('reports a missing key', () => {
      const decoder = module.object(
        ['x', module.number()],
        (x: number) => ({x})
      )
      expect(() => module.decode(decoder, '{}')).toThrowError('missing keys: x')
    })

    it('reports multiple missing keys', () => {
      const decoder = module.object(
        ['name', module.string()],
        ['x', module.number()],
        ['y', module.number()],
        (name: string, x: number, y: number) => ({name, x, y})
      )
      expect(() => module.decode(decoder, '{"x": 5}')).toThrowError(
        'missing keys: name, y'
      )
    })

    it('reports invalid values', () => {
      const decoder = module.object(
        ['name', module.string()],
        (name: string) => {name}
      )
      expect(() => module.decode(decoder, '{"name": 5}')).toThrowError(
        `error decoding key "name": expected string, got number`
      )
    })
  })
})

describe('map', () => {
  it('can apply the identity function to the decoder', () => {
    const decoder = module.map((x) => x, module.string())
    expect(module.decode(decoder, '"hey there"')).toBe('hey there')
  })

  it('can apply an endomorphic function to the decoder', () => {
    const decoder = module.map((x) => x * 5, module.number())
    expect(module.decode(decoder, '10')).toBe(50)
  })

  it('can apply a funcition that transforms the type', () => {
    const decoder = module.map((x) => x.length, module.string())
    expect(module.decode(decoder, '"hey"')).toEqual(3)
  })
})

describe('tuple', () => {
  describe('when given valid JSON', () => {
    it('decodes an 2 value tuple', () => {
      const decoder = module.tuple(
        module.string(),
        module.number(),
      )
      expect(module.decode(decoder, '["Dale Gribble", 47]'))
    })

    it('decodes a 3 value tuple', () => {
      const decoder = module.tuple(
        module.string(),
        module.string(),
        module.number(),
      )
      expect(module.decode(decoder, '["Rusty", "Shackleford", 47]')).toEqual([
        "Rusty",
        "Shackleford",
        47
      ])
    })
  })

  describe('when given incorrect JSON', () => {
    it('throws an error', () => {
      const decoder = module.tuple(
        module.string(),
        module.number()
      )
      expect(() => module.decode(decoder, '[54, 84]')).toThrowError(
        'error decoding item 0 of tuple: expected string, got number'
      )
    })
  })
})

describe('at', () => {
  describe('when given a valid object', () => {
    it('can look up a nested value', () => {
      const decoder = module.at(
        ['a', 'b', 'c'],
        module.number()
      )
      expect(module.decode(decoder, '{"a":{"b":{"c":123}}}')).toEqual(123)
    })
  })

  describe('when the given object is missing a key', () => {
    it('throws an error', () => {
      const decoder = module.at(
        ['yes'],
        module.string()
      )
      expect(() => module.decode(decoder, '{"no":false}')).toThrowError(
        'error decoding nested object: missing key: yes'
      )
    })
  })

  describe('when the value has the wrong type', () => {
    it('throws an error', () => {
      const decoder = module.at(
        ['hello', 'world'],
        module.string()
      )
      expect(() => module.decode(decoder, '{"hello":{"world":null}}')).toThrowError(
        'error decoding nested object: expected string, got null'
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
      expect(module.decode(decoder, '"yo"')).toEqual('yo')
    })

    it('decodes a value with multiple alternatives', () => {
      const decoder = module.list(
        module.oneOf(
          module.map((s) => s.length, module.string()),
          module.number()
        )
      )
      expect(module.decode(decoder, '["hey", 10]')).toEqual([3, 10])
    })
  })

  describe('when a value that does not fit any decoder', () => {
    it('throws an error', () => {
      const decoder = module.oneOf(
        module.string(),
        module.map(String, module.number())
      )
      expect(() => module.decode(decoder, '[]')).toThrow()
    })
  })
})

describe('fail', () => {
  it('fails by itself', () => {
    const decoder = module.fail('dang')
    expect(() => module.decode(decoder, '{"hey":"there"}')).toThrowError('dang')
  })

  it('does not fail when not used during decoding', () => {
    const decoder = module.oneOf(
      module.number(),
      module.fail('dang')
    )
    expect(module.decode(decoder, '3')).toEqual(3)
  })
})

describe('succeed', () => {
  it('returns the value given', () => {
    const decoder = module.succeed('woohoo!')
    expect(module.decode(decoder, '[]')).toEqual('woohoo!')
  })

  it('acts as the default clause with oneOf', () => {
    const decoder = module.oneOf(
      module.string(),
      module.succeed('(nothing)')
    )
    expect(module.decode(decoder, '[]')).toEqual('(nothing)')
  })
})

describe('andThen', () => {
  it('performs conditional decoding based on field', () => {
    const vehicle = (t: string): module.IDecoder<string> => {
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
    const blueLine = `{"type":"train","color":"blue"}`
    const lambaAirlines = `{"type":"plane","airline":"lambda"}`
    const foot = `{"type":"Ehh"}`
    expect(module.decode(decoder, blueLine)).toEqual('blue line')
    expect(module.decode(decoder, lambaAirlines)).toEqual('lambda airlines')
    expect(module.decode(decoder, foot)).toEqual("you're walkin', pal")
  })
})
