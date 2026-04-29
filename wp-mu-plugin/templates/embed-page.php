<?php
/**
 * Minimal full-bleed template for the embed flavour of /booking/.
 * No header, no footer, no sidebar — just the page content
 * (i.e. the [taxi_booking] shortcode the client put on the booking page).
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>Booking</title>
    <?php wp_head(); ?>
</head>
<body <?php body_class('titan-embed'); ?>>
    <main>
        <?php
        // WP loop renders the page content, which is the [taxi_booking] shortcode.
        if (have_posts()) {
            while (have_posts()) {
                the_post();
                the_content();
            }
        }
        ?>
    </main>
    <?php wp_footer(); ?>
</body>
</html>
