<?php
/** Native template backgrounds and signed contact forms. */
defined('ABSPATH') || exit;
function bkbg_template_background($a){
 $s=is_array($a['settings']??null)?$a['settings']:array();$type=$s['background_background']??'';$out='';
 if($type==='slideshow'&&!empty($s['background_slideshow_gallery'])){
  $effect=$s['background_slideshow_slide_transition']??'fade';if(!in_array($effect,array('fade','slide_right','slide_left','slide_up','slide_down'),true))$effect='fade';
  $config=array('effect'=>$effect,'duration'=>max(1000,(int)($s['background_slideshow_slide_duration']??5000)),'transition'=>max(0,min(5000,(int)($s['background_slideshow_transition_duration']??500))),'loop'=>($s['background_slideshow_loop']??'yes')==='yes','kenBurns'=>($s['background_slideshow_ken_burns']??'')==='yes','zoomOut'=>($s['background_slideshow_ken_burns_zoom_direction']??'in')==='out');
  $out='<div class="bkbg-tpl-background-slideshow bkbg-template-background-slides" aria-hidden="true" data-bkbg-slideshow="'.esc_attr(wp_json_encode($config)).'">';
  foreach($s['background_slideshow_gallery'] as $i=>$image){$url=esc_url($image['url']??'');if(!$url)continue;$out.='<div class="bkbg-template-background-slide'.($i===0?' is-active':'').'"><div class="bkbg-tpl-background-slideshow__slide__image" style="background-image:url(&quot;'.$url.'&quot;)"></div></div>';}
  $out.='</div>';
 }elseif($type==='video'){
  $url=$s['background_video_link']??'';$url=esc_url($url);if($url&&preg_match('~\.(mp4|webm|ogg)(?:\?|$)~i',$url))$out='<div class="bkbg-tpl-background-video-container'.(($s['background_play_on_mobile']??'')==='yes'?'':' bkbg-tpl-hidden-mobile').'" aria-hidden="true"><video class="bkbg-tpl-background-video-hosted bkbg-template-background-video" src="'.$url.'" muted autoplay loop playsinline preload="metadata"></video></div>';
 }
 return $out;
}
function bkbg_template_form_markup($body,$a,$fields){
 // Prevent another installed CF7 plugin from attaching a second submit handler.
 $body=str_replace('wpcf7','bkbg-tpl-cf7',$body);
 $schema=array();foreach($a['behavior']['formFields']??array() as $f){$name=sanitize_key($f['name']??'');$type=$f['type']??'text';if(!$name||!in_array($type,array('text','email','tel','number','textarea','select'),true))continue;$schema[]=array('name'=>$name,'type'=>$type,'required'=>!empty($fields[$f['requiredField']??'']['value']));}
 if(!$schema)return $body;
 $config=array('fields'=>$schema,'subject'=>sanitize_text_field($a['behavior']['subject']??'Website contact form'));
 $token=base64_encode(wp_json_encode($config));$sig=hash_hmac('sha256',$token,wp_salt('auth'));
 $attrs=' data-bkbg-form="1" data-bkbg-endpoint="'.esc_url(rest_url('blockenberg/v1/template-contact')).'" data-bkbg-schema="'.esc_attr($token).'" data-bkbg-signature="'.esc_attr($sig).'" data-bkbg-success="'.esc_attr($a['behavior']['successMessage']??'Thank you! Your message has been sent.').'" data-bkbg-error="'.esc_attr($a['behavior']['errorMessage']??'Unable to send your message. Please try again.').'"';
 $body=preg_replace('/<form\b/', '<form'.$attrs, $body,1);
 $extra='<label class="bkbg-template-form-honeypot" aria-hidden="true">Website<input type="text" name="bkbg_website" tabindex="-1" autocomplete="off"></label><div class="bkbg-template-form-result" role="status" aria-live="polite" hidden></div>';
 return str_replace('</form>',$extra.'</form>',$body);
}
add_action('rest_api_init',function(){register_rest_route('blockenberg/v1','/template-contact',array('methods'=>'POST','permission_callback'=>'__return_true','callback'=>'bkbg_template_form_submit'));});
function bkbg_template_form_submit($request){
 $data=$request->get_json_params();if(!is_array($data))return new WP_Error('invalid_form','Invalid form.',array('status'=>400));
 $token=$data['schema']??'';$sig=$data['signature']??'';
 if(!is_string($token)||strlen($token)>12000||!is_string($sig)||!hash_equals(hash_hmac('sha256',$token,wp_salt('auth')),$sig))return new WP_Error('invalid_form','Invalid form.',array('status'=>400));
 $config=json_decode(base64_decode($token,true),true);if(!is_array($config)||empty($config['fields']))return new WP_Error('invalid_form','Invalid form.',array('status'=>400));
 if(!empty($data['website']))return rest_ensure_response(array('success'=>true));
 $key='bkbg_tpl_form_'.hash('sha256',$_SERVER['REMOTE_ADDR']??'unknown');$count=(int)get_transient($key);if($count>=5)return new WP_Error('rate_limit','Please try again in a minute.',array('status'=>429));set_transient($key,$count+1,60);
 $values=is_array($data['values']??null)?$data['values']:array();$body='';$reply='';
 foreach($config['fields'] as $field){$name=$field['name'];$raw=$values[$name]??'';if(!is_scalar($raw)||strlen((string)$raw)>10000)return new WP_Error('invalid_field','Invalid field.',array('status'=>400));$value=sanitize_textarea_field((string)$raw);
  if($field['required']&&trim($value)==='')return new WP_Error('required_field','Please complete all required fields.',array('status'=>400));
  if($field['type']==='email'&&$value!==''){if(!is_email($value))return new WP_Error('invalid_email','Please enter a valid email address.',array('status'=>400));$reply=sanitize_email($value);}
  if($field['type']==='number'&&$value!==''&&!is_numeric($value))return new WP_Error('invalid_number','Please enter a valid number.',array('status'=>400));
  $body.=$name.":\n".$value."\n\n";
 }
 $headers=$reply?array('Reply-To: '.$reply):array();$ok=wp_mail(get_option('admin_email'),sanitize_text_field($config['subject']),$body,$headers);
 return $ok?rest_ensure_response(array('success'=>true)):new WP_Error('mail_failed','Unable to send your message.',array('status'=>500));
}

/** Typed decorative SVG section boundaries. No arbitrary HTML is accepted. */
function bkbg_template_shapes($a){
    $out='';
    foreach(($a['shapeDividers']??array()) as $shape){
        if(!is_array($shape)||!empty($shape['disabled']))continue;
        $position=($shape['position']??'')==='top'?'top':'bottom';
        $view=preg_match('/^[0-9. ,\-]+$/',$shape['viewBox']??'')?$shape['viewBox']:'0 0 1000 100';
        $color=sanitize_hex_color($shape['color']??'');$height=max(0,min(1000,(float)($shape['height']??0)));
        $out.='<div class="bkbg-tpl-shape bkbg-tpl-shape-'.$position.'" data-negative="'.esc_attr(($shape['negative']??'false')==='true'?'true':'false').'" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="'.esc_attr($view).'" preserveAspectRatio="none"'.($height?' style="height:'.$height.'px"':'').'>';
        foreach(($shape['paths']??array()) as $path)$out.='<path class="'.esc_attr($path['classes']??'bkbg-tpl-shape-fill').'" d="'.esc_attr($path['d']??'').'"'.($color?' style="fill:'.esc_attr($color).'"':'').'></path>';
        $out.='</svg></div>';
    }
    return $out;
}
