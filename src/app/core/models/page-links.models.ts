interface MainLayoutLink {
  title: string;
  link: string;
  isMainNav: boolean;
  isUserNav: boolean,
  icon: string;
}

export const PAGE_LINKS_LIST: MainLayoutLink[] = [
  {
    title: "Profile",
    link: "profile",
    icon: "user",
    isMainNav: false,
    isUserNav: true,
  },
  {
    title: "Dashboard",
    link: "dashboard",
    isMainNav: true,
    isUserNav: false,
    icon: "home",
  },
  {
    title: "Orders calendar",
    link: "orders",
    isMainNav: true,
    isUserNav: false,
    icon: "calendar"
  },
  {
    title: "Team",
    link: "team",
    isMainNav: true,
    isUserNav: false,
    icon: "team"
  },
  {
    title: "Shows",
    link: "shows",
    isMainNav: true,
    isUserNav: false,
    icon: "firework-rocket"
  },
  {
    title: "Inventory",
    link: "inventory",
    isMainNav: true,
    isUserNav: false,
    icon: "storage"
  },
  {
    title: "Statistics",
    link: "statistics",
    isMainNav: true,
    isUserNav: false,
    icon: "statistics"
  }
];
