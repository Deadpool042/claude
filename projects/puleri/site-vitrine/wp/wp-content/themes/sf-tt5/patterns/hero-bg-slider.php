<?php
/**
 * Title: Composant — Hero bg slider (SF)
 * Slug: sf-tt5/hero-bg-slider
 * Categories: sf-sections
 */
?>
<!-- wp:group {"align":"full","className":"sf-hero-slider sf-hero-full","layout":{"type":"constrained","inherit":false},"style":{"dimensions":{"minHeight":"70vh"},"spacing":{"padding":{"top":"var:preset|spacing|xl","bottom":"var:preset|spacing|xl"}}},"textColor":"base"} -->
<div class="wp-block-group alignfull sf-hero-slider sf-hero-full has-base-color has-text-color" style="min-height:70vh;padding-top:var(--wp--preset--spacing--xl);padding-bottom:var(--wp--preset--spacing--xl)">
  <!-- wp:group {"className":"sf-hero-slider__slides","layout":{"type":"default"}} -->
  <div class="wp-block-group sf-hero-slider__slides">
    <!-- wp:cover {"url":"<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/botany-flowers.webp","dimRatio":40,"overlayColor":"secondary","isUserOverlayColor":true,"minHeight":70,"minHeightUnit":"vh","className":"sf-hero-slide"} -->
    <div class="wp-block-cover sf-hero-slide" style="min-height:70vh"><span aria-hidden="true" class="wp-block-cover__background has-secondary-background-color has-background-dim-40 has-background-dim"></span><img class="wp-block-cover__image-background" alt="" src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/botany-flowers.webp" data-object-fit="cover"/>
      <div class="wp-block-cover__inner-container"></div>
    </div>
    <!-- /wp:cover -->
    <!-- wp:cover {"url":"<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/man-in-hat.webp","dimRatio":40,"overlayColor":"secondary","isUserOverlayColor":true,"minHeight":70,"minHeightUnit":"vh","className":"sf-hero-slide"} -->
    <div class="wp-block-cover sf-hero-slide" style="min-height:70vh"><span aria-hidden="true" class="wp-block-cover__background has-secondary-background-color has-background-dim-40 has-background-dim"></span><img class="wp-block-cover__image-background" alt="" src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/man-in-hat.webp" data-object-fit="cover"/>
      <div class="wp-block-cover__inner-container"></div>
    </div>
    <!-- /wp:cover -->
    <!-- wp:cover {"url":"<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/location.webp","dimRatio":40,"overlayColor":"secondary","isUserOverlayColor":true,"minHeight":70,"minHeightUnit":"vh","className":"sf-hero-slide"} -->
    <div class="wp-block-cover sf-hero-slide" style="min-height:70vh"><span aria-hidden="true" class="wp-block-cover__background has-secondary-background-color has-background-dim-40 has-background-dim"></span><img class="wp-block-cover__image-background" alt="" src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/location.webp" data-object-fit="cover"/>
      <div class="wp-block-cover__inner-container"></div>
    </div>
    <!-- /wp:cover -->
  </div>
  <!-- /wp:group -->
  <!-- wp:group {"align":"wide","className":"sf-hero-slider__content","layout":{"type":"constrained","inherit":false}} -->
  <div class="wp-block-group alignwide sf-hero-slider__content">
    <!-- wp:heading {"textAlign":"center","fontSize":"2xl"} -->
    <h2 class="wp-block-heading has-text-align-center has-2xl-font-size">Un hero avec slider automatique</h2>
    <!-- /wp:heading -->
    <!-- wp:paragraph {"textAlign":"center","fontSize":"md"} -->
    <p class="has-text-align-center has-md-font-size">Plusieurs images qui defilent en fond pour donner du rythme a la page.</p>
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
  </div>
  <!-- /wp:group -->
</div>
<!-- /wp:group -->
