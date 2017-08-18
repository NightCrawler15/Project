/*-------------------------------------------------------------------------------------------------------------------------------*/
/*This is main JS file that contains custom style rules used in this template*/
/*-------------------------------------------------------------------------------------------------------------------------------*/
/* Template Name: Site Title*/
/* Version: 1.0 Initial Release*/
/* Build Date: 22-04-2015*/
/* Author: Unbranded*/
/* Website: http://moonart.net.ua/site/ 
/* Copyright: (C) 2015 */
/*-------------------------------------------------------------------------------------------------------------------------------*/

/*--------------------------------------------------------*/
/* TABLE OF CONTENTS: */
/*--------------------------------------------------------*/

jQuery(function($) {

  "use strict";

  function mapHeight() {
    var window_h = $(window).height();
    var html_h = $(document).height();
    $('.contact-map').css({
      'height': window_h
    });
  }

  $(window).resize(function() {
    mapHeight();
  });

  $(window).load(function() {
    if ($('.contact-map').length) {
      mapHeight();
    } 
  });

});