import type {
  Assignment,
  AssignmentFormData,
  QuestionPaperOutput,
} from "@/types";

const API_BASE = "/api";

export async function fetchAssignments(): Promise<Assignment[]> {
  const res = await fetch(`${API_BASE}/assignments`);
  if (!res.ok) throw new Error("Failed to fetch assignments");
  return res.json();
}

export async function fetchAssignmentById(
  id: string
): Promise<Assignment | undefined> {
  const res = await fetch(`${API_BASE}/assignments/${id}`);
  if (!res.ok) return undefined;
  return res.json();
}

export async function createAssignment(
  formData: AssignmentFormData
): Promise<Assignment> {
  const body = new FormData();
  body.append("title", `${formData.topic || "Untitled"} - ${formData.subject}`);
  body.append("subject", formData.subject);
  body.append("className", formData.className);
  body.append("dueDate", formData.dueDate);
  body.append("topic", formData.topic);
  body.append("additionalInstructions", formData.additionalInstructions);
  body.append("questionTypes", JSON.stringify(formData.questionTypes));

  if (formData.files && formData.files.length > 0) {
    for (const file of formData.files) {
      body.append("file", file);
    }
  }

  const res = await fetch(`${API_BASE}/assignments`, {
    method: "POST",
    body,
  });
  if (!res.ok) throw new Error("Failed to create assignment");
  return res.json();
}

export async function deleteAssignment(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/assignments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete assignment");
}

export async function updateAssignment(
  id: string,
  updates: Partial<Assignment>
): Promise<Assignment | undefined> {
  const res = await fetch(`${API_BASE}/assignments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) return undefined;
  return res.json();
}

export async function triggerGeneration(assignmentId: string): Promise<void> {
  const res = await fetch(
    `${API_BASE}/assignments/${assignmentId}/generate`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Failed to trigger generation");
}

export async function fetchQuestionPaper(
  outputId: string
): Promise<QuestionPaperOutput | undefined> {
  const res = await fetch(`${API_BASE}/question-papers/${outputId}`);
  if (!res.ok) return undefined;
  return res.json();
}

export function getPdfUrl(outputId: string): string {
  return `${API_BASE}/question-papers/${outputId}/pdf`;
}

