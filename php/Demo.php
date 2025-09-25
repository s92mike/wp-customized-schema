<?php
/**
 * All the demo functionality can be found here.
 *
 * @package BLCleanPlugin
 */

namespace Boundless\BLCleanPlugin;

/**
 * Class Demo
 */
class Demo {
	/**
	 * Class runner
	 *
	 * @return void
	 */
	public function run() {
		add_action( 'init', array( $this, 'bl_display_demo' ) );
	}

	/**
	 * Display the demo
	 *
	 * @return void
	 */
	public function bl_display_demo() {
		echo Functions::get_plugin_url( 'dist/demo.php' ) . ' This is a demo';
	}
}
