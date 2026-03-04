<?php
declare(strict_types=1);

add_filter('render_block_data', function (array $block): array {
    if (($block['blockName'] ?? '') !== 'core/template-part') return $block;
    $attrs = $block['attrs'] ?? [];
    $area = $attrs['area'] ?? '';
    if ($area !== 'header' && $area !== 'footer') return $block;

    $post_id = sf_tt5_get_context_post_id();
    if ($post_id === 0) return $block;

    if ($area === 'header') {
        $variant = get_post_meta($post_id, 'sf_tt5_header_variant', true);
        if (in_array($variant, sf_tt5_header_variants(), true)) {
            $attrs['slug'] = $variant;
            $block['attrs'] = $attrs;
        }
    }

    if ($area === 'footer') {
        $variant = get_post_meta($post_id, 'sf_tt5_footer_variant', true);
        if (in_array($variant, sf_tt5_footer_variants(), true)) {
            $attrs['slug'] = $variant;
            $block['attrs'] = $attrs;
        }
    }

    return $block;
});
