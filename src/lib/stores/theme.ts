import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
	if (!browser) return 'dark';

	const stored = localStorage.getItem('theme') as Theme | null;
	if (stored) return stored;

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const theme = writable<Theme>(getInitialTheme());

theme.subscribe((value) => {
	if (!browser) return;

	const root = document.documentElement;

	if (value === 'dark') {
		root.classList.add('dark');
	} else {
		root.classList.remove('dark');
	}

	localStorage.setItem('theme', value);
});
