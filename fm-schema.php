<?php
/**
 * Plugin Name:       Dream Schema
 * Plugin URI:        https://github.com/s92mike
 * Description:       Schema for Dream
 * Version:           1.1.11
 * Requires at least: 6.0
 * Requires PHP:      7.3
 * Author:            Dream Team
 * Author URI:        https://github.com/s92mike
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       fm-schema
 * Domain Path:       /languages
 *
 * @package FMSchema
 */

namespace Dream\FMSchema;

// Support for site-level autoloading.
if (file_exists(__DIR__ . '/lib/autoload.php') ) {
    include_once __DIR__ . '/lib/autoload.php';
}

define('FM_SCHEMA_VERSION', '1.1.11');
define('FM_SCHEMA_FILE', __FILE__);

/**
 * Class FMSchema.
 */
class FMSchema
{

    /**
     * Holds the class instance.
     *
     * @var FMSchema $instance
     */
    private static $instance = null;

    /**
     * Return an instance of the class
     *
     * Return an instance of the FMSchema Class.
     *
     * @since 1.0.0
     *
     * @return FMSchema class instance.
     */
    public static function get_instance()
    {
        if (null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Loads when all the plugins have finished loading in. Useful for init.
     */
    public function plugins_loaded()
    {
        // Set Up Organizational Schema.
        $organizational_schema = new OrganizationalSchema();
        $organizational_schema->run();

        // Initialize Admin Schema Editor.
        $admin_schema_editor = new AdminSchemaEditor();
        $admin_schema_editor->run();

        // Initialize Dropin Schema.
        $dropin_schema = new DropinSchema();
        $dropin_schema->run();
    }
}

add_action(
    'plugins_loaded',
    function () {
        $fm_schema = FMSchema::get_instance();
        $fm_schema->plugins_loaded();
    }
);
