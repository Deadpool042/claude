<?php
/**
 * Title: Composant — Image gauche (SF)
 * Slug: sf-tt5/section-image-left
 * Categories: sf-sections
 */
?>
<!-- wp:group {"align":"full","backgroundColor":"accent","layout":{"type":"constrained","inherit":false},"style":{"spacing":{"padding":{"top":"var:preset|spacing|lg","right":"var:preset|spacing|lg","bottom":"var:preset|spacing|lg","left":"var:preset|spacing|lg"}}}} -->
<div class="wp-block-group alignfull has-accent-background-color has-background" style="padding-top:var(--wp--preset--spacing--lg);padding-right:var(--wp--preset--spacing--lg);padding-bottom:var(--wp--preset--spacing--lg);padding-left:var(--wp--preset--spacing--lg)">
  <!-- wp:columns {"verticalAlignment":"center","align":"wide","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|md","left":"var:preset|spacing|md"}}}} -->
  <div class="wp-block-columns alignwide are-vertically-aligned-center">
    <!-- wp:column {"verticalAlignment":"center"} -->
    <div class="wp-block-column is-vertically-aligned-center">
      <!-- wp:group {"backgroundColor":"base","layout":{"type":"constrained","inherit":false},"style":{"spacing":{"padding":{"top":"var:preset|spacing|lg","right":"var:preset|spacing|md","bottom":"var:preset|spacing|lg","left":"var:preset|spacing|lg"}}}} -->
      <div class="wp-block-group has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--lg);padding-right:var(--wp--preset--spacing--md);padding-bottom:var(--wp--preset--spacing--lg);padding-left:var(--wp--preset--spacing--lg)">
        <!-- wp:image {"aspectRatio":"4/3","scale":"cover","sizeSlug":"full","linkDestination":"none"} -->
        <figure class="wp-block-image size-full"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/botany-flowers.webp" alt="" style="aspect-ratio:4/3;object-fit:cover"/></figure>
        <!-- /wp:image -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->
    <!-- wp:column {"verticalAlignment":"center"} -->
    <div class="wp-block-column is-vertically-aligned-center">
      <!-- wp:group {"backgroundColor":"base","layout":{"type":"constrained","inherit":false},"style":{"spacing":{"padding":{"top":"var:preset|spacing|lg","right":"var:preset|spacing|md","bottom":"var:preset|spacing|md","left":"var:preset|spacing|md"}}}} -->
      <div class="wp-block-group has-base-background-color has-background" style="padding-top:var(--wp--preset--spacing--lg);padding-right:var(--wp--preset--spacing--md);padding-bottom:var(--wp--preset--spacing--md);padding-left:var(--wp--preset--spacing--md)">
        <!-- wp:heading {"fontSize":"xl"} -->
        <h2 class="has-xl-font-size">Une image pour capter l'attention</h2>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"fontSize":"md"} -->
        <p class="has-md-font-size">Ajoute un texte clair a droite pour expliquer le visuel et guider la lecture.</p>
        <!-- /wp:paragraph -->
      </div>
      <!-- /wp:group -->
    </div>
    <!-- /wp:column -->
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:group -->
