jQuery(document).ready(function ($) {

    $('.multivendorx-policies-accordion .accordion-header').on('click', function () {
        var $currentItem = $(this).closest('.accordion-item');
        var $currentBody = $currentItem.find('.accordion-body');
        $('.multivendorx-policies-accordion .accordion-body')
            .not($currentBody)
            .slideUp(200);
        $currentBody.slideToggle(200);
    });
    
})