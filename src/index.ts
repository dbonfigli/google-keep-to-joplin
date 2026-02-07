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

interface KeepNote {
	title?: string;
	textContent?: string;
	createdTimestampUsec?: number;
	userEditedTimestampUsec?: number;
	labels?: KeepLabel[] | string[];
	attachments?: KeepAttachment[];
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

async function importSingleFile(file: string, tagMap: Map<string, string>) {
	const raw = await fs.readFile(file, "utf8");
	const note: KeepNote = JSON.parse(raw);

	const title = (note.title || "Untitled").trim();
	const body = note.textContent || "";

	if (!title && !body) {
		throw new Error("Note has no title and no content");
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

	await applyTags(createdNote.id, note.labels, tagMap);
	await applyAttachments(createdNote.id, body, note.attachments, file);
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

async function applyAttachments(
	noteId: string,
	originalBody: string,
	attachments: KeepNote["attachments"],
	jsonFilePath: string,
) {
	if (!Array.isArray(attachments) || attachments.length === 0) return;

	let body = originalBody;
	const baseDir = path.dirname(jsonFilePath);

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

		body += `\n\n![${fileName}](:/${resource.id})`;
	}

	await joplin.data.put(["notes", noteId], null, { body });
}
