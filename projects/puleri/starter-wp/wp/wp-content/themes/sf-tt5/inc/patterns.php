<?php
declare(strict_types=1);

add_action('init', function () {
    if (!sf_tt5_is_active_theme()) return;
    if (!class_exists('WP_Block_Patterns_Registry')) return;
    $registry = WP_Block_Patterns_Registry::get_instance();
    foreach ($registry->get_all_registered() as $pattern) {
        $name = isset($pattern['name']) ? (string) $pattern['name'] : '';
        if ($name !== '' && !sf_tt5_allowed_pattern_slug($name)) {
            unregister_block_pattern($name);
        }
    }
}, 99);

add_action('admin_init', function () {
    if (!sf_tt5_is_active_theme()) return;
    if (!current_user_can('edit_theme_options')) return;
    wp_cache_delete('block_patterns', 'themes');
    wp_cache_delete('block_patterns_registry', 'themes');
    delete_transient('block_patterns');
    delete_transient('block_patterns_registry');
});

add_action('init', function () {
    if (!sf_tt5_is_active_theme()) return;
    if (!function_exists('register_block_pattern')) return;
    if (!class_exists('WP_Block_Patterns_Registry')) return;
    $pattern_dir = get_stylesheet_directory() . '/patterns';
    if (!is_dir($pattern_dir)) return;
    $files = glob($pattern_dir . '/*.php');
    if (!$files) return;
    $headers = [
        'title' => 'Title',
        'slug' => 'Slug',
        'categories' => 'Categories',
        'description' => 'Description',
    ];
    $registry = WP_Block_Patterns_Registry::get_instance();
    foreach ($files as $file) {
        $meta = get_file_data($file, $headers);
        $slug = isset($meta['slug']) ? trim((string) $meta['slug']) : '';
        if ($slug === '' || !sf_tt5_allowed_pattern_slug($slug)) continue;
        if ($registry->is_registered($slug)) continue;
        ob_start();
        include $file;
        $content = trim((string) ob_get_clean());
        if ($content === '') continue;
        $args = [
            'title' => $meta['title'] !== '' ? $meta['title'] : $slug,
            'content' => $content,
        ];
        if (!empty($meta['description'])) $args['description'] = $meta['description'];
        if (!empty($meta['categories'])) {
            $categories = array_filter(array_map('trim', explode(',', (string) $meta['categories'])));
            if ($categories) $args['categories'] = $categories;
        }
        register_block_pattern($slug, $args);
    }
}, 20);

add_filter('block_pattern_categories_all', function (array $categories): array {
    if (!sf_tt5_is_active_theme()) return $categories;
    return array_values(array_filter($categories, function ($category) {
        $slug = isset($category['slug']) ? (string) $category['slug'] : '';
        return $slug !== '' && str_starts_with($slug, 'sf-');
    }));
});

add_filter('allowed_block_patterns_all', function ($patterns) {
    if (!sf_tt5_is_active_theme()) return $patterns;
    if (!is_array($patterns)) return $patterns;
    $filtered = [];
    foreach ($patterns as $pattern) {
        if (is_string($pattern)) {
            if (sf_tt5_allowed_pattern_slug($pattern)) $filtered[] = $pattern;
            continue;
        }
        if (is_array($pattern)) {
            $name = isset($pattern['name']) ? (string) $pattern['name'] : '';
            if ($name !== '' && sf_tt5_allowed_pattern_slug($name)) $filtered[] = $pattern;
        }
    }
    return $filtered;
});
