export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  featured_image?: string;
  meta_description: string;
  tags: string;
  tags_list: string[];
  created_at: string;
  updated_at: string;
  published_at: string;
  view_count: number;
  comment_count: number;
}

export interface BlogComment {
  id: number;
  blog_post: number;
  content: string;
  user_name: string;
  user_username: string;
  is_owner: boolean;
  created_at: string;
  updated_at: string;
  is_approved: boolean;
}