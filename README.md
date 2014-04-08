project-hub
========

A simple Javascript only website for displaying hierarchical pages with Osmek (osmek.com).

## Set up
1. Get an Osmek account - osmek.com
2. Create a Multi-Entry bin called "Pages".
3. Create a Drop-down custom field in that bin called "Parent". The keyword should be set to parent_id and the values should be set to "fill values from another content bin." with the "Pages" bin selected.
4. Paste your API key and the Pages bin ID into assets/js/controllers/Controller.js
