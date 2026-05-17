import * as path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import * as tsAst from '@typescript/native-preview/unstable/ast';
import * as tsApi from '@typescript/native-preview/unstable/sync';

const THIS_PATH = fileURLToPath(new URL('.', import.meta.url));
const PROJECT_PATH = THIS_PATH;

const tsconfig = path.resolve(PROJECT_PATH, 'tsconfig.json');
const testFile = path.resolve(PROJECT_PATH, 'test.mts');

const [, typeChecker, source] = prepare();

const a1 = getExpressionFromPosition(source, 5, 11);
if (a1 && tsAst.isExpression(a1)) {
  console.log('---a1---');
  console.log('expr:', tsAst.SyntaxKind[a1.kind], getNodeText(a1, source));
  const t = typeChecker.getTypeAtLocation(a1);
  console.log('type:', t && typeChecker.typeToString(t));
}

const a2 = getExpressionFromPosition(source, 7, 11);
if (a2 && tsAst.isExpression(a2)) {
  console.log('---a2---');
  console.log('expr:', tsAst.SyntaxKind[a2.kind], getNodeText(a2, source));
  const t = typeChecker.getTypeAtLocation(a2);
  console.log('type:', t && typeChecker.typeToString(t));
}

const c = getExpressionFromPosition(source, 8, 10);
if (c && tsAst.isExpression(c)) {
  console.log('---c---');
  console.log('expr:', tsAst.SyntaxKind[c.kind], getNodeText(c, source));
  const t = typeChecker.getTypeAtLocation(c);
  console.log('type:', t && typeChecker.typeToString(t));
}

function prepare() {
  const cwd = process.cwd();

  const api = new tsApi.API({ cwd });
  const conf = api.parseConfigFile({ uri: pathToFileURL(tsconfig).toString() });
  if (conf.fileNames.length === 0) {
    throw new Error('Unexpected: cannot load tsconfig');
  }

  const snapshot = api.updateSnapshot({ openProject: conf.fileNames[0]! });
  const tsProject = snapshot.getProjects()[0]!;

  const program = tsProject.program;

  const source = program.getSourceFile(testFile);
  if (!source) {
    throw new Error('Unexpected');
  }
  const typeChecker = tsProject.checker;

  return [program, typeChecker, source] as const;
}

function getNodeText(node: tsAst.Node, source: tsAst.SourceFile): string {
  const start = tsAst.getTokenPosOfNode(node, source);
  return source.text.slice(start, node.end);
}

function getExpressionFromPosition(
  source: tsAst.SourceFile,
  line: number,
  pos: number
) {
  const lines = tsAst.computeLineStarts(source.text);
  if (line >= lines.length) {
    line = lines.length - 1;
  }
  const nodePos = pos + lines[line];
  let foundExpr: tsAst.Expression | undefined;
  visit(source);
  return foundExpr;

  function visit(node: tsAst.Node): tsAst.Node {
    if (
      tsAst.isExpression(node) &&
      node.pos <= nodePos &&
      node.end >= nodePos
    ) {
      foundExpr = node;
    }
    if (
      !tsAst.isPropertyAccessExpression(node) &&
      !tsAst.isElementAccessExpression(node)
    ) {
      tsAst.visitEachChild(node, (n) => visit(n));
    }
    return node;
  }
}
