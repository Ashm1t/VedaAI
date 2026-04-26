import {
  autoFixLatex,
  compileLaTeX,
  extractErrorFromLog,
  validateLatex,
} from "@libra/core";
import { config } from "../config/index.js";
import {
  getTemplateContextById,
  retrieveTemplatesForAgent,
} from "./templateRetrievalService.js";
import { agentToolRegistry, type AgentTool } from "./agentToolRegistry.js";

interface SearchTemplatesInput {
  query: string;
  topK?: number;
  preferredTypes?: string[];
  subjectHints?: string[];
  positiveKeywords?: string[];
  minimumScore?: number;
}

interface GetTemplateSourceInput {
  templateId: string;
}

interface ValidateLatexInput {
  latex: string;
}

interface CompileLatexInput {
  latex: string;
  documentId: string;
  autoFix?: boolean;
}

function defineTool<Input, Output>(
  tool: AgentTool<Input, Output>
): AgentTool<Input, Output> {
  return tool;
}

const searchTemplatesTool = defineTool<SearchTemplatesInput, unknown>({
  name: "search_templates",
  description:
    "Search the local template memory and return a compact shortlist for template selection.",
  isReadOnly: true,
  requiresPermission: false,
  tokenCostHint: "medium",
  async run(input) {
    return retrieveTemplatesForAgent(input.query, {
      topK: input.topK,
      preferredTypes: input.preferredTypes,
      subjectHints: input.subjectHints,
      positiveKeywords: input.positiveKeywords,
      minimumScore: input.minimumScore,
    });
  },
});

const getTemplateSourceTool = defineTool<GetTemplateSourceInput, unknown>({
  name: "get_template_source",
  description:
    "Load a selected template source and metadata after template selection is complete.",
  isReadOnly: true,
  requiresPermission: false,
  tokenCostHint: "large",
  async run(input) {
    return getTemplateContextById(input.templateId);
  },
});

const validateLatexTool = defineTool<ValidateLatexInput, unknown>({
  name: "validate_latex",
  description:
    "Run deterministic LaTeX validation before compile or repair attempts.",
  isReadOnly: true,
  requiresPermission: false,
  tokenCostHint: "small",
  async run(input) {
    return validateLatex(input.latex);
  },
});

const autofixLatexTool = defineTool<ValidateLatexInput, { latex: string }>({
  name: "autofix_latex",
  description:
    "Apply deterministic fixes for common LaTeX issues such as markdown fences, braces, environments, and missing local images.",
  isReadOnly: true,
  requiresPermission: false,
  tokenCostHint: "small",
  async run(input) {
    return {
      latex: autoFixLatex(input.latex),
    };
  },
});

const compileLatexTool = defineTool<
  CompileLatexInput,
  {
    status: "success" | "error";
    pdfPath: string;
    finalLatex: string;
    error: string;
  }
>({
  name: "compile_latex",
  description:
    "Compile a complete LaTeX document to PDF using the configured local LaTeX engine.",
  isReadOnly: false,
  requiresPermission: false,
  tokenCostHint: "medium",
  async run(input) {
    const finalLatex = input.autoFix === false ? input.latex : autoFixLatex(input.latex);

    try {
      const pdfPath = await compileLaTeX(
        finalLatex,
        config.outputDir,
        input.documentId,
        config.latexTimeout
      );

      return {
        status: "success",
        pdfPath,
        finalLatex,
        error: "",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Compilation failed";

      return {
        status: "error",
        pdfPath: "",
        finalLatex,
        error: extractErrorFromLog(message),
      };
    }
  },
});

const INTERNAL_TOOLS = [
  searchTemplatesTool,
  getTemplateSourceTool,
  validateLatexTool,
  autofixLatexTool,
  compileLatexTool,
] as const;

let registered = false;

export function registerAgentInternalTools() {
  if (registered) return agentToolRegistry;

  for (const tool of INTERNAL_TOOLS) {
    agentToolRegistry.register(tool);
  }

  registered = true;
  return agentToolRegistry;
}
