#!/usr/bin/env node
import { Command } from "commander";
import prompts from "prompts";
import pc from "picocolors";
import { fileURLToPath } from "node:url";
import { cp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEMPLATES = ["vite", "next", "expo"] as const;
type Template = (typeof TEMPLATES)[number];

const TEMPLATE_CHOICES: { title: string; value: Template }[] = [
  { title: "Vite + React (web)", value: "vite" },
  { title: "Next.js (web)", value: "next" },
  { title: "Expo + React Native (mobile)", value: "expo" },
];

const DEV_COMMAND: Record<Template, string> = {
  vite: "npm run dev",
  next: "npm run dev",
  expo: "npm run start",
};

const PLACEHOLDER_FILES = ["package.json", "app.json", "index.html", "src/app/App.tsx"];

const program = new Command();

program
  .name("create-fsd-app")
  .argument("[project-name]", "nome do projeto")
  .option("-t, --template <name>", `template: ${TEMPLATES.join(" | ")}`)
  .action(async (projectName: string | undefined, opts: { template?: string }) => {
    const answers = await prompts([
      {
        type: projectName ? null : "text",
        name: "name",
        message: "Nome do projeto:",
        initial: "my-fsd-app",
      },
      {
        type: opts.template ? null : "select",
        name: "template",
        message: "Qual stack?",
        choices: TEMPLATE_CHOICES,
      },
    ]);

    const name = projectName ?? answers.name;
    if (!name) {
      console.log(pc.red("Nome do projeto é obrigatório."));
      process.exit(1);
    }

    const template = (opts.template ?? answers.template) as Template;
    if (!TEMPLATES.includes(template)) {
      console.log(pc.red(`Template inválido. Use: ${TEMPLATES.join(", ")}`));
      process.exit(1);
    }

    const target = path.resolve(process.cwd(), name);
    const templateDir = path.join(__dirname, "../templates", template);

    console.log(pc.cyan(`\n Criando ${name} (${template})...`));

    await cp(templateDir, target, { recursive: true });

    for (const relPath of PLACEHOLDER_FILES) {
      const filePath = path.join(target, relPath);
      try {
        const contents = await readFile(filePath, "utf-8");
        await writeFile(filePath, contents.replace(/{{PROJECT_NAME}}/g, name));
      } catch {
        // arquivo não existe nesse template
      }
    }

    console.log(pc.green("Pronto\n"));
    console.log(`  cd ${name}`);
    console.log(`  npm install`);
    console.log(`  ${DEV_COMMAND[template]}\n`);
  });

program.parse();
