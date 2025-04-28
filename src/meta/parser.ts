import * as fs from 'node:fs';

import { ExceptionBuilder, RuntimeException } from '@douglasneuroinformatics/libjs';
import { ok, Result } from 'neverthrow';
import { Node, Project, SourceFile, Symbol } from 'ts-morph';

const { SyntaxParsingException } = new ExceptionBuilder().setParams({ name: 'SyntaxParsingException' }).build();

export class Parser {
  private readonly project: Project;

  constructor() {
    this.project = new Project();
  }

  parseUserConfig(configFile: string): Result<Node, Error> {
    if (!fs.existsSync(configFile)) {
      return RuntimeException.asErr(`Config file does not exist: ${configFile}`);
    }
    const sourceCode = fs.readFileSync(configFile, 'utf-8');
    const sourceFile = this.project.createSourceFile(configFile, sourceCode);
    return this.parseDefaultExportNode(sourceFile);
  }

  private parseDefaultExportNode(sourceFile: SourceFile): Result<Node, typeof SyntaxParsingException.Instance> {
    const filename = sourceFile.getBaseName();
    const defaultExportSymbol = sourceFile.getDefaultExportSymbol();
    if (!defaultExportSymbol) {
      return SyntaxParsingException.asErr(`Source file '${filename}' does not include a default export symbol`);
    }
    const resolvedSymbol = this.resolveAliasedSymbol(defaultExportSymbol);
    const declarations = resolvedSymbol.getDeclarations();
    if (declarations.length === 0) {
      return SyntaxParsingException.asErr(`Default export symbol in '${filename}' has no declarations`);
    }
    if (declarations.length > 1) {
      return SyntaxParsingException.asErr(
        `Default export symbol in '${filename}' has multiple declarations (${declarations.length})`
      );
    }
    return ok(declarations[0]!);
  }

  private resolveAliasedSymbol(symbol: Symbol): Symbol {
    let current = symbol;
    while (current.getAliasedSymbol()) {
      current = current.getAliasedSymbol()!;
    }
    return current;
  }
}
