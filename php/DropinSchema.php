<?php
/**
 * Handles registration of drop-in schema-related post meta fields.
 *
 * @package FMSchema
 */

namespace Dream\FMSchema;

/**
 * Class DropinSchema
 *
 * Registers drop-in schema-related post meta fields for supported post types.
 */
class DropinSchema
{
    /**
     * Set up hooks for drop-in schema meta registration.
     */
    public function run()
    {
        add_action('init', array( __CLASS__, 'register_meta' ));
        add_action('enqueue_block_editor_assets', array( $this, 'enqueue_sidebar_script' ));
        add_filter('wpseo_schema_graph', array( $this, 'output_schema' ), 20);
        add_filter('wpseo_json_ld_output', array( $this, 'maybe_prevent_yoast_schema' ), 10, 2);
        add_action('save_post', array( $this, 'clear_rocket_cache' ), 10, 2);
    }

    /**
     * Register drop-in schema post meta for supported post types.
     */
    public static function register_meta()
    {
        $post_types = array( 'post', 'page', 'fm_guides', 'faqs', 'bct_service', 'fm_profiles' );

        foreach ( $post_types as $type ) {
            register_post_meta(
                $type,
                '_fm_manual_schema',
                array(
                'show_in_rest'      => true,
                'single'            => true,
                'type'              => 'string',
                'auth_callback'     => function () {
                    return current_user_can('edit_posts'); 
                },
                    'sanitize_callback' => 'wp_kses_post',
                )
            );
            register_post_meta(
                $type,
                '_fm_merge_yoast_schema',
                array(
                'show_in_rest'  => true,
                'single'        => true,
                'type'          => 'boolean',
                'auth_callback' => function () {
                    return current_user_can('edit_posts'); 
                },
                    'default'       => true,
                )
            );
        }
    }

    /**
     * Enqueue the DropinSchemaSidebar script in the block editor for supported post types.
     */
    public function enqueue_sidebar_script()
    {
        global $typenow;
        $supported = array( 'post', 'page', 'fm_guides', 'faqs', 'bct_service', 'fm_profiles' );
        if (in_array($typenow, $supported, true) ) {
            wp_enqueue_script(
                'bl-schema-dropin-sidebar',
                plugins_url('../dist/dropin-schema-sidebar.js', __FILE__),
                array( 'wp-plugins', 'wp-edit-post', 'wp-element', 'wp-components', 'wp-data', 'wp-i18n' ),
                FM_SCHEMA_VERSION,
                true
            );
        }
    }

    /**
     * Prevent Yoast schema output when merging is disabled.
     *
     * @param  bool   $output  Whether to output the schema.
     * @param  string $context The context of the schema output.
     * @return bool Whether to output the schema.
     */
    public function maybe_prevent_yoast_schema( $output, $context )
    {
        $post_id = get_queried_object_id();
        if (! $post_id ) {
            return $output;
        }

        $manual_schema = get_post_meta($post_id, '_fm_manual_schema', true);
        if (empty($manual_schema) ) {
            return $output;
        }

        $merge_yoast = get_post_meta($post_id, '_fm_merge_yoast_schema', true);
        if (! $merge_yoast ) {
            $manual_schema = $this->process_schema_variables($manual_schema);
            add_action(
                'wp_head',
                function () use ( $manual_schema ) {
                    printf(
                        '<script type="application/ld+json" id="manual-schema-page">%s</script>',
                        wp_json_encode(json_decode($manual_schema), JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)
                    );
                },
                20
            );
            return false;
        }

        return $output;
    }


    /**
     * Process schema template variables.
     *
     * @param  string $schema The schema JSON string.
     * @return string Processed schema.
     */
    private function process_schema_variables( $schema )
    {
        $post_id = get_the_ID();
        if (! $post_id ) {
            return $schema;
        }

        $post          = get_post($post_id);
        $created_date  = get_the_date('Y-m-d', $post_id);
        $modified_date = get_the_modified_date('Y-m-d', $post_id);

        // Replace variables in the schema.
        $schema = str_replace(
            array(
            '{{fm_schema_created_date}}',
            '{{fm_schema_last_updated_date}}',
            ),
            array(
            esc_attr($created_date),
            esc_attr($modified_date),
            ),
            $schema
        );

        return $schema;
    }

    /**
     * Output the schema based on merge setting.
     *
     * @param  array $yoast_graph Yoast's complete schema graph.
     * @return array|false Modified schema graph or false to prevent output.
     */
    public function output_schema( $yoast_graph )
    {
        $post_id = get_queried_object_id();
        if (! $post_id ) {
            return $yoast_graph;
        }

        $manual_schema = get_post_meta($post_id, '_fm_manual_schema', true);
        if (empty($manual_schema) ) {
            return $yoast_graph;
        }

        // Process variables in the schema.
        $manual_schema = $this->process_schema_variables($manual_schema);

        $custom_graph = json_decode($manual_schema, true);
        if (empty($custom_graph) ) {
            return $yoast_graph;
        }

        // If schema has @graph, use it, otherwise wrap in array.
        $custom_graph = isset($custom_graph['@graph']) ? $custom_graph['@graph'] : array( $custom_graph );

        // Ensure yoast_graph is an array.
        $yoast_graph = is_array($yoast_graph) ? $yoast_graph : array( $yoast_graph );

        foreach ( $yoast_graph as &$schema ) {
            if (! isset($schema['@type']) ) {
                continue;
            }

            $type  = is_array($schema['@type']) ? $schema['@type'][ array_key_last($schema['@type']) ] : $schema['@type'];
            $index = $this->find_schema_index($custom_graph, $type);

            if (-1 === $index ) {
                continue;
            }

            // Merge the schemas recursively.
            $schema = $this->merge_recursive($schema, $custom_graph[ $index ]);
            unset($custom_graph[ $index ]);
        }

        // Add any remaining custom schemas that didn't match.
        return array_merge($yoast_graph, $custom_graph);
    }

    /**
     * Find the index of a schema in the graph by type.
     *
     * @param  array  $schemas Array of schemas.
     * @param  string $type    Schema type to find.
     * @return int Index of the schema or -1 if not found.
     */
    private function find_schema_index( array $schemas, string $type ): int
    {
        $types = wp_list_pluck($schemas, '@type');
        $index = array_search($type, $types);
        return false === $index ? -1 : $index;
    }

    /**
     * Recursively merge two arrays.
     *
     * @param  array $array1 First array.
     * @param  array $array2 Second array.
     * @return array Merged array.
     */
    private function merge_recursive( array $array1, array $array2 ): array
    {
        foreach ( $array2 as $key => $value ) {
            if (is_array($value) && isset($array1[ $key ]) && is_array($array1[ $key ]) ) {
                $array1[ $key ] = $this->merge_recursive($array1[ $key ], $value);
            } else {
                $array1[ $key ] = $value;
            }
        }
        return $array1;
    }

    /**
     * Clear WP Rocket cache when a post is saved.
     *
     * @param int     $post_id The post ID.
     * @param WP_Post $post    The post object.
     */
    public function clear_rocket_cache( $post_id, $post )
    {
        // Don't clear cache on autosave or revision.
        if (( defined('DOING_AUTOSAVE') && DOING_AUTOSAVE ) || wp_is_post_revision($post_id) ) {
            return;
        }

        // Only clear cache for supported post types.
        $supported = array( 'post', 'page', 'guide', 'faq' );
        if (! in_array($post->post_type, $supported, true) ) {
            return;
        }

        // Clear WP Rocket cache if available.
        if (function_exists('rocket_clean_domain') ) {
            rocket_clean_domain();
        }
    }
}
