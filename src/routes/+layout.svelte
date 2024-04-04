<script lang="ts">
	import '../app.postcss';
	import { sineIn } from 'svelte/easing';
	import {
		DarkMode,
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		NavHamburger,
		Sidebar,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper,
		Drawer,
		CloseButton,
		SidebarDropdownWrapper
	} from 'flowbite-svelte';
  import { page } from '$app/stores';
  import { ssp, queryParam } from 'sveltekit-search-params';
  import { Layer } from '$lib/types';

  const layer = queryParam('layer', ssp.string(Layer.AIR));

  function setLayer(newLayer: string) {
    layer.set(newLayer);
  }

	let transitionParams = {
		x: -320,
		duration: 200,
		easing: sineIn
	};

	let width: number;
	let drawerHidden: boolean = true;
	let activateClickOutside = true;

	const toggleDrawer = () => {
		drawerHidden = !drawerHidden;
	};

  $: activeUrl = $page.url.pathname;

  const activeClass: string = "text-red-500";
</script>

<svelte:window bind:innerWidth={width} />


<header class="flex bg-white dark:bg-slate-950">
  <Navbar class="" fluid>
    <NavHamburger
      class="md:block focus:outline-none hover:bg-gray-100 dark:hover:bg-gray-600"
      onClick={toggleDrawer}
    />
    <NavUl>
      <NavLi class={`cursor-pointer ${$layer === Layer.AIR && activeClass}`} on:click={() => setLayer("air")}>Air</NavLi>
      <NavLi class={`cursor-pointer ${$layer === Layer.RADIATION && activeClass}`} on:click={() => setLayer("rad")}>Radiation</NavLi>
    </NavUl>
    <NavBrand href="/map" class="">
      <img src="/logo.svg" class="me-3 h-6 sm:h-9" alt="Safecast Logo" />
      <span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
        >SAFECAST</span
      >
    </NavBrand>
  </Navbar>
</header>

<Drawer
  transitionType="fly"
  {transitionParams}
  bind:hidden={drawerHidden}
  bind:activateClickOutside
  width="w-64"
  class="overflow-scroll pb-32"
  id="sidebar"
>
  <div class="flex items-center">
    <CloseButton on:click={() => (drawerHidden = true)} class="mb-4 dark:text-white" />
  </div>
  <Sidebar asideClass="w-54">
    <SidebarWrapper divClass="overflow-y-auto py-2 px-1 dark:bg-gray-800">
      <SidebarGroup>
        <SidebarItem label="About this map" href="/about" active={activeUrl === `/about`} />
        <SidebarItem label="About Safecast" href="/safecast" active={activeUrl === `safecast`} />
        <SidebarItem label="Donate" href="https://blog.safecast.org/donate/" />
        <SidebarItem label="News" href="https://blog.safecast.org/" />
      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>
</Drawer>

<slot />