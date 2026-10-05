import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

const header = document.querySelector<HTMLElement>("[data-header]");
const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
const nav = document.querySelector<HTMLElement>("[data-nav]");

let lenis: Lenis | null = null;

function closeNav() {
	if (!nav || !toggle) return;
	nav.classList.remove("is-open");
	header?.classList.remove("is-menu");
	toggle.setAttribute("aria-expanded", "false");
	document.documentElement.classList.remove("is-locked");
	lenis?.start();
}

function openNav() {
	if (!nav || !toggle) return;
	nav.classList.add("is-open");
	header?.classList.add("is-menu");
	toggle.setAttribute("aria-expanded", "true");
	document.documentElement.classList.add("is-locked");
	lenis?.stop();
}

toggle?.addEventListener("click", () => {
	const expanded = toggle.getAttribute("aria-expanded") === "true";
	if (expanded) closeNav();
	else openNav();
});

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape") closeNav();
});

document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
	anchor.addEventListener("click", (event) => {
		const hash = anchor.getAttribute("href");
		if (!hash || hash === "#") return;
		const target = document.querySelector<HTMLElement>(hash);
		if (!target) return;
		event.preventDefault();
		const menuWasOpen = nav?.classList.contains("is-open") ?? false;
		closeNav();
		if (lenis) {
			lenis.scrollTo(target, { offset: -76, force: true });
		} else {
			target.scrollIntoView({ behavior: menuWasOpen ? "auto" : "smooth" });
		}
		history.pushState(null, "", hash);
	});
});

const motion = gsap.matchMedia();

motion.add("(prefers-reduced-motion: reduce)", () => {
	const onScroll = () => {
		header?.classList.toggle("is-scrolled", window.scrollY > 24);
	};
	onScroll();
	window.addEventListener("scroll", onScroll, { passive: true });
	return () => window.removeEventListener("scroll", onScroll);
});

motion.add("(prefers-reduced-motion: no-preference)", () => {
	lenis = new Lenis({
		lerp: 0.085,
		smoothWheel: true,
	});

	lenis.on("scroll", ScrollTrigger.update);

	const onTick = (time: number) => {
		lenis?.raf(time * 1000);
	};
	gsap.ticker.add(onTick);
	gsap.ticker.lagSmoothing(0);

	gsap
		.timeline({ defaults: { ease: "power3.out" } })
		.fromTo(
			"[data-hero='fade']",
			{ autoAlpha: 0, y: 16 },
			{ autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 },
		)
		.fromTo(
			".hero-fixed__img",
			{ scale: 1.08 },
			{ scale: 1, duration: 1.6, ease: "power2.out" },
			0,
		);

	gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
		gsap.from(element, {
			y: 32,
			autoAlpha: 0,
			duration: 1.05,
			ease: "power3.out",
			scrollTrigger: {
				trigger: element,
				start: "top 88%",
				once: true,
			},
		});
	});

	gsap.utils.toArray<HTMLElement>("[data-reveal-stagger]").forEach((group) => {
		const items = group.querySelectorAll<HTMLElement>("[data-reveal-item]");
		gsap.from(items, {
			y: 36,
			autoAlpha: 0,
			duration: 1,
			stagger: 0.12,
			ease: "power3.out",
			scrollTrigger: {
				trigger: group,
				start: "top 84%",
				once: true,
			},
		});
	});

	gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
		const trigger = element.closest<HTMLElement>("[data-parallax-wrap]") ?? element;
		gsap.fromTo(
			element,
			{ yPercent: -7 },
			{
				yPercent: 7,
				ease: "none",
				scrollTrigger: {
					trigger,
					start: "top bottom",
					end: "bottom top",
					scrub: true,
				},
			},
		);
	});

	gsap.to("[data-progress]", {
		scaleX: 1,
		ease: "none",
		scrollTrigger: {
			start: 0,
			end: "max",
			scrub: 0.25,
		},
	});

	ScrollTrigger.create({
		start: 24,
		end: "max",
		onToggle: (self) => header?.classList.toggle("is-scrolled", self.isActive),
	});

	const refresh = () => ScrollTrigger.refresh();
	window.addEventListener("load", refresh);

	return () => {
		window.removeEventListener("load", refresh);
		lenis?.destroy();
		lenis = null;
		gsap.ticker.remove(onTick);
	};
});

export {};
