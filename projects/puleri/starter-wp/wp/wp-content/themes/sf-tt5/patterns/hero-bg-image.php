<?php
/**
 * Title: Composant — Hero bg image (SF)
 * Slug: sf-tt5/hero-bg-image
 * Categories: sf-sections
 */
?>
<!-- wp:cover {"url":"<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/poster-image-background.webp","dimRatio":40,"overlayColor":"secondary","isUserOverlayColor":true,"minHeight":70,"minHeightUnit":"vh","align":"full","className":"sf-hero-full","textColor":"base","layout":{"type":"constrained"}} -->
<div class="wp-block-cover alignfull sf-hero-full has-base-color has-text-color" style="min-height:70vh"><span aria-hidden="true" class="wp-block-cover__background has-secondary-background-color has-background-dim-40 has-background-dim"></span><img class="wp-block-cover__image-background" alt="" src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/poster-image-background.webp" data-object-fit="cover"/>
  <div class="wp-block-cover__inner-container">
    <!-- wp:heading {"textAlign":"center","fontSize":"2xl"} -->
    <h2 class="wp-block-heading has-text-align-center has-2xl-font-size">Un hero avec image de fond</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"textAlign":"center","fontSize":"md"} -->
    <p class="has-text-align-center has-md-font-size">Un texte lisible sur un visuel fort, avec un appel a l'action clair.</p>
    <!-- /wp:paragraph -->
    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
    <div class="wp-block-buttons">
      <!-- wp:button {"backgroundColor":"primary","textColor":"base","url":"#"} -->
      <div class="wp-block-button"><a class="wp-block-button__link has-base-color has-primary-background-color has-text-color has-background wp-element-button" href="#">Commencer</a></div>
      <!-- /wp:button -->
      <!-- wp:button {"backgroundColor":"base","textColor":"secondary","url":"#"} -->
      <div class="wp-block-button"><a class="wp-block-button__link has-secondary-color has-base-background-color has-text-color has-background wp-element-button" href="#">Voir les offres</a></div>
      <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
  </div>
</div>
<!-- /wp:cover -->
