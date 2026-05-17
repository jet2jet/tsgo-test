# tsgo-test

Checks difference between TypeScript 6.0.x and TypeScript 7 (preview).

## The target source

[test.mts](./test.mts)

## Run test

```
npm ci
node run-ts.mts
node run-tsgo.mts
```

### Expected output

```
---a1---
expr: PropertyAccessExpression obj.a
type: number
---a2---
expr: PropertyAccessExpression (obj).a
type: number
---c---
expr: PropertyAccessExpression obj.b.c
type: number
```

### Actual output

(using: `typescript@6.0.3`, `@typescript/native-preview@7.0.0-dev.20260517.1`)

For `node run-ts.mts`:

```
---a1---
expr: PropertyAccessExpression obj.a
type: number
---a2---
expr: PropertyAccessExpression (obj).a
type: number
---c---
expr: PropertyAccessExpression obj.b.c
type: number
```

For `node run-tsgo.mts`:

```
---a1---
expr: PropertyAccessExpression obj.a
type: number
---a2---
expr: PropertyAccessExpression (obj).a
type: A
---c---
expr: PropertyAccessExpression obj.b.c
type: { c: number; }
```
