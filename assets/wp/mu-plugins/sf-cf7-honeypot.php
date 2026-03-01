<?php
/**
 * Plugin Name: SF CF7 Honeypot
 * Description: Adds a lightweight honeypot to Contact Form 7.
 */

add_action('plugins_loaded', function () {
  if (!defined('WPCF7_VERSION')) {
    return;
  }

  $field_name = 'sf_hp';

  add_filter('wpcf7_form_elements', function ($content) use ($field_name) {
    $honeypot = '<span class="sf-hp" style="position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;" aria-hidden="true">';
    $honeypot .= '<label for="' . esc_attr($field_name) . '">Ne pas remplir</label>';
    $honeypot .= '<input type="text" name="' . esc_attr($field_name) . '" id="' . esc_attr($field_name) . '" tabindex="-1" autocomplete="off" />';
    $honeypot .= '</span>';

    return $content . $honeypot;
  });

  add_filter('wpcf7_spam', function ($spam, $submission) use ($field_name) {
    if ($spam) {
      return $spam;
    }

    if (!$submission && class_exists('WPCF7_Submission')) {
      $submission = WPCF7_Submission::get_instance();
    }

    if (!$submission || !method_exists($submission, 'get_posted_data')) {
      return $spam;
    }

    $data = $submission->get_posted_data();
    if (!empty($data[$field_name])) {
      return true;
    }

    return $spam;
  }, 10, 2);
}, 20);

if (defined('WP_CLI') && WP_CLI) {
  WP_CLI::add_command('sf honeypot-test', function () {
    $results = [
      'cf7_active' => defined('WPCF7_VERSION'),
      'empty_pass' => null,
      'filled_blocked' => null,
    ];

    if ($results['cf7_active']) {
      $empty = new class {
        public function get_posted_data() {
          return ['sf_hp' => ''];
        }
        public function get_meta($key) {
          return '';
        }
        public function __call($name, $args) {
          return null;
        }
      };
      $filled = new class {
        public function get_posted_data() {
          return ['sf_hp' => 'bot'];
        }
        public function get_meta($key) {
          return '';
        }
        public function __call($name, $args) {
          return null;
        }
      };
      $results['empty_pass'] = !apply_filters('wpcf7_spam', false, $empty);
      $results['filled_blocked'] = (bool) apply_filters('wpcf7_spam', false, $filled);
    }

    WP_CLI::line(wp_json_encode($results));
  });
}
