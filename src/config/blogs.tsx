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
  }
];

export default blogs;