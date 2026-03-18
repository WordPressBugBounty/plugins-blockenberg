( function () {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.bkrc2-wrap[data-schema="1"]').forEach(function (wrap) {
      var raw = wrap.dataset.recipe;
      if (!raw) return;
      var r;
      try { r = JSON.parse(raw); } catch(e) { return; }

      var schema = {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        'name': r.name || '',
        'description': r.description || '',
        'prepTime': 'PT' + (r.prepTime || '').replace(/\D+/g,'') + 'M',
        'cookTime': 'PT' + (r.cookTime || '').replace(/\D+/g,'') + 'M',
        'totalTime': 'PT' + (r.totalTime || '').replace(/\D+/g,'') + 'M',
        'recipeYield': r.servings || '',
        'recipeCuisine': r.cuisine || '',
        'recipeCategory': r.category || '',
        'recipeIngredient': r.ingredients || [],
        'recipeInstructions': (r.steps || []).map(function(s, i) {
          return { '@type': 'HowToStep', 'text': s, 'position': i + 1 };
        }),
        'nutrition': {
          '@type': 'NutritionInformation',
          'calories': r.calories ? r.calories + ' calories' : undefined,
        },
        'aggregateRating': r.ratingCount ? {
          '@type': 'AggregateRating',
          'ratingValue': r.rating || 5,
          'reviewCount': r.ratingCount,
        } : undefined,
      };

      if (r.image) schema.image = r.image;

      // Remove undefined values
      schema = JSON.parse(JSON.stringify(schema));

      var script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
  });
}() );
