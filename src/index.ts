import joplin from "api";
import { MenuItemLocation } from "api/types";
import * as fs from "fs/promises";
import * as path from "path";

interface KeepLabel {
	name?: string;
}

interface KeepAttachment {
	filePath?: string;
	fileName?: string;
}

interface KeepChecklistItem {
	text?: string;
	isChecked?: boolean;
}

interface KeepNote {
	title?: string;
	textContent?: string;
	listContent?: KeepChecklistItem[];
	createdTimestampUsec?: number;
	userEditedTimestampUsec?: number;
	labels?: KeepLabel[] | string[];
	attachments?: KeepAttachment[];
	color?: string;
	isTrashed?: boolean;
	isPinned?: boolean;
	isArchived?: boolean;
}

joplin.plugins.register({
	onStart: async () => {
		await joplin.commands.register({
			name: "importKeepNotes",
			label: "Import Google Keep Notes",
			execute: async () => {
				const files = await joplin.views.dialogs.showOpenDialog({
					title: "Select your Google Keep JSON files",
					properties: ["openFile", "multiSelections"],
					filters: [{ name: "JSON Files", extensions: ["json"] }],
				});

				if (!files?.length) {
					await joplin.views.dialogs.showMessageBox("No files selected.");
					return;
				}

				const tagMap = await loadExistingTags();
				let importedCount = 0;
				const errors: string[] = [];

				for (const file of files) {
					try {
						await importSingleFile(file, tagMap);
						importedCount++;
					} catch (err) {
						console.error(err);
						errors.push(`${path.basename(file)}: ${String(err)}`);
					}
				}

				await joplin.views.dialogs.showMessageBox(
					`Import complete!\n\nImported: ${importedCount}\nFailed: ${errors.length}` +
					(errors.length ? `\n\nErrors:\n${errors.join("\n")}` : ""),
				);
			},
		});
		await joplin.views.menuItems.create("importKeepNotesMenu", "importKeepNotes", MenuItemLocation.Tools);
	},
});

async function loadExistingTags(): Promise<Map<string, string>> {
	const map = new Map<string, string>();
	const response = await joplin.data.get(["tags"], { fields: ["id", "title"] });

	for (const tag of response.items) {
		map.set(tag.title, tag.id);
	}

	return map;
}

function checklistToMarkdown(items: KeepChecklistItem[]): string {
	return items
		.map(item => {
			const checked = item.isChecked ? "x" : " ";
			const text = item.text?.trim() ?? "";
			return `- [${checked}] ${text}`;
		})
		.join("\n");
}

async function importSingleFile(file: string, tagMap: Map<string, string>) {
	const raw = await fs.readFile(file, "utf8");
	const note: KeepNote = JSON.parse(raw);

	const fallbackText =
		note.textContent?.trim() ||
		note.listContent?.[0]?.text?.trim() ||
		"";

	const title =
		note.title?.trim() ||
		(fallbackText
			? fallbackText.length > 40
				? fallbackText.slice(0, 37) + "..."
				: fallbackText
			: "Untitled");


	let body =
		Array.isArray(note.listContent) && note.listContent.length > 0
			? checklistToMarkdown(note.listContent)
			: note.textContent || "";

	// Create resources first
	const resources = await createResources(note.attachments, file);

	// Append resource links
	for (const r of resources) {
		body += `\n\n![${r.fileName}](:/${r.resourceId})`;
	}

	const createdNote = await joplin.data.post(["notes"], null, {
		title,
		body,
		user_created_time: note.createdTimestampUsec
			? note.createdTimestampUsec / 1000
			: undefined,
		user_updated_time: note.userEditedTimestampUsec
			? note.userEditedTimestampUsec / 1000
			: undefined,
	});

	// translate regular google keep notes to joplin tags
	await applyTags(createdNote.id, note.labels, tagMap);

	// transalte google keep additional tags like color, isArchived... to Joplin tags
	const metaTags = getGoogleKeepMetaTags(note);
	await applyTags(createdNote.id, metaTags, tagMap);

}

function getGoogleKeepMetaTags(note: KeepNote): string[] {
	const tags: string[] = [];

	if (note.color) {
		tags.push(`GoogleKeep/color/${note.color}`);
	}

	if (note.isArchived) {
		tags.push("GoogleKeep/isArchived");
	}

	if (note.isPinned) {
		tags.push("GoogleKeep/isPinned");
	}

	if (note.isTrashed) {
		tags.push("GoogleKeep/isTrashed");
	}

	return tags;
}

async function applyTags(
	noteId: string,
	labels: KeepNote["labels"],
	tagMap: Map<string, string>,
) {
	if (!Array.isArray(labels)) return;

	for (const label of labels) {
		const name = typeof label === "string" ? label : label.name;
		if (!name) continue;

		let tagId = tagMap.get(name);
		if (!tagId) {
			const tag = await joplin.data.post(["tags"], null, { title: name });
			tagId = tag.id;
			tagMap.set(name, tagId);
		}

		await joplin.data.post(["tags", tagId, "notes"], null, { id: noteId });
	}
}

async function createResources(
	attachments: KeepNote["attachments"],
	jsonFilePath: string,
): Promise<{ fileName: string; resourceId: string }[]> {
	if (!Array.isArray(attachments)) return [];

	const baseDir = path.dirname(jsonFilePath);
	const results: { fileName: string; resourceId: string }[] = [];

	for (const att of attachments) {
		const fileName = att.filePath || att.fileName;
		if (!fileName) continue;

		const fullPath = path.join(baseDir, fileName);
		const resource = await joplin.data.post(
			["resources"],
			null,
			null,
			[{ path: fullPath }],
		);

		results.push({ fileName, resourceId: resource.id });
	}

	return results;
}
