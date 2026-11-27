/* =========================================================
   main.js · Un día en La Aguja y el Tornillo
   GSAP + ScrollTrigger + Lenis
   Docs: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
   ========================================================= */

// Truco para clase: abre index.html?marcadores y verás los marcadores de inicio y fin
const verMarcadores = window.location.search.includes('marcadores');

// ¿El sistema pide "reducir movimiento"?
const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ---------- 0 · PREPARAR: plugin y Lenis sincronizado con ScrollTrigger ---------- */
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ anchors: true });   // sin autoRaf: lo mueve el reloj de GSAP

lenis.on('scroll', ScrollTrigger.update);     // cada vez que Lenis mueve la página, ScrollTrigger se entera
gsap.ticker.add(function (tiempo) {
    lenis.raf(tiempo * 1000);                 // GSAP cuenta en segundos y Lenis en milisegundos
});
gsap.ticker.lagSmoothing(0);


if (reducirMovimiento) {
    // Sin animaciones: quitamos la clase .js y la web se ve "normal" (sin persiana ni scroll horizontal)
    document.documentElement.classList.remove('js');
} else {
    animarPagina();
}


function animarPagina() {

    /* ---------- 1 · LA PERSIANA: pin + scrub ----------
       Una timeline atada al scroll. Mientras la portada está fijada (pin),
       el scroll hace avanzar la timeline como si fuera la barra de un vídeo. */
    const portada = gsap.timeline({
        scrollTrigger: {
            trigger: '.portada',
            start: 'top top',      // cuando la parte de arriba de la portada toca arriba de la pantalla
            end: '+=120%',         // ...y durante 1,2 pantallas de scroll
            pin: true,             // la portada se queda fija mientras tanto
            scrub: 1,              // la animación sigue al scroll (con 1 s de suavizado)
            markers: verMarcadores
        }
    });

    portada
        .to('.persiana', { yPercent: -100, ease: 'none' })
        .from('.portada-foto', { scale: 1.25, ease: 'none' }, 0)
        .from('.portada-titulo .linea-texto', { yPercent: 110, stagger: 0.15 }, 0.45)
        .from('.portada-sub', { autoAlpha: 0, y: 20, stagger: 0.1 }, '<0.2');


    /* ---------- 2 · TARJETAS: toggleActions ----------
       Una ScrollTrigger por tarjeta (si usáramos una para todas, entrarían a la vez). */
    gsap.utils.toArray('.tarjeta').forEach(function (tarjeta) {
        gsap.from(tarjeta, {
            y: 60,
            autoAlpha: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: tarjeta,
                start: 'top 85%',
                // al entrar, al salir por arriba, al volver a entrar, al salir por abajo
                toggleActions: 'play none none reverse',
                markers: verMarcadores
            }
        });
    });


    /* ---------- 3 · CIFRAS: once ----------
       Los números cuentan desde 0 una sola vez. */
    gsap.utils.toArray('.cifra').forEach(function (cifra) {
        const contador = { valor: 0 };

        gsap.to(contador, {
            valor: Number(cifra.dataset.valor),
            duration: 2,
            ease: 'power2.out',
            onUpdate: function () {
                cifra.textContent = conPuntos(Math.round(contador.valor));
            },
            scrollTrigger: {
                trigger: '#cifras',
                start: 'top 75%',
                once: true,            // se lanza una vez y la ScrollTrigger desaparece
                markers: verMarcadores
            }
        });
    });

    function conPuntos(numero) {
        // 4000 -> "4.000"
        return String(numero).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }


    /* ---------- 4 · HISTORIA HORIZONTAL: pin + scrub de lado ----------
       Mientras bajas, la sección se queda fija y la pista se mueve hacia la izquierda
       todo lo que mide de más. Los valores son funciones para recalcularse al redimensionar. */
    const pista = document.querySelector('.historia-pista');

    function recorrido() {
        return pista.scrollWidth - window.innerWidth;
    }

    const horizontal = gsap.to(pista, {
        x: function () { return -recorrido(); },
        ease: 'none',                                       // obligatorio para seguir el scroll de forma uniforme
        scrollTrigger: {
            trigger: '#historia',
            start: 'top top',
            end: function () { return '+=' + recorrido(); },  // tanto scroll vertical como recorrido horizontal
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,                       // recalcular x al cambiar el tamaño de la ventana
            markers: verMarcadores
        }
    });

    // Extra: los años crecen al entrar en pantalla DENTRO del scroll horizontal (containerAnimation)
    gsap.utils.toArray('.panel-ano').forEach(function (ano) {
        gsap.from(ano, {
            scale: 0.5,
            autoAlpha: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: ano,
                containerAnimation: horizontal,
                start: 'left 85%',
                end: 'left 45%',
                scrub: true
            }
        });
    });


    /* ---------- 5 · BARRA DE PROGRESO: scrub de toda la página ---------- */
    gsap.to('.barra-progreso', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
            start: 0,          // desde arriba del todo
            end: 'max',        // hasta abajo del todo
            scrub: 0.3
        }
    });
}
