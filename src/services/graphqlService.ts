import { GRAPHQL_URL } from '../config/api';

export interface FamousPerson {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  years: string;
}

const FAMOUS_PEOPLE_QUERY = `
  query {
    famousPeople {
      id
      name
      title
      description
      image
      years
    }
  }
`;

export const graphqlService = {
  fetchFamousPeople: async (): Promise<FamousPerson[]> => {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: FAMOUS_PEOPLE_QUERY }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch famous people');
    }

    const { data } = await response.json();
    return data.famousPeople;
  },
};
