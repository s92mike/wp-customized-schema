# Block Author Authority Section Repo

Block Author Authority Section Repo is a custom WordPress plugin that is for the blogs author section and block page's block author section.

## For Development:

1. Add this repo to your plugin folder
2. Go to your local global .gitignore file and add this line:
```
wordpress/wp-content/plugins/bl-clean-plugin-repo
```   
3. Add the folder name to you folder example: `wordpress/wp-content/plugins/bl-plugin-repo`
4. Update the Title, and Description to be displayed to the WordPress Plugin Page
```php
<?php
/**
 * Plugin Name:       Clean Plugin Template
 * Description:       Add the description of the plugin here.
 * Version:           1.0.0
``` 
Then start Search and replace in your IDE of choice:
Namespace
```
// namespace or @packages
Search: BLCleanPlugin
Replace: BLNewPlugin

// Defined Variables
Search: BL_CLEAN_PLUGIN_VERSION
Replace: BL_NEW_PLUGIN_VERSION

Search: BL_CLEAN_PLUGIN_FILE
Replace: BL_NEW_PLUGIN_FILE

//
```
5. Remove the composer.lock and lib folder
6. Go to your terminal/shell and install the node
```
nvm use 18
npm install --legacy-peer-deps
npm run start
```
7. Go to your local WordPress and activate the plugin
