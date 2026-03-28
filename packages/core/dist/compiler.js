import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
const execFileAsync = promisify(execFile);
const DEFAULT_TIMEOUT = 30_000;
/**
 * Compile a .tex string to PDF using pdflatex.
 * Returns the absolute path to the generated PDF.
 */
export async function compileLaTeX(texContent, outputDir, documentId, timeout = DEFAULT_TIMEOUT) {
    const dir = path.join(outputDir, documentId);
    await fs.promises.mkdir(dir, { recursive: true });
    const texPath = path.join(dir, "paper.tex");
    await fs.promises.writeFile(texPath, texContent, "utf-8");
    // Run pdflatex twice (for references and cross-references)
    for (let pass = 0; pass < 2; pass++) {
        try {
            await execFileAsync("pdflatex", [
                "-interaction=nonstopmode",
                "--no-shell-escape",
                `-output-directory=${dir}`,
                texPath,
            ], { timeout, cwd: dir });
        }
        catch (err) {
            // pdflatex returns non-zero exit code on warnings too.
            // Only fail if the PDF wasn't produced.
            if (pass === 1) {
                const pdfPath = path.join(dir, "paper.pdf");
                if (fs.existsSync(pdfPath)) {
                    return pdfPath;
                }
                const logContent = await readLogFile(dir);
                const error = err instanceof Error ? err.message : String(err);
                throw new Error(`LaTeX compilation failed: ${error}\nLog: ${logContent}`);
            }
        }
    }
    const pdfPath = path.join(dir, "paper.pdf");
    if (!fs.existsSync(pdfPath)) {
        const logContent = await readLogFile(dir);
        throw new Error(`PDF not generated. Log: ${logContent}`);
    }
    return pdfPath;
}
/**
 * Extract the error-relevant portion of the pdflatex log file.
 */
async function readLogFile(dir) {
    const logPath = path.join(dir, "paper.log");
    if (!fs.existsSync(logPath))
        return "No log file found";
    const log = await fs.promises.readFile(logPath, "utf-8");
    const errorLines = log
        .split("\n")
        .filter((line) => line.startsWith("!") ||
        line.includes("Error") ||
        line.includes("Undefined control sequence") ||
        line.includes("Missing") ||
        line.includes("Extra"))
        .slice(0, 20);
    return errorLines.length > 0
        ? errorLines.join("\n")
        : log.slice(-1500);
}
/**
 * Extract error summary from a compilation error message.
 */
export function extractErrorFromLog(errorMessage) {
    const logMatch = errorMessage.match(/Log: (.+)/s);
    return logMatch ? logMatch[1].trim() : errorMessage;
}
//# sourceMappingURL=compiler.js.map