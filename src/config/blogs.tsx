interface Blog {
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
  }
];

export default blogs;