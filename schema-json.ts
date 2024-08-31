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
    const name = decl.getName().replace("__", ":").replace("_", ".");
    return [name, decl.getType().getText(undefined, flags)];
  })
  .map((item) => {
    const [key, val] = item;
    const code = val
      .replace(/( {4,})/g, "\n$1")
      .replace(/;}/g, ";\n}")
      .replace(/ {4}/g, "  ");
    console.log(`#### ${key}`);
    console.log();
    console.log("```typescript");
    console.log(code);
    console.log("```");
    console.log();
  });
console.log("<!-- prettier-ignore-end -->");
