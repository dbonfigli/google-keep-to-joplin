(() => {
    "use strict";
    var e = {
            143: (e, t) => {
                var o, n, i, r, a, l, s, c, u, d, p;
                Object.defineProperty(t, "__esModule", {
                        value: !0
                    }), t.ContentScriptType = t.SettingStorage = t.AppType = t.SettingItemSubType = t.SettingItemType = t.ToastType = t.ToolbarButtonLocation = t.isContextMenuItemLocation = t.MenuItemLocation = t.ModelType = t.ImportModuleOutputFormat = t.FileSystemItem = void 0, (p = t.FileSystemItem || (t.FileSystemItem = {})).File = "file", p.Directory = "directory", (d = t.ImportModuleOutputFormat || (t.ImportModuleOutputFormat = {})).Markdown = "md", d.Html = "html", (u = t.ModelType || (t.ModelType = {}))[u.Note = 1] = "Note", u[u.Folder = 2] = "Folder", u[u.Setting = 3] = "Setting", u[u.Resource = 4] = "Resource", u[u.Tag = 5] = "Tag", u[u.NoteTag = 6] = "NoteTag", u[u.Search = 7] = "Search", u[u.Alarm = 8] = "Alarm", u[u.MasterKey = 9] = "MasterKey", u[u.ItemChange = 10] = "ItemChange", u[u.NoteResource = 11] = "NoteResource", u[u.ResourceLocalState = 12] = "ResourceLocalState", u[u.Revision = 13] = "Revision", u[u.Migration = 14] = "Migration", u[u.SmartFilter = 15] = "SmartFilter", u[u.Command = 16] = "Command",
                    function(e) {
                        e.File = "file", e.Edit = "edit", e.View = "view", e.Note = "note", e.Tools = "tools", e.Help = "help", e.Context = "context", e.NoteListContextMenu = "noteListContextMenu", e.EditorContextMenu = "editorContextMenu", e.FolderContextMenu = "folderContextMenu", e.TagContextMenu = "tagContextMenu"
                    }(o = t.MenuItemLocation || (t.MenuItemLocation = {})), t.isContextMenuItemLocation = function(e) {
                        return [o.Context, o.NoteListContextMenu, o.EditorContextMenu, o.FolderContextMenu, o.TagContextMenu].includes(e)
                    }, (c = t.ToolbarButtonLocation || (t.ToolbarButtonLocation = {})).NoteToolbar = "noteToolbar", c.EditorToolbar = "editorToolbar", (s = t.ToastType || (t.ToastType = {})).Info = "info", s.Success = "success", s.Error = "error", (l = t.SettingItemType || (t.SettingItemType = {}))[l.Int = 1] = "Int", l[l.String = 2] = "String", l[l.Bool = 3] = "Bool", l[l.Array = 4] = "Array", l[l.Object = 5] = "Object", l[l.Button = 6] = "Button", (a = t.SettingItemSubType || (t.SettingItemSubType = {})).FilePathAndArgs = "file_path_and_args", a.FilePath = "file_path", a.DirectoryPath = "directory_path", (r = t.AppType || (t.AppType = {})).Desktop = "desktop", r.Mobile = "mobile", r.Cli = "cli", (i = t.SettingStorage || (t.SettingStorage = {}))[i.Database = 1] = "Database", i[i.File = 2] = "File", (n = t.ContentScriptType || (t.ContentScriptType = {})).MarkdownItPlugin = "markdownItPlugin", n.CodeMirrorPlugin = "codeMirrorPlugin"
            },
            156: function(e, t, o) {
                var n = this && this.__awaiter || function(e, t, o, n) {
                    return new(o || (o = Promise))(function(i, r) {
                        function a(e) {
                            try {
                                s(n.next(e))
                            } catch (e) {
                                r(e)
                            }
                        }

                        function l(e) {
                            try {
                                s(n.throw(e))
                            } catch (e) {
                                r(e)
                            }
                        }

                        function s(e) {
                            var t;
                            e.done ? i(e.value) : (t = e.value, t instanceof o ? t : new o(function(e) {
                                e(t)
                            })).then(a, l)
                        }
                        s((n = n.apply(e, t || [])).next())
                    })
                };
                Object.defineProperty(t, "__esModule", {
                    value: !0
                });
                const i = o(998),
                    r = o(143);
                i.default.plugins.register({
                    onStart: function() {
                        return n(this, void 0, void 0, function*() {
                            yield i.default.commands.register({
                                name: "importKeepNotes",
                                label: "Import Google Keep Notes",
                                execute: () => n(this, void 0, void 0, function*() {
                                    const e = yield i.default.views.dialogs.showOpenDialog({
                                        title: "Select your Google Keep JSON files",
                                        properties: ["openFile", "multiSelections"],
                                        filters: [{
                                            name: "JSON Files",
                                            extensions: ["json"]
                                        }]
                                    });
                                    if (!e || !e.length) return void(yield i.default.views.dialogs.showMessageBox("No files selected."));
                                    let t = 0;
                                    for (const o of e) try {
                                        let e, n = "";
                                        try {
                                            n = yield window.require("fs").readFileSync(o, "utf8"), console.info(`Read file: ${o}`)
                                        } catch (e) {
                                            console.error(`Failed to read file: ${o}`, e);
                                            continue
                                        }
                                        try {
                                            e = JSON.parse(n), console.info("Parsed JSON:", e)
                                        } catch (e) {
                                            console.error(`Failed to parse JSON in file: ${o}`, e);
                                            continue
                                        }
                                        const r = (e.title || "Untitled").trim(),
                                            a = e.textContent || "";
                                        if (!r && !a) {
                                            console.warn(`Skipping file (no title/body): ${o}`);
                                            continue
                                        }
                                        let l, s = a;
                                        try {
                                            l = yield i.default.data.post(["notes"], null, {
                                                title: r,
                                                body: s
                                            }), console.info(`Created note: ${r}`)
                                        } catch (e) {
                                            console.error(`Failed to create note for file: ${o}`, e);
                                            continue
                                        }
                                        if (e.labels && Array.isArray(e.labels))
                                            for (const t of e.labels) {
                                                const e = t.name || t;
                                                try {
                                                    yield i.default.data.post(["tags"], null, {
                                                        title: e
                                                    })
                                                } catch (e) {}
                                                try {
                                                    yield i.default.data.post(["tags", e, "notes"], null, {
                                                        id: l.id
                                                    }), console.info(`Added tag "${e}" to note "${r}"`)
                                                } catch (e) {}
                                            }
                                        if (e.attachments && Array.isArray(e.attachments))
                                            for (const t of e.attachments) {
                                                const e = t.filePath || t.fileName;
                                                if (!e) continue;
                                                const n = o.replace(/[^/\\]+$/, "") + e;
                                                try {
                                                    s += `\n\n![${e}](:/${(yield i.default.data.post(["resources"],null,null,[{path:n}])).id})`, yield i.default.data.put(["notes", l.id], null, {
                                                        body: s
                                                    }), console.info(`Added attachment "${e}" to note "${r}"`)
                                                } catch (e) {
                                                    console.error(`Failed to import attachment: ${n}`, e)
                                                }
                                            }
                                        t++
                                    } catch (e) {
                                        console.error("Unexpected error while processing file:", o, e);
                                        continue
                                    }
                                    yield i.default.views.dialogs.showMessageBox(`Import complete! Imported ${t} notes from Google Keep.`)
                                })
                            }), yield i.default.views.menuItems.create("importKeepNotesMenu", "importKeepNotes", r.MenuItemLocation.Tools)
                        })
                    }
                })
            },
            998: (e, t) => {
                Object.defineProperty(t, "__esModule", {
                    value: !0
                }), t.default = joplin
            }
        },
        t = {};
    ! function o(n) {
        var i = t[n];
        if (void 0 !== i) return i.exports;
        var r = t[n] = {
            exports: {}
        };
        return e[n].call(r.exports, r, r.exports, o), r.exports
    }(156)
})();
