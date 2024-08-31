import { Project, TypeFormatFlags } from "ts-morph";

const project = new Project({ tsConfigFilePath: "tsconfig.json" });

const flags =
  TypeFormatFlags.MultilineObjectLiterals |
  TypeFormatFlags.NoTruncation |
  TypeFormatFlags.InTypeAlias;

console.log("<!-- prettier-ignore-start -->");
project
  .getSourceFile("redspot-frontend/record.ts")!
  .getTypeAliases()
  .filter((decl) => decl.getName().includes("_"))
  .map((decl) => {
    const name = decl.getName();
    const head = name.replace("__", ":").replace("_", ".");
    const type = decl
      .getType()
      .getText(undefined, flags)
      .replace(/( {4,})/g, "\n$1")
      .replace(/;}/g, ";\n}")
      .replace(/ {4}/g, "  ");
    console.log(`#### ${head}`);
    console.log();
    console.log("```typescript");
    console.log(`type ${name} = ${type}`);
    console.log("```");
    console.log();
  });
console.log("<!-- prettier-ignore-end -->");
