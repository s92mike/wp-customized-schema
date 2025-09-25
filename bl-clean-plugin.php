<?php
/**
 * Plugin Name:       Boundless Clean Plugin Template
 * Plugin URI:        https://www.boundless.com
 * Description:       Add the description of the plugin here.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.3
 * Author:            CACTUS Team
 * Author URI:        https://www.boundless.com
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       bl-author-authority-section
 * Domain Path:       /languages
 *
 * @package BLCleanPlugin
 */

namespace Boundless\BLCleanPlugin;

// Support for site-level autoloading.
if ( file_exists( __DIR__ . '/lib/autoload.php' ) ) {
	require_once __DIR__ . '/lib/autoload.php';
}

define( 'BL_CLEAN_PLUGIN_VERSION', '1.0.0' );
define( 'BL_CLEAN_PLUGIN_FILE', __FILE__ );

/**
 * Class BLCleanPlugin.
 */
class BLCleanPlugin {

	/**
	 * Holds the class instance.
	 *
	 * @var BLCleanPlugin $instance
	 */
	private static $instance = null;

	/**
	 * Return an instance of the class
	 *
	 * Return an instance of the BLWWWNav Class.
	 *
	 * @since 1.0.0
	 *
	 * @return BLCleanPlugin class instance.
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Loads when all the plugins have finished loading in. Useful for init.
	 */
	public function plugins_loaded() {
		// Set Up Demo.
		$demo = new Demo();
		$demo->run();
	}
}

add_action(
	'plugins_loaded',
	function () {
		$bl_block_assist = BLCleanPlugin::get_instance();
		$bl_block_assist->plugins_loaded();
	}
);
