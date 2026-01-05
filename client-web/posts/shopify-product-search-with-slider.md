---
title: "Shopify product search with slider"
summary: "Implement a product slider section with search functionality using vanilla JavaScript within a liquid file."
createdAt: "2023-08-17"
tags: ["shopify"]
image: '/images/posts/general/shopify.webp'
---

The completed project can be found [here](https://github.com/hahuaz/dawn/blob/main/sections/search-slide.liquid).

## Introduction 

A product slider section with search is a great way to showcase your products in a stylish and interactive manner. It consists of a search bar and a slider that displays a set of products. The slider is powered by Swiper. 

The section allows customers to search for products by typing in a product name in the search bar. The slider will then display only the products that match the search query.

## What will we build?

<video
  src="/images/posts/shopify-product-search-with-slider/2023-08-16.mp4"
  autoPlay
  loop
  muted
></video>


The Shopify documentation only covers the basics of working with [the Form tag](https://shopify.dev/themes/architecture/templates/search) and lacks technical depth. While they aim for simplicity, this results in developers having to search through theme code in their IDE rather than finding the information they need in the documentation. 

Our landing page will display a server-side rendered slider, and user inputs will dynamically update it via AJAX requests for a seamless experience.

For improved user experience, we'll implement a debounced input that instantly displays the products as soon as the user finishes typing, actually after one second, eliminating the need to hit enter.

## Prerequisites

- Having experience with [Shopify theme architecture](https://shopify.dev/themes/architecture).
- Having experience with DOM manipulation.

## Code walkthrough

I will try to explain every logical component in isolation. If you want contact source code you can found it in the provided repository at the start of the page.

### Create initial HTML content on server side

```liquid filename-search-slide
<div class="swiper-wrapper">
  <!-- Slides -->
  {% for product in collections.all.products limit: 20 %}
    <div class="swiper-slide">
      <div class="swiper__container">
        <div class="image__container">
          {{ product | image_url: width: 300 | image_tag }}
          <div class="add-cart">ADD TO CART</div>

          <div class="badge"><span>Best</span><span>Seller</span></div>
        </div>
        <div class="product__content">
          <p class="product__title">{{ product.title }}</p>
          <p class="product__price">{{ product.price | money_without_currency }} $</p>
        </div>
      </div>
    </div>
  {% endfor %}
</div>
```
- To show slide on initial load, access `collections.all.products` object on server side and loop over them.
- You can target a specific category here or stop the loop by using loop.index, which is available inside the loop.


### Create Swiper class in isolation
We can use IIFE to encapsulate scope. The purpose of an IIFE is to execute code in its own scope, which helps prevent variable collisions. It's crucial to encapsulate scope if we use the same slider section on the page multiple times.

```js filename-search-slide
(function () {
  let swiper;
  const createSwiper = () => {
    swiper = new Swiper('.{{ section.id }} .swiper', {
      slidesPerGroupAuto: true,
      breakpoints: {
        0: {
          slidesPerView: 3,
          //spaceBetween: 20,
        },
      },
      pagination: {
        el: '.{{ section.id }} .swiper-pagination',
        dynamicBullets: true,
        clickable: true,
      },
      // autoplay: {
      //  delay: 5000,
      // },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  };
  createSwiper();
  // ...
})();
```

- Pay attention to how I use `{{ section.id }}` in JavaScript to access the unique swiper element. This way I can utilize multiple Swiper sections on the same page.

### Re-initiate Swiper on Shopify editor

When a user makes changes in the Shopify editor, the DOM refreshes, which removes event listeners for Swiper and breaks its functionality, but doesn't re-execute your js files.   
To fix this, we added an event listener to the document for the `shopify.section:load` event, which re-initiates the Swiper instance between edits.

```js filename-search-slide
if (Shopify.designMode) {
  // This will only render in the theme editor
  document.addEventListener('shopify:section:load', function (event) {
    createSwiper();
  });
}
```


### Update the DOM after search 

We need to update the DOM with new products after search query is completed. But there is no re-render method on Swiper class. We need to destroy the existing instance to remove event listeners then create a new instance with brand new HTML content for every query result.

```js filename-search-slide
const sectionId = '{{ section.id }}';
const SWIPER_OUTER = document.querySelector(`.${sectionId} .swiper-outer`);
const SEARCH_EL = document.querySelector('.search__container input');

const initialSlider = SWIPER_OUTER.innerHTML;

const debouncedSearchProduct = debounce(searchProduct, 1000);

SEARCH_EL.addEventListener('input', (e) => {
  const inputValue = e.target.value.trim();
  if (!inputValue) {
    swiper.destroy(true, true);
    SWIPER_OUTER.innerHTML = initialSlider;
    createSwiper();
    return;
  }
  debouncedSearchProduct(inputValue);
});

async function searchProduct(query) {
  console.log('query for:', query);
  const response = await fetch(`/search/suggest.json?q=${query}&resources[type]=product`);
  const {
    resources: {
      results: { products },
    },
  } = await response.json();
  console.log(products);

  // don't update ui if input value is changed since start of fetch.
  if (SEARCH_EL.value.trim() !== query) {
    return console.log('Query is changed since start of fetch. Doing nothing...');
  }

  if (!products || products.length === 0) {
    swiper.destroy(true, true);
    SWIPER_OUTER.innerHTML = `<div style="text-align:center; padding: 20px; font-size:20px; color:red;">There is no product for this query.</div>`;
    return;
  }

  // recreate html of swiper
  const slideItems = products.map((product) => {
    const slideItem = `<div class="swiper-slide">
      <div class="swiper__container">
        <div class="image__container">
          <img src="${product.image}" alt="bold star" width="300" height="200">
          <div class="add-cart">ADD TO CART</div>

          <div class="badge"><span>Best</span><span>Seller</span></div>
        </div>
        <div class="product__content">
          <p class="product__title">${product.title}</p>
          <p class="product__price">${product.price} $</p>
        </div>
      </div>
    </div>`;
    return slideItem;
  });

  const newSwiperContent = `<div class="swiper">
    <div class="swiper-wrapper">
      ${slideItems}
    </div>
    <!-- If we need pagination -->
    <div class="swiper-pagination"></div>

    <!-- If we need navigation buttons -->
    <div class="swiper-button-prev"></div>
    <div class="swiper-button-next"></div>

    <!-- If we need scrollbar -->
    <div class="swiper-scrollbar"></div>
  </div>`;

  SWIPER_OUTER.innerHTML = newSwiperContent;
  swiper.destroy(true, true);
  createSwiper();
```

### How to bounce search AJAX requests while the user is typing?

```js filename-search-slide
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}
```
- The debounce function is a utility function that helps limit the frequency of function calls. It is often used when working with events that can fire rapidly, such as scroll, resize, or input events, and you want to prevent expensive or slow functions from being executed too frequently.


### Load dependencies when section is used in a page

```liquid filename-search-slide
{{ 'swiper-bundle.min.css' | asset_url | stylesheet_tag }}
{{ 'swiper-bundle.min.js' | asset_url | script_tag }}

{{ 'search-slide.css' | asset_url | stylesheet_tag }}
```

- Install Swiper bundles from [here](https://www.jsdelivr.com/package/npm/swiper) and add them to your assets folder in your theme.
- The `script_tag` filter is parser blocking. It will block the DOM rendering untill dependencies (the Swiper class) are fully loaded. This make sures we can reference them without a problem on subsequent scripts.
- The `search-slide.css` content can be found in the provided repository. I won't include in the blog post to prevent code pollution.

### Liquid schema settings

To locate the section in the Shopify code editor, add the preset name to the Liquid schema.

```liquid filename-search-slide
{% schema %}
{
  "name": "search-slide",
  "presets": [
    {
      "name": "search-slide"
    }
  ]
}
{% endschema %}

```

