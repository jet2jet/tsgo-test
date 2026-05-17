import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as ts from 'typescript';

const THIS_PATH = fileURLToPath(new URL('.', import.meta.url));
const PROJECT_PATH = THIS_PATH;

const tsconfig = path.resolve(PROJECT_PATH, 'tsconfig.json');
const testFile = path.resolve(PROJECT_PATH, 'test.mts');

const [, typeChecker, source] = prepare();

const a1 = getExpressionFromPosition(source, 5, 11);
if (a1 && ts.isExpression(a1)) {
  console.log('---a1---');
  console.log('expr:', ts.SyntaxKind[a1.kind], a1.getText(source));
  const t = typeChecker.getTypeAtLocation(a1);
  console.log('type:', t && typeChecker.typeToString(t));
}

const a2 = getExpressionFromPosition(source, 7, 11);
if (a2 && ts.isExpression(a2)) {
  console.log('---a2---');
  console.log('expr:', ts.SyntaxKind[a2.kind], a2.getText(source));
  const t = typeChecker.getTypeAtLocation(a2);
  console.log('type:', t && typeChecker.typeToString(t));
}

const c = getExpressionFromPosition(source, 8, 10);
if (c && ts.isExpression(c)) {
  console.log('---c---');
  console.log('expr:', ts.SyntaxKind[c.kind], c.getText(source));
  const t = typeChecker.getTypeAtLocation(c);
  console.log('type:', t && typeChecker.typeToString(t));
}

function prepare() {
  const cwd = process.cwd();

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const foundConfigPath = ts.findConfigFile(cwd, ts.sys.fileExists, tsconfig);
  if (foundConfigPath == null) {
    throw new Error('Unexpected: cannot load tsconfig');
  }

  const getCurrentDirectory = () => cwd;
  const config = ts.getParsedCommandLineOfConfigFile(foundConfigPath, void 0, {
    fileExists: fs.existsSync,
    getCurrentDirectory,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    readDirectory: ts.sys.readDirectory,
    readFile: (file) =>
      fs.readFileSync(
        path.isAbsolute(file) ? file : path.join(getCurrentDirectory(), file),
        'utf-8'
      ),
    useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
    onUnRecoverableConfigFileDiagnostic: (diag) => {
      throw new Error(
        ts.formatDiagnostics([diag], {
          getCanonicalFileName: (f) => f,
          getCurrentDirectory,
          getNewLine: () => '\n',
        })
      );
    },
  });
  if (!config) {
    throw new Error('Unexpected');
  }

  const program = ts.createProgram({
    options: config.options,
    rootNames: config.fileNames,
  });

  const source = program.getSourceFile(testFile);
  if (!source) {
    throw new Error('Unexpected');
  }
  const typeChecker = program.getTypeChecker();

  return [program, typeChecker, source] as const;
}

function getExpressionFromPosition(
  source: ts.SourceFile,
  line: number,
  pos: number
) {
  const lines = source.getLineStarts();
  if (line >= lines.length) {
    line = lines.length - 1;
  }
  const nodePos = pos + lines[line];
  let foundExpr: ts.Expression | undefined;
  visit(source);
  return foundExpr;

  function visit(node: ts.Node): ts.Node {
    if (ts.isExpression(node) && node.pos <= nodePos && node.end >= nodePos) {
      foundExpr = node;
    }
    if (
      !ts.isPropertyAccessExpression(node) &&
      !ts.isElementAccessExpression(node)
    ) {
      ts.visitEachChild(node, (n) => visit(n), undefined);
    }
    return node;
  }
}
