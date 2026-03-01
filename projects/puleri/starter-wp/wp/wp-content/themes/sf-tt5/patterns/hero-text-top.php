<?php
/**
 * Title: Composant — Hero texte dessus (SF)
 * Slug: sf-tt5/hero-text-top
 * Categories: sf-sections
 */
?>
<!-- wp:group {"align":"full","backgroundColor":"surface","layout":{"type":"constrained","inherit":false},"style":{"spacing":{"padding":{"top":"var:preset|spacing|xl","bottom":"var:preset|spacing|xl"}}}} -->
<div class="wp-block-group alignfull has-surface-background-color has-background" style="padding-top:var(--wp--preset--spacing--xl);padding-bottom:var(--wp--preset--spacing--xl)">
  <!-- wp:heading {"textAlign":"center","fontSize":"2xl"} -->
  <h2 class="wp-block-heading has-text-align-center has-2xl-font-size">Un hero centre avec le texte en tete</h2>
  <!-- /wp:heading -->
  <!-- wp:paragraph {"textAlign":"center","fontSize":"md"} -->
  <p class="has-text-align-center has-md-font-size">Le message d'abord, puis l'image pour illustrer la proposition.</p>
  <!-- /wp:paragraph -->
  <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
  <div class="wp-block-buttons">
    <!-- wp:button {"backgroundColor":"primary","textColor":"base","url":"#"} -->
    <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-primary-background-color has-text-color has-background wp-element-button" href="#">Demander un devis</a></div>
    <!-- /wp:button -->
    <!-- wp:button {"backgroundColor":"base","textColor":"secondary","url":"#"} -->
    <div class="wp-block-button"><a class="wp-block-button__link has-secondary-color has-base-background-color has-text-color has-background wp-element-button" href="#">Voir les offres</a></div>
    <!-- /wp:button -->
  </div>
  <!-- /wp:buttons -->
  <!-- wp:image {"align":"center","aspectRatio":"16/9","scale":"cover","sizeSlug":"full","linkDestination":"none"} -->
  <figure class="wp-block-image aligncenter size-full"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/book-image-landing.webp" alt="" style="aspect-ratio:16/9;object-fit:cover"/></figure>
  <!-- /wp:image -->
</div>
<!-- /wp:group -->
