<?php
/** Searchable native template library. Server filtering remains usable without JS. */
defined('ABSPATH') || exit;
add_action('admin_enqueue_scripts',function($hook){if($hook!=='blockenberg_page_blockenberg-templates')return;wp_enqueue_style('bkbg-section-library');$base=dirname(__DIR__,2);$url=plugins_url('',$base.'/blockenberg.php');foreach(array('css','js') as $ext){$f='/assets/'.$ext.'/template-catalog.'.$ext;if($ext==='css')wp_enqueue_style('bkbg-template-catalog',$url.$f,array(),filemtime($base.$f));else wp_enqueue_script('bkbg-template-catalog',$url.$f,array(),filemtime($base.$f),true);}});

/** Preview access is independent of import entitlement; never use a source Elementor URL. */
function bkbg_catalog_preview_url($entry) {
    $key = $entry['key'] ?? '';
    if (!is_string($key) || !preg_match('/^[a-z0-9][a-z0-9-]{0,159}$/D', $key)) return '';
    $public = 'https://templates.blockenberg.com/template-library/previews/20261009-v2/' . rawurlencode($key) . '/';
    $preview = $entry['previewUrl'] ?? '';
    // Release IDs match the publisher: 1–80 ASCII letters/digits/underscores/hyphens,
    // starting with a letter/digit. Exact URL matching rejects traversal and extra parameters.
    $pattern = '~\Ahttps://templates\.blockenberg\.com/template-library/previews/[A-Za-z0-9][A-Za-z0-9_-]{0,79}/' . preg_quote($key, '~') . '/\z~';
    // Older cached catalogs may still name King previews. Use the native versioned fallback.
    return is_string($preview) && preg_match($pattern, $preview) ? $preview : $public;
}

/** Search titles first, then tags, with the same word/key behavior as King Addons. */
function bkbg_catalog_filter_entries($entries, $search, $category, $collection, $plan, $chosen) {
    $normalize = static function ($value) {
        return trim(preg_replace('/\s+/u', ' ', (string) $value));
    };
    $search = $normalize($search);
    $terms = $search === '' ? array() : explode(' ', $search);
    $titles = $tag_matches = array();
    foreach ($entries as $entry) {
        if ($category !== '' && $category !== strtolower(trim($entry['category'] ?? ''))) continue;
        if ($collection !== '' && $collection !== (string) ($entry['collection'] ?? '')) continue;
        if ($plan !== '' && $plan !== ($entry['plan'] ?? '')) continue;
        $tags = array_map(static function ($tag) { return strtolower(trim($tag)); }, $entry['tags'] ?? array());
        if ($chosen && array_diff($chosen, $tags)) continue;
        if ($search !== '' && strcasecmp($entry['key'], $search) === 0) return array($entry);
        if (!$terms) { $titles[] = $entry; continue; }
        $title = $normalize($entry['title'] ?? '');
        $title_match = $tag_match = false;
        foreach ($terms as $term) {
            if (stripos($title, $term) !== false) $title_match = true;
            foreach ($tags as $tag) if (stripos($tag, $term) !== false) { $tag_match = true; break; }
        }
        if ($title_match) $titles[] = $entry;
        elseif ($tag_match) $tag_matches[] = $entry;
    }
    $results = array_merge($titles, $tag_matches);
    return $search === '' && $plan === '' ? bkbg_library_mix_access_entries($results) : $results;
}

function bkbg_template_catalog_screen(){
 if(!current_user_can('manage_options'))wp_die('Insufficient permissions.');
 $view=isset($_GET['view'])&&is_string($_GET['view'])?sanitize_key(wp_unslash($_GET['view'])):'templates';if(!in_array($view,array('templates','collections','sections'),true))$view='templates';$section_catalog=bkbg_sections_catalog();$full=bkbg_template_manifest();$manifest=$view==='sections'?$section_catalog['sections']:$full;$names=bkbg_library_catalog()['collections'];$categories=array();$collections=array();$tags=array();$entries=array();
 foreach($manifest as $key=>$entry){$entry['key']=$key;$cat=strtolower(trim($entry['category']??''));if($cat)$categories[$cat]=($categories[$cat]??0)+1;$coll=(string)($entry['collection']??'');if($coll)$collections[$coll][]=$entry;foreach($entry['tags']??array() as $tag){$tag=strtolower(trim($tag));if($tag)$tags[$tag]=($tags[$tag]??0)+1;}$entries[]=$entry;}
 ksort($categories);ksort($tags);uksort($collections,function($a,$b)use($names){return strnatcasecmp($names[$a]??$a,$names[$b]??$b);});
 $read=static function($key){return isset($_GET[$key])&&is_string($_GET[$key])?sanitize_text_field(wp_unslash($_GET[$key])):'';};
 $search=$read('s');$category=strtolower($read('category'));$collection=$read('collection');$plan=$read('plan');$chosen=array();foreach((array)($_GET['tags']??array()) as $tag)if(is_string($tag))$chosen[]=strtolower(sanitize_text_field(wp_unslash($tag)));
 $filtered=$view==='sections'?bkbg_section_filter_entries($entries,$search,$category,$collection,$plan,$chosen):bkbg_catalog_filter_entries($entries,$search,$category,$collection,$plan,$chosen);
 $groups=array_filter($collections,function($rows,$id)use($view,$search,$names){return $view!=='collections'||$search===''||stripos(($names[$id]??'').' '.implode(' ',array_column($rows,'title')),$search)!==false;},ARRAY_FILTER_USE_BOTH);
 $total=$view==='collections'?count($groups):count($filtered);$per=$view==='collections'?8:24;$pages=max(1,(int)ceil($total/$per));$current=min($pages,max(1,(int)$read('paged')));$visible=$view==='collections'?array_slice($groups,($current-1)*$per,$per,true):array_slice($filtered,($current-1)*$per,$per);
 $base=admin_url('admin.php');$home=add_query_arg('page','blockenberg-templates',$base);$reset=$view==='sections'?add_query_arg('view','sections',$home):$home;$args=array('page'=>'blockenberg-templates','view'=>$view,'s'=>$search,'category'=>$category,'collection'=>$collection,'plan'=>$plan,'tags'=>$chosen);
 ?>
 <div class="wrap bkbg-template-catalog <?php echo $view==='sections'?'bkbg-section-view':'';?>" id="bkbg-template-catalog" data-import-url="<?php echo esc_url(admin_url('admin-ajax.php'));?>">
  <header class="bkbg-catalog-header">
   <div class="bkbg-catalog-brand"><span class="bkbg-catalog-mark" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="8" height="8" rx="2"/><rect x="14" y="2" width="8" height="8" rx="2"/><rect x="2" y="14" width="8" height="8" rx="2"/><rect x="14" y="14" width="8" height="8" rx="2"/></svg></span><span class="bkbg-catalog-eyebrow">Blockenberg</span></div>
   <div class="bkbg-catalog-intro"><div><h1>Template Library</h1></div>
    <form method="post" action="<?php echo esc_url(admin_url('admin-post.php'));?>" class="bkbg-catalog-refresh"><input type="hidden" name="action" value="bkbg_refresh_template_library"><input type="hidden" name="view" value="<?php echo esc_attr($view);?>"><?php wp_nonce_field('bkbg_refresh_template_library');?><button type="submit" class="button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.6-1L20 9M4 15l2.3 3A7 7 0 0 0 17.9 17"/></svg>Refresh library</button></form>
   </div>
  <nav class="bkbg-catalog-tabs" aria-label="Library views"><?php foreach(array('templates'=>count($full),'sections'=>count($section_catalog['sections']),'collections'=>count(array_unique(array_column($full,'collection')))) as $v=>$n):?><a class="<?php echo $view===$v?'is-active':'';?>" href="<?php echo esc_url(add_query_arg(array('view'=>$v),$home));?>" <?php if($view===$v)echo 'aria-current="page"';?>><?php echo esc_html(ucfirst($v));?><span><?php echo (int)$n;?></span></a><?php endforeach;?></nav>
  </header>
  <form method="get" action="<?php echo esc_url($base);?>" id="bkbg-catalog-filters"><input type="hidden" name="page" value="blockenberg-templates"><input type="hidden" name="view" value="<?php echo esc_attr($view);?>">
   <div class="bkbg-catalog-layout">
    <?php if($view!=='collections'):?><aside class="bkbg-catalog-sidebar" aria-label="Template filters"><div class="bkbg-catalog-filter-heading"><strong>Filters</strong></div>
     <label for="bkbg-catalog-category">Category</label><select name="category" id="bkbg-catalog-category"><option value="">All categories (<?php echo count($entries);?>)</option><?php foreach($categories as $v=>$n):?><option value="<?php echo esc_attr($v);?>" <?php selected($category,$v);?>><?php echo esc_html(($view==='sections'?($section_catalog['categories'][$v]??ucwords($v)):ucwords($v)).' ('.$n.')');?></option><?php endforeach;?></select>
     <label for="bkbg-catalog-collection">Collection</label><select name="collection" id="bkbg-catalog-collection"><option value="">All collections (<?php echo count($collections);?>)</option><?php foreach($collections as $v=>$rows):?><option value="<?php echo esc_attr($v);?>" <?php selected($collection,(string)$v);?>><?php echo esc_html(($names[$v]??'Collection '.$v).' ('.count($rows).')');?></option><?php endforeach;?></select>
     <fieldset class="bkbg-catalog-access"><legend>Access</legend><div class="bkbg-catalog-access-options"><?php foreach(array(''=>$view==='sections'?'All sections':'All templates','free'=>'Free','premium'=>'Pro') as $v=>$label):?><label class="bkbg-catalog-choice"><input type="radio" name="plan" value="<?php echo esc_attr($v);?>" <?php checked($plan,$v);?>><?php echo esc_html($label);?></label><?php endforeach;?></div></fieldset>
     <details class="bkbg-catalog-tags" <?php if($chosen)echo 'open';?>><summary>Tags <span><?php echo count($tags);?></span></summary><div class="bkbg-catalog-tag-list"><?php foreach($tags as $v=>$n):?><label class="bkbg-catalog-choice"><input type="checkbox" name="tags[]" value="<?php echo esc_attr($v);?>" <?php checked(in_array($v,$chosen,true));?>><span><?php echo esc_html(ucfirst($v));?></span><small><?php echo (int)$n;?></small></label><?php endforeach;?></div></details>
     <button class="button bkbg-catalog-apply" type="submit">Apply filters</button>
     <div class="bkbg-catalog-filter-footer"><a href="<?php echo esc_url($reset);?>" class="bkbg-catalog-reset"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10a9 9 0 1 1 2.6 8.4M3 4v6h6"/></svg><span>Reset filters and search</span></a></div>
    </aside><?php endif;?>
    <section class="bkbg-catalog-content"><div class="bkbg-catalog-search"><label for="bkbg-catalog-search" class="screen-reader-text">Search <?php echo esc_html($view);?></label><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/></svg><input id="bkbg-catalog-search" type="search" name="s" value="<?php echo esc_attr($search);?>" placeholder="Search <?php echo esc_attr($view);?>…"><button class="button" type="submit">Search</button></div>
     <div id="bkbg-catalog-results" aria-live="polite" aria-atomic="false"><div class="bkbg-catalog-result-heading"><p><?php echo esc_html(number_format_i18n($total).' '.$view);?><?php if($collection&&$view!=='collections')echo ' · '.esc_html($names[$collection]??'Collection '.$collection);?></p><span>Page <?php echo (int)$current;?> of <?php echo (int)$pages;?></span></div>
      <?php if($view==='collections'):?><div class="bkbg-catalog-collections"><?php foreach($visible as $id=>$rows):$link=add_query_arg(array('collection'=>$id),$home);?><article class="bkbg-catalog-collection"><div class="bkbg-catalog-collection-heading"><div><h2><?php echo esc_html($names[$id]??'Collection '.$id);?></h2><p><?php echo count($rows);?> matching page designs</p></div><a class="button" href="<?php echo esc_url($link);?>">View collection →</a></div><div class="bkbg-catalog-collection-previews"><?php foreach(array_slice($rows,0,5) as $e):?><a href="<?php echo esc_url($link);?>" aria-label="<?php echo esc_attr($e['title']);?>"><img src="<?php echo esc_url($e['thumbnail']);?>" alt="<?php echo esc_attr($e['title']);?>" loading="lazy" decoding="async"><span><?php echo esc_html($e['title']);?></span></a><?php endforeach;?></div></article><?php endforeach;?></div>
      <?php else:?><div class="bkbg-catalog-grid"><?php foreach($visible as $index=>$e):$ready=($e['status']??'')==='ready';$locked=($e['plan']??'')!=='free'&&!bkbg_library_pro_enabled();$preview=bkbg_catalog_preview_url($e);?><article class="bkbg-catalog-card"><div class="bkbg-catalog-image"><img src="<?php echo esc_url($e['thumbnail']??'');?>" alt="<?php echo esc_attr($e['title']);?>" loading="lazy" decoding="async" width="560" height="700"><span class="bkbg-catalog-plan <?php echo ($e['plan']??'')==='free'?'is-free':'';?>"><?php echo ($e['plan']??'')==='free'?'FREE':'PRO';?></span><a class="bkbg-catalog-preview-overlay" href="<?php echo esc_url($preview);?>" data-bkbg-preview data-preview-key="<?php echo esc_attr($e['key']);?>" data-preview-title="<?php echo esc_attr($e['title']);?>" aria-haspopup="dialog" aria-controls="bkbg-template-preview" aria-label="<?php echo esc_attr('Preview '.$e['title']);?>">Preview <?php echo $view==='sections'?'section':'template';?></a></div><div class="bkbg-catalog-card-body"><span class="bkbg-catalog-category"><?php echo esc_html($view==='sections'?($section_catalog['categories'][$e['category']]??ucfirst($e['category'])):ucfirst($e['category']??''));?></span><h2><?php echo esc_html($e['title']);?></h2><?php if($view==='sections'):?><p class="bkbg-section-description"><?php echo esc_html($e['description']);?></p><?php endif;?><div class="bkbg-catalog-actions"><a href="<?php echo esc_url($preview);?>" data-bkbg-preview data-preview-key="<?php echo esc_attr($e['key']);?>" data-preview-title="<?php echo esc_attr($e['title']);?>" aria-haspopup="dialog" aria-controls="bkbg-template-preview" aria-label="<?php echo esc_attr('Preview '.$e['title']);?>">Preview</a><?php if($locked):?><a class="button button-primary" href="<?php echo esc_url(apply_filters('bkbg_templates_upgrade_url','https://blockenberg.com/'));?>" target="_blank" rel="noopener">Unlock Pro ↗</a><?php elseif($view==='sections'):?><a class="button button-primary" href="<?php echo esc_url(add_query_arg(array('post_type'=>'page','bkbg_section'=>$e['key']),admin_url('post-new.php')));?>">Use section →</a><?php else:?><button type="submit" form="<?php echo esc_attr('bkbg-catalog-import-'.$index);?>" class="button button-primary" <?php disabled(!$ready);?> aria-label="<?php echo esc_attr('Import '.$e['title']);?>">Import →</button><?php endif;?></div><?php if(!$ready):?><p><?php echo esc_html(implode(' ',$e['diagnostics']??array('Unavailable')));?></p><?php endif;?></div></article><?php endforeach;?></div><?php endif;?>
      <?php if(!$total):?><div class="bkbg-catalog-empty"><h2>No matches yet</h2><p>Try another search or clear your filters.</p><a href="<?php echo esc_url($reset);?>">Reset filters</a></div><?php endif;?>
      <?php if($pages>1):?><nav class="bkbg-catalog-pagination" aria-label="Library pages"><?php echo wp_kses_post(paginate_links(array('base'=>str_replace('999999999','%#%',add_query_arg($args+array('paged'=>999999999),$base)),'format'=>'','current'=>$current,'total'=>$pages,'mid_size'=>1,'end_size'=>1)));?></nav><?php endif;?>
     </div>
    </section>
   </div>
  </form>
  <div id="bkbg-catalog-import-forms" hidden><?php if($view==='templates')foreach($visible as $index=>$e):?><form id="<?php echo esc_attr('bkbg-catalog-import-'.$index);?>" method="post" action="<?php echo esc_url(admin_url('admin-post.php'));?>"><input type="hidden" name="action" value="bkbg_import_template"><input type="hidden" name="key" value="<?php echo esc_attr($e['key']);?>"><?php wp_nonce_field('bkbg_import_template');?></form><?php endforeach;?></div>
  <dialog id="bkbg-template-preview" class="bkbg-preview" aria-modal="true" aria-labelledby="bkbg-preview-title" aria-describedby="bkbg-preview-help">
   <header class="bkbg-preview-toolbar">
    <h2 id="bkbg-preview-title">Template preview</h2>
    <div class="bkbg-preview-devices" role="group" aria-label="Preview device">
     <button type="button" data-preview-device="desktop" aria-pressed="true" aria-label="Desktop full width" title="Desktop · Full width"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8M12 16v5"/></svg></button>
     <button type="button" data-preview-device="tablet" aria-pressed="false" aria-label="Tablet 768px" title="Tablet · 768px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M11 18h2"/></svg></button>
     <button type="button" data-preview-device="mobile" aria-pressed="false" aria-label="Mobile 375px" title="Mobile · 375px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg></button>
    </div>
    <span class="bkbg-preview-size" data-preview-size aria-hidden="true">Full width</span>
    <a class="bkbg-preview-open-page" data-preview-fallback href="#" target="_blank" rel="noopener noreferrer" aria-label="Open preview in a new tab" title="Open preview in a new tab"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3h7v7M21 3l-9 9M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/></svg></a>
    <button type="button" class="bkbg-preview-close" data-preview-close aria-label="Close template preview"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
   </header>
   <p class="bkbg-preview-status" role="status" aria-live="polite"></p>
   <div class="bkbg-preview-stage" data-preview-stage>
    <div class="bkbg-preview-loading" aria-hidden="true"><span></span>Loading preview</div>
    <iframe class="bkbg-preview-frame" title="Native Blockenberg template preview" src="about:blank" width="100%" sandbox="allow-scripts allow-same-origin allow-forms" referrerpolicy="strict-origin-when-cross-origin"></iframe>
   </div>
   <p id="bkbg-preview-help" class="screen-reader-text">Scroll inside the preview. Press Escape or Close to return to the library.</p>
  </dialog>
 </div>
 <?php
}
