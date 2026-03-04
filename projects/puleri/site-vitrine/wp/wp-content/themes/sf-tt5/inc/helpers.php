<?php
declare(strict_types=1);

function sf_tt5_is_active_theme(): bool {
    return get_stylesheet() === 'sf-tt5';
}

function sf_tt5_allowed_pattern_slug(string $slug): bool {
    return str_starts_with($slug, 'sf-tt5/');
}

function sf_tt5_header_variants(): array {
    return ['header-default', 'header-centered', 'header-custom', 'header-split'];
}

function sf_tt5_footer_variants(): array {
    return ['footer', 'footer-compact', 'footer-columns', 'footer-newsletter'];
}

function sf_tt5_get_context_post_id(): int {
    $post_id = get_the_ID();
    if (!$post_id) {
        $post_id = get_queried_object_id();
    }
    if (!$post_id && is_admin() && isset($_GET['post'])) {
        $post_id = (int) $_GET['post'];
    }
    if (!$post_id && is_admin() && isset($_GET['postId'])) {
        $post_id = (int) $_GET['postId'];
    }
    return $post_id ? (int) $post_id : 0;
}
