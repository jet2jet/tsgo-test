interface A {
  a: number;
  b: { c: number };
}
const obj: A = { a: 1, b: { c: 2 } };
const a1 = obj.a;
// prettier-ignore
const a2 = (obj).a;
const c = obj.b.c;
export { a1, a2, c };
