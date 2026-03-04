<?php
/**
 * Plugin Name: SF Local SSL Loopback
 * Description: Disable SSL verification for local loopback requests.
 */
if (function_exists('wp_get_environment_type') && wp_get_environment_type() !== 'local') {
  return;
}

add_filter('https_local_ssl_verify', '__return_false');
