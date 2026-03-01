<?php
declare(strict_types=1);

add_filter('wp_theme_json_get_style_variations', function (array $variations): array {
    if (!sf_tt5_is_active_theme()) return $variations;
    $styles_dir = trailingslashit(get_stylesheet_directory()) . 'styles';
    $allowed = [];
    if (is_dir($styles_dir)) {
        $files = glob($styles_dir . '/*.json') ?: [];
        foreach ($files as $file) {
            $allowed[] = basename((string) $file, '.json');
        }
    }
    if (count($allowed) === 0) return $variations;
    return array_values(array_filter($variations, function ($variation) use ($allowed) {
        if (!is_array($variation)) return false;
        $slug = isset($variation['slug']) ? (string) $variation['slug'] : '';
        return $slug !== '' && in_array($slug, $allowed, true);
    }));
});
