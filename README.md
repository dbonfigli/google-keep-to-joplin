# Google Keep to Joplin

This is a quick and dirty plugin to import Google Keep notes to Joplin.

# Installation

1. Move this repo to a directory Joplin process can access to;
2. In Joplin, go to Tools -> Options -> Plugins -> Show Advanced Settings -> Development plugins and add this directory absolute path;
3. Restart the app;
4. The plugin is now in Tools -> Import Google Keep Notes;
5. Select it and import the json files of the Google Keep Notes exported via Google Takeout you are interested in.

To get the Google Keep Notes, go to https://takeout.google.com/settings/takeout, deselect all but Keep, download the zip when ready then unzip it.

# Development

The work is taken from https://github.com/chrubble/google-keep-to-joplin (I could not really fork it since the original repo is now removed, but i got the code from the archived plugin on https://joplinapp.org/plugins/). The first commit of this repo is a direct copy from there.

The plugin is no longer present in https://joplinapp.org/plugins/, and it was not working, i roughly patched it to make it visible from Jopling and added support to properly import notes and dates.

For reference, here an example of note from a google checkout export:

```
{
  "color": "DEFAULT",
  "isTrashed": false,
  "isPinned": false,
  "isArchived": true,
  "textContent": "My awesome note",
  "title": "Zero days",
  "userEditedTimestampUsec": 1456052332223000,
  "createdTimestampUsec": 1456052307747000,
  "textContentHtml": "<p dir=\"ltr\" style=\"line-height:1.38;margin-top:0.0pt;margin-bottom:0.0pt;\"><span style=\"font-size:7.2pt;font-family:'Google Sans';color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;\">My awesome note</span></p>",
  "labels": [
    {
      "name": "film"
    }
  ]
}
```
