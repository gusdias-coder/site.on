      (function () {
        "use strict";

        /* ========================================================
     REDUCED MOTION
     ======================================================== */

        var reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        /* ========================================================
     MOBILE STATE
     ======================================================== */

        var mobileQuery = window.matchMedia("(max-width:1040px)");

        var isMobile = mobileQuery.matches;

        if (mobileQuery.addEventListener) {
          mobileQuery.addEventListener("change", function (e) {
            isMobile = e.matches;
          });
        }

        /* ========================================================
     TEXT DECODE (efeito de "resolver" texto, tipo URL
     carregando — usado uma única vez na barra do navegador
     do mockup do hero)
     ======================================================== */

        var DECODE_CHARS =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        function decodeText(el, duration) {
          if (!el) {
            return;
          }

          var finalText = el.textContent.trim();

          var startTime = null;

          el.classList.add("decoding");

          function tick(now) {
            if (startTime === null) {
              startTime = now;
            }

            var progress = Math.min(1, (now - startTime) / duration);

            var revealCount = Math.floor(progress * finalText.length);

            var out = "";

            for (var i = 0; i < finalText.length; i++) {
              if (i < revealCount || finalText[i] === " ") {
                out += finalText[i];
              } else {
                out +=
                  DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
              }
            }

            el.textContent = out;

            if (progress < 1) {
              requestAnimationFrame(tick);
            } else {
              el.textContent = finalText;

              el.classList.remove("decoding");
            }
          }

          requestAnimationFrame(tick);
        }

        /* ========================================================
     HERO ENTRANCE
     ======================================================== */

        function armEntrance() {
          if (reduced) {
            return;
          }

          document.documentElement.classList.add("anim");

          var started = false;

          var bootTimer = setTimeout(start, 900);

          function start() {
            if (started) {
              return;
            }

            started = true;

            clearTimeout(bootTimer);

            document.addEventListener("animationend", onEnd, true);

            setTimeout(clean, 2600);

            document.documentElement.classList.add("go");

            var urlBar = document.getElementById("heroUrlBar");

            if (urlBar) {
              setTimeout(function () {
                decodeText(urlBar, 900);
              }, 950);
            }
          }

          function onEnd(e) {
            if (
              e.animationName === "softIn" &&
              e.target.closest &&
              e.target.closest(".hero .ctas")
            ) {
              clean();
            }
          }

          function clean() {
            document.removeEventListener("animationend", onEnd, true);

            document.documentElement.classList.remove("anim", "go");
          }

          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(start, start);
          } else {
            start();
          }
        }

        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", armEntrance);
        } else {
          armEntrance();
        }

        /* ========================================================
     SCROLL PROGRESS
     ======================================================== */

        var progress = document.querySelector(".scroll-progress");

        function updateProgress() {
          var height =
            document.documentElement.scrollHeight - window.innerHeight;

          if (!progress) {
            return;
          }

          progress.style.width =
            height > 0 ? (window.scrollY / height) * 100 + "%" : "0";
        }

        /* ========================================================
     HEADER
     ======================================================== */

        var header = document.getElementById("siteHeader");

        var lastY = window.scrollY;

        function onScroll() {
          var y = window.scrollY;

          if (!header) {
            return;
          }

          header.classList.toggle("scrolled", y > 12);

          if (y > 200) {
            header.classList.toggle("hidden", y > lastY);
          } else {
            header.classList.remove("hidden");
          }

          lastY = y;
        }

        var scrollTicking = false;

        function onScrollFrame() {
          updateProgress();
          onScroll();

          scrollTicking = false;
        }

        function requestScrollFrame() {
          if (!scrollTicking) {
            requestAnimationFrame(onScrollFrame);

            scrollTicking = true;
          }
        }

        document.addEventListener("scroll", requestScrollFrame, {
          passive: true,
        });

        onScrollFrame();

        /* ========================================================
     MOBILE MENU
     ======================================================== */

        var burger = document.getElementById("burger");

        var menu = document.getElementById("mobileMenu");

        var overlay = document.getElementById("menuOverlay");

        function setMenu(open) {
          if (!menu || !burger) {
            return;
          }

          menu.classList.toggle("open", open);

          burger.classList.toggle("open", open);

          document.body.classList.toggle("menu-open", open);

          burger.setAttribute("aria-expanded", open ? "true" : "false");

          burger.setAttribute(
            "aria-label",
            open ? "Fechar menu" : "Abrir menu",
          );

          if (overlay) {
            overlay.setAttribute("aria-hidden", open ? "false" : "true");
          }
        }

        if (burger) {
          burger.addEventListener("click", function (e) {
            e.stopPropagation();

            setMenu(!menu.classList.contains("open"));
          });
        }

        if (overlay) {
          overlay.addEventListener("click", function () {
            setMenu(false);
          });
        }

        if (menu) {
          menu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
              setMenu(false);
            });
          });
        }

        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape" && menu && menu.classList.contains("open")) {
            setMenu(false);

            if (burger) {
              burger.focus();
            }
          }
        });

        /* ========================================================
     TEMA CLARO / ESCURO (com persistência)
     ======================================================== */

        function setTheme(theme) {
          document.documentElement.setAttribute("data-theme", theme);

          try {
            localStorage.setItem("siteon-theme", theme);
          } catch (err) {
            /* armazenamento indisponível: segue sem persistir */
          }

          var metaTheme = document.querySelector('meta[name="theme-color"]');

          if (metaTheme) {
            metaTheme.setAttribute(
              "content",
              theme === "light" ? "#f3f5fa" : "#07070B",
            );
          }
        }

        var savedTheme = null;

        try {
          savedTheme = localStorage.getItem("siteon-theme");
        } catch (err) {
          savedTheme = null;
        }

        setTheme(savedTheme === "light" ? "light" : "dark");

        document
          .querySelectorAll("[data-theme-toggle]")
          .forEach(function (btn) {
            btn.addEventListener("click", function () {
              var current =
                document.documentElement.getAttribute("data-theme");

              setTheme(current === "light" ? "dark" : "light");
            });
          });

        /* ========================================================
     PORTFÓLIO
     ======================================================== */

        var PROJECTS = [
          {
            nome: "Brechó da Sassá",
            cat: "ecommerce",
            categoria: "E-commerce",
            descricao:
              "Brechó vintage com catálogo, coleções e atendimento direto pelo WhatsApp.",
            imagem: "img/imagem.brecho.jpeg",
            tecnologias: ["HTML5", "CSS3", "JavaScript"],
            url: "https://gusdias-coder.github.io/brech-da-sassa/",
          },

          {
            nome: "Donuts Loverss",
            cat: "gastronomia",
            categoria: "Gastronomia",
            descricao:
              "Doceria artesanal de mini donuts e doces gourmet com encomendas pelo WhatsApp.",
            imagem: "img/imagem.donutsL.jpeg",
            tecnologias: ["HTML5", "CSS3", "JavaScript"],
            url: "https://gusdias-coder.github.io/donutsLovers/",
          },

          {
            nome: "Desafio 60 Max",
            cat: "profissionais",
            categoria: "Profissionais",
            descricao:
              "Landing page para programa de treino individualizado com captação de alunos.",
            imagem: "img/imagem.max.jpeg",
            tecnologias: ["HTML5", "CSS3", "JavaScript"],
            url: "https://gusdias-coder.github.io/CoachMax/",
          },
        ];

        function renderProjects() {
          var grid = document.getElementById("portGrid");

          if (!grid) {
            return;
          }

          grid.innerHTML = PROJECTS.map(function (p) {
            var tags = p.tecnologias
              .map(function (t) {
                return "<span>" + t + "</span>";
              })
              .join("");

            var thumb =
              '<div class="port-thumb">' +
              "<img " +
              'src="' +
              p.imagem +
              '" ' +
              'alt="Screenshot da homepage do site ' +
              p.nome +
              '" ' +
              'loading="lazy" ' +
              'decoding="async" ' +
              'onerror="' +
              "this.style.display='none';" +
              "this.parentNode.querySelector('.port-fallback').style.display='grid';" +
              '">' +
              '<div class="port-fallback">' +
              "<div>" +
              "<b>" +
              p.nome +
              "</b>" +
              "Imagem em breve" +
              "</div>" +
              "</div>" +
              (p.url
                ? '<span class="port-view">Visualizar projeto ↗</span>' +
                  '<span class="port-cursor-chip">Ver projeto ↗</span>'
                : "") +
              "</div>";

            var cta = p.url
              ? '<span class="ver">' +
                "Ver projeto " +
                '<span class="ver-arrow">→</span>' +
                "</span>"
              : '<span class="ver is-disabled">' + "URL em breve" + "</span>";

            var body =
              '<div class="port-body">' +
              '<span class="seg">' +
              p.categoria +
              "</span>" +
              "<h3>" +
              p.nome +
              "</h3>" +
              "<p>" +
              p.descricao +
              "</p>" +
              '<div class="tech">' +
              tags +
              "</div>" +
              cta +
              "</div>";

            if (p.url) {
              return (
                "<a " +
                'class="port-card reveal" ' +
                'data-cat="' +
                p.cat +
                '" ' +
                "data-tilt " +
                'href="' +
                p.url +
                '" ' +
                'target="_blank" ' +
                'rel="noopener noreferrer" ' +
                'aria-label="Abrir o site ' +
                p.nome +
                ' em nova aba">' +
                thumb +
                body +
                "</a>"
              );
            }

            return (
              "<article " +
              'class="port-card reveal" ' +
              'data-cat="' +
              p.cat +
              '" ' +
              "data-tilt>" +
              thumb +
              body +
              "</article>"
            );
          }).join("");
        }

        renderProjects();

        /* ========================================================
     PORTFOLIO CURSOR CHIP
     ======================================================== */

        if (!reduced && !isMobile) {
          document.querySelectorAll(".port-card").forEach(function (card) {
            var chip = card.querySelector(".port-cursor-chip");

            if (!chip) {
              return;
            }

            card.addEventListener("mousemove", function (e) {
              var rect = card.getBoundingClientRect();

              chip.style.left = e.clientX - rect.left + "px";

              chip.style.top = e.clientY - rect.top + "px";
            });
          });
        }

        /* ========================================================
     REVEAL
     ======================================================== */

        var revealItems = document.querySelectorAll(".reveal,.t-row,.rline");

        if (reduced || !("IntersectionObserver" in window)) {
          revealItems.forEach(function (el) {
            el.classList.add("in");
          });
        } else {
          var io = new IntersectionObserver(
            function (entries) {
              entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                  entry.target.classList.add("in");

                  io.unobserve(entry.target);
                }
              });
            },
            {
              threshold: 0.2,
              rootMargin: "0px 0px -60px 0px",
            },
          );

          revealItems.forEach(function (el) {
            io.observe(el);
          });
        }

        /* ========================================================
     PORTFOLIO FILTER
     ======================================================== */

        var filterButtons = document.querySelectorAll(".filter-btn");

        var portCards = document.querySelectorAll(".port-card");

        var portEmpty = document.getElementById("portEmpty");

        filterButtons.forEach(function (button) {
          button.addEventListener("click", function () {
            filterButtons.forEach(function (btn) {
              btn.classList.remove("active");
            });

            button.classList.add("active");

            var filter = button.getAttribute("data-filter");

            var visible = 0;

            portCards.forEach(function (card) {
              var show =
                filter === "all" || card.getAttribute("data-cat") === filter;

              card.style.display = show ? "" : "none";

              if (show) {
                visible++;
              }
            });

            if (portEmpty) {
              portEmpty.hidden = visible > 0;
            }
          });
        });

        /* ========================================================
     FAQ
     ======================================================== */

        var faqs = document.querySelectorAll(".faq-item");

        faqs.forEach(function (item) {
          item.addEventListener("toggle", function () {
            if (item.open) {
              faqs.forEach(function (other) {
                if (other !== item) {
                  other.open = false;
                }
              });
            }
          });
        });

        /* ========================================================
     DOTS
     ======================================================== */

        var field = document.getElementById("dotsField");

        if (field && !reduced) {
          for (var i = 0; i < 22; i++) {
            var dot = document.createElement("span");

            dot.className = "dot";

            dot.style.left = Math.random() * 100 + "%";

            dot.style.top = Math.random() * 70 + "%";

            dot.style.animationDelay = Math.random() * 6 + "s";

            dot.style.animationDuration = 10 + Math.random() * 8 + "s";

            field.appendChild(dot);
          }
        }

        /* ========================================================
     YEAR
     ======================================================== */

        var year = document.getElementById("year");

        if (year) {
          year.textContent = new Date().getFullYear();
        }

        /* ========================================================
     BUTTON RIPPLE
     ======================================================== */

        if (!reduced) {
          document.querySelectorAll(".btn").forEach(function (btn) {
            btn.addEventListener("click", function (e) {
              var ripple = document.createElement("span");

              ripple.className = "ripple-el";

              var rect = btn.getBoundingClientRect();

              var size = Math.max(rect.width, rect.height);

              ripple.style.width = size + "px";

              ripple.style.height = size + "px";

              ripple.style.left = e.clientX - rect.left - size / 2 + "px";

              ripple.style.top = e.clientY - rect.top - size / 2 + "px";

              btn.appendChild(ripple);

              ripple.addEventListener("animationend", function () {
                ripple.remove();
              });
            });
          });
        }

        /* ========================================================
     MAGNETIC BUTTONS
     (os CTAs mais importantes reagem sutilmente à posição
     do cursor, como se fossem atraídos por ele)
     ======================================================== */

        if (!reduced && !isMobile) {
          document.querySelectorAll(".magnetic").forEach(function (el) {
            var strength = el.classList.contains("wa-float") ? 0.25 : 0.35;

            el.addEventListener("mousemove", function (e) {
              var rect = el.getBoundingClientRect();

              var x = (e.clientX - rect.left - rect.width / 2) * strength;

              var y = (e.clientY - rect.top - rect.height / 2) * strength;

              el.style.translate = x + "px " + y + "px";
            });

            el.addEventListener("mouseleave", function () {
              el.style.translate = "0 0";
            });
          });
        }

        /* ========================================================
     CUSTOM CURSOR
     ======================================================== */

        if (!reduced && !isMobile) {
          var cursorDot = document.querySelector(".cursor-dot");

          var cursorRing = document.querySelector(".cursor-ring");

          var spotlight = document.querySelector(".spotlight");

          var mx = 0;
          var my = 0;

          var rx = 0;
          var ry = 0;

          var spotlightArmed = false;

          /* --- paralaxe do hero: elementos com data-depth --- */

          var parallaxEls = Array.prototype.map.call(
            document.querySelectorAll("[data-depth]"),
            function (el) {
              return {
                el: el,
                depth: parseFloat(el.getAttribute("data-depth")) || 0,
              };
            },
          );

          var heroVisual = document.querySelector(".hero-visual");

          var heroRect = null;

          function measureHero() {
            heroRect = heroVisual ? heroVisual.getBoundingClientRect() : null;
          }

          measureHero();

          window.addEventListener("resize", measureHero);

          document.addEventListener("mousemove", function (e) {
            mx = e.clientX;
            my = e.clientY;

            if (spotlight && !spotlightArmed) {
              spotlight.classList.add("active");

              spotlightArmed = true;
            }
          });

          (function cursorLoop() {
            rx += (mx - rx) * 0.15;

            ry += (my - ry) * 0.15;

            if (cursorDot) {
              cursorDot.style.left = mx + "px";

              cursorDot.style.top = my + "px";
            }

            if (cursorRing) {
              cursorRing.style.left = rx + "px";

              cursorRing.style.top = ry + "px";
            }

            if (spotlight) {
              spotlight.style.setProperty("--sx", rx + "px");

              spotlight.style.setProperty("--sy", ry + "px");
            }

            if (heroRect && heroRect.width && parallaxEls.length) {
              var nx = Math.max(
                -1,
                Math.min(1, ((rx - heroRect.left) / heroRect.width - 0.5) * 2),
              );

              var ny = Math.max(
                -1,
                Math.min(1, ((ry - heroRect.top) / heroRect.height - 0.5) * 2),
              );

              parallaxEls.forEach(function (item) {
                item.el.style.translate =
                  nx * item.depth + "px " + ny * item.depth * 0.6 + "px";
              });
            }

            requestAnimationFrame(cursorLoop);
          })();

          document
            .querySelectorAll("a,button,summary,.btn,[data-tilt]")
            .forEach(function (el) {
              el.addEventListener("mouseenter", function () {
                if (cursorRing) {
                  cursorRing.classList.add("hover");
                }
              });

              el.addEventListener("mouseleave", function () {
                if (cursorRing) {
                  cursorRing.classList.remove("hover");
                }
              });
            });
        }

        /* ========================================================
     3D TILT DESKTOP
     ======================================================== */

        if (!reduced && !isMobile) {
          document.querySelectorAll("[data-tilt]").forEach(function (card) {
            card.addEventListener("mousemove", function (e) {
              var rect = card.getBoundingClientRect();

              var x = (e.clientX - rect.left) / rect.width - 0.5;

              var y = (e.clientY - rect.top) / rect.height - 0.5;

              card.style.transform =
                "perspective(800px) " +
                "rotateY(" +
                x * 8 +
                "deg) " +
                "rotateX(" +
                -y * 8 +
                "deg) " +
                "translateY(-2px)";
            });

            card.addEventListener("mouseleave", function () {
              card.style.transform =
                "perspective(800px) " +
                "rotateY(0) " +
                "rotateX(0) " +
                "translateY(0)";
            });
          });
        }

        /* ========================================================
     SMOOTH SCROLL
     ======================================================== */

        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
          anchor.addEventListener("click", function (e) {
            var id = anchor.getAttribute("href");

            if (!id || id === "#") {
              return;
            }

            var target = document.querySelector(id);

            if (!target) {
              return;
            }

            e.preventDefault();

            var shell = header ? header.querySelector(".nav-shell") : null;

            var offset =
              (shell ? shell.offsetHeight : header ? header.offsetHeight : 0) +
              36;

            var top =
              target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
              top: Math.max(0, top),

              behavior: reduced ? "auto" : "smooth",
            });
          });
        });

        /* ========================================================
     ACTIVE SECTION
     ======================================================== */

        var spyLinks = Array.prototype.slice.call(
          document.querySelectorAll(".nav-links a,.mobile-menu .mm-links a"),
        );

        var spyMap = {};

        spyLinks.forEach(function (link) {
          var href = link.getAttribute("href");

          if (!href || href.charAt(0) !== "#") {
            return;
          }

          if (!spyMap[href]) {
            spyMap[href] = [];
          }

          spyMap[href].push(link);
        });

        function setActive(id) {
          spyLinks.forEach(function (link) {
            var active = link.getAttribute("href") === id;

            link.classList.toggle("active", active);

            if (active) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        }

        if ("IntersectionObserver" in window) {
          var spy = new IntersectionObserver(
            function (entries) {
              entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                  setActive("#" + entry.target.id);
                }
              });
            },
            {
              rootMargin: "-40% 0px -55% 0px",

              threshold: 0,
            },
          );

          [
            "inicio",
            "por-que",
            "servicos",
            "projetos",
            "como-funciona",
            "faq",
            "contato",
          ].forEach(function (sectionId) {
            var section = document.getElementById(sectionId);

            if (section) {
              spy.observe(section);
            }
          });
        }
      })();
