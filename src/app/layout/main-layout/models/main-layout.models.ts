interface MainLayoutLink {
  title: string;
  link: string;
  isMainNav: boolean;
  isUserNav: boolean,
  icon: string;
}

export const PAGE_LINKS_LIST: MainLayoutLink[] = [
  {
    title: "Your profile",
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
    title: "Orders",
    link: "orders",
    isMainNav: true,
    isUserNav: false,
    icon: "calendar"
  },
  {
    title: "Team Management",
    link: "team",
    isMainNav: true,
    isUserNav: false,
    icon: "team"
  },
  {
    title: "Shows & Events",
    link: "shows",
    isMainNav: true,
    isUserNav: false,
    icon: "firework"
  },
  {
    title: "Tools storage",
    link: "Tools & Resources",
    isMainNav: true,
    isUserNav: false,
    icon: "storage"
  },
  {
    title: "Statistics & Analytics",
    link: "statistics",
    isMainNav: true,
    isUserNav: false,
    icon: "statistics"
  }
];
