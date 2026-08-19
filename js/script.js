/* ============================================================
   WORKNEST - Premium JavaScript v2.0
   Advanced Features: Custom cursor, scroll progress,
   particle effects, smooth scroll, throttle/debounce,
   keyboard navigation, reduced motion, IntersectionObserver
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     UTILITIES — Throttle, Debounce, prefersReducedMotion
     ---------------------------------------------------------- */
  function throttle(fn, wait) {
    var lastTime = 0;
    return function () {
      var now = Date.now();
      if (now - lastTime >= wait) {
        lastTime = now;
        fn.apply(this, arguments);
      }
    };
  }

  function debounce(fn, delay) {
    var timer;
    return function () {
      var args = arguments;
      var ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
    };
  }

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     1. LOADER
     ---------------------------------------------------------- */
  window.addEventListener("load", function () {
    setTimeout(function () {
      var loader = document.getElementById("loader");
      if (loader) {
        loader.classList.add("hidden");
        setTimeout(function () { loader.remove(); }, 600);
      }
    }, 1500);
  });

  /* ----------------------------------------------------------
     2. AOS INIT
     ---------------------------------------------------------- */
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: prefersReducedMotion ? 0 : 1200,
      once: true,
      offset: 80,
      easing: "ease-out-cubic",
    });
  }

  /* ----------------------------------------------------------
     3. TYPED.JS
     ---------------------------------------------------------- */
  if (document.getElementById("typed") && typeof Typed !== "undefined") {
    new Typed("#typed", {
      strings: [
        "Hot Desks",
        "Private Offices",
        "Meeting Rooms",
        "Virtual Offices",
        "Conference Spaces",
      ],
      typeSpeed: 50,
      backSpeed: 35,
      backDelay: 2000,
      loop: true,
      showCursor: true,
      cursorChar: "|",
    });
  }

  /* ----------------------------------------------------------
     4. NAVBAR SCROLL — with CSS variable for scroll progress
     ---------------------------------------------------------- */
  var navbar = document.querySelector(".custom-navbar");

  var handleScroll = throttle(function () {
    var scrollY = window.scrollY;

    /* Navbar */
    if (navbar) {
      if (scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }

    /* Back to top */
    var backToTop = document.getElementById("backToTop");
    if (backToTop) {
      if (scrollY > 400) {
        backToTop.classList.add("show");
      } else {
        backToTop.classList.remove("show");
      }
    }

    /* Scroll progress */
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? scrollY / docHeight : 0;
    document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));

    /* Scroll progress bar */
    var progressBar = document.querySelector(".scroll-progress");
    if (progressBar) {
      progressBar.style.width = (progress * 100) + "%";
    }

    /* Active nav link */
    setActiveNavLink();
  }, 16);

  window.addEventListener("scroll", handleScroll, { passive: true });

  /* ----------------------------------------------------------
     5. BACK TO TOP
     ---------------------------------------------------------- */
  var backToTopBtn = document.getElementById("backToTop");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ----------------------------------------------------------
     6. ACTIVE NAV LINK
     ---------------------------------------------------------- */
  function setActiveNavLink() {
    var sections = document.querySelectorAll("section[id]");
    var scrollPos = window.scrollY + 120;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute("id");

      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll(".nav-link").forEach(function (link) {
          link.classList.remove("active");
          if (link.getAttribute("href") === "#" + id) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  /* ----------------------------------------------------------
     7. SMOOTH SCROLL
     ---------------------------------------------------------- */
  document.querySelectorAll('.nav-link[href^="#"], a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var targetId = this.getAttribute("href");
      if (targetId === "#") return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }

      /* Close mobile nav */
      var navbarCollapse = document.querySelector(".navbar-collapse.show");
      if (navbarCollapse) {
        if (typeof bootstrap !== "undefined") {
          var bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
          if (bsCollapse) bsCollapse.hide();
        } else {
          navbarCollapse.classList.remove("show");
        }
      }
    });
  });

  /* ----------------------------------------------------------
     8. COUNTER ANIMATION — IntersectionObserver
     ---------------------------------------------------------- */
  function animateCounter(el) {
    var text = el.textContent.trim();
    var hasPlus = text.includes("+");
    var hasK = text.includes("K");
    var numberStr = text.replace(/[^0-9]/g, "");
    var target = parseInt(numberStr, 10);
    if (isNaN(target)) return;

    var duration = prefersReducedMotion ? 0 : 2000;
    var startTime = null;

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutExpo(progress);
      var current = Math.floor(eased * target);
      var suffix = (hasPlus ? "+" : "") + (hasK ? "K" : "");
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    if (duration === 0) {
      el.textContent = target + (hasPlus ? "+" : "") + (hasK ? "K" : "");
    } else {
      requestAnimationFrame(step);
    }
  }

  if ("IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll(".stat-box h3, .stat-number").forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  /* ----------------------------------------------------------
     9. MAGNETIC BUTTON EFFECT
     ---------------------------------------------------------- */
  if (!prefersReducedMotion) {
    document.querySelectorAll(".custom-btn, .btn-outline-glass").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;
        var dx = e.clientX - centerX;
        var dy = e.clientY - centerY;
        btn.style.transform = "translate(" + dx * 0.15 + "px, " + dy * 0.15 + "px)";
      });

      btn.addEventListener("mouseleave", function () {
        btn.style.transition = "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
        btn.style.transform = "translate(0, 0)";
        setTimeout(function () { btn.style.transition = ""; }, 300);
      });
    });
  }

  /* ----------------------------------------------------------
     10. CARD TILT EFFECT
     ---------------------------------------------------------- */
  if (!prefersReducedMotion) {
    var tiltCards = document.querySelectorAll(
      ".property-card, .service-card, .space-type-card, .why-card, .testimonial-card"
    );

    tiltCards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = ((y - centerY) / centerY) * -5;
        var rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform =
          "perspective(1000px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-4px)";
        card.style.transition = "transform 0.1s ease";
      });

      card.addEventListener("mouseleave", function () {
        card.style.transition = "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
      });
    });
  }

  /* ----------------------------------------------------------
     11. PROPERTY FILTER — properties page
     ---------------------------------------------------------- */
  var filterButtons = document.querySelectorAll(".filter-btn");

  if (filterButtons.length > 0) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");

        var filter = btn.getAttribute("data-type") || btn.getAttribute("data-filter");
        var cards = document.querySelectorAll(".property-card");
        var visibleCount = 0;

        cards.forEach(function (card, index) {
          var type = card.getAttribute("data-type");
          var shouldShow = filter === "all" || type === filter;

          if (shouldShow) {
            card.style.display = "";
            card.style.animation = prefersReducedMotion
              ? "none"
              : "fadeIn 0.5s ease " + (index * 0.05) + "s forwards";
            visibleCount++;
          } else {
            card.style.display = "none";
          }
        });

        /* Update result count */
        var resultCount = document.getElementById("resultCount");
        if (resultCount) resultCount.textContent = visibleCount;

        /* Toggle no results */
        var noResults = document.getElementById("noResults");
        if (noResults) {
          if (visibleCount === 0) {
            noResults.classList.add("visible");
          } else {
            noResults.classList.remove("visible");
          }
        }
      });
    });
  }

  /* ----------------------------------------------------------
     12. CITY FILTER + SORT — properties page
     ---------------------------------------------------------- */
  var sortFilter = document.getElementById("sortFilter");
  var cityFilter = document.getElementById("cityFilter");

  function applyFilters() {
    var typeBtn = document.querySelector(".filter-btn.active");
    var typeFilter = typeBtn ? (typeBtn.getAttribute("data-type") || "all") : "all";
    var cityVal = cityFilter ? cityFilter.value : "all";
    var sortVal = sortFilter ? sortFilter.value : "popular";
    var cards = Array.from(document.querySelectorAll(".property-card"));
    var visibleCount = 0;

    cards.forEach(function (card) {
      var type = card.getAttribute("data-type");
      var city = card.getAttribute("data-city");
      var typeMatch = typeFilter === "all" || type === typeFilter;
      var cityMatch = cityVal === "all" || city === cityVal;

      if (typeMatch && cityMatch) {
        card.style.display = "";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    /* Sort visible cards */
    var visibleCards = cards.filter(function (c) { return c.style.display !== "none"; });
    if (sortVal === "price-low") {
      visibleCards.sort(function (a, b) { return parseInt(a.dataset.price) - parseInt(b.dataset.price); });
    } else if (sortVal === "price-high") {
      visibleCards.sort(function (a, b) { return parseInt(b.dataset.price) - parseInt(a.dataset.price); });
    }

    var grid = document.getElementById("propertiesGrid");
    if (grid) {
      visibleCards.forEach(function (card) { grid.appendChild(card); });
    }

    var resultCount = document.getElementById("resultCount");
    if (resultCount) resultCount.textContent = visibleCount;

    var noResults = document.getElementById("noResults");
    if (noResults) {
      noResults.classList.toggle("visible", visibleCount === 0);
    }
  }

  if (sortFilter) sortFilter.addEventListener("change", applyFilters);
  if (cityFilter) cityFilter.addEventListener("change", applyFilters);

  /* ----------------------------------------------------------
     13. CONTACT FORM — with real-time validation
     ---------------------------------------------------------- */
  var contactForm = document.getElementById("contactForm");

  if (contactForm) {
    /* Real-time validation */
    contactForm.querySelectorAll(".form-input").forEach(function (field) {
      field.addEventListener("input", function () {
        field.classList.remove("error", "success");
        if (field.hasAttribute("required") && !field.value.trim()) {
          field.classList.add("error");
        } else if (field.value.trim()) {
          field.classList.add("success");
        }
      });

      field.addEventListener("blur", function () {
        if (field.type === "email" && field.value.trim()) {
          var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          field.classList.toggle("error", !emailRegex.test(field.value.trim()));
          field.classList.toggle("success", emailRegex.test(field.value.trim()));
        }
      });
    });

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var isValid = true;
      var fields = contactForm.querySelectorAll(".form-input");

      fields.forEach(function (field) {
        field.classList.remove("error", "success");
        if (field.hasAttribute("required") && !field.value.trim()) {
          field.classList.add("error");
          isValid = false;
        } else if (field.value.trim()) {
          field.classList.add("success");
        }
      });

      var emailField = contactForm.querySelector('input[type="email"]');
      if (emailField && emailField.value.trim()) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value.trim())) {
          emailField.classList.remove("success");
          emailField.classList.add("error");
          isValid = false;
        }
      }

      if (!isValid) return;

      /* Show toast */
      var toast = document.getElementById("toastNotification");
      if (toast) {
        toast.classList.add("show");
        setTimeout(function () { toast.classList.remove("show"); }, 4000);
      }

      contactForm.reset();
      fields.forEach(function (field) { field.classList.remove("error", "success"); });
    });
  }

  /* ----------------------------------------------------------
     14. RIPPLE EFFECT
     ---------------------------------------------------------- */
  document.querySelectorAll(".custom-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      var rect = btn.getBoundingClientRect();
      var ripple = document.createElement("span");
      var size = Math.max(rect.width, rect.height);

      ripple.classList.add("ripple");
      ripple.style.cssText =
        "position:absolute;border-radius:50%;background:rgba(255,255,255,0.4);pointer-events:none;width:" +
        size + "px;height:" + size + "px;left:" +
        (e.clientX - rect.left - size / 2) + "px;top:" +
        (e.clientY - rect.top - size / 2) + "px;transform:scale(0);animation:rippleAnim 0.7s ease-out forwards;";

      btn.appendChild(ripple);
      setTimeout(function () { ripple.remove(); }, 700);
    });
  });

  /* ----------------------------------------------------------
     15. PARALLAX SHAPES
     ---------------------------------------------------------- */
  if (!prefersReducedMotion) {
    var heroShapes = document.querySelectorAll(".hero-shape");
    var parallaxSpeeds = [0.1, 0.15, 0.08];

    window.addEventListener("scroll", throttle(function () {
      var scrollY = window.scrollY;
      heroShapes.forEach(function (shape, index) {
        var speed = parallaxSpeeds[index % parallaxSpeeds.length];
        shape.style.transform = "translateY(" + scrollY * speed + "px)";
      });
    }, 16), { passive: true });
  }

  /* ----------------------------------------------------------
     16. SCROLL REVEAL — IntersectionObserver
     ---------------------------------------------------------- */
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children"
    ).forEach(function (el) {
      revealObserver.observe(el);
    });

    /* Auto-reveal sections */
    document.querySelectorAll("section").forEach(function (section) {
      section.style.opacity = "0";
      section.style.transform = "translateY(30px)";
      section.style.transition = "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)";

      var sectionObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.style.opacity = "1";
              entry.target.style.transform = "translateY(0)";
              sectionObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05 }
      );
      sectionObserver.observe(section);
    });
  }

  /* ----------------------------------------------------------
     17. SEARCH FILTER — properties page
     ---------------------------------------------------------- */
  var searchInput = document.getElementById("searchInput");
  var searchBtn = document.getElementById("searchBtn");

  function doSearch() {
    if (!searchInput) return;
    var query = searchInput.value.toLowerCase().trim();
    var cards = document.querySelectorAll(".property-card");
    var visibleCount = 0;

    cards.forEach(function (card) {
      var title = card.querySelector("h3, h4");
      var location = card.querySelector(".location, .property-location");
      var features = card.querySelector(".features, .property-features");

      var searchText = [
        title ? title.textContent : "",
        location ? location.textContent : "",
        features ? features.textContent : "",
      ].join(" ").toLowerCase();

      if (!query || searchText.includes(query)) {
        card.style.display = "";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    var resultCount = document.getElementById("resultCount");
    if (resultCount) resultCount.textContent = visibleCount;

    var noResults = document.getElementById("noResults");
    if (noResults) noResults.classList.toggle("visible", visibleCount === 0);
  }

  if (searchInput) {
    searchInput.addEventListener("input", debounce(doSearch, 300));
  }
  if (searchBtn) {
    searchBtn.addEventListener("click", doSearch);
  }

  /* ----------------------------------------------------------
     18. IMAGE LAZY LOAD — IntersectionObserver
     ---------------------------------------------------------- */
  if ("IntersectionObserver" in window) {
    var lazyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
            }
            img.classList.add("loaded");
            lazyObserver.unobserve(img);
          }
        });
      },
      { rootMargin: "200px" }
    );

    document.querySelectorAll("img[data-src], img[loading='lazy']").forEach(function (img) {
      lazyObserver.observe(img);
    });
  }

  /* ----------------------------------------------------------
     19. CUSTOM CURSOR — uses HTML elements if present
     ---------------------------------------------------------- */
  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    var cursor = document.getElementById("customCursor");
    var cursorOutline = document.getElementById("customCursorOutline");

    /* Fallback: create elements if not in HTML */
    if (!cursor) {
      cursor = document.createElement("div");
      cursor.classList.add("custom-cursor");
      document.body.appendChild(cursor);
    }
    if (!cursorOutline) {
      cursorOutline = document.createElement("div");
      cursorOutline.classList.add("custom-cursor-outline");
      document.body.appendChild(cursorOutline);
    }

    var cursorX = 0, cursorY = 0;
    var outlineX = 0, outlineY = 0;

    document.addEventListener("mousemove", function (e) {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursor.style.left = cursorX + "px";
      cursor.style.top = cursorY + "px";
    });

    function updateCursorOutline() {
      outlineX += (cursorX - outlineX) * 0.15;
      outlineY += (cursorY - outlineY) * 0.15;
      cursorOutline.style.left = outlineX + "px";
      cursorOutline.style.top = outlineY + "px";
      requestAnimationFrame(updateCursorOutline);
    }
    requestAnimationFrame(updateCursorOutline);

    /* Hover states for interactive elements */
    document.querySelectorAll("a, button, .property-card, .filter-btn, .accordion-button, input, textarea, select").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        cursor.classList.add("hovering");
        cursorOutline.classList.add("hovering");
      });
      el.addEventListener("mouseleave", function () {
        cursor.classList.remove("hovering");
        cursorOutline.classList.remove("hovering");
      });
    });

    /* Hide default cursor */
    var cursorStyle = document.createElement("style");
    cursorStyle.textContent = "*, *::before, *::after { cursor: none !important; } @media (pointer: coarse) { *, *::before, *::after { cursor: auto !important; } }";
    document.head.appendChild(cursorStyle);
  } else {
    /* Remove cursor elements on touch devices / reduced motion */
    var c1 = document.getElementById("customCursor");
    var c2 = document.getElementById("customCursorOutline");
    if (c1) c1.style.display = "none";
    if (c2) c2.style.display = "none";
  }

  /* ----------------------------------------------------------
     19b. HERO MOUSE GLOW — Follows cursor in hero section
     ---------------------------------------------------------- */
  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    var heroMouseGlow = document.querySelector(".hero-mouse-glow");
    var heroSection = document.querySelector(".hero-section");

    if (heroMouseGlow && heroSection) {
      heroSection.addEventListener("mousemove", function (e) {
        var rect = heroSection.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        heroMouseGlow.style.left = x + "px";
        heroMouseGlow.style.top = y + "px";
        heroMouseGlow.style.opacity = "1";
      });

      heroSection.addEventListener("mouseleave", function () {
        heroMouseGlow.style.opacity = "0";
      });
    }
  }

  /* ----------------------------------------------------------
     20. PARTICLE EFFECTS — Hero section
     ---------------------------------------------------------- */
  if (!prefersReducedMotion && document.querySelector(".hero-section")) {
    var canvas = document.getElementById("particleCanvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.classList.add("particles-canvas");
      var heroSection = document.querySelector(".hero-section");
      heroSection.insertBefore(canvas, heroSection.firstChild);
    } else {
      canvas.classList.add("particles-canvas");
      var heroSection = document.querySelector(".hero-section");
      if (heroSection && canvas.parentElement !== heroSection) {
        heroSection.insertBefore(canvas, heroSection.firstChild);
      }
    }

    var ctx = canvas.getContext("2d");
    var particles = [];
    var particleCount = 40;

    function resizeCanvas() {
      canvas.width = heroSection.offsetWidth;
      canvas.height = heroSection.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", debounce(resizeCanvas, 200));

    function Particle() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 1;
      this.opacity = Math.random() * 0.3 + 0.1;
    }

    for (var i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, " + p.opacity + ")";
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      /* Draw connections */
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = "rgba(16, 185, 129, " + (0.08 * (1 - dist / 120)) + ")";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  /* ----------------------------------------------------------
     21. KEYBOARD NAVIGATION
     ---------------------------------------------------------- */
  document.addEventListener("keydown", function (e) {
    /* Escape closes mobile nav */
    if (e.key === "Escape") {
      var openCollapse = document.querySelector(".navbar-collapse.show");
      if (openCollapse) {
        if (typeof bootstrap !== "undefined") {
          var bsCollapse = bootstrap.Collapse.getInstance(openCollapse);
          if (bsCollapse) bsCollapse.hide();
        } else {
          openCollapse.classList.remove("show");
        }
      }
    }
  });

  /* ----------------------------------------------------------
     22. MOBILE NAV CLOSE on link click
     ---------------------------------------------------------- */
  document.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      var collapse = document.querySelector(".navbar-collapse.show");
      if (collapse && typeof bootstrap !== "undefined") {
        var bsCollapse = bootstrap.Collapse.getInstance(collapse);
        if (bsCollapse) bsCollapse.hide();
        else collapse.classList.remove("show");
      }
    });
  });

  /* ----------------------------------------------------------
     23. IMAGE ERROR FALLBACK
     ---------------------------------------------------------- */
  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () {
      img.style.display = "none";
    });
  });

  /* ----------------------------------------------------------
     24. SMOOTH SECTION REVEAL on page load
     ---------------------------------------------------------- */
  window.addEventListener("load", function () {
    document.body.classList.add("page-loaded");
  });

  /* ----------------------------------------------------------
     26. CONSOLE BRANDING
     ---------------------------------------------------------- */
  console.log(
    "%c WORKNEST v3.0 ",
    "background: linear-gradient(135deg, #10b981 0%, #34d399 100%); color: #fff; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 6px;"
  );
  console.log(
    "%c Premium Co-Working & Real Estate Website ",
    "color: #10b981; font-size: 12px; font-style: italic;"
  );
})();
