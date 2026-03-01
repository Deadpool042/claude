<?php
declare(strict_types=1);

add_filter('theme_templates', function (array $templates, $theme, $post, $post_type): array {
    $stylesheet = get_stylesheet();
    if (!is_object($theme) || $theme->get_stylesheet() !== $stylesheet) {
        return $templates;
    }
    return array_filter($templates, function ($template) use ($stylesheet) {
        $template_theme = is_object($template) && isset($template->theme) ? (string) $template->theme : '';
        return $template_theme === '' || $template_theme === $stylesheet;
    });
}, 10, 4);

add_filter('get_block_templates', function (array $templates): array {
    $stylesheet = get_stylesheet();
    $filtered = array_values(array_filter($templates, function ($template) use ($stylesheet) {
        if (!is_object($template)) return false;
        if (!isset($template->theme) || $template->theme !== $stylesheet) return false;
        if (($template->type ?? '') !== 'wp_template_part') return true;
        $slug = (string) ($template->slug ?? '');
        if ($slug === 'footer') return true;
        if (str_starts_with($slug, 'header-')) return true;
        return str_starts_with($slug, 'footer-');
    }));

    $post_id = sf_tt5_get_context_post_id();
    if ($post_id === 0) return $filtered;

    $header_variant = (string) get_post_meta($post_id, 'sf_tt5_header_variant', true);
    $footer_variant = (string) get_post_meta($post_id, 'sf_tt5_footer_variant', true);

    foreach ($filtered as $template) {
        if (!is_object($template) || empty($template->content)) continue;
        if ($header_variant !== '') {
            $template->content = preg_replace(
                '/"slug":"header[^"]*"/',
                '"slug":"' . $header_variant . '"',
                $template->content
            );
        }
        if ($footer_variant !== '') {
            $template->content = preg_replace(
                '/"slug":"footer[^"]*"/',
                '"slug":"' . $footer_variant . '"',
                $template->content
            );
        }
    }

    return $filtered;
});

add_filter('get_block_template', function ($template) {
    if (!is_object($template) || empty($template->content)) return $template;
    $post_id = sf_tt5_get_context_post_id();
    if ($post_id === 0) return $template;
    $header_variant = (string) get_post_meta($post_id, 'sf_tt5_header_variant', true);
    $footer_variant = (string) get_post_meta($post_id, 'sf_tt5_footer_variant', true);
    if ($header_variant !== '') {
        $template->content = preg_replace(
            '/"slug":"header[^"]*"/',
            '"slug":"' . $header_variant . '"',
            $template->content
        );
    }
    if ($footer_variant !== '') {
        $template->content = preg_replace(
            '/"slug":"footer[^"]*"/',
            '"slug":"' . $footer_variant . '"',
            $template->content
        );
    }
    return $template;
});
