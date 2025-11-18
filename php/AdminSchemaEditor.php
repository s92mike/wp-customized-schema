<?php
/**
 * Admin Schema Editor for Boundless Schema Plugin
 *
 * @package FMSchema
 */

namespace Dream\FMSchema;

/**
 * Class AdminSchemaEditor
 */
class AdminSchemaEditor
{
    /**
     * Class runner
     *
     * @return void
     */
    public function run()
    {
        add_action('admin_menu', array( $this, 'add_admin_menu' ));
        add_action('admin_enqueue_scripts', array( $this, 'enqueue_scripts' ));
    }

    /**
     * Add admin menu items
     *
     * @return void
     */
    public function add_admin_menu()
    {
        // Add parent menu if it doesn't exist.
        if (! menu_page_url('dream-features', false) ) {
            add_menu_page(
                'Dream Features',
                'Dream',
                'manage_options',
                'dream-features',
                array( $this, 'render_parent_page' ),
                'dashicons-admin-generic',
                30
            );
        }

        // Add schema editor submenu.
        add_submenu_page(
            'dream-features',
            'Organization Schema Editor',
            'Organization Schema Editor',
            'manage_options',
            'dream-schema-editor',
            array( $this, 'render_schema_editor' )
        );

        // Remove the default submenu.
        add_action(
            'admin_menu',
            function () {
                remove_submenu_page('dream-features', 'dream-features');
            },
            999
        );
    }

    /**
     * Enqueue admin scripts and styles
     *
     * @param  string $hook The current admin page.
     * @return void
     */
    public function enqueue_scripts( $hook )
    {
        if ('dream_page_dream-schema-editor' !== $hook ) {
            return;
        }

        wp_enqueue_script(
            'dream-schema-editor',
            plugins_url('build/index.js', __DIR__),
            array( 'wp-components', 'wp-element', 'wp-api-fetch' ),
            FM_SCHEMA_VERSION,
            true
        );

        wp_enqueue_style(
            'dream-schema-editor',
            plugins_url('dist/schema-editor.css', __DIR__),
            array( 'wp-components' ),
            FM_SCHEMA_VERSION
        );
    }

    /**
     * Render the parent menu page
     *
     * @return void
     */
    public function render_parent_page()
    {
        ?>
        <div class="wrap">
            <h1>Welcome to Dream Features</h1>
            <p>This is the central hub for all Dream customizations and features.</p>
        </div>
        <?php
    }

    /**
     * Render the schema editor page
     *
     * @return void
     */
    public function render_schema_editor()
    {
        ?>
        <div class="wrap">
            <h1>Organization Schema Editor</h1>
            <div id="dream-schema-editor"></div>
        </div>
        <?php
    }
}
