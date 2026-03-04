<?php
/**
 * Title: Composant — Hero image gauche (SF)
 * Slug: sf-tt5/hero-image-left
 * Categories: sf-sections
 */
?>
<!-- wp:group {"align":"full","backgroundColor":"surface","layout":{"type":"constrained","inherit":false},"style":{"spacing":{"padding":{"top":"var:preset|spacing|xl","bottom":"var:preset|spacing|xl"}}}} -->
<div class="wp-block-group alignfull has-surface-background-color has-background" style="padding-top:var(--wp--preset--spacing--xl);padding-bottom:var(--wp--preset--spacing--xl)">
  <!-- wp:columns {"verticalAlignment":"center","align":"wide","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|lg","left":"var:preset|spacing|lg"}}}} -->
  <div class="wp-block-columns alignwide are-vertically-aligned-center">
    <!-- wp:column {"verticalAlignment":"center"} -->
    <div class="wp-block-column is-vertically-aligned-center">
      <!-- wp:image {"aspectRatio":"4/3","scale":"cover","sizeSlug":"full","linkDestination":"none"} -->
      <figure class="wp-block-image size-full"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/hero-podcast.webp" alt="" style="aspect-ratio:4/3;object-fit:cover"/></figure>
      <!-- /wp:image -->
    </div>
    <!-- /wp:column -->
    <!-- wp:column {"verticalAlignment":"center"} -->
    <div class="wp-block-column is-vertically-aligned-center">
      <!-- wp:heading {"fontSize":"2xl"} -->
      <h2 class="wp-block-heading has-2xl-font-size">Un hero avec image a gauche</h2>
      <!-- /wp:heading -->
      <!-- wp:paragraph {"fontSize":"md"} -->
      <p class="has-md-font-size">Un texte d'intro clair, puis un appel a l'action pour guider l'utilisateur.</p>
      <!-- /wp:paragraph -->
      <!-- wp:buttons -->
      <div class="wp-block-buttons">
        <!-- wp:button {"backgroundColor":"primary","textColor":"base","url":"#"} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-primary-background-color has-text-color has-background wp-element-button" href="#">Demander un devis</a></div>
        <!-- /wp:button -->
        <!-- wp:button {"backgroundColor":"base","textColor":"secondary","url":"#"} -->
        <div class="wp-block-button"><a class="wp-block-button__link has-secondary-color has-base-background-color has-text-color has-background wp-element-button" href="#">Voir les offres</a></div>
        <!-- /wp:button -->
      </div>
      <!-- /wp:buttons -->
    </div>
    <!-- /wp:column -->
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->
