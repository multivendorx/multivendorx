jQuery(document).ready(function($){

    // Initialize buttons
    $('.follow-btn').each(function(){
        var btn = $(this);
        var store_id = btn.data('store-id');

        $.post(followStoreFrontend.ajaxurl, {
            action: 'mvx_get_follow_data',
            store_id: store_id,
            nonce: followStoreFrontend.nonce
        }, function(res){
            if(res.success){
                btn.text(res.data.button_text).show();

                if(res.data.button_text === 'Login to Follow'){
                    btn.off('click').on('click', function(){
                        window.location.href = res.data.login_url;
                    });
                }

                if (res.data.follower_count == 1){
                    $('#followers-count-' + store_id).text(res.data.follower_count + ' Follower');
                } else{
                    $('#followers-count-' + store_id).text(res.data.follower_count + ' Followers');
                }
            }
        });
    });

    // Handle follow/unfollow click
    $(document).on('click', '.follow-btn', function(){
        var btn = $(this);
        var store_id = btn.data('store-id');
        var user_id  = btn.data('user-id');

        if(!user_id || btn.text().trim() === 'Login to Follow') return;

        $.post(followStoreFrontend.ajaxurl, {
            action: 'mvx_follow_store',
            store_id: store_id,
            user_id: user_id,
            nonce: followStoreFrontend.nonce
        }, function(res){
            if(res.success){
                btn.text(res.data.new_status);

                // Update follower count
                $.post(followStoreFrontend.ajaxurl, {
                    action: 'mvx_get_follow_data',
                    store_id: store_id,
                    nonce: followStoreFrontend.nonce
                }, function(resp){
                    if(resp.success){
                        if (resp.data.follower_count == 1){
                            $('#followers-count-' + store_id).text(resp.data.follower_count + ' Follower');
                        } else{
                            $('#followers-count-' + store_id).text(resp.data.follower_count + ' Followers');
                        }
                    }                    
                });
            }
        });
    });

});
