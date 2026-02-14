import { GRAPHQL_URL } from '../config/api';

export interface FamousPerson {
  id: string;
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  years: string;
  haplogroup: string;
}

export interface Country {
  id: string;
  name: string;
}

export interface Province {
  id: string;
  name: string;
  code: string;
  country: Country;
  latitude: number;
  longitude: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  featuredImage: string;
  createdAt: string;
  publishedAt: string;
  viewCount: number;
  tags: string;
}

export interface Tribe {
  id: string;
  name: string;
  ethnicities: string[];
  historicalNote: string;
  sampleCount: number;
}

export interface Clan {
  id: string;
  name: string;
  tribes: string[];
  commonAncestor: string;
  sampleCount: number;
}

export interface TribeWithClans {
  tribe: Tribe;
  clans: Clan[];
}

export interface CountryHierarchy {
  country: string;
  tribes: TribeWithClans[];
}

export interface YDNATreeNode {
  id: string;
  name: string;
  parent: { id: string; name: string } | null;
  isoggyghg: string;
  yfullHg: string;
  tmrca: number | null;
  paleoSamples: string[];
  children: YDNATreeNode[];
  sampleCount: number;
}

const FAMOUS_PEOPLE_QUERY = `
  query {
    famousPeople {
      id
      name
      title
      description
      imageUrl
      years
      haplogroup
    }
  }
`;

const COUNTRIES_QUERY = `
  query {
    countries {
      id
      name
    }
  }
`;

const PROVINCES_QUERY = `
  query($country: String) {
    provinces(country: $country) {
      id
      name
      code
      latitude
      longitude
      country {
        id
        name
      }
    }
  }
`;

const BLOG_POSTS_QUERY = `
  query($tag: String, $search: String) {
    blogPosts(tag: $tag, search: $search) {
      id
      title
      slug
      excerpt
      author
      featuredImage
      createdAt
      publishedAt
      viewCount
      tags
    }
  }
`;

const COMMUNITIES_HIERARCHY_QUERY = `
  query {
    communitiesHierarchy {
      country
      tribes {
        tribe {
          id
          name
          ethnicities
          historicalNote
          sampleCount
        }
        clans {
          id
          name
          tribes
          commonAncestor
          sampleCount
        }
      }
    }
  }
`;

const YDNA_TREE_QUERY = `
  query($rootHaplogroup: String) {
    ydnaTree(rootHaplogroup: $rootHaplogroup) {
      id
      name
      parent {
        id
        name
      }
      isoggyghg: isoggYghg
      yfullHg
      tmrca
      paleoSamples
      sampleCount
      children {
        id
        name
        parent {
          id
          name
        }
        isoggyghg: isoggYghg
        yfullHg
        tmrca
        paleoSamples
        sampleCount
        children {
          id
          name
          parent {
            id
            name
          }
          isoggyghg: isoggYghg
          yfullHg
          tmrca
          paleoSamples
          sampleCount
          children {
            id
            name
            isoggyghg: isoggYghg
            yfullHg
            tmrca
            paleoSamples
            sampleCount
          }
        }
      }
    }
  }
`;

async function graphqlRequest<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error('GraphQL request failed');
  }

  const { data } = await response.json();
  return data;
}

export const graphqlService = {
  fetchFamousPeople: async (): Promise<FamousPerson[]> => {
    const data = await graphqlRequest<{ famousPeople: FamousPerson[] }>(FAMOUS_PEOPLE_QUERY);
    return data.famousPeople;
  },

  fetchCountries: async (): Promise<Country[]> => {
    const data = await graphqlRequest<{ countries: Country[] }>(COUNTRIES_QUERY);
    return data.countries;
  },

  fetchProvinces: async (country?: string): Promise<Province[]> => {
    const data = await graphqlRequest<{ provinces: Province[] }>(PROVINCES_QUERY, { country });
    return data.provinces;
  },

  fetchBlogPosts: async (tag?: string, search?: string): Promise<BlogPost[]> => {
    const data = await graphqlRequest<{ blogPosts: BlogPost[] }>(BLOG_POSTS_QUERY, { tag, search });
    return data.blogPosts;
  },

  fetchCommunitiesHierarchy: async (): Promise<CountryHierarchy[]> => {
    const data = await graphqlRequest<{ communitiesHierarchy: CountryHierarchy[] }>(COMMUNITIES_HIERARCHY_QUERY);
    return data.communitiesHierarchy;
  },

  fetchYDNATree: async (rootHaplogroup?: string): Promise<YDNATreeNode[]> => {
    const data = await graphqlRequest<{ ydnaTree: YDNATreeNode[] }>(YDNA_TREE_QUERY, { rootHaplogroup });
    return data.ydnaTree;
  },
};
