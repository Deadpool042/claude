<?php
declare(strict_types=1);

add_action('init', function () {
    $meta_args = [
        'single' => true,
        'type' => 'string',
        'show_in_rest' => [
            'schema' => [
                'type' => 'string',
                'default' => '',
            ],
        ],
        'auth_callback' => function ($allowed, $meta_key, $post_id) {
            return current_user_can('edit_post', $post_id);
        },
        'sanitize_callback' => 'sanitize_text_field',
    ];
    register_post_meta('page', 'sf_tt5_header_variant', $meta_args);
    register_post_meta('page', 'sf_tt5_footer_variant', $meta_args);
    register_post_meta('post', 'sf_tt5_header_variant', $meta_args);
    register_post_meta('post', 'sf_tt5_footer_variant', $meta_args);
});
