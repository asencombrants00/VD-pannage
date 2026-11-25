document.addEventListener('DOMContentLoaded',()=>{
  const year=document.getElementById('current-year');
  if(year) year.textContent=new Date().getFullYear();

  // The same sidebar toggle works on every page; the sidebar overlays the page and never shifts it.
  const toggle=document.getElementById('menu-toggle');
  if(toggle){
    const setState=()=>{
      const closed=document.body.classList.contains('nav-collapsed');
      toggle.setAttribute('aria-expanded',String(!closed));
      toggle.setAttribute('aria-label',closed?'Ouvrir la navigation':'Fermer la navigation');
      toggle.setAttribute('title',closed?'Ouvrir la navigation':'Fermer la navigation');
    };
    toggle.addEventListener('click',()=>{document.body.classList.toggle('nav-collapsed');setState();});
    setState();
  }

  const form=document.getElementById('diagnostic-form');
  if(!form)return;
  const category=document.getElementById('category');
  const appliance=document.getElementById('appliance');
  const addressWrap=document.getElementById('address-wrap');
  const address=document.getElementById('address');
  const suggestions=document.getElementById('suggestions');
  const distanceField=document.getElementById('distance-field');
  const priceField=document.getElementById('price-field');
  const devices={
    'Gros électroménager':['Lave-linge','Sèche-linge','Lave-vaisselle','Réfrigérateur','Congélateur','Four','Cuisinière','Plaque de cuisson','Hotte','Cave à vin','Autre gros électroménager'],
    'Petit électroménager':['Aspirateur','Machine à café','Robot / robot pâtissier','Bouilloire','Grille-pain','Micro-ondes','Fer à repasser','Centrale vapeur','Mixeur / blender','Friteuse','Autre petit électroménager']
  };
  const origin=[4.778,45.399]; // longitude, latitude: Saint-Maurice-l’Exil
  let chosenPlace=null, timer=null, requestId=0;

  function setHiddenPrice(value){priceField.value=value;}
  function clearEstimate(){distanceField.value='';setHiddenPrice('');chosenPlace=null;}
  function makeOption(label, place){
    const button=document.createElement('button');button.type='button';button.textContent=label;
    button.addEventListener('click',async()=>{
      address.value=label;suggestions.hidden=true;chosenPlace=place;
      if(!chosenPlace.coordinates) chosenPlace.coordinates=await geocodePlace(place.name,place.postcode);
      if(chosenPlace.coordinates) await estimateRoute(chosenPlace.coordinates);
      else {distanceField.value='Distance non calculée — à confirmer';setHiddenPrice('À confirmer — distance non calculée');}
    });
    suggestions.appendChild(button);
  }
  async function geocodePlace(name,postcode){
    try{
      const q=encodeURIComponent(`${name} ${postcode||''}`.trim());
      const response=await fetch(`https://api-adresse.data.gouv.fr/search/?q=${q}&type=municipality&limit=1`);
      const data=await response.json();const feature=(data.features||[])[0];
      if(!feature||!feature.geometry||!feature.geometry.coordinates)return null;
      return feature.geometry.coordinates;
    }catch(_){return null;}
  }
  async function estimateRoute(coords){
    const [lon,lat]=coords;
    try{
      const response=await fetch(`https://router.project-osrm.org/route/v1/driving/${origin[0]},${origin[1]};${lon},${lat}?overview=false`);
      const data=await response.json();
      if(!data.routes||!data.routes[0])throw new Error('Route unavailable');
      const km=data.routes[0].distance/1000;
      let price;
      if(km<=15)price=50;else if(km<=30)price=60;else if(km<=50)price=70;else price=null;
      distanceField.value=`${km.toFixed(1)} km (itinéraire routier estimé)`;
      setHiddenPrice(price===null?'Sur devis (plus de 50 km)':`${price} € (diagnostic + déplacement)`);
    }catch(_){
      distanceField.value='Distance non calculée — à confirmer';
      setHiddenPrice('À confirmer — calcul de distance indisponible');
    }
  }
  async function loadSuggestions(query){
    const id=++requestId;suggestions.innerHTML='';suggestions.hidden=true;
    const tasks=[];
    // Commune suggestions always include postal codes, including when the query is only a city prefix.
    tasks.push(fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,codesPostaux&format=json&boost=population`).then(r=>r.json()).then(rows=>{
      const out=[];(rows||[]).forEach(row=>(row.codesPostaux||[]).forEach(postcode=>out.push({kind:'city',name:row.nom,postcode,label:`${row.nom} (${postcode})`})));return out;
    }).catch(()=>[]));
    // Address-level results allow the customer to choose a street address when desired.
    tasks.push(fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&autocomplete=1&limit=8`).then(r=>r.json()).then(data=>{
      return (data.features||[]).map(feature=>{const p=feature.properties||{};const coords=feature.geometry&&feature.geometry.coordinates;const postcode=p.postcode||'';const city=p.city||'';const name=p.name||p.label||city;const label=p.type==='municipality'?`${name}${postcode?` (${postcode})`:''}`:[name,`${postcode} ${city}`.trim()].filter(Boolean).join(', ');return {kind:'address',name:city||name,postcode,label,coordinates:coords||null};});
    }).catch(()=>[]));
    const results=(await Promise.all(tasks)).flat();if(id!==requestId)return;
    const seen=new Set();
    results.forEach(place=>{const key=place.label.toLocaleLowerCase('fr');if(seen.has(key))return;seen.add(key);makeOption(place.label,place);});
    suggestions.hidden=suggestions.children.length===0;
  }

  category.addEventListener('change',()=>{
    appliance.innerHTML='<option value="">Sélectionnez un appareil</option>';
    (devices[category.value]||[]).forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=value;appliance.appendChild(option);});
    appliance.disabled=!category.value;
    const big=category.value==='Gros électroménager';
    addressWrap.hidden=!big;address.required=big;suggestions.hidden=true;clearEstimate();
    if(category.value==='Petit électroménager'){
      distanceField.value='Aucun déplacement — dépôt à l’atelier';
      setHiddenPrice('20 € (diagnostic petit électroménager, sans déplacement)');
    }
  });
  address.addEventListener('input',()=>{
    clearTimeout(timer);clearEstimate();const query=address.value.trim();
    if(query.length<2){suggestions.hidden=true;suggestions.innerHTML='';return;}
    timer=setTimeout(()=>loadSuggestions(query),250);
  });
  address.addEventListener('keydown',event=>{if(event.key==='Escape')suggestions.hidden=true;});
  document.addEventListener('click',event=>{if(!event.target.closest('.suggestions'))suggestions.hidden=true;});

  form.addEventListener('submit',event=>{
    if(category.value==='Petit électroménager'){
      distanceField.value='Aucun déplacement — dépôt à l’atelier';
      setHiddenPrice('20 € (diagnostic petit électroménager, sans déplacement)');
      return;
    }
    if(category.value==='Gros électroménager'){
      if(!chosenPlace){event.preventDefault();alert('Sélectionnez une adresse ou une ville dans les propositions.');address.focus();return;}
      if(!priceField.value){event.preventDefault();alert('Le calcul de distance est en cours ou indisponible. Sélectionnez à nouveau la ville, puis réessayez.');}
    }
  });
});
