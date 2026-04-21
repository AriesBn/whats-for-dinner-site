export const buttonLinks = [
  { key: "查看项目", url: "#apps" },
  { key: "找到我", url: "#social-links" },
  { key: "回到顶部", url: "#hero" },
  {
    key: "《Trading in the Zone》",
    url: "https://www.goodreads.com/book/show/253516.Trading_in_the_Zone",
  },
  {
    key: "《Technical Analysis of the Financial Markets》",
    url: "https://www.goodreads.com/en/book/show/212102.Technical_Analysis_of_the_Financial_Markets",
  },
  {
    key: "《Market Wizards》",
    url: "https://www.goodreads.com/book/show/966769.Market_Wizards",
  },
  {
    key: "《The Daily Trading Coach》",
    url: "https://www.goodreads.com/en/book/show/6226153-the-daily-trading-coach",
  },
  {
    key: "X / Twitter",
    url: "https://x.com/AriesBn2",
  },
  {
    key: "GitHub",
    url: "https://link3.cc/mypjetzy",
  },
  {
    key: "Bilibili",
    url: "https://space.bilibili.com/12970572?spm_id_from=333.337.0.0",
  },
  {
    key: "邮箱",
    url: "mailto:hello@example.com",
  },
  {
    key: "YouTube",
    url: "https://www.youtube.com/channel/UCAgsu8bK2qdm4D1at1Mpx0A",
  },
];

export const defaultLinkMap = Object.fromEntries(
  buttonLinks.map(({ key, url }) => [key, url]),
);

export const kvManagedKeys = buttonLinks.map(({ key }) => key);
