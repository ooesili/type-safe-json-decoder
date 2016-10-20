Type-safe JSON Decoder
======================
[![wercker status](https://app.wercker.com/status/981a74cb4e88dcfa211647cc71752035/s/master "wercker status")](https://app.wercker.com/project/byKey/981a74cb4e88dcfa211647cc71752035)

A strongly typed JSON decoder and validator inspired by Elm, namely the
[Json.Decode][elm-decode] package.


Introduction
------------

Parsing JSON introduces an unfortunate `any` in to TypeScript programs. The
objects returned from `JSON.parse` often become the data sources for entire
applications, never once validated against the actual interfaces and classes
which they go into. This module allows for the creation of decoders which
perform runtime type checks on the input and return a fully typed result.

Given this JSON input:
```typescript
const usersJSON = `{
  "users": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ]
}`
```

We can create a decoder that matches this expected structure:
```typescript
import { Decoder, at, array, object, number, string } from 'type-safe-json-decoder'

interface User {
  id: number
  name: string
}

const usersDecoder: Decoder<User[]> = at(['users'], array(
  object(
    ['id', number()],
    ['name', string()],
    (id, name) => ({id, name})
  )
))

const users: User[] = usersDecoder.decodeJSON(usersJSON)
```

The important thing to note here is that `decodeJSON` does not return `any`.
It returns a type assignable to `User[]`.

A decoder will also a throw nice error message if it comes across an
unexpected value at runtime:
```typescript
const badJSON = `{
  "users": [{"id": "0", "name": "Mallory"}]
}`

usersDecoder.decodeJSON(badJSON)
// throws => error at .users[0].id: expected number, got string
```


Documentation
-------------

Detalied API documentation can be found [here][docs]


[elm-decode]: http://package.elm-lang.org/packages/elm-lang/core/latest/Json-Decode
[docs]: https://ooesili.github.io/type-safe-json-decoder
