# Google Keep Importer for Joplin

This plugin allows you to import **Google Keep** notes and checklists into **Joplin**.

## Exporting your Google Keep data
1. Go to Google Takeout: https://takeout.google.com/settings/takeout
2. Deselect all services except **Keep**;
3. Create the export and download the ZIP file when it’s ready
4. Unzip the archive. Each Google Keep note will be saved as an individual json file, alongside attachments and other files

## Importing notes into Joplin
1. In Joplin, select the notebook you want to import notes into
2. Open the new option **Tools → Import Google Keep Notes**
3. Select the JSON files you want to import

All selected notes will be imported into the currently selected notebook.

## Supported features
The importer supports the following:

- Notes
- Checklists
- Attachments
- Labels
- Metadata, converted to Joplin tags:
  - `color`
  - `isArchived`
  - `isPinned`
  - `isTrashed`  
  (stored as tags prefixed with `GoogleKeep/`)
- Creation and update timestamps
- Titles:
  - If a note has no title, the first 40 characters of its content are used
  - If the note is empty, the title defaults to **Untitled**
