import authorsData from './authors.json';

export const getAllAuthors = () => authorsData;
export const getAuthorBySlug = (slug: string) => authorsData.find(author => author.slug === slug);
export const getDefaultAuthor = () => authorsData[0];
