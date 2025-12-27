export interface Blog {
  title: string;
  url: string;
  author: string;
}

const blogs: Blog[] = [
  {
    title: "Do things that don't scale",
    url: "https://www.ycombinator.com/library/96-do-things-that-don-t-scale",
    author: "Paul Graham"
  },
  {
    title: "Staff Archetypes",
    url: "https://staffeng.com/guides/staff-archetypes/",
    author: "Will Larson"
  },
  {
    title: "Six Attributes of Beautiful Systems",
    url: "https://engineering.squarespace.com/blog/2018/six-attributes-of-beautiful-systems",
    author: "Thomas Chau"
  },
  {
    title: "Exit the haunted forest",
    url: "https://increment.com/software-architecture/exit-the-haunted-forest/",
    author: "John Millikin"
  },
  {
    title: "A primer on functional architecture",
    url: "https://increment.com/software-architecture/primer-on-functional-architecture/",
    author: "Scott Wlaschin"
  },
  {
    title: "Idea Generation",
    url: "https://blog.samaltman.com/idea-generation",
    author: "Sam Altman"
  },
  {
    title: "How to be Successful",
    url: "https://blog.samaltman.com/how-to-be-successful",
    author: "Sam Altman"
  },
  {
    title: "Economic Inequality",
    url: "https://paulgraham.com/ineq.html",
    author: "Paul Graham"
  },
  {
    title: "How to do Great Work",
    url: "https://paulgraham.com/greatwork.html",
    author: "Paul Graham"
  },
  {
    title: "When to do What You Love",
    url: "https://paulgraham.com/when.html",
    author: "Paul Graham"
  },
  {
    title: "The Friendship That Made Google Huge",
    url: "https://www.newyorker.com/magazine/2018/12/10/the-friendship-that-made-google-huge",
    author: "James Somers"
  },
  {
    title: "You and Your Research",
    url: "https://d37ugbyn3rpeym.cloudfront.net/stripe-press/TAODSAE_zine_press.pdf",
    author: "Richard Hamming"
  },
  {
    title: "Michelle Bu - Payments Products Tech Lead at Stripe",
    url: "https://staffeng.com/stories/michelle-bu/",
    author: "Will Larson"
  },
  {
    title: "Building a System for Front-End Translations",
    url: "https://engineering.squarespace.com/blog/2018/building-a-system-for-front-end-translations",
    author: "Dan Na"
  },
  {
    title: "The Power of Yes If (RFC Process)",
    url: "https://engineering.squarespace.com/blog/2019/the-power-of-yes-if",
    author: "Squarespace Engineering"
  },
  {
    title: "Logging Sucks",
    url: "https://loggingsucks.com/",
    author: "Boris Tane"
  },
  {
    title: "You should not use URLPattern to route HTTP requests on the server",
    url: "https://adventures.nodeland.dev/archive/you-should-not-use-urlpattern-to-route-http/",
    author: "Adventures in Nodeland"
  },
  {
    title: "Fast and flexible observability with canonical log lines",
    url: "https://stripe.com/blog/canonical-log-lines",
    author: "Brandur Leach"
  },
  {
    title: "How Stripe's document databases supported 99.999% uptime with zero-downtime data migrations",
    url: "https://stripe.com/blog/how-stripes-document-databases-supported-99.999-uptime-with-zero-downtime-data-migrations",
    author: "Jimmy Morzaria"
  },
];

export default blogs;
