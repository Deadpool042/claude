<?php

if (!defined('WP_DEBUG')) define('WP_DEBUG', false);
if (!defined('WP_DEBUG_LOG')) define('WP_DEBUG_LOG', false);
if (!defined('WP_DEBUG_DISPLAY')) define('WP_DEBUG_DISPLAY', false);
if (!defined('WP_ENVIRONMENT_TYPE')) define('WP_ENVIRONMENT_TYPE', 'production');

if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
  $_SERVER['HTTPS'] = 'on';
}

if (!defined('SITE_FACTORY_MODE')) define('SITE_FACTORY_MODE', 'prod-like');
