#!/usr/bin/env node
import { Command } from "commander";
import prompts from "prompts";
import pc from "picocolors";
import { fileURLToPath } from "node:url";
import { cp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const program = new Command();

program
  .name("create-fsd-app")
  .argument("[project-name]", "nome do projeto")
  .action(async (projectName: string | undefined) => {
    const answers = await prompts([
      {
        type: projectName ? null : "text",
        name: "name",
        message: "Nome do projeto:",
        initial: "my-fsd-app",
      },
    ]);

    const name = projectName ?? answers.name;
    if (!name) {
      console.log(pc.red("Nome do projeto é obrigatório."));
      process.exit(1);
    }

    const target = path.resolve(process.cwd(), name);
    const templateDir = path.join(__dirname, "../templates/vite");

    console.log(pc.cyan(`\n Criando ${name}...`));

    await cp(templateDir, target, { recursive: true });

    const filesWithPlaceholder = ["package.json", "index.html", "src/app/App.tsx"];
    for (const relPath of filesWithPlaceholder) {
      const filePath = path.join(target, relPath);
      const contents = await readFile(filePath, "utf-8");
      await writeFile(filePath, contents.replace(/{{PROJECT_NAME}}/g, name));
    }

    console.log(pc.green("Pronto\n"));
    console.log(`  cd ${name}`);
    console.log(`  npm install`);
    console.log(`  npm run dev\n`);
  });

program.parse();
