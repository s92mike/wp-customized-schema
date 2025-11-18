<?php
/**
 * Organizational Schema for the homepage and about page.
 *
 * @package FMSchema
 */

namespace Dream\FMSchema;

/**
 * Class OrganizationalSchema
 */
class OrganizationalSchema
{
    /**
     * Post meta key for global schema data.
     *
     * @var string
     */
    const SCHEMA_META_KEY = '_dream_organization_schema';

    /**
     * Post meta key for default schema data.
     *
     * @var string
     */
    const DEFAULT_SCHEMA_META_KEY = '_dream_default_organization_schema';

    /**
     * Class runner
     *
     * @return void
     */
    public function run()
    {
        add_filter('wpseo_schema_organization', array( $this, 'dream_custom_organization_schema' ), 100);
        add_filter('wpseo_schema_article', array( $this, 'dream_remove_specific_schema' ));
        add_filter('wpseo_schema_webpage', array( $this, 'dream_remove_specific_schema' ));
        add_filter('wpseo_schema_person', array( $this, 'dream_remove_specific_schema' ));
        add_filter('wpseo_schema_breadcrumblist', array( $this, 'dream_remove_specific_schema' ));

        // Register REST API endpoints.
        add_action('rest_api_init', array( $this, 'register_rest_routes' ));
    }

    /**
     * Register REST API routes.
     *
     * @return void
     */
    public function register_rest_routes()
    {
        // Full schema routes.
        register_rest_route(
            'dream/v1',
            '/schema',
            array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'get_schema_data' ),
            'permission_callback' => function () {
                return current_user_can('manage_options');
            },
            )
        );

        register_rest_route(
            'dream/v1',
            '/schema',
            array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'update_schema_data' ),
            'permission_callback' => function () {
                return current_user_can('manage_options');
            },
            )
        );

        // Default schema routes.
        register_rest_route(
            'dream/v1',
            '/default-schema',
            array(
            'methods'             => 'GET',
            'callback'            => array( $this, 'get_default_schema_data' ),
            'permission_callback' => function () {
                return current_user_can('manage_options');
            },
            )
        );

        register_rest_route(
            'dream/v1',
            '/default-schema',
            array(
            'methods'             => 'POST',
            'callback'            => array( $this, 'update_default_schema_data' ),
            'permission_callback' => function () {
                return current_user_can('manage_options');
            },
            )
        );
    }

    /**
     * Get default minimal schema data if no custom data exists.
     *
     * @return array
     */
    private function get_default_minimal_schema()
    {
        return array(
        '@type' => 'Organization',
        '@id'   => 'https://www.dream.com/#dream',
        'name'  => 'Dream',
        'url'   => 'https://www.dream.com/',
        );
    }

    /**
     * Get default global schema data if no custom data exists.
     *
     * @return array Default schema data with all fields.
     */
    private function get_default_global_schema()
    {
        return array(
        'name'                      => 'Dream',
        'foundingDate'              => '2016',
        );
    }

    /**
     * Get default schema data from post meta.
     *
     * @return \WP_REST_Response
     */
    public function get_default_schema_data()
    {
        $schema_data = get_option(self::DEFAULT_SCHEMA_META_KEY, array());

        if (empty($schema_data) ) {
            // Return default schema data if no custom data exists.
            $schema_data = $this->get_default_minimal_schema();
        }

        return rest_ensure_response($schema_data);
    }

    /**
     * Clear WP Rocket cache.
     *
     * @return void
     */
    private function clear_wp_rocket_cache()
    {
        if (function_exists('rocket_clean_domain') ) {
            rocket_clean_domain();
        }
    }

    /**
     * Update default schema data in post meta.
     *
     * @param  \WP_REST_Request $request The request object.
     * @return \WP_REST_Response
     */
    public function update_default_schema_data( $request )
    {
        $schema_data = $request->get_json_params();

        // Validate and sanitize the data.
        $schema_data = $this->sanitize_default_schema_data($schema_data);

        // Save the data.
        update_option(self::DEFAULT_SCHEMA_META_KEY, $schema_data);

        // Clear WP Rocket cache.
        $this->clear_wp_rocket_cache();

        return rest_ensure_response($schema_data);
    }

    /**
     * Sanitize default schema data.
     *
     * @param  array $data The schema data to sanitize.
     * @return array
     */
    private function sanitize_default_schema_data( $data )
    {
        $sanitized = array();

        $fields = array(
        '@id',
        'name',
        'url',
        );

        // Sanitize fields.
        foreach ( $fields as $field ) {
            if (isset($data[ $field ]) ) {
                if ('url' === $field || '@id' === $field ) {
                    $sanitized[ $field ] = esc_url_raw($data[ $field ]);
                } else {
                    $sanitized[ $field ] = sanitize_text_field($data[ $field ]);
                }
            }
        }

        return $sanitized;
    }

    /**
     * Get schema data from post meta.
     *
     * @return \WP_REST_Response
     */
    public function get_schema_data()
    {
        $schema_data = get_option(self::SCHEMA_META_KEY, array());

        if (empty($schema_data) ) {
            // Return default schema data if no custom data exists.
            $schema_data = $this->get_default_global_schema();
        }

        return rest_ensure_response($schema_data);
    }

    /**
     * Update schema data in post meta.
     *
     * @param  \WP_REST_Request $request The request object.
     * @return \WP_REST_Response
     */
    public function update_schema_data( $request )
    {
        $schema_data = $request->get_json_params();

        // Validate and sanitize the data.
        $schema_data = $this->sanitize_schema_data($schema_data);

        // Save the data.
        update_option(self::SCHEMA_META_KEY, $schema_data);

        // Clear WP Rocket cache.
        $this->clear_wp_rocket_cache();

        return rest_ensure_response($schema_data);
    }

    /**
     * Sanitize schema data.
     *
     * @param  array $data The schema data to sanitize.
     * @return array
     */
    private function sanitize_schema_data( $data )
    {
        $sanitized = array();

        $fields = array(
        'name',
        'foundingDate',
        );

        // Sanitize regular fields.
        foreach ( $fields as $field ) {
            if (isset($data[ $field ]) ) {
                // Use esc_url_raw for URL fields that will be stored in the database.
                if (in_array($field, array( 'url', 'logo', 'image' ), true) ) {
                    $sanitized[ $field ] = esc_url_raw($data[ $field ]);
                } else {
                    $sanitized[ $field ] = sanitize_text_field($data[ $field ]);
                }
            }
        }

        return $sanitized;
    }

    /**
     * Escape URLs in schema data for safe HTML output.
     *
     * @param  array $data The schema data to escape.
     * @return array The schema data with URLs escaped.
     */
    private function escape_schema_urls( $data )
    {
        if (isset($data['url']) ) {
            $data['url'] = esc_url($data['url']);
        }
        if (isset($data['logo']) ) {
            $data['logo'] = esc_url($data['logo']);
        }
        if (isset($data['image']) ) {
            $data['image'] = esc_url($data['image']);
        }
        if (isset($data['sameAs']) && is_array($data['sameAs']) ) {
            $data['sameAs'] = array_map('esc_url', $data['sameAs']);
        }
        if (isset($data['@id']) ) {
            if (filter_var($data['@id'], FILTER_VALIDATE_URL) ) {
                $data['@id'] = esc_url($data['@id']);
            } else {
                $data['@id'] = sanitize_text_field($data['@id']);
            }
        }
        return $data;
    }

    /**
     * Generate organization schema data.
     *
     * @param  array $data The initial schema data.
     * @return array The modified schema data.
     */
    public function dream_custom_organization_schema( array $data ): array
    {
        // Get default schema data.
        $default_schema          = get_option(self::DEFAULT_SCHEMA_META_KEY, $this->get_default_minimal_schema());
        $default_schema['@type'] = 'Organization';

        // If not front page or about page, return the default schema.
        if (! is_front_page() && ! is_page('about') ) {
            return $default_schema;
        }
        $test = get_the_title();

        // Get custom schema data from options for homepage/about page.
        $custom_data = get_option(self::SCHEMA_META_KEY, array());

        // If no custom data exists, use default data.
        if (empty($custom_data) ) {
            $custom_data = $this->get_default_global_schema();
        }
        // Ensure URLs are properly escaped.
        $custom_data = $this->escape_schema_urls(is_array($custom_data) ? $custom_data : $custom_data->get_data());

        // Transform founders into Person objects.
        $custom_data['founders'] = array_map(
            function ( $founder ) {
                return array(
                '@type' => 'Person',
                'name'  => $founder,
                );
            },
            isset($custom_data['founders']) && is_array($custom_data['founders']) ? $custom_data['founders'] : array()
        );

        // Return the global schema with context for homepage/about page.
        return array(
        '@context'                  => 'http://www.schema.org',
        '@type'                     => 'Organization',
        'name'                      => $custom_data['name'],
        'foundingDate'              => $custom_data['foundingDate'],
        'founders'                  => $custom_data['founders'],
        'url'                       => $custom_data['url'],
        'sameAs'                    => $custom_data['sameAs'],
        'logo'                      => $custom_data['logo'],
        'image'                     => $custom_data['image'],
        'description'               => $custom_data['description'],
        'disambiguatingDescription' => $custom_data['disambiguatingDescription'],
        'alternateName'             => $custom_data['alternateName'],
        'telephone'                 => $custom_data['telephone'],
        'legalName'                 => $custom_data['legalName'],
        'address'                   => array(
        '@type'           => 'PostalAddress',
        'streetAddress'   => $custom_data['streetAddress'],
        'addressLocality' => $custom_data['addressLocality'],
        'addressRegion'   => $custom_data['addressRegion'],
        'postalCode'      => $custom_data['postalCode'],
        'addressCountry'  => $custom_data['addressCountry'],
        ),
        );
    }

    /**
     * Removes specific schema for homepage and about page.
     *
     * @param  array $data The schema data.
     * @return array Modified schema data.
     */
    public function dream_remove_specific_schema( $data )
    {
        if (is_front_page() || is_page('about') ) {
            return false;
        }
        return $data;
    }
}
