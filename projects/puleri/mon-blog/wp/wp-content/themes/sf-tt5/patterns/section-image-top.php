<?php
/**
 * Title: Composant — Image dessus (SF)
 * Slug: sf-tt5/section-image-top
 * Categories: sf-sections
 */
?>
<!-- wp:group {"align":"full","backgroundColor":"accent","layout":{"type":"constrained","inherit":false},"style":{"spacing":{"padding":{"top":"var:preset|spacing|lg","right":"var:preset|spacing|lg","bottom":"var:preset|spacing|lg","left":"var:preset|spacing|lg"}}}} -->
<div class="wp-block-group alignfull has-accent-background-color has-background" style="padding-top:var(--wp--preset--spacing--lg);padding-right:var(--wp--preset--spacing--lg);padding-bottom:var(--wp--preset--spacing--lg);padding-left:var(--wp--preset--spacing--lg)">
  <!-- wp:group {"align":"wide","backgroundColor":"base","layout":{"type":"constrained","inherit":false},"style":{"spacing":{"padding":{"top":"var:preset|spacing|lg","right":"var:preset|spacing|lg","bottom":"var:preset|spacing|lg","left":"var:preset|spacing|lg"}}}} -->
  <div class="wp-block-group alignwide has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--lg);padding-right:var(--wp--preset--spacing--lg);padding-bottom:var(--wp--preset--spacing--lg);padding-left:var(--wp--preset--spacing--lg)">
    <!-- wp:image {"align":"center","aspectRatio":"16/9","scale":"cover","sizeSlug":"full","linkDestination":"none"} -->
    <figure class="wp-block-image aligncenter size-full"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/hero-podcast.webp" alt="" style="aspect-ratio:16/9;object-fit:cover"/></figure>
    <!-- /wp:image -->
    <!-- wp:heading {"textAlign":"center","fontSize":"xl"} -->
    <h2 class="wp-block-heading has-text-align-center has-xl-font-size">Une image en tete, un texte centre</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"textAlign":"center","fontSize":"md"} -->
    <p class="has-text-align-center has-md-font-size">Parfait pour une annonce ou un message avec un visuel en premiere ligne.</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:group -->
</div>
<!-- /wp:group -->
