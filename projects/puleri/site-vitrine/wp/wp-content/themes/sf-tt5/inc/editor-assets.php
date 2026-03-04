<?php
declare(strict_types=1);

function sf_tt5_enqueue_editor_variants($screen = null): void {
    $screen = $screen ?: (function_exists('get_current_screen') ? get_current_screen() : null);
    $screen_base = is_object($screen) ? (string) $screen->base : '';
    $screen_id = is_object($screen) ? (string) $screen->id : '';
    $is_post_editor = $screen_base === 'post' || $screen_id === 'post' || $screen_id === 'page';
    if (!$is_post_editor && isset($_GET['post']) && is_numeric($_GET['post'])) {
        $is_post_editor = true;
    }
    $script = $is_post_editor ? 'editor-variants-post.js' : 'editor-variants-site.js';
    $deps = $is_site_editor
        ? ['wp-hooks', 'wp-compose', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-data']
        : ['wp-hooks', 'wp-compose', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-data', 'wp-edit-post'];

    if (wp_script_is('sf-tt5-editor-variants', 'enqueued')) return;

    wp_enqueue_script(
        'sf-tt5-editor-variants',
        get_stylesheet_directory_uri() . '/assets/js/' . $script,
        $deps,
        wp_get_theme()->get('Version'),
        true
    );
}

function sf_tt5_enqueue_editor_sections(): void {
    if (wp_script_is('sf-tt5-editor-sections', 'enqueued')) return;
    wp_enqueue_script(
        'sf-tt5-editor-sections',
        get_stylesheet_directory_uri() . '/assets/js/editor-sections.js',
        ['wp-hooks', 'wp-compose', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-data', 'wp-blocks'],
        wp_get_theme()->get('Version'),
        true
    );
}

add_action('enqueue_block_editor_assets', function () {
    sf_tt5_enqueue_editor_variants();
    sf_tt5_enqueue_editor_sections();
});

add_action('admin_enqueue_scripts', function () {
    $screen = function_exists('get_current_screen') ? get_current_screen() : null;
    if (!is_object($screen)) return;
    if (!method_exists($screen, 'is_block_editor') || !$screen->is_block_editor()) return;
    sf_tt5_enqueue_editor_variants($screen);
    sf_tt5_enqueue_editor_sections();
});
