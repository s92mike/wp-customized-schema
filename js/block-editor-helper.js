/* eslint-disable prettier/prettier */
/**
 * Various block editor JS helpers.
 */
window.addEventListener('load', function (event) {
	/**
	 * This needs to be updated. It no longer works.
	 */
	// Get the User ID.
	// var blUserSettings = userSettings; // userSettings is defined globally in the admin block editor.
	// var blUserId = blUserSettings.uid;

	// // Get local storage.
	// var blBlockEditorStorage = localStorage.getItem( 'WP_DATA_USER_' + blUserId );
	// var blShowWelcomeEditor = false;
	// var blShowTopToolbar = true;
	// var blShowFullScreen = false;
	// if ( null !== blBlockEditorStorage ) {
	// 	var blBlockEditorStorageJSON = JSON.parse( blBlockEditorStorage );
	// 	// Get whether the welcome guide is on or off. Use user's preferences.
	// 	var blWelcomeGuide = blBlockEditorStorageJSON['core/block-editor'].preferences['core/edit-post']['welcomeGuide'] ?? null;
	// 	if ( null !== blWelcomeGuide ) {
	// 		blShowWelcomeEditor = blWelcomeGuide;
	// 	}

	// 	// Get whether the top toolbar is on or off. Use user's preferences.
	// 	var blTopToolbar = blBlockEditorStorageJSON['core/block-editor'].preferences['core/edit-post']['fixedToolbar'] ?? null;
	// 	if ( null !== blTopToolbar ) {
	// 		blShowTopToolbar = blTopToolbar;
	// 	}

	// 	// Get whether the full screen mode is on or off. Use user's preferences.
	// 	var blFullScreenMode = blBlockEditorStorageJSON['core/block-editor'].preferences['core/edit-post']['fullscreenMode'] ?? null;
	// 	if ( null !== blFullScreenMode ) {
	// 		blShowFullScreen = blFullScreenMode;
	// 	}
	// }
	// if ( ! blShowWelcomeEditor ) {
	// 	wp.data && wp.data.select('core/edit-post').isFeatureActive('welcomeGuide') && wp.data.dispatch('core/edit-post').toggleFeature('welcomeGuide');
	// }
	// if ( blShowTopToolbar ) {
	// 	wp.data && ! wp.data.select('core/edit-post').isFeatureActive('fixedToolbar') && wp.data.dispatch('core/edit-post').toggleFeature('fixedToolbar');
	// }
	// if ( ! blShowFullScreen ) {
	// 	wp.data && wp.data.select('core/edit-post').isFeatureActive('fullscreenMode') && wp.data.dispatch('core/edit-post').toggleFeature('fullscreenMode');
	// }
	
} );